<?php
/**
 * Check Revenue Accounts
 */

require_once __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Finance\Account;

echo "=== Checking Revenue Accounts ===\n\n";

$revenueAccounts = Account::where('type', 'Revenue')->where('active', true)->get();

echo "Active Revenue Accounts: " . $revenueAccounts->count() . "\n\n";

if ($revenueAccounts->count() > 0) {
    foreach ($revenueAccounts as $acc) {
        echo "  - {$acc->code}: {$acc->name}\n";
    }
} else {
    echo "⚠️  No Revenue accounts found!\n";
    echo "\nThis is why the 'Add Product' button is disabled.\n";
    echo "The button requires: disabled={!selectedAccountId}\n";
    echo "\nSolution: Create Revenue accounts in Chart of Accounts.\n";
}

echo "\n=== All Account Types ===\n\n";

$accountTypes = Account::selectRaw('type, COUNT(*) as count')
    ->groupBy('type')
    ->get();

foreach ($accountTypes as $type) {
    echo "  {$type->type}: {$type->count} accounts\n";
}
