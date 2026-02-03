<?php
/**
 * Clear cart for user 124 (for debugging)
 */

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

$userId = 124;

echo "Clearing cart for user $userId...\n\n";

$deleted = Capsule::table('cart_items')
    ->where('user_id', $userId)
    ->delete();

echo "✓ Deleted $deleted cart items\n";

echo "\nCurrent cart state:\n";
$items = Capsule::table('cart_items')
    ->where('user_id', $userId)
    ->get();

if ($items->isEmpty()) {
    echo "✓ Cart is now empty\n";
} else {
    foreach ($items as $item) {
        echo "ID: {$item->id} | Qty: {$item->quantity}\n";
    }
}
