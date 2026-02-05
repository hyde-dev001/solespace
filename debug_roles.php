<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\DB;

echo "Database Check:\n";
echo str_repeat("=", 50) . "\n\n";

// Check model_has_roles table
$roles = DB::table('model_has_roles')
    ->where('model_type', 'App\\Models\\User')
    ->where('model_id', 241)
    ->get();

echo "Roles in model_has_roles for User ID 241:\n";
if ($roles->count() > 0) {
    foreach ($roles as $role) {
        $roleName = DB::table('roles')->where('id', $role->role_id)->first();
        echo "  - Role ID: {$role->role_id} ({$roleName->name})\n";
    }
} else {
    echo "  NONE\n";
}

echo "\n";

// Check all Manager roles in database
$managerRoles = DB::table('roles')->where('name', 'Manager')->get();
echo "Manager roles in database:\n";
foreach ($managerRoles as $role) {
    echo "  - ID: {$role->id}, Name: {$role->name}, Guard: {$role->guard_name}\n";
}

echo "\n";

// Try to assign role fresh
echo "Assigning Manager role...\n";
$user = \App\Models\User::find(241);
try {
    // Remove all roles first
    $user->syncRoles([]);
    echo "  - Removed all roles\n";
    
    // Assign Manager role
    $user->assignRole('Manager');
    echo "  - Assigned Manager role\n";
    
    // Clear cache
    app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();
    echo "  - Cleared cache\n";
    
    // Fresh check
    $user = $user->fresh();
    echo "  - Has Manager role: " . ($user->hasRole('Manager') ? 'YES' : 'NO') . "\n";
    echo "  - Roles: " . $user->getRoleNames()->implode(', ') . "\n";
} catch (\Exception $e) {
    echo "  ERROR: " . $e->getMessage() . "\n";
}
