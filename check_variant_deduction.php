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

echo "=== PRODUCT 3 VARIANT QUANTITIES ===\n\n";

$variants = Capsule::table('product_variants')
    ->where('product_id', 3)
    ->orderBy('size')
    ->orderBy('color')
    ->get();

foreach ($variants as $v) {
    echo sprintf("Size %-2s %-10s: Qty = %-2d\n", $v->size, $v->color, $v->quantity);
}

echo "\n=== RECENT ORDERS FOR PRODUCT 3 ===\n\n";

$orderItems = Capsule::table('order_items')
    ->where('product_id', 3)
    ->orderBy('created_at', 'DESC')
    ->limit(10)
    ->get();

if ($orderItems->isEmpty()) {
    echo "No orders found for product 3\n";
} else {
    foreach ($orderItems as $item) {
        echo sprintf(
            "Order ID: %-25s Size: %-2s Color: %-10s Qty: %d (created: %s)\n",
            $item->order_id,
            $item->size ?? 'N/A',
            $item->color ?? 'N/A',
            $item->quantity,
            $item->created_at
        );
    }
}
