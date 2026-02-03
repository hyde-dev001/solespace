<?php
require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "=== TESTING VARIANT STOCK DEDUCTION ===\n\n";

// Example: Size 9 Black
$productId = 3; // Niggers product
$size = '9';
$color = 'Black';

echo "Testing with: Product ID $productId, Size $size, Color $color\n\n";

// Find the variant
$variant = DB::table('product_variants')
    ->where('product_id', $productId)
    ->where('size', $size)
    ->where('color', $color)
    ->first();

if ($variant) {
    echo "✓ Variant found!\n";
    echo "  Current quantity: {$variant->quantity}\n\n";
    
    // Simulate what checkout does
    $testData = [
        'size' => '9',
        'color' => 'Black',
        'options' => json_encode(['color' => 'Black', 'image' => 'some-image.jpg'])
    ];
    
    // Test extraction logic
    $options = json_decode($testData['options'], true);
    $itemSize = $testData['size'] ?? null;
    $itemColor = $testData['color'] ?? $options['color'] ?? null;
    
    echo "Extracted from test data:\n";
    echo "  Size: $itemSize\n";
    echo "  Color: $itemColor\n\n";
    
    if ($itemSize && $itemColor) {
        echo "✓ Both size and color present - variant stock WILL be decremented\n";
    } else {
        echo "✗ Missing size or color - variant stock WILL NOT be decremented\n";
    }
} else {
    echo "✗ Variant not found!\n";
}
