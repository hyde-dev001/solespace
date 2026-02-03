<?php
require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "=== CHECKING FOR CART DUPLICATES ===\n\n";

// Get all cart items
$cartItems = DB::table('cart_items')
    ->select('*')
    ->orderBy('user_id')
    ->orderBy('product_id')
    ->orderBy('created_at')
    ->get();

echo "Total cart items: " . $cartItems->count() . "\n\n";

// Group by user + product + size + options
$grouped = [];
foreach ($cartItems as $item) {
    $key = $item->user_id . '|' . $item->product_id . '|' . ($item->size ?? 'null') . '|' . ($item->options ?? 'null');
    
    if (!isset($grouped[$key])) {
        $grouped[$key] = [];
    }
    $grouped[$key][] = $item;
}

// Find duplicates
$duplicates = array_filter($grouped, function($items) {
    return count($items) > 1;
});

if (count($duplicates) > 0) {
    echo "⚠ DUPLICATES FOUND:\n";
    echo str_repeat("-", 100) . "\n";
    
    foreach ($duplicates as $key => $items) {
        list($userId, $productId, $size, $options) = explode('|', $key);
        
        echo "\nUser: $userId | Product: $productId | Size: $size\n";
        echo "Options: $options\n";
        
        $totalQty = 0;
        foreach ($items as $item) {
            $totalQty += $item->quantity;
            echo sprintf(
                "  ID: %-4d | Qty: %-3d | Created: %s | Updated: %s\n",
                $item->id,
                $item->quantity,
                $item->created_at,
                $item->updated_at
            );
        }
        echo "  TOTAL QUANTITY: $totalQty (shown as separate items!)\n";
    }
} else {
    echo "✓ No duplicates found\n";
}

// Show current cart state
echo "\n" . str_repeat("=", 100) . "\n";
echo "CURRENT CART STATE:\n";
echo str_repeat("-", 100) . "\n";

foreach ($cartItems as $item) {
    $options = $item->options ? json_decode($item->options, true) : [];
    $color = $options['color'] ?? 'N/A';
    
    echo sprintf(
        "ID: %-3d | User: %-2d | Product: %-20s | Size: %-4s | Color: %-10s | Qty: %-3d\n",
        $item->id,
        $item->user_id,
        substr($item->product_name, 0, 20),
        $item->size ?? 'N/A',
        $color,
        $item->quantity
    );
}
