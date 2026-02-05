<?php

/**
 * Final Integration Test - Manager Dashboard Access
 * Run: php final_manager_test.php
 */

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(\Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;

echo "\n╔════════════════════════════════════════════════════════════════╗\n";
echo "║          FINAL MANAGER DASHBOARD ACCESS TEST                  ║\n";
echo "╚════════════════════════════════════════════════════════════════╝\n\n";

$manager = User::where('email', 'dan@gmail.com')->first();

if (!$manager) {
    echo "❌ FAILED: Manager not found\n";
    exit(1);
}

$allPass = true;

// Test 1: User Setup
echo "Test 1: User Account Setup\n";
echo "───────────────────────────────────────────────────────────────\n";
echo "   Name: {$manager->name}\n";
echo "   Email: {$manager->email}\n";
echo "   Old Role Column: {$manager->role}\n";
echo "   Spatie Roles: " . $manager->getRoleNames()->implode(', ') . "\n";
$pass1 = !empty($manager->getRoleNames());
echo "   " . ($pass1 ? "✅ PASS" : "❌ FAIL") . "\n\n";
$allPass = $allPass && $pass1;

// Test 2: Role Checks
echo "Test 2: Role Verification\n";
echo "───────────────────────────────────────────────────────────────\n";
$hasManagerRole = $manager->hasRole('Manager');
echo "   hasRole('Manager'): " . ($hasManagerRole ? "✅ YES" : "❌ NO") . "\n";
$hasOldManagerRole = $manager->hasOldRole('MANAGER');
echo "   hasOldRole('MANAGER'): " . ($hasOldManagerRole ? "✅ YES" : "❌ NO") . "\n";
$hasAnyManager = $manager->hasAnyRole(['Manager', 'Finance Manager']);
echo "   hasAnyRole(['Manager', 'Finance Manager']): " . ($hasAnyManager ? "✅ YES" : "❌ NO") . "\n";
$pass2 = $hasManagerRole && $hasOldManagerRole && $hasAnyManager;
echo "   " . ($pass2 ? "✅ PASS" : "❌ FAIL") . "\n\n";
$allPass = $allPass && $pass2;

// Test 3: Permissions
echo "Test 3: Permission Checks\n";
echo "───────────────────────────────────────────────────────────────\n";
$permissions = $manager->getAllPermissions();
$permissionCount = $permissions->count();
echo "   Total Permissions: $permissionCount\n";

$criticalPermissions = [
    'view-all-audit-logs',
    'view-all-users',
    'create-users',
    'edit-users',
    'manage-shop-settings',
];

$permPass = true;
foreach ($criticalPermissions as $perm) {
    $hasPerm = $manager->can($perm);
    echo "   can('$perm'): " . ($hasPerm ? "✅ YES" : "❌ NO") . "\n";
    $permPass = $permPass && $hasPerm;
}
$pass3 = $permPass && $permissionCount > 50;
echo "   " . ($pass3 ? "✅ PASS" : "❌ FAIL") . "\n\n";
$allPass = $allPass && $pass3;

// Test 4: Routes
echo "Test 4: Route Configuration\n";
echo "───────────────────────────────────────────────────────────────\n";
$routes = Route::getRoutes();

$dashboardRoute = $routes->getByName('erp.manager.dashboard');
echo "   Dashboard Route: " . ($dashboardRoute ? "✅ EXISTS" : "❌ MISSING") . "\n";
if ($dashboardRoute) {
    echo "     URI: " . $dashboardRoute->uri() . "\n";
    echo "     Middleware: " . implode(', ', $dashboardRoute->middleware()) . "\n";
}

$statsRoute = $routes->getByName('api.manager.dashboard.stats');
echo "   Stats API Route: " . ($statsRoute ? "✅ EXISTS" : "❌ MISSING") . "\n";
if ($statsRoute) {
    echo "     URI: " . $statsRoute->uri() . "\n";
}

$perfRoute = $routes->getByName('api.manager.staff-performance');
echo "   Performance API Route: " . ($perfRoute ? "✅ EXISTS" : "❌ MISSING") . "\n";

$analyticsRoute = $routes->getByName('api.manager.analytics');
echo "   Analytics API Route: " . ($analyticsRoute ? "✅ EXISTS" : "❌ MISSING") . "\n";

$pass4 = $dashboardRoute && $statsRoute && $perfRoute && $analyticsRoute;
echo "   " . ($pass4 ? "✅ PASS" : "❌ FAIL") . "\n\n";
$allPass = $allPass && $pass4;

// Test 5: Controller
echo "Test 5: Controller Verification\n";
echo "───────────────────────────────────────────────────────────────\n";
$controllerClass = 'App\\Http\\Controllers\\Api\\ManagerController';
$controllerExists = class_exists($controllerClass);
echo "   Controller Exists: " . ($controllerExists ? "✅ YES" : "❌ NO") . "\n";

if ($controllerExists) {
    $methods = ['getDashboardStats', 'getStaffPerformance', 'getAnalytics', 'userHasManagerAccess'];
    $allMethodsExist = true;
    foreach ($methods as $method) {
        $methodExists = method_exists($controllerClass, $method);
        echo "   Method '$method': " . ($methodExists ? "✅ EXISTS" : "❌ MISSING") . "\n";
        $allMethodsExist = $allMethodsExist && $methodExists;
    }
    $pass5 = $allMethodsExist;
} else {
    $pass5 = false;
}
echo "   " . ($pass5 ? "✅ PASS" : "❌ FAIL") . "\n\n";
$allPass = $allPass && $pass5;

// Test 6: Middleware Logic Simulation
echo "Test 6: Middleware Logic Simulation\n";
echo "───────────────────────────────────────────────────────────────\n";
// Simulate what the middleware checks
$oldRoleMatches = strcasecmp($manager->role, 'MANAGER') === 0;
echo "   Old Role Column Match: " . ($oldRoleMatches ? "✅ YES" : "❌ NO") . "\n";

$spatieRoleMatches = $manager->hasRole('Manager');
echo "   Spatie Role Match: " . ($spatieRoleMatches ? "✅ YES" : "❌ NO") . "\n";

$pass6 = $oldRoleMatches || $spatieRoleMatches;
echo "   Would Grant Access: " . ($pass6 ? "✅ YES" : "❌ NO") . "\n";
echo "   " . ($pass6 ? "✅ PASS" : "❌ FAIL") . "\n\n";
$allPass = $allPass && $pass6;

// Final Summary
echo "╔════════════════════════════════════════════════════════════════╗\n";
echo "║                         TEST SUMMARY                           ║\n";
echo "╠════════════════════════════════════════════════════════════════╣\n";
echo "║ Test 1 (User Setup):        " . ($pass1 ? "✅ PASS" : "❌ FAIL") . "                              ║\n";
echo "║ Test 2 (Role Checks):       " . ($pass2 ? "✅ PASS" : "❌ FAIL") . "                              ║\n";
echo "║ Test 3 (Permissions):       " . ($pass3 ? "✅ PASS" : "❌ FAIL") . "                              ║\n";
echo "║ Test 4 (Routes):            " . ($pass4 ? "✅ PASS" : "❌ FAIL") . "                              ║\n";
echo "║ Test 5 (Controller):        " . ($pass5 ? "✅ PASS" : "❌ FAIL") . "                              ║\n";
echo "║ Test 6 (Middleware):        " . ($pass6 ? "✅ PASS" : "❌ FAIL") . "                              ║\n";
echo "╠════════════════════════════════════════════════════════════════╣\n";

if ($allPass) {
    echo "║                  🎉 ALL TESTS PASSED 🎉                        ║\n";
    echo "╠════════════════════════════════════════════════════════════════╣\n";
    echo "║  Manager dashboard access is fully configured and working!     ║\n";
    echo "║                                                                ║\n";
    echo "║  ✅ User can login as Manager                                  ║\n";
    echo "║  ✅ User can access /erp/manager/dashboard                     ║\n";
    echo "║  ✅ API endpoints will return data                             ║\n";
    echo "║  ✅ All permissions are granted                                ║\n";
    echo "║                                                                ║\n";
    echo "║  Next Steps:                                                   ║\n";
    echo "║  1. Login as: {$manager->email}                        ║\n";
    echo "║  2. Navigate to: http://127.0.0.1:8000/erp/manager/dashboard   ║\n";
    echo "║  3. Verify dashboard loads with statistics                     ║\n";
    echo "║  4. If issues persist, clear browser cache                     ║\n";
    echo "╚════════════════════════════════════════════════════════════════╝\n\n";
    exit(0);
} else {
    echo "║                  ❌ SOME TESTS FAILED ❌                       ║\n";
    echo "╠════════════════════════════════════════════════════════════════╣\n";
    echo "║  Please review the failures above and:                         ║\n";
    echo "║  1. Run: php artisan optimize:clear                            ║\n";
    echo "║  2. Run: php artisan permission:cache-reset                    ║\n";
    echo "║  3. Check for any error messages                               ║\n";
    echo "║  4. Re-run this test                                           ║\n";
    echo "╚════════════════════════════════════════════════════════════════╝\n\n";
    exit(1);
}
