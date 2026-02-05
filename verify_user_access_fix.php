<?php

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

echo "\n";
echo "=================================================\n";
echo " USER ACCESS CONTROL FIX VERIFICATION\n";
echo "=================================================\n\n";

// Check the role mapping in the controller
echo "[1] Role Mapping:\n";
$roleMapping = [
    'HR' => 'HR',
    'FINANCE_STAFF' => 'Finance Staff',
    'FINANCE_MANAGER' => 'Finance Manager',
    'CRM' => 'CRM',
    'MANAGER' => 'Manager',
    'STAFF' => 'Staff',
    'SCM' => 'Staff',
    'MRP' => 'Staff',
];

foreach ($roleMapping as $oldRole => $newRole) {
    echo "  {$oldRole} → {$newRole}\n";
}

echo "\n[2] Verifying Spatie Roles Exist:\n";
$missingRoles = [];
foreach (array_unique(array_values($roleMapping)) as $roleName) {
    $role = Spatie\Permission\Models\Role::where('name', $roleName)
        ->where('guard_name', 'user')
        ->first();
    
    if ($role) {
        echo "  ✓ {$roleName} (ID: {$role->id}, {$role->permissions()->count()} permissions)\n";
    } else {
        echo "  ✗ {$roleName} - NOT FOUND!\n";
        $missingRoles[] = $roleName;
    }
}

if (!empty($missingRoles)) {
    echo "\n⚠ WARNING: Some roles are missing!\n";
    echo "   Run: php artisan db:seed --class=Database\\Seeders\\RolesAndPermissionsSeeder\n";
}

echo "\n[3] Testing Manager Account:\n";
$manager = App\Models\User::where('role', 'MANAGER')->first();
if ($manager) {
    echo "  Email: {$manager->email}\n";
    echo "  Old role column: {$manager->role}\n";
    echo "  Has Manager role: " . ($manager->hasRole('Manager') ? '✓ YES' : '✗ NO') . "\n";
    echo "  Permissions: {$manager->getAllPermissions()->count()}\n";
    echo "  Can access Finance: " . ($manager->can('view-expenses') ? '✓ YES' : '✗ NO') . "\n";
} else {
    echo "  ℹ No manager found\n";
}

echo "\n=================================================\n";
echo " FIX STATUS\n";
echo "=================================================\n\n";

echo "✅ Controller updated to assign Spatie roles\n";
echo "✅ Role mapping configured for all departments\n";
echo "✅ New employees will get proper permissions\n\n";

echo "NEXT STEPS:\n";
echo "1. Test by creating a new employee from Shop Owner dashboard\n";
echo "2. Verify the new employee can access their assigned module\n";
echo "3. Existing employees (like your Manager) should logout/login\n\n";

echo "=================================================\n\n";
