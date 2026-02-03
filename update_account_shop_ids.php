<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Finance\Account;
use App\Models\ShopOwner;

// Get the first shop owner
$shopOwner = ShopOwner::first();

if (!$shopOwner) {
    echo "No shop owners found!\n";
    exit(1);
}

echo "Using Shop Owner ID: {$shopOwner->id} - {$shopOwner->business_name}\n";

// Update all accounts without shop_owner_id
$updated = Account::whereNull('shop_owner_id')->update(['shop_owner_id' => $shopOwner->id]);

echo "Updated {$updated} accounts with shop_owner_id = {$shopOwner->id}\n";

// Verify
$accountsWithShopId = Account::whereNotNull('shop_owner_id')->count();
echo "Total accounts with shop_owner_id: {$accountsWithShopId}\n";
