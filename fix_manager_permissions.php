<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

echo "Fix Manager Permissions\n";
echo "=======================\n\n";

// Find manager user
$manager = App\Models\User::where('role', 'Manager')
    ->orWhere('role', 'MANAGER')
    ->first();

if (!$manager) {
    echo "❌ No manager user found with role='Manager' or 'MANAGER'\n";
    exit(1);
}

echo "Found manager: {$manager->email}\n";
echo "Current role column: {$manager->role}\n\n";

// Check if Manager role exists
$managerRole = Spatie\Permission\Models\Role::where('name', 'Manager')
    ->where('guard_name', 'user')
    ->first();

if (!$managerRole) {
    echo "❌ Manager role doesn't exist in database!\n";
    echo "   Running RolesAndPermissionsSeeder...\n\n";
    
    Artisan::call('db:seed', ['--class' => 'Database\\Seeders\\RolesAndPermissionsSeeder']);
    echo Artisan::output();
    
    // Re-fetch the role
    $managerRole = Spatie\Permission\Models\Role::where('name', 'Manager')
        ->where('guard_name', 'user')
        ->first();
}

if (!$managerRole) {
    echo "❌ Failed to create Manager role!\n";
    exit(1);
}

echo "✓ Manager role exists (ID: {$managerRole->id})\n";
echo "  Permissions count: {$managerRole->permissions()->count()}\n\n";

// Remove any existing roles first
echo "Removing any existing roles from user...\n";
$manager->roles()->detach();

// Assign Manager role
echo "Assigning Manager role to user...\n";
$manager->assignRole('Manager');

// Clear permission cache
app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

echo "✓ Role assigned!\n\n";

// Verify
$manager = App\Models\User::find($manager->id); // Fresh instance
echo "Verification:\n";
echo "  hasRole('Manager'): " . ($manager->hasRole('Manager') ? '✓ YES' : '✗ NO') . "\n";
echo "  Total permissions: {$manager->getAllPermissions()->count()}\n";
echo "  can('view-expenses'): " . ($manager->can('view-expenses') ? '✓ YES' : '✗ NO') . "\n";
echo "  can('view-invoices'): " . ($manager->can('view-invoices') ? '✓ YES' : '✗ NO') . "\n";
echo "  can('view-all-audit-logs'): " . ($manager->can('view-all-audit-logs') ? '✓ YES' : '✗ NO') . "\n";

echo "\n=======================\n";
echo "✅ Fix complete! Manager should now have access to all modules.\n";
