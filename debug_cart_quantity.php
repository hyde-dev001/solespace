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

echo "=== CHECKING ACTUAL CART_ITEMS TABLE ===\n\n";

// Get table info
$sql = "SELECT COLUMN_NAME, COLUMN_TYPE, COLUMN_DEFAULT, IS_NULLABLE 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_NAME='cart_items' AND TABLE_SCHEMA='solespace'";

$columns = Capsule::select($sql);

echo "Table Structure:\n";
foreach ($columns as $col) {
    echo sprintf(
        "  %s: %s (default: %s, nullable: %s)\n",
        $col->COLUMN_NAME,
        $col->COLUMN_TYPE,
        $col->COLUMN_DEFAULT ?? 'NULL',
        $col->IS_NULLABLE
    );
}

echo "\n=== CURRENT CART ITEMS ===\n";
$items = Capsule::table('cart_items')->where('user_id', 124)->get();

foreach ($items as $item) {
    echo "ID: {$item->id} | Product: {$item->product_id} | Size: {$item->size} | Qty: {$item->quantity}\n";
}

echo "\n=== TEST: Insert with explicit quantity ===\n";

// Insert a test item with quantity=3
$testId = Capsule::table('cart_items')->insertGetId([
    'user_id' => 124,
    'product_id' => 1,
    'size' => 'test',
    'quantity' => 3,
    'price' => 100.00,
    'product_name' => 'Test Item',
]);

echo "Inserted test item ID: {$testId} with quantity=3\n";

$testItem = Capsule::table('cart_items')->where('id', $testId)->first();
echo "Retrieved from DB: quantity = {$testItem->quantity}\n";

// Clean up
Capsule::table('cart_items')->where('id', $testId)->delete();
echo "Test item deleted\n";
