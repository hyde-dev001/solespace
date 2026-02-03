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

echo "Cart Items for User 124 (detailed):\n\n";

$cartItems = Capsule::table('cart_items')
    ->where('user_id', 124)
    ->get();

foreach ($cartItems as $item) {
    echo "Cart Item ID: {$item->id}\n";
    echo "  Product ID: {$item->product_id}\n";
    echo "  Size: " . ($item->size ?? 'NULL') . "\n";
    echo "  Quantity: {$item->quantity}\n";
    echo "  Options (JSON): " . ($item->options ?? 'NULL') . "\n";
    
    if ($item->options) {
        $options = json_decode($item->options, true);
        echo "  Options (parsed):\n";
        foreach ($options as $key => $value) {
            echo "    - $key: $value\n";
        }
    }
    echo "\n";
}
