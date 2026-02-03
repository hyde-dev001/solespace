<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\ShopOwner;
use App\Models\Product;

echo "Shop Owners (from shop_owners table) and their products:\n\n";

$shops = ShopOwner::where('status', 'approved')->get(['id', 'first_name', 'last_name', 'email', 'business_name']);

foreach($shops as $shop) {
    $count = Product::where('shop_owner_id', $shop->id)->count();
    echo "{$shop->id} - {$shop->first_name} {$shop->last_name} / {$shop->business_name} ({$shop->email}): {$count} products\n";
}

echo "\nTotal approved shops: " . $shops->count() . "\n";
echo "Total products: " . Product::count() . "\n";
