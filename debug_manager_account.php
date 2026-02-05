<?php

/**
 * Debug script to check Manager account setup
 * Run: php debug_manager_account.php
 */

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\User;
use Illuminate\Support\Facades\DB;

echo "\n=== Manager Account Debug ===\n\n";

// Find most recent Manager account
$managerUser = User::where('role', 'MANAGER')
    ->orderBy('created_at', 'desc')
    ->first();

if (!$managerUser) {
    echo "❌ No Manager account found in users table with role='MANAGER'\n";
    echo "\nLet's check all users:\n";
    $allUsers = User::orderBy('created_at', 'desc')->limit(5)->get(['id', 'name', 'email', 'role', 'created_at']);
    foreach ($allUsers as $u) {
        echo "  - ID: {$u->id}, Name: {$u->name}, Email: {$u->email}, Role: {$u->role}, Created: {$u->created_at}\n";
    }
    exit(1);
}

echo "✅ Found Manager account:\n";
echo "  - ID: {$managerUser->id}\n";
echo "  - Name: {$managerUser->name}\n";
echo "  - Email: {$managerUser->email}\n";
echo "  - Role (old column): {$managerUser->role}\n";
echo "  - Shop Owner ID: {$managerUser->shop_owner_id}\n";
echo "  - Created: {$managerUser->created_at}\n\n";

// Check Spatie roles
echo "=== Spatie Roles Check ===\n";
if (method_exists($managerUser, 'getRoleNames')) {
    $spatieRoles = $managerUser->getRoleNames();
    if ($spatieRoles->isEmpty()) {
        echo "❌ NO Spatie roles assigned!\n";
        echo "   This is the problem - user was created but Spatie role was not assigned.\n\n";
    } else {
        echo "✅ Spatie roles assigned:\n";
        foreach ($spatieRoles as $roleName) {
            echo "  - $roleName\n";
        }
        echo "\n";
    }
} else {
    echo "❌ User model does not have HasRoles trait!\n\n";
}

// Check if user has Manager role
if (method_exists($managerUser, 'hasRole')) {
    $hasManagerRole = $managerUser->hasRole('Manager');
    echo "Has 'Manager' role: " . ($hasManagerRole ? "✅ YES" : "❌ NO") . "\n";
    
    $hasMANAGERRole = $managerUser->hasRole('MANAGER');
    echo "Has 'MANAGER' role: " . ($hasMANAGERRole ? "✅ YES" : "❌ NO") . "\n\n";
}

// Check all permissions
echo "=== Permissions Check ===\n";
if (method_exists($managerUser, 'getAllPermissions')) {
    $permissions = $managerUser->getAllPermissions();
    if ($permissions->isEmpty()) {
        echo "❌ NO permissions assigned\n\n";
    } else {
        echo "✅ Has " . $permissions->count() . " permissions\n";
        echo "Sample permissions:\n";
        foreach ($permissions->take(10) as $perm) {
            echo "  - {$perm->name}\n";
        }
        if ($permissions->count() > 10) {
            echo "  ... and " . ($permissions->count() - 10) . " more\n";
        }
        echo "\n";
    }
}

// Check model_has_roles table directly
echo "=== Database Check (model_has_roles) ===\n";
$roleAssignments = DB::table('model_has_roles')
    ->where('model_type', 'App\\Models\\User')
    ->where('model_id', $managerUser->id)
    ->join('roles', 'model_has_roles.role_id', '=', 'roles.id')
    ->select('roles.name as role_name', 'roles.guard_name')
    ->get();

if ($roleAssignments->isEmpty()) {
    echo "❌ NO entries in model_has_roles table for this user!\n";
    echo "   This confirms the Spatie role was not assigned during user creation.\n\n";
} else {
    echo "✅ Found role assignments:\n";
    foreach ($roleAssignments as $assignment) {
        echo "  - Role: {$assignment->role_name}, Guard: {$assignment->guard_name}\n";
    }
    echo "\n";
}

// Check if Manager role exists
echo "=== Available Roles ===\n";
$availableRoles = DB::table('roles')
    ->where('guard_name', 'user')
    ->get(['id', 'name', 'guard_name']);

echo "Roles in database:\n";
foreach ($availableRoles as $role) {
    echo "  - {$role->name} (guard: {$role->guard_name})\n";
}
echo "\n";

// Recommendation
echo "=== Recommendation ===\n";
if ($spatieRoles->isEmpty() || !$managerUser->hasRole('Manager')) {
    echo "❌ ISSUE FOUND: The user has role='MANAGER' in old column but no Spatie role.\n";
    echo "\n📋 Solution:\n";
    echo "   The UserAccessControlController.php needs to ensure BOTH:\n";
    echo "   1. Old role column is set (already working)\n";
    echo "   2. Spatie role is assigned (failing)\n\n";
    echo "   Run this to fix the existing user:\n";
    echo "   php artisan tinker\n";
    echo "   >>> \$user = App\\Models\\User::find({$managerUser->id});\n";
    echo "   >>> \$user->assignRole('Manager');\n";
    echo "   >>> \$user->getRoleNames();\n\n";
} else {
    echo "✅ User setup looks correct!\n";
    echo "   If still getting 403 errors, check:\n";
    echo "   1. Middleware configuration\n";
    echo "   2. Route definitions\n";
    echo "   3. Controller permission checks\n\n";
}

echo "=== Debug Complete ===\n\n";
