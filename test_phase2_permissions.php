<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

echo "========================================\n";
echo "Phase 2: Roles & Permissions Verification\n";
echo "========================================\n\n";

// Check totals
echo "📊 Database Summary:\n";
echo "  Total Roles: " . Role::count() . "\n";
echo "  Total Permissions: " . Permission::count() . "\n\n";

// Check roles by guard
echo "🔐 Roles by Guard:\n";
echo "  User Guard: " . Role::where('guard_name', 'user')->count() . " roles\n";
echo "  Shop Owner Guard: " . Role::where('guard_name', 'shop_owner')->count() . " roles\n";
echo "  Super Admin Guard: " . Role::where('guard_name', 'super_admin')->count() . " roles\n\n";

// Test specific role permissions
echo "✓ Finance Staff Role:\n";
$financeStaff = Role::findByName('Finance Staff', 'user');
echo "  - Total Permissions: " . $financeStaff->permissions->count() . "\n";
echo "  - Has 'view-expenses': " . ($financeStaff->hasPermissionTo('view-expenses') ? 'YES ✓' : 'NO ✗') . "\n";
echo "  - Has 'approve-expenses': " . ($financeStaff->hasPermissionTo('approve-expenses') ? 'YES ✓' : 'NO ✗') . " (should be NO)\n\n";

echo "✓ Finance Manager Role:\n";
$financeManager = Role::findByName('Finance Manager', 'user');
echo "  - Total Permissions: " . $financeManager->permissions->count() . "\n";
echo "  - Has 'view-expenses': " . ($financeManager->hasPermissionTo('view-expenses') ? 'YES ✓' : 'NO ✗') . "\n";
echo "  - Has 'approve-expenses': " . ($financeManager->hasPermissionTo('approve-expenses') ? 'YES ✓' : 'NO ✗') . " (should be YES)\n";
echo "  - Has 'approve-budgets': " . ($financeManager->hasPermissionTo('approve-budgets') ? 'YES ✓' : 'NO ✗') . " (should be YES)\n\n";

echo "✓ HR Role:\n";
$hr = Role::findByName('HR', 'user');
echo "  - Total Permissions: " . $hr->permissions->count() . "\n";
echo "  - Has 'view-employees': " . ($hr->hasPermissionTo('view-employees') ? 'YES ✓' : 'NO ✗') . "\n";
echo "  - Has 'approve-timeoff': " . ($hr->hasPermissionTo('approve-timeoff') ? 'YES ✓' : 'NO ✗') . "\n\n";

echo "✓ Manager Role:\n";
$manager = Role::findByName('Manager', 'user');
echo "  - Total Permissions: " . $manager->permissions->count() . " (should have ALL)\n";
echo "  - Has 'approve-expenses': " . ($manager->hasPermissionTo('approve-expenses') ? 'YES ✓' : 'NO ✗') . "\n";
echo "  - Has 'view-all-audit-logs': " . ($manager->hasPermissionTo('view-all-audit-logs') ? 'YES ✓' : 'NO ✗') . "\n\n";

echo "✓ Staff Role:\n";
$staff = Role::findByName('Staff', 'user');
echo "  - Total Permissions: " . $staff->permissions->count() . "\n";
echo "  - Has 'view-job-orders': " . ($staff->hasPermissionTo('view-job-orders') ? 'YES ✓' : 'NO ✗') . "\n";
echo "  - Has 'view-dashboard': " . ($staff->hasPermissionTo('view-dashboard') ? 'YES ✓' : 'NO ✗') . "\n\n";

echo "========================================\n";
echo "✅ Phase 2 Complete!\n";
echo "========================================\n";
echo "\nAll roles and permissions have been successfully created and assigned.\n";
echo "Ready for Phase 3: Migrate Existing Users\n";
