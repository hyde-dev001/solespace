<?php

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

echo "GUARD DIAGNOSTIC\n";
echo "================\n\n";

$manager = App\Models\User::find(241); // Direct ID

echo "User Model:\n";
echo "  ID: {$manager->id}\n";
echo "  Email: {$manager->email}\n";
echo "  Class: " . get_class($manager) . "\n";
echo "  \$guard_name property: {$manager->guard_name}\n";
echo "  getDefaultGuardName(): " . $manager->getDefaultGuardName() . "\n\n";

echo "Role from database:\n";
$roleInDb = DB::select("
    SELECT r.* 
    FROM model_has_roles mhr
    JOIN roles r ON r.id = mhr.role_id
    WHERE mhr.model_type = ? AND mhr.model_id = ?
", ['App\\Models\\User', 241]);

foreach ($roleInDb as $role) {
    echo "  Role: {$role->name}\n";
    echo "  Guard: {$role->guard_name}\n\n";
}

echo "Spatie hasRole() check:\n";
echo "  hasRole('Manager'): " . ($manager->hasRole('Manager') ? 'YES' : 'NO') . "\n";
echo "  hasRole('Manager', 'user'): " . ($manager->hasRole('Manager', 'user') ? 'YES' : 'NO') . "\n\n";

echo "Direct role check:\n";
$roles = $manager->roles;
echo "  \$manager->roles count: " . $roles->count() . "\n";
foreach ($roles as $role) {
    echo "    - {$role->name} (guard: {$role->guard_name})\n";
}
echo "\n";

echo "getRoleNames():\n";
$roleNames = $manager->getRoleNames();
echo "  " . ($roleNames->isEmpty() ? 'EMPTY' : $roleNames->implode(', ')) . "\n\n";

echo "Checking if guard_name is set at runtime...\n";
$freshUser = new App\Models\User();
echo "  New instance guard: " . $freshUser->getDefaultGuardName() . "\n\n";

echo "================\n";

if ($roles->count() > 0 && !$manager->hasRole('Manager')) {
    echo "❌ PROBLEM: Roles exist but hasRole() returns false!\n";
    echo "   This is likely a guard mismatch or cache issue.\n\n";
    
    echo "Attempting to reload permissions...\n";
    $manager->load('roles', 'permissions');
    app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();
    
    // Try again
    $manager2 = App\Models\User::find(241);
    echo "After reload - hasRole('Manager'): " . ($manager2->hasRole('Manager') ? 'YES' : 'NO') . "\n";
}
