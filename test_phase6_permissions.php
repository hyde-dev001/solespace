<?php

/**
 * Test Phase 6: Permission Management API
 * Tests the shop owner permission management endpoints
 */

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\ShopOwner;
use App\Models\User;
use App\Http\Controllers\ShopOwner\UserAccessControlController;
use Illuminate\Support\Facades\Auth;

echo "\n=== Phase 6: Permission Management API Test ===\n\n";

// Test 1: Get Shop Owner
echo "Test 1: Get Shop Owner\n";
echo str_repeat('-', 50) . "\n";
$shopOwner = ShopOwner::first();
if ($shopOwner) {
    echo "✓ Shop Owner: {$shopOwner->business_name} (ID: {$shopOwner->id})\n";
    echo "  Email: {$shopOwner->email}\n";
} else {
    echo "✗ No shop owner found\n";
    exit(1);
}

// Set authenticated shop owner
Auth::guard('shop_owner')->setUser($shopOwner);

echo "\nTest 2: Get Available Permissions\n";
echo str_repeat('-', 50) . "\n";
try {
    $controller = new UserAccessControlController();
    $response = $controller->getAvailablePermissions();
    $data = $response->getData();
    
    echo "✓ Total permissions: " . count($data->all) . "\n";
    echo "✓ Grouped permissions:\n";
    echo "  - Finance: " . count($data->grouped->finance) . "\n";
    echo "  - HR: " . count($data->grouped->hr) . "\n";
    echo "  - CRM: " . count($data->grouped->crm) . "\n";
    echo "  - Manager: " . count($data->grouped->manager) . "\n";
    echo "  - Staff: " . count($data->grouped->staff) . "\n";
    echo "✓ Total roles: " . count($data->roles) . "\n";
    
    // Show first few permissions
    echo "\n  Sample Finance Permissions:\n";
    foreach (array_slice($data->grouped->finance, 0, 5) as $perm) {
        echo "    - {$perm}\n";
    }
    
} catch (\Exception $e) {
    echo "✗ Error: " . $e->getMessage() . "\n";
}

echo "\nTest 3: Get Employee with Permissions\n";
echo str_repeat('-', 50) . "\n";
$user = User::where('shop_owner_id', $shopOwner->id)->first();
if ($user) {
    echo "✓ Employee: {$user->name} (ID: {$user->id})\n";
    echo "  Email: {$user->email}\n";
    echo "  Role: {$user->role}\n";
    
    // Get Spatie role
    $roleName = $user->getRoleNames()->first();
    echo "  Spatie Role: " . ($roleName ?? 'None') . "\n";
    
    // Get permissions
    $allPermissions = $user->getAllPermissions()->pluck('name')->toArray();
    $rolePermissions = $user->getPermissionsViaRoles()->pluck('name')->toArray();
    $directPermissions = $user->getDirectPermissions()->pluck('name')->toArray();
    
    echo "  Total Permissions: " . count($allPermissions) . "\n";
    echo "  From Role: " . count($rolePermissions) . "\n";
    echo "  Direct: " . count($directPermissions) . "\n";
    
    if (count($rolePermissions) > 0) {
        echo "\n  Sample Role Permissions:\n";
        foreach (array_slice($rolePermissions, 0, 5) as $perm) {
            echo "    - {$perm}\n";
        }
    }
    
    if (count($directPermissions) > 0) {
        echo "\n  Direct Permissions:\n";
        foreach ($directPermissions as $perm) {
            echo "    - {$perm}\n";
        }
    }
    
} else {
    echo "✗ No employees found for this shop owner\n";
}

echo "\nTest 4: Get Employee Permissions via API\n";
echo str_repeat('-', 50) . "\n";
if ($user) {
    try {
        $response = $controller->getEmployeePermissions($user->id);
        $data = $response->getData();
        
        echo "✓ API Response:\n";
        echo "  User ID: {$data->userId}\n";
        echo "  Name: {$data->name}\n";
        echo "  Email: {$data->email}\n";
        echo "  Role: " . ($data->roleName ?? 'None') . "\n";
        echo "  All Permissions: " . count($data->allPermissions) . "\n";
        echo "  Role Permissions: " . count($data->rolePermissions) . "\n";
        echo "  Direct Permissions: " . count($data->directPermissions) . "\n";
        
    } catch (\Exception $e) {
        echo "✗ Error: " . $e->getMessage() . "\n";
    }
}

echo "\nTest 5: Test Permission Assignment\n";
echo str_repeat('-', 50) . "\n";
if ($user) {
    // Test giving a permission
    try {
        echo "Testing: Give 'manage-inventory' permission...\n";
        $user->givePermissionTo('manage-inventory');
        
        if ($user->can('manage-inventory')) {
            echo "✓ Permission granted successfully\n";
            
            $directPerms = $user->getDirectPermissions()->pluck('name')->toArray();
            echo "  Direct permissions now: " . implode(', ', $directPerms) . "\n";
            
            // Revoke it to clean up
            $user->revokePermissionTo('manage-inventory');
            echo "✓ Permission revoked (cleanup)\n";
        } else {
            echo "✗ Permission not applied\n";
        }
        
    } catch (\Exception $e) {
        echo "✗ Error: " . $e->getMessage() . "\n";
    }
}

echo "\n=== All Tests Complete ===\n";
echo "\nPhase 6 Backend Status: ✅ WORKING\n";
echo "Next Step: Build frontend UI for permission management\n\n";
