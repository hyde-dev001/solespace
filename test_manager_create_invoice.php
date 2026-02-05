<?php
/**
 * Test Manager Create Invoice Access
 * Tests if Manager can access all necessary endpoints for creating invoices
 */

require_once __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;

echo "=== Manager Create Invoice Access Test ===\n\n";

// Find Manager user
$manager = User::where('email', 'dan@gmail.com')->first();

if (!$manager) {
    echo "❌ Manager user dan@gmail.com not found\n";
    exit(1);
}

echo "✓ Found Manager: {$manager->name} (ID: {$manager->id})\n";
echo "  Email: {$manager->email}\n\n";

// Check Spatie roles
$roles = $manager->roles->pluck('name')->toArray();
echo "Spatie Roles: " . implode(', ', $roles) . "\n";

// Check old role
echo "Old Role Column: " . ($manager->role ?? 'NULL') . "\n\n";

// Check permissions needed for invoice creation
$requiredPermissions = [
    'finance.invoices.create',
    'finance.invoices.view',
    'finance.accounts.view',
    'finance.tax-rates.view',
];

echo "=== Required Permissions ===\n";
foreach ($requiredPermissions as $permission) {
    $has = $manager->hasPermissionTo($permission);
    echo ($has ? "✓" : "❌") . " {$permission}\n";
}

echo "\n=== Testing API Endpoints ===\n\n";

// Simulate Manager authentication
Auth::guard('user')->login($manager);

// Test 1: Chart of Accounts endpoint
echo "1. Testing /api/finance/session/accounts\n";
try {
    $route = Route::getRoutes()->match(
        \Illuminate\Http\Request::create('/api/finance/session/accounts', 'GET')
    );
    
    if ($route) {
        $middleware = $route->middleware();
        echo "   ✓ Route exists\n";
        echo "   Middleware: " . implode(', ', $middleware) . "\n";
        
        // Try to fetch accounts
        $accounts = \App\Models\Finance\Account::where('type', 'Revenue')->get();
        echo "   ✓ Found " . $accounts->count() . " Revenue accounts\n";
        
        if ($accounts->count() > 0) {
            echo "   Sample accounts:\n";
            foreach ($accounts->take(3) as $account) {
                echo "     - {$account->code}: {$account->name}\n";
            }
        }
    } else {
        echo "   ❌ Route not found\n";
    }
} catch (\Exception $e) {
    echo "   ❌ Error: " . $e->getMessage() . "\n";
}

echo "\n2. Testing /api/finance/session/tax-rates\n";
try {
    $route = Route::getRoutes()->match(
        \Illuminate\Http\Request::create('/api/finance/session/tax-rates', 'GET')
    );
    
    if ($route) {
        echo "   ✓ Route exists\n";
        
        // Try to fetch tax rates
        $taxRates = \App\Models\Finance\TaxRate::all();
        echo "   ✓ Found " . $taxRates->count() . " tax rates\n";
        
        if ($taxRates->count() > 0) {
            echo "   Sample tax rates:\n";
            foreach ($taxRates->take(3) as $tax) {
                echo "     - {$tax->name}: {$tax->rate}%\n";
            }
        }
    } else {
        echo "   ❌ Route not found\n";
    }
} catch (\Exception $e) {
    echo "   ❌ Error: " . $e->getMessage() . "\n";
}

echo "\n3. Testing /api/finance/session/invoices (POST - Create Invoice)\n";
try {
    $route = Route::getRoutes()->match(
        \Illuminate\Http\Request::create('/api/finance/session/invoices', 'POST')
    );
    
    if ($route) {
        $middleware = $route->middleware();
        echo "   ✓ Route exists\n";
        echo "   Middleware: " . implode(', ', $middleware) . "\n";
    } else {
        echo "   ❌ Route not found\n";
    }
} catch (\Exception $e) {
    echo "   ❌ Error: " . $e->getMessage() . "\n";
}

echo "\n=== Frontend Component Analysis ===\n";

// Check if Revenue accounts exist
$revenueAccounts = \App\Models\Finance\Account::where('type', 'Revenue')->where('active', true)->get();
echo "\nActive Revenue Accounts: " . $revenueAccounts->count() . "\n";

if ($revenueAccounts->count() === 0) {
    echo "⚠️  WARNING: No active Revenue accounts found!\n";
    echo "   The 'Add Product' button will be disabled because it requires a Revenue Account.\n";
    echo "   Create Revenue accounts in Chart of Accounts.\n";
}

// Check if Tax rates exist
$activeTaxRates = \App\Models\Finance\TaxRate::where('active', true)->get();
echo "\nActive Tax Rates: " . $activeTaxRates->count() . "\n";

if ($activeTaxRates->count() === 0) {
    echo "⚠️  WARNING: No active tax rates found!\n";
    echo "   Create tax rates in Finance settings.\n";
}

echo "\n=== Component Behavior Analysis ===\n";
echo "\nThe 'Add Product' button in Create Invoice is disabled when:\n";
echo "  - selectedAccountId is empty (no Revenue Account selected)\n";
echo "\nThe button code: disabled={!selectedAccountId}\n";
echo "\nThe component filters accounts to Revenue type only.\n";
echo "If no Revenue accounts exist, the dropdown will be empty and button disabled.\n";

echo "\n=== Summary ===\n";

$issues = [];

if (!$manager->hasPermissionTo('finance.invoices.create')) {
    $issues[] = "Missing finance.invoices.create permission";
}

if (!$manager->hasPermissionTo('finance.accounts.view')) {
    $issues[] = "Missing finance.accounts.view permission";
}

if ($revenueAccounts->count() === 0) {
    $issues[] = "No Revenue accounts in database";
}

if (count($issues) === 0) {
    echo "✅ All checks passed! Manager should be able to add products.\n";
    echo "\nIf the button is still disabled, check:\n";
    echo "  1. Browser console for JavaScript errors\n";
    echo "  2. Network tab - is /api/finance/session/accounts returning data?\n";
    echo "  3. React DevTools - is selectedAccountId state set?\n";
} else {
    echo "❌ Found " . count($issues) . " issue(s):\n";
    foreach ($issues as $i => $issue) {
        echo "  " . ($i + 1) . ". {$issue}\n";
    }
}

echo "\nDone.\n";
