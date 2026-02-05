<?php

/**
 * Verification script for simplified role system
 * Run: php verify_simplified_roles.php
 */

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\User;
use App\Models\PositionTemplate;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Illuminate\Support\Facades\DB;

echo "\n╔════════════════════════════════════════════════════════════╗\n";
echo "║        SIMPLIFIED ROLE SYSTEM VERIFICATION                 ║\n";
echo "╚════════════════════════════════════════════════════════════╝\n\n";

// 1. Check Available Roles
echo "📋 1. AVAILABLE ROLES\n";
echo "═══════════════════════════════════════════════\n";
$roles = Role::where('guard_name', 'user')->get();
echo "Total Roles: " . $roles->count() . "\n\n";
foreach ($roles as $role) {
    $permCount = $role->permissions->count();
    echo "  ✓ {$role->name}\n";
    echo "    - Permissions: {$permCount}\n";
    if ($permCount > 0 && $permCount <= 10) {
        echo "    - Sample: " . $role->permissions->take(5)->pluck('name')->join(', ') . "\n";
    }
}

// 2. Check Old Roles Removed
echo "\n\n📋 2. OLD DEPARTMENT ROLES STATUS\n";
echo "═══════════════════════════════════════════════\n";
$oldRoles = ['HR', 'Finance Staff', 'Finance Manager', 'CRM'];
$foundOldRoles = Role::whereIn('name', $oldRoles)->where('guard_name', 'user')->get();

if ($foundOldRoles->isEmpty()) {
    echo "  ✅ ALL old department roles removed successfully!\n";
    echo "  ✅ System now uses only Manager and Staff\n";
} else {
    echo "  ❌ WARNING: Found " . $foundOldRoles->count() . " old roles:\n";
    foreach ($foundOldRoles as $role) {
        echo "    - {$role->name}\n";
    }
}

// 3. Check Users Table
echo "\n\n📋 3. USERS TABLE STATUS\n";
echo "═══════════════════════════════════════════════\n";
$userRoles = User::select('role', DB::raw('COUNT(*) as count'))
    ->whereNotNull('role')
    ->groupBy('role')
    ->get();

echo "User role distribution:\n";
foreach ($userRoles as $ur) {
    echo "  - {$ur->role}: {$ur->count} users\n";
}

// Check if position column exists
$hasPositionColumn = DB::select("SHOW COLUMNS FROM users LIKE 'position'");
if (!empty($hasPositionColumn)) {
    echo "\n  ✅ Position column added to users table\n";
    $usersWithPosition = User::whereNotNull('position')->count();
    echo "  📊 Users with position assigned: {$usersWithPosition}\n";
} else {
    echo "\n  ❌ Position column not found in users table\n";
}

// 4. Check Position Templates
echo "\n\n📋 4. POSITION TEMPLATES\n";
echo "═══════════════════════════════════════════════\n";
$templates = PositionTemplate::where('is_active', true)->get();
echo "Total Active Templates: " . $templates->count() . "\n\n";

$grouped = $templates->groupBy('category');
foreach ($grouped as $category => $categoryTemplates) {
    echo "  📁 {$category}\n";
    foreach ($categoryTemplates as $template) {
        $permCount = $template->templatePermissions->count();
        echo "     └─ {$template->name} ({$permCount} permissions)\n";
    }
}

// 5. Check Permissions
echo "\n\n📋 5. PERMISSIONS STATUS\n";
echo "═══════════════════════════════════════════════\n";
$totalPermissions = Permission::where('guard_name', 'user')->count();
echo "Total Permissions: {$totalPermissions}\n\n";

// Group permissions by module
$permissionsByModule = [
    'Finance' => Permission::where('guard_name', 'user')
        ->where(function($q) {
            $q->where('name', 'like', '%expense%')
              ->orWhere('name', 'like', '%invoice%')
              ->orWhere('name', 'like', '%finance%');
        })->count(),
    'HR' => Permission::where('guard_name', 'user')
        ->where(function($q) {
            $q->where('name', 'like', '%employee%')
              ->orWhere('name', 'like', '%attendance%')
              ->orWhere('name', 'like', '%payroll%')
              ->orWhere('name', 'like', '%hr%');
        })->count(),
    'CRM' => Permission::where('guard_name', 'user')
        ->where(function($q) {
            $q->where('name', 'like', '%customer%')
              ->orWhere('name', 'like', '%lead%')
              ->orWhere('name', 'like', '%opportunity%')
              ->orWhere('name', 'like', '%crm%');
        })->count(),
    'Management' => Permission::where('guard_name', 'user')
        ->where(function($q) {
            $q->where('name', 'like', '%user%')
              ->orWhere('name', 'like', '%product%')
              ->orWhere('name', 'like', '%inventory%')
              ->orWhere('name', 'like', '%shop%');
        })->count(),
];

foreach ($permissionsByModule as $module => $count) {
    echo "  - {$module}: {$count} permissions\n";
}

// 6. Sample User Check
echo "\n\n📋 6. SAMPLE USER VERIFICATION\n";
echo "═══════════════════════════════════════════════\n";
$sampleUser = User::whereNotNull('role')
    ->orderBy('created_at', 'desc')
    ->first();

if ($sampleUser) {
    echo "Sample User: {$sampleUser->name} ({$sampleUser->email})\n";
    echo "  - Old Role Column: {$sampleUser->role}\n";
    echo "  - Position: " . ($sampleUser->position ?? 'Not set') . "\n";
    echo "  - Spatie Role: " . ($sampleUser->getRoleNames()->first() ?? 'None') . "\n";
    echo "  - Total Permissions: " . $sampleUser->getAllPermissions()->count() . "\n";
    
    if ($sampleUser->role === 'MANAGER') {
        $hasAllPerms = $sampleUser->getAllPermissions()->count() >= 50;
        echo "  - Has Manager Access: " . ($hasAllPerms ? "✅ Yes" : "❌ No") . "\n";
    } else {
        $hasBasicPerms = $sampleUser->can('view-dashboard');
        echo "  - Has Basic Access: " . ($hasBasicPerms ? "✅ Yes" : "❌ No") . "\n";
    }
} else {
    echo "  ℹ️  No users found to verify\n";
}

// 7. Summary
echo "\n\n╔════════════════════════════════════════════════════════════╗\n";
echo "║                    VERIFICATION SUMMARY                    ║\n";
echo "╚════════════════════════════════════════════════════════════╝\n\n";

$checks = [
    'Manager role exists' => Role::where('name', 'Manager')->where('guard_name', 'user')->exists(),
    'Staff role exists' => Role::where('name', 'Staff')->where('guard_name', 'user')->exists(),
    'Old roles removed' => $foundOldRoles->isEmpty(),
    'Position column added' => !empty($hasPositionColumn),
    'Position templates loaded' => $templates->count() >= 10,
    'Permissions available' => $totalPermissions >= 50,
];

foreach ($checks as $check => $passed) {
    $icon = $passed ? '✅' : '❌';
    echo "  {$icon} {$check}\n";
}

$allPassed = !in_array(false, $checks, true);

echo "\n";
if ($allPassed) {
    echo "  🎉 ALL CHECKS PASSED! Role system simplified successfully!\n";
    echo "\n  ✨ Next Steps:\n";
    echo "     1. Test creating a new Manager user\n";
    echo "     2. Test creating a new Staff user with a position template\n";
    echo "     3. Verify Staff can access only their assigned permissions\n";
    echo "     4. Verify Manager has full system access\n";
} else {
    echo "  ⚠️  Some checks failed. Please review the output above.\n";
}

echo "\n╚════════════════════════════════════════════════════════════╝\n\n";
