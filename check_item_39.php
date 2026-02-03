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

$item = Capsule::table('cart_items')->where('id', 39)->first();

echo "Cart Item 39:\n";
echo "  Quantity: {$item->quantity}\n";
echo "  Created: {$item->created_at}\n";
echo "  Updated: {$item->updated_at}\n";

// Check if there are any UPDATE queries in binlog or slow log
echo "\nChecking for any updates to this item...\n";

$updates = Capsule::select("SELECT * FROM information_schema.processlist WHERE INFO LIKE '%cart_items%' AND ID != CONNECTION_ID()");
if (count($updates) > 0) {
    echo "Found active queries:\n";
    foreach ($updates as $q) {
        echo "  {$q->INFO}\n";
    }
} else {
    echo "  No active queries found\n";
}
