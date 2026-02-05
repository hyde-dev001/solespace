<?php
require 'vendor/autoload.php';
$app = require 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

echo "\nDEBUG: Middleware Role Check\n";
echo "=====================================\n\n";

// Get the manager
$manager = App\Models\User::where('email', 'dan@gmail.com')->first();

echo "User: {$manager->email}\n";
echo "Old role column: '{$manager->role}'\n";
echo "Guard name property: '{$manager->guard_name}'\n\n";

// Test what the middleware checks
echo "Middleware Checks:\n";

// Check 1: Old role column (case-insensitive)
$roles = ['Manager', 'Finance Manager', 'Super Admin'];
foreach ($roles as $role) {
    $match = strcasecmp($manager->role, $role) === 0;
    echo "  strcasecmp('{$manager->role}', '{$role}') = " . ($match ? 'TRUE ✓' : 'FALSE') . "\n";
}

echo "\n";

// Check 2: Spatie hasRole
echo "Spatie Role Checks:\n";
foreach ($roles as $role) {
    try {
        $hasRole = $manager->hasRole($role);
        echo "  hasRole('{$role}') = " . ($hasRole ? 'TRUE ✓' : 'FALSE ✗') . "\n";
    } catch (Exception $e) {
        echo "  hasRole('{$role}') = ERROR: {$e->getMessage()}\n";
    }
}

echo "\n";

// Check 3: Get actual roles
echo "Actual Roles from Spatie:\n";
try {
    $roleNames = $manager->getRoleNames();
    echo "  getRoleNames() = " . ($roleNames->isEmpty() ? 'EMPTY' : $roleNames->toJson()) . "\n";
    
    $roles = $manager->roles;
    echo "  Direct roles: {$roles->count()}\n";
    foreach ($roles as $r) {
        echo "    - '{$r->name}' (guard: '{$r->guard_name}')\n";
    }
} catch (Exception $e) {
    echo "  ERROR: {$e->getMessage()}\n";
}

echo "\n";

// Check 4: Test the exact middleware logic
echo "Simulating Middleware Logic:\n";
$hasAccess = false;
$checkRoles = ['Manager', 'Finance Manager', 'Super Admin'];

foreach ($checkRoles as $role) {
    // Check old role column
    if (strcasecmp($manager->role, $role) === 0) {
        echo "  ✓ PASS: Old role column matches '{$role}'\n";
        $hasAccess = true;
        break;
    }
    
    // Check Spatie roles
    if (method_exists($manager, 'hasRole') && $manager->hasRole($role)) {
        echo "  ✓ PASS: Spatie hasRole('{$role}') returns true\n";
        $hasAccess = true;
        break;
    }
}

if (!$hasAccess) {
    echo "  ✗ FAIL: No role matched\n";
}

echo "\n=====================================\n";
echo $hasAccess ? "✅ SHOULD HAVE ACCESS\n" : "❌ WOULD BE DENIED\n";
echo "=====================================\n\n";
