<?php
/**
 * Test checkout flow to debug variant deduction
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

echo "=== BEFORE CHECKOUT ===\n\n";

$product = Capsule::table('products')->where('id', 3)->first();
echo "Product Stock: {$product->stock_quantity}\n\n";

$variants = Capsule::table('product_variants')
    ->where('product_id', 3)
    ->orderBy('size')
    ->orderBy('color')
    ->get();

echo "Variant Stocks:\n";
foreach ($variants as $variant) {
    echo "  Size {$variant->size} {$variant->color}: {$variant->quantity}\n";
}

echo "\n=== SIMULATING CHECKOUT ===\n";
echo "Ordering: Size 7 Black, Quantity 2\n\n";

// Simulate what the CheckoutController would do
$itemSize = '7';
$itemColor = 'Black';
$qtyOrdered = 2;

// Find variant
$variant = Capsule::table('product_variants')
    ->where('product_id', 3)
    ->where('size', $itemSize)
    ->where('color', $itemColor)
    ->first();

if ($variant) {
    echo "✓ Variant FOUND: ID {$variant->id}\n";
    echo "  Before quantity: {$variant->quantity}\n";
    
    // Decrement (using raw query since we're not using Eloquent models)
    Capsule::table('product_variants')
        ->where('id', $variant->id)
        ->decrement('quantity', $qtyOrdered);
    
    // Also decrement product stock
    Capsule::table('products')
        ->where('id', 3)
        ->decrement('stock_quantity', $qtyOrdered);
    
    echo "  Decrementing by: {$qtyOrdered}\n";
    
    // Fetch updated value
    $updatedVariant = Capsule::table('product_variants')->where('id', $variant->id)->first();
    $updatedProduct = Capsule::table('products')->where('id', 3)->first();
    
    echo "  After quantity: {$updatedVariant->quantity}\n";
    echo "  Product stock after: {$updatedProduct->stock_quantity}\n";
} else {
    echo "✗ Variant NOT FOUND\n";
    echo "  Searched for: product_id=3, size='{$itemSize}', color='{$itemColor}'\n";
    
    // Check what variants exist
    $allVariants = Capsule::table('product_variants')
        ->where('product_id', 3)
        ->get();
    
    echo "\n  Available variants:\n";
    foreach ($allVariants as $v) {
        echo "    ID {$v->id}: Size='{$v->size}' Color='{$v->color}'\n";
    }
}

echo "\n=== AFTER TEST ===\n\n";

$product = Capsule::table('products')->where('id', 3)->first();
echo "Product Stock: {$product->stock_quantity}\n\n";

$variants = Capsule::table('product_variants')
    ->where('product_id', 3)
    ->orderBy('size')
    ->orderBy('color')
    ->get();

echo "Variant Stocks:\n";
foreach ($variants as $variant) {
    echo "  Size {$variant->size} {$variant->color}: {$variant->quantity}\n";
}
