<?php
require __DIR__ . '/vendor/autoload.php';

use Illuminate\Database\Capsule\Manager as Capsule;

$capsule = new Capsule;

$capsule->addConnection([
    'driver' => 'mysql',
    'host' => '127.0.0.1',
    'database' => 'solespace',
    'username' => 'root',
    'password' => '',
    'charset' => 'utf8mb4',
    'collation' => 'utf8mb4_unicode_ci',
    'prefix' => '',
]);

$capsule->setAsGlobal();
$capsule->bootEloquent();

echo "Product Variant Stock for Product 3 (Niggers):\n\n";

$variants = Capsule::table('product_variants')
    ->where('product_id', 3)
    ->orderBy('size')
    ->orderBy('color')
    ->get();

foreach ($variants as $variant) {
    echo "Size: {$variant->size} | Color: {$variant->color} | Stock: {$variant->quantity}\n";
}

echo "\n\nCurrent Cart for User 124:\n";
$cartItems = Capsule::table('cart_items')
    ->where('user_id', 124)
    ->get();

foreach ($cartItems as $item) {
    echo "Size: {$item->size} | Qty in cart: {$item->quantity}\n";
}
