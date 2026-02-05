<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

echo "Final Manager Permission Check\n";
echo "==============================\n\n";

// Get manager
$manager = App\Models\User::where('role', 'MANAGER')->first();

if (!$manager) {
    die("No manager found!\n");
}

echo "Manager: {$manager->email}\n";
echo "Model guard: {$manager->guard_name}\n";
echo "Old role column: {$manager->role}\n\n";

// Check database directly
$roleAssignments = DB::select("
    SELECT r.id, r.name, r.guard_name 
    FROM model_has_roles mhr
    JOIN roles r ON r.id = mhr.role_id
    WHERE mhr.model_type = 'App\\\\Models\\\\User'
    AND mhr.model_id = ?
", [$manager->id]);

echo "Database role assignments:\n";
if (empty($roleAssignments)) {
    echo "  NONE FOUND\n";
} else {
    foreach ($roleAssignments as $role) {
        echo "  - {$role->name} (ID: {$role->id}, Guard: {$role->guard_name})\n";
    }
}
echo "\n";

// Test hasRole method
echo "Testing hasRole():\n";
echo "  hasRole('Manager'): " . ($manager->hasRole('Manager') ? 'YES' : 'NO') . "\n";
echo "  hasRole('Manager', 'user'): " . ($manager->hasRole('Manager', 'user') ? 'YES' : 'NO') . "\n\n";

// Get role via Spatie
$managerRoles = $manager->getRoleNames();
echo "getRoleNames(): " . ($managerRoles->isEmpty() ? 'EMPTY' : $managerRoles->implode(', ')) . "\n\n";

// Test permissions
echo "Testing permissions:\n";
$testPerms = ['view-expenses', 'view-invoices', 'view-all-audit-logs'];
foreach ($testPerms as $perm) {
    echo "  can('{$perm}'): " . ($manager->can($perm) ? 'YES' : 'NO') . "\n";
}

echo "\n==============================\n";
