<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

echo "Deep Permission Debugging\n";
echo "=========================\n\n";

$manager = App\Models\User::where('role', 'MANAGER')->first();

echo "Manager: {$manager->email}\n";
echo "Model class: " . get_class($manager) . "\n";
echo "Model guard_name property: {$manager->guard_name}\n";
echo "getDefaultGuardName(): " . $manager->getDefaultGuardName() . "\n\n";

// Check roles
$roles = DB::table('model_has_roles')
    ->where('model_type', 'App\\Models\\User')
    ->where('model_id', $manager->id)
    ->get();

echo "Roles in pivot table:\n";
foreach ($roles as $roleAssignment) {
    $role = Spatie\Permission\Models\Role::find($roleAssignment->role_id);
    if ($role) {
        echo "  - Role: {$role->name}, Guard: {$role->guard_name}\n";
    }
}
echo "\n";

// Test with explicit guard
echo "Testing with explicit guard:\n";
echo "  hasRole('Manager', 'user'): " . ($manager->hasRole('Manager', 'user') ? 'YES' : 'NO') . "\n";

// Check permission cache
echo "\nChecking permission cache...\n";
$cacheKey = 'spatie.permission.cache';
if (Cache::has($cacheKey)) {
    echo "  Cache exists\n";
} else {
    echo "  No cache\n";
}

// Clear and retry
app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();
echo "\n  Cache cleared\n";

// Get fresh instance
$freshManager = App\Models\User::find($manager->id);
echo "\nFresh instance test:\n";
echo "  hasRole('Manager'): " . ($freshManager->hasRole('Manager') ? 'YES' : 'NO') . "\n";
echo "  can('view-expenses'): " . ($freshManager->can('view-expenses') ? 'YES' : 'NO') . "\n";

// Test permissions direct from role
echo "\nDirect role test:\n";
$managerRole = Spatie\Permission\Models\Role::where('name', 'Manager')->where('guard_name', 'user')->first();
$permissions = $managerRole->permissions;
echo "  Manager role has {$permissions->count()} permissions\n";
echo "  First few: " . $permissions->take(3)->pluck('name')->implode(', ') . "\n";

echo "\n=========================\n";
