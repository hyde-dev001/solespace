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

$product = Capsule::table('products')->where('id', 3)->first();

echo "Product ID: {$product->id}\n";
echo "Product Name: {$product->name}\n";
echo "Product stock_quantity: {$product->stock_quantity}\n\n";

echo "Product Variants (detailed):\n";
$variants = Capsule::table('product_variants')
    ->where('product_id', 3)
    ->orderBy('size')
    ->orderBy('color')
    ->get();

foreach ($variants as $variant) {
    echo "  ID: {$variant->id} | Size: {$variant->size} | Color: {$variant->color} | Quantity: {$variant->quantity}\n";
}
