<?php

use Illuminate\Support\Facades\Artisan;

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "\n";
echo "==========================================\n";
echo " MANAGER PERMISSION FIX\n";
echo "==========================================\n\n";

// Step 1: Find manager user
echo "[1/5] Finding manager user...\n";
$manager = App\Models\User::where('role', 'MANAGER')
    ->orWhere('role', 'Manager')
    ->first();

if (!$manager) {
    die("❌ ERROR: No manager user found!\n");
}

echo "  ✓ Found: {$manager->email} (ID: {$manager->id})\n";
echo "  Old role column: {$manager->role}\n\n";

// Step 2: Ensure roles and permissions exist
echo "[2/5] Checking roles and permissions...\n";
$managerRole = Spatie\Permission\Models\Role::where('name', 'Manager')
    ->where('guard_name', 'user')
    ->first();

if (!$managerRole) {
    echo "  ⚠ Manager role not found. Creating roles...\n";
    Artisan::call('db:seed', [
        '--class' => 'Database\\Seeders\\RolesAndPermissionsSeeder',
        '--force' => true
    ]);
    
    $managerRole = Spatie\Permission\Models\Role::where('name', 'Manager')
        ->where('guard_name', 'user')
        ->first();
    
    if (!$managerRole) {
        die("❌ ERROR: Failed to create Manager role!\n");
    }
}

echo "  ✓ Manager role exists (ID: {$managerRole->id})\n";
echo "  ✓ Role has {$managerRole->permissions()->count()} permissions\n\n";

// Step 3: Remove existing roles and reassign
echo "[3/5] Assigning Manager role...\n";

// Remove all existing role assignments for this user
DB::table('model_has_roles')
    ->where('model_type', 'App\\Models\\User')
    ->where('model_id', $manager->id)
    ->delete();
echo "  ✓ Cleared existing role assignments\n";

// Assign Manager role directly in database
DB::table('model_has_roles')->insert([
    'role_id' => $managerRole->id,
    'model_type' => 'App\\Models\\User',
    'model_id' => $manager->id
]);
echo "  ✓ Assigned Manager role\n\n";

// Step 4: Clear all caches
echo "[4/5] Clearing caches...\n";
Artisan::call('permission:cache-reset');
echo "  ✓ Permission cache cleared\n";
Artisan::call('cache:clear');
echo "  ✓ Application cache cleared\n";
Artisan::call('config:clear');
echo "  ✓ Config cache cleared\n\n";

// Step 5: Verify
echo "[5/5] Verifying...\n";

// Get fresh instance
$manager = App\Models\User::find($manager->id);

$hasRole = $manager->hasRole('Manager');
$permissionCount = $manager->getAllPermissions()->count();
$canViewExpenses = $manager->can('view-expenses');
$canViewInvoices = $manager->can('view-invoices');
$canViewAuditLogs = $manager->can('view-all-audit-logs');

echo "  hasRole('Manager'): " . ($hasRole ? '✓ YES' : '✗ NO') . "\n";
echo "  Total permissions: {$permissionCount}\n";
echo "  can('view-expenses'): " . ($canViewExpenses ? '✓ YES' : '✗ NO') . "\n";
echo "  can('view-invoices'): " . ($canViewInvoices ? '✓ YES' : '✗ NO') . "\n";
echo "  can('view-all-audit-logs'): " . ($canViewAuditLogs ? '✓ YES' : '✗ NO') . "\n\n";

if ($hasRole && $permissionCount > 0 && $canViewExpenses && $canViewInvoices) {
    echo "==========================================\n";
    echo " ✅ SUCCESS!\n";
    echo "==========================================\n";
    echo " Manager has been assigned all permissions.\n";
    echo " Please LOGOUT and LOGIN again to apply changes.\n";
    echo "==========================================\n\n";
} else {
    echo "==========================================\n";
    echo " ⚠ PARTIAL SUCCESS\n";
    echo "==========================================\n";
    echo " Role was assigned but permissions may not\n";
    echo " be working. This could be a guard issue.\n";
    echo " \n";
    echo " Next steps:\n";
    echo " 1. Check User model has: protected \$guard_name = 'user';\n";
    echo " 2. Logout and login again\n";
    echo " 3. If still not working, check middleware in routes\n";
    echo "==========================================\n\n";
}
