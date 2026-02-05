<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

echo "Database Check\n";
echo "==============\n\n";

// Check manager user
$manager = DB::table('users')->where('role', 'MANAGER')->first();
echo "Manager user ID: {$manager->id}\n";
echo "Manager email: {$manager->email}\n\n";

// Check roles table
echo "Roles in database:\n";
$roles = DB::table('roles')->where('guard_name', 'user')->get();
foreach ($roles as $role) {
    echo "  ID: {$role->id}, Name: {$role->name}, Guard: {$role->guard_name}\n";
}
echo "\n";

// Check role assignments
echo "Role assignments for manager (user_id={$manager->id}):\n";
$assignments = DB::table('model_has_roles')
    ->where('model_type', 'App\\Models\\User')
    ->where('model_id', $manager->id)
    ->get();

if ($assignments->isEmpty()) {
    echo "  ❌ NO ROLES ASSIGNED!\n\n";
    
    // Assign Manager role
    $managerRole = DB::table('roles')
        ->where('name', 'Manager')
        ->where('guard_name', 'user')
        ->first();
    
    if ($managerRole) {
        echo "Assigning Manager role (ID: {$managerRole->id})...\n";
        DB::table('model_has_roles')->insert([
            'role_id' => $managerRole->id,
            'model_type' => 'App\\Models\\User',
            'model_id' => $manager->id
        ]);
        echo "✓ Role assigned!\n\n";
    }
} else {
    foreach ($assignments as $assignment) {
        $role = DB::table('roles')->where('id', $assignment->role_id)->first();
        echo "  - Role ID: {$assignment->role_id}, Name: {$role->name}\n";
    }
    echo "\n";
}

// Verify
echo "Final check:\n";
$finalAssignments = DB::table('model_has_roles')
    ->where('model_type', 'App\\Models\\User')
    ->where('model_id', $manager->id)
    ->count();
echo "  Role assignments: {$finalAssignments}\n";

// Clear cache
Artisan::call('cache:clear');
echo "  ✓ Cache cleared\n";

echo "\n==============\n";
echo "✅ Manager should now have permissions. Please logout and login again.\n";
