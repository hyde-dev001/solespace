<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

echo "Detailed Manager Role Check\n";
echo "===========================\n\n";

$manager = App\Models\User::where('role', 'Manager')->orWhere('role', 'MANAGER')->first();

if ($manager) {
    echo "Manager User:\n";
    echo "  Email: {$manager->email}\n";
    echo "  Old role: {$manager->role}\n";
    echo "  Guard: {$manager->guard_name}\n\n";
    
    // Check roles table
    $managerRole = Spatie\Permission\Models\Role::where('name', 'Manager')->where('guard_name', 'user')->first();
    if ($managerRole) {
        echo "Manager Role in database:\n";
        echo "  ID: {$managerRole->id}\n";
        echo "  Name: {$managerRole->name}\n";
        echo "  Guard: {$managerRole->guard_name}\n";
        echo "  Permissions count: {$managerRole->permissions()->count()}\n\n";
    } else {
        echo "❌ Manager role NOT FOUND in roles table!\n\n";
    }
    
    // Check role assignment
    $assignedRoles = DB::table('model_has_roles')
        ->where('model_type', 'App\\Models\\User')
        ->where('model_id', $manager->id)
        ->get();
    
    echo "Role assignments for this user:\n";
    if ($assignedRoles->isEmpty()) {
        echo "  ❌ NO ROLES ASSIGNED in model_has_roles table!\n";
    } else {
        foreach ($assignedRoles as $assignment) {
            $role = Spatie\Permission\Models\Role::find($assignment->role_id);
            echo "  - Role ID: {$assignment->role_id}, Name: " . ($role ? $role->name : 'NOT FOUND') . "\n";
        }
    }
    
    echo "\n";
    
    // Check direct permissions
    $directPermissions = DB::table('model_has_permissions')
        ->where('model_type', 'App\\Models\\User')
        ->where('model_id', $manager->id)
        ->get();
    
    echo "Direct permissions count: {$directPermissions->count()}\n\n";
    
    // Re-test with fresh instance
    echo "Testing with fresh user instance:\n";
    $freshManager = App\Models\User::find($manager->id);
    echo "  hasRole('Manager'): " . ($freshManager->hasRole('Manager') ? 'YES' : 'NO') . "\n";
    echo "  can('view-expenses'): " . ($freshManager->can('view-expenses') ? 'YES' : 'NO') . "\n";
    
} else {
    echo "❌ No manager user found\n";
}

echo "\n===========================\n";
