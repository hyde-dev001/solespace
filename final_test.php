<?php

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

echo "\n";
echo "============================================\n";
echo " FINAL MANAGER PERMISSION TEST\n";
echo "============================================\n\n";

$manager = App\Models\User::where('role', 'MANAGER')->first();

if (!$manager) {
    die("No manager found!\n");
}

echo "Manager: {$manager->email}\n";
echo "Old role: {$manager->role}\n\n";

// Test 1: Database check
echo "[Test 1] Database Role Assignment:\n";
$dbCheck = DB::select("
    SELECT r.name, r.guard_name
    FROM model_has_roles mhr
    JOIN roles r ON r.id = mhr.role_id
    WHERE mhr.model_type = 'App\\\\Models\\\\User' AND mhr.model_id = ?
", [$manager->id]);

if (!empty($dbCheck)) {
    foreach ($dbCheck as $role) {
        echo "  ✓ {$role->name} (guard: {$role->guard_name})\n";
    }
} else {
    echo "  ✗ NO ROLES IN DATABASE\n";
}
echo "\n";

// Test 2: Spatie role check
echo "[Test 2] Spatie hasRole() Check:\n";
$hasManagerRole = $manager->hasRole('Manager');
echo "  " . ($hasManagerRole ? '✓' : '✗') . " hasRole('Manager'): " . ($hasManagerRole ? 'YES' : 'NO') . "\n\n";

// Test 3: Permission check
echo "[Test 3] Permission Checks:\n";
$perms = [
    'view-expenses',
    'view-invoices',
    'view-finance-audit-logs',
    'view-all-audit-logs'
];

foreach ($perms as $perm) {
    $hasPerm = $manager->can($perm);
    echo "  " . ($hasPerm ? '✓' : '✗') . " can('{$perm}'): " . ($hasPerm ? 'YES' : 'NO') . "\n";
}
echo "\n";

// Test 4: Total permissions
echo "[Test 4] Total Permissions:\n";
$allPerms = $manager->getAllPermissions();
echo "  Count: {$allPerms->count()}\n";
if ($allPerms->count() > 0) {
    echo "  First 5: " . $allPerms->take(5)->pluck('name')->implode(', ') . "\n";
}
echo "\n";

// Summary
echo "============================================\n";
$dbOk = !empty($dbCheck);
$roleOk = $hasManagerRole;
$permOk = $manager->can('view-expenses') && $manager->can('view-invoices');

if ($dbOk && $roleOk && $permOk) {
    echo " ✅ ALL TESTS PASSED\n";
    echo "============================================\n";
    echo " Manager has all permissions!\n";
    echo " \n";
    echo " IMPORTANT:\n";
    echo " Please LOGOUT and LOGIN again to apply\n";
    echo " the permission changes in your session.\n";
    echo "============================================\n\n";
} else {
    echo " ⚠ SOME TESTS FAILED\n";
    echo "============================================\n";
    echo " Database role: " . ($dbOk ? 'OK' : 'FAIL') . "\n";
    echo " hasRole check: " . ($roleOk ? 'OK' : 'FAIL') . "\n";
    echo " Permissions: " . ($permOk ? 'OK' : 'FAIL') . "\n\n";
    
    if ($dbOk && !$roleOk) {
        echo " The role exists in DB but hasRole() fails.\n";
        echo " This suggests a configuration or cache issue.\n";
        echo " \n";
        echo " Try:\n";
        echo " 1. Run: php artisan config:clear\n";
        echo " 2. Run: php artisan permission:cache-reset\n";
        echo " 3. Restart your web server\n";
        echo " 4. Logout and login again\n";
    }
    echo "============================================\n\n";
}
