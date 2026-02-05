<?php
require 'vendor/autoload.php';
$app = require 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

// Get fresh user instance
$manager = App\Models\User::where('email', 'dan@gmail.com')->first();

echo "\nUser Model Guard Investigation:\n";
echo "=====================================\n\n";

echo "Properties:\n";
echo "  \$guard_name property: '{$manager->guard_name}'\n";
echo "  getDefaultGuardName(): '{$manager->getDefaultGuardName()}'\n";
echo "  getTable(): '{$manager->getTable()}'\n\n";

echo "Role Relationship:\n";
try {
    // Load roles fresh
    $manager->load('roles');
    $roles = $manager->roles;
    echo "  Roles count: {$roles->count()}\n";
    foreach ($roles as $role) {
        echo "  - Name: '{$role->name}', Guard: '{$role->guard_name}'\n";
    }
} catch (Exception $e) {
    echo "  ERROR: {$e->getMessage()}\n";
}

echo "\nTesting hasRole with guard specification:\n";
echo "  hasRole('Manager'): " . ($manager->hasRole('Manager') ? 'TRUE' : 'FALSE') . "\n";
echo "  hasRole('Manager', 'user'): " . ($manager->hasRole('Manager', 'user') ? 'TRUE' : 'FALSE') . "\n";

echo "\nDirect Permission Registry Check:\n";
$registrar = app(\Spatie\Permission\PermissionRegistrar::class);
echo "  Permission class: " . $registrar->getPermissionClass() . "\n";
echo "  Role class: " . $registrar->getRoleClass() . "\n";

echo "\n=====================================\n\n";
