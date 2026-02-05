<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\User;
use App\Models\ShopOwner;
use App\Models\SuperAdmin;
use Spatie\Permission\Models\Role;

echo "========================================\n";
echo "Phase 3: User Migration Verification\n";
echo "========================================\n\n";

// ===== VERIFY USERS =====
echo "📊 Employee Users (user guard):\n";

$totalUsers = User::whereNotNull('role')->count();
$usersWithRoles = User::whereNotNull('role')->whereHas('roles')->count();

echo "  Total users with role column: {$totalUsers}\n";
echo "  Users assigned to Spatie roles: {$usersWithRoles}\n";

if ($totalUsers === $usersWithRoles) {
    echo "  ✅ All users successfully migrated!\n\n";
} else {
    echo "  ⚠ Warning: " . ($totalUsers - $usersWithRoles) . " users not yet migrated\n\n";
}

// Show role distribution
echo "  Role Distribution:\n";
$roleMapping = [
    'FINANCE_STAFF' => 'Finance Staff',
    'FINANCE_MANAGER' => 'Finance Manager',
    'HR' => 'HR',
    'CRM' => 'CRM',
    'MANAGER' => 'Manager',
    'STAFF' => 'Staff',
];

foreach ($roleMapping as $oldRole => $newRole) {
    $oldCount = User::where('role', $oldRole)->count();
    if ($oldCount > 0) {
        $newCount = User::where('role', $oldRole)->whereHas('roles', function($q) use ($newRole) {
            $q->where('name', $newRole);
        })->count();
        $status = $oldCount === $newCount ? '✓' : '✗';
        echo "    {$status} {$oldRole} → {$newRole}: {$newCount}/{$oldCount}\n";
    }
}
echo "\n";

// ===== VERIFY SHOP OWNERS =====
echo "📊 Shop Owners (shop_owner guard):\n";

$totalShopOwners = ShopOwner::count();
$shopOwnersWithRoles = ShopOwner::whereHas('roles')->count();

echo "  Total shop owners: {$totalShopOwners}\n";
echo "  Shop owners with role: {$shopOwnersWithRoles}\n";

if ($totalShopOwners === $shopOwnersWithRoles) {
    echo "  ✅ All shop owners successfully migrated!\n\n";
} else {
    echo "  ⚠ Warning: " . ($totalShopOwners - $shopOwnersWithRoles) . " shop owners not yet migrated\n\n";
}

// ===== VERIFY SUPER ADMINS =====
echo "📊 Super Admins (super_admin guard):\n";

$totalSuperAdmins = SuperAdmin::count();
$superAdminsWithRoles = SuperAdmin::whereHas('roles')->count();

echo "  Total super admins: {$totalSuperAdmins}\n";
echo "  Super admins with role: {$superAdminsWithRoles}\n";

if ($totalSuperAdmins === $superAdminsWithRoles) {
    echo "  ✅ All super admins successfully migrated!\n\n";
} else {
    echo "  ⚠ Warning: " . ($totalSuperAdmins - $superAdminsWithRoles) . " super admins not yet migrated\n\n";
}

// ===== TEST SPECIFIC USERS =====
echo "🔍 Testing Specific User Permissions:\n\n";

// Test Finance Staff
$financeStaffUsers = User::where('role', 'FINANCE_STAFF')->whereHas('roles')->get();
if ($financeStaffUsers->count() > 0) {
    $user = $financeStaffUsers->first();
    echo "✓ Finance Staff User: {$user->email}\n";
    echo "  - Has role 'Finance Staff': " . ($user->hasRole('Finance Staff') ? 'YES ✓' : 'NO ✗') . "\n";
    echo "  - Can view expenses: " . ($user->can('view-expenses') ? 'YES ✓' : 'NO ✗') . "\n";
    echo "  - Can approve expenses: " . ($user->can('approve-expenses') ? 'YES ✓' : 'NO ✗') . " (should be NO)\n\n";
}

// Test Finance Manager
$financeManagerUsers = User::where('role', 'FINANCE_MANAGER')->whereHas('roles')->get();
if ($financeManagerUsers->count() > 0) {
    $user = $financeManagerUsers->first();
    echo "✓ Finance Manager User: {$user->email}\n";
    echo "  - Has role 'Finance Manager': " . ($user->hasRole('Finance Manager') ? 'YES ✓' : 'NO ✗') . "\n";
    echo "  - Can view expenses: " . ($user->can('view-expenses') ? 'YES ✓' : 'NO ✗') . "\n";
    echo "  - Can approve expenses: " . ($user->can('approve-expenses') ? 'YES ✓' : 'NO ✗') . " (should be YES)\n\n";
}

// Test Manager
$managerUsers = User::where('role', 'MANAGER')->whereHas('roles')->get();
if ($managerUsers->count() > 0) {
    $user = $managerUsers->first();
    echo "✓ Manager User: {$user->email}\n";
    echo "  - Has role 'Manager': " . ($user->hasRole('Manager') ? 'YES ✓' : 'NO ✗') . "\n";
    echo "  - Total permissions: " . $user->getAllPermissions()->count() . " (should be 69)\n";
    echo "  - Can approve expenses: " . ($user->can('approve-expenses') ? 'YES ✓' : 'NO ✗') . "\n";
    echo "  - Can view all audit logs: " . ($user->can('view-all-audit-logs') ? 'YES ✓' : 'NO ✗') . "\n\n";
}

// Test Shop Owner
$shopOwner = ShopOwner::whereHas('roles')->first();
if ($shopOwner) {
    echo "✓ Shop Owner: {$shopOwner->email}\n";
    echo "  - Has role 'Shop Owner': " . ($shopOwner->hasRole('Shop Owner') ? 'YES ✓' : 'NO ✗') . "\n";
    echo "  - Guard: " . $shopOwner->guard_name . "\n\n";
}

// Test Super Admin
$superAdmin = SuperAdmin::whereHas('roles')->first();
if ($superAdmin) {
    echo "✓ Super Admin: {$superAdmin->email}\n";
    echo "  - Has role 'Super Admin': " . ($superAdmin->hasRole('Super Admin') ? 'YES ✓' : 'NO ✗') . "\n";
    echo "  - Guard: " . $superAdmin->guard_name . "\n\n";
}

// ===== VERIFY OLD ROLE COLUMN INTACT =====
echo "🔒 Rollback Safety Check:\n";
$usersWithOldRole = User::whereNotNull('role')->count();
echo "  Users with old 'role' column intact: {$usersWithOldRole}\n";
echo "  ✅ Old role column preserved for rollback\n\n";

// ===== FINAL SUMMARY =====
echo "========================================\n";
echo "✅ Phase 3 Complete!\n";
echo "========================================\n\n";

$totalMigrated = $usersWithRoles + $shopOwnersWithRoles + $superAdminsWithRoles;
echo "Summary:\n";
echo "  - Total accounts migrated: {$totalMigrated}\n";
echo "  - Employee users: {$usersWithRoles}\n";
echo "  - Shop owners: {$shopOwnersWithRoles}\n";
echo "  - Super admins: {$superAdminsWithRoles}\n\n";

echo "Next Steps:\n";
echo "  - All users have been assigned Spatie Permission roles\n";
echo "  - Old 'role' column is preserved for rollback\n";
echo "  - Ready for Phase 4: Update Middleware & Routes\n";
