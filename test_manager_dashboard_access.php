<?php

/**
 * Test Manager Dashboard Access
 * Run: php test_manager_dashboard_access.php
 */

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(\Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use Illuminate\Support\Facades\Route;

echo "\n=== Manager Dashboard Access Test ===\n\n";

// Get the manager user
$manager = User::where('email', 'dan@gmail.com')->first();

if (!$manager) {
    echo "❌ Manager not found\n";
    exit(1);
}

echo "Testing with user: {$manager->name} ({$manager->email})\n";
echo "Old role column: {$manager->role}\n";
echo "Spatie roles: " . $manager->getRoleNames()->implode(', ') . "\n\n";

// Test 1: Check if user has Manager role via Spatie
echo "=== Test 1: Spatie Role Check ===\n";
$hasManagerRole = $manager->hasRole('Manager');
echo "hasRole('Manager'): " . ($hasManagerRole ? "✅ YES" : "❌ NO") . "\n";

$hasOldManagerRole = $manager->hasOldRole('MANAGER');
echo "hasOldRole('MANAGER'): " . ($hasOldManagerRole ? "✅ YES" : "❌ NO") . "\n\n";

// Test 2: Check permissions
echo "=== Test 2: Permissions Check ===\n";
$canViewAllAuditLogs = $manager->can('view-all-audit-logs');
echo "can('view-all-audit-logs'): " . ($canViewAllAuditLogs ? "✅ YES" : "❌ NO") . "\n";

$canManageShopSettings = $manager->can('manage-shop-settings');
echo "can('manage-shop-settings'): " . ($canManageShopSettings ? "✅ YES" : "❌ NO") . "\n\n";

// Test 3: Route access check
echo "=== Test 3: Route Configuration ===\n";
$routes = Route::getRoutes();
$managerRoute = $routes->getByName('erp.manager.dashboard');

if ($managerRoute) {
    echo "✅ Route 'erp.manager.dashboard' exists\n";
    echo "URI: " . $managerRoute->uri() . "\n";
    echo "Methods: " . implode(', ', $managerRoute->methods()) . "\n";
    echo "Middleware: " . implode(', ', $managerRoute->middleware()) . "\n\n";
} else {
    echo "❌ Route 'erp.manager.dashboard' not found\n\n";
}

// Test 4: API route check
$statsRoute = $routes->getByName('erp.manager.dashboard.stats');
if ($statsRoute) {
    echo "✅ API Route 'erp.manager.dashboard.stats' exists\n";
    echo "URI: " . $statsRoute->uri() . "\n";
    echo "Methods: " . implode(', ', $statsRoute->methods()) . "\n";
    echo "Middleware: " . implode(', ', $statsRoute->middleware()) . "\n\n";
} else {
    echo "❌ API Route 'erp.manager.dashboard.stats' not found\n\n";
}

// Test 5: Controller method check
echo "=== Test 4: Controller Check ===\n";
$controllerClass = 'App\\Http\\Controllers\\Api\\ManagerController';
if (class_exists($controllerClass)) {
    echo "✅ ManagerController exists\n";
    
    $controller = new $controllerClass();
    if (method_exists($controller, 'getDashboardStats')) {
        echo "✅ getDashboardStats method exists\n";
    } else {
        echo "❌ getDashboardStats method not found\n";
    }
} else {
    echo "❌ ManagerController not found\n";
}

echo "\n=== Summary ===\n";
if ($hasManagerRole && $canViewAllAuditLogs && $managerRoute) {
    echo "✅ Manager should be able to access the dashboard\n";
    echo "   If you still see 403 errors:\n";
    echo "   1. Clear browser cache and cookies\n";
    echo "   2. Log out and log in again\n";
    echo "   3. Check browser console for errors\n";
} else {
    echo "❌ Issues found that may prevent access\n";
    if (!$hasManagerRole) echo "   - User doesn't have Manager role\n";
    if (!$canViewAllAuditLogs) echo "   - User doesn't have manager permissions\n";
    if (!$managerRoute) echo "   - Manager route not configured\n";
}

echo "\n=== Test Complete ===\n\n";
