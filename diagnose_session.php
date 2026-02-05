<?php

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

echo "\n";
echo "==========================================\n";
echo " MANAGER SESSION DIAGNOSTIC\n";
echo "==========================================\n\n";

// Check manager user
$manager = App\Models\User::where('email', 'dan@gmail.com')->first();

if (!$manager) {
    echo "❌ Manager not found!\n";
    exit(1);
}

echo "Manager User:\n";
echo "  ID: {$manager->id}\n";
echo "  Email: {$manager->email}\n";
echo "  Old role: {$manager->role}\n";
echo "  Guard: {$manager->guard_name}\n\n";

// Check database role assignment
echo "Database Check:\n";
$dbRoles = DB::select("
    SELECT r.id, r.name, r.guard_name
    FROM model_has_roles mhr
    JOIN roles r ON r.id = mhr.role_id
    WHERE mhr.model_type = 'App\\\\Models\\\\User'
    AND mhr.model_id = ?
", [$manager->id]);

if (empty($dbRoles)) {
    echo "  ❌ NO ROLES in database!\n\n";
    echo "Assigning Manager role now...\n";
    $manager->assignRole('Manager');
    app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();
    echo "  ✓ Role assigned\n\n";
    
    // Reload
    $manager = App\Models\User::find($manager->id);
}

foreach ($dbRoles as $role) {
    echo "  ✓ {$role->name} (ID: {$role->id}, Guard: {$role->guard_name})\n";
}

echo "\n";

// Test Spatie methods
echo "Spatie Role Check:\n";
try {
    $hasRole = $manager->hasRole('Manager');
    echo "  hasRole('Manager'): " . ($hasRole ? '✓ YES' : '✗ NO') . "\n";
    
    $roleNames = $manager->getRoleNames();
    echo "  getRoleNames(): " . ($roleNames->isEmpty() ? 'EMPTY' : $roleNames->implode(', ')) . "\n";
    
    $roles = $manager->roles;
    echo "  Roles count: {$roles->count()}\n";
    
    foreach ($roles as $role) {
        echo "    - {$role->name} (guard: {$role->guard_name})\n";
    }
} catch (Exception $e) {
    echo "  ❌ ERROR: {$e->getMessage()}\n";
}

echo "\n";

// Test permissions
echo "Permission Check:\n";
try {
    $allPerms = $manager->getAllPermissions();
    echo "  Total permissions: {$allPerms->count()}\n";
    
    $canViewExpenses = $manager->can('view-expenses');
    echo "  can('view-expenses'): " . ($canViewExpenses ? '✓ YES' : '✗ NO') . "\n";
} catch (Exception $e) {
    echo "  ❌ ERROR: {$e->getMessage()}\n";
}

echo "\n";

// Check if the issue is with the guard
echo "Guard Check:\n";
$managerRole = Spatie\Permission\Models\Role::where('name', 'Manager')
    ->where('guard_name', 'user')
    ->first();

if ($managerRole) {
    echo "  ✓ Manager role exists (guard: {$managerRole->guard_name})\n";
    echo "  ✓ Role has {$managerRole->permissions()->count()} permissions\n";
} else {
    echo "  ❌ Manager role not found!\n";
}

echo "\n==========================================\n";
echo "CONCLUSION:\n";
echo "==========================================\n\n";

if (!empty($dbRoles) && $manager->hasRole('Manager') && $manager->getAllPermissions()->count() > 0) {
    echo "✅ Everything looks correct!\n";
    echo "   The issue might be:\n";
    echo "   1. Session cache - try logging out in ANOTHER tab/browser\n";
    echo "   2. Browser cache - clear cookies for 127.0.0.1\n";
    echo "   3. PHP session - restart Apache\n\n";
    echo "   Try: Ctrl+Shift+Delete > Clear cookies > Logout > Login\n";
} else {
    echo "❌ There's still an issue with the role assignment\n";
    if (empty($dbRoles)) {
        echo "   - No role in database\n";
    }
    if (!$manager->hasRole('Manager')) {
        echo "   - hasRole() returns false\n";
    }
    if ($manager->getAllPermissions()->count() == 0) {
        echo "   - No permissions\n";
    }
}

echo "\n==========================================\n\n";
