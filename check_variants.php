<?php
require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "=== PRODUCT VARIANTS TABLE CHECK ===\n\n";

// Check if table exists
$hasTable = DB::getSchemaBuilder()->hasTable('product_variants');
echo "Table exists: " . ($hasTable ? "YES" : "NO") . "\n\n";

if ($hasTable) {
    // Get columns
    $columns = DB::getSchemaBuilder()->getColumnListing('product_variants');
    echo "Columns: " . implode(', ', $columns) . "\n\n";
    
    // Get count
    $count = DB::table('product_variants')->count();
    echo "Total variants: $count\n\n";
    
    if ($count > 0) {
        echo "Sample variants:\n";
        echo str_repeat("-", 80) . "\n";
        
        $variants = DB::table('product_variants')
            ->join('products', 'product_variants.product_id', '=', 'products.id')
            ->select('product_variants.*', 'products.name as product_name')
            ->take(10)
            ->get();
        
        foreach ($variants as $v) {
            echo sprintf(
                "ID: %-3d | Product: %-20s | Size: %-4s | Color: %-10s | Qty: %-3d\n",
                $v->id,
                substr($v->product_name, 0, 20),
                $v->size,
                $v->color,
                $v->quantity
            );
        }
    }
}
