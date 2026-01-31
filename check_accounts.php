<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "=== Finance Accounts ===\n";
$accounts = App\Models\Finance\Account::all(['id', 'code', 'name', 'shop_owner_id', 'balance', 'type']);
foreach($accounts as $account) {
    echo sprintf(
        "ID: %s | Code: %s | Name: %s | Type: %s | shop_owner_id: %s | Balance: %s\n",
        $account->id,
        $account->code,
        $account->name,
        $account->type,
        $account->shop_owner_id ?? 'NULL',
        $account->balance
    );
}
echo "\nTotal Accounts: " . $accounts->count() . "\n";

// Check if user is logged in
echo "\n=== Auth Check ===\n";
if (auth()->check()) {
    $user = auth()->user();
    echo "Logged in as: " . $user->email . "\n";
    echo "User ID: " . $user->id . "\n";
    echo "User shop_owner_id: " . ($user->shop_owner_id ?? 'NULL') . "\n";
} else {
    echo "No user logged in (CLI context)\n";
}
