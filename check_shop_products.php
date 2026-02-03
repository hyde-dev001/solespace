<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use App\Models\Product;

echo "Shop Owners and their products:\n\n";

$shops = User::where('role', 'SUPER_ADMIN')->get(['id', 'name', 'email']);

foreach($shops as $shop) {
    $count = Product::where('shop_owner_id', $shop->id)->count();
    echo "{$shop->id} - {$shop->name} ({$shop->email}): {$count} products\n";
}

echo "\nTotal shops: " . $shops->count() . "\n";
echo "Total products: " . Product::count() . "\n";
