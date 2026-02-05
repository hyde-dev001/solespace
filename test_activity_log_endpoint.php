<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\Auth;
use App\Models\ShopOwner;

// Simulate shop owner authentication
$shopOwner = ShopOwner::first();
if (!$shopOwner) {
    echo "No shop owner found!\n";
    exit(1);
}

Auth::guard('shop_owner')->login($shopOwner);

echo "Authenticated as Shop Owner: " . $shopOwner->id . "\n";
echo "Shop Name: " . ($shopOwner->shop_name ?? 'N/A') . "\n\n";

// Create a fake request
$request = new \Illuminate\Http\Request();
$request->merge(['per_page' => 10]);

// Call the controller
$controller = new \App\Http\Controllers\ActivityLogController();

try {
    $response = $controller->index($request);
    $data = $response->getData(true);
    
    echo "✅ Success!\n";
    echo "Total logs: " . ($data['pagination']['total'] ?? 0) . "\n";
    echo "Current page logs: " . count($data['data'] ?? []) . "\n";
    
    if (!empty($data['data'])) {
        echo "\nFirst log:\n";
        $first = $data['data'][0];
        echo "  Event: " . ($first['event'] ?? 'N/A') . "\n";
        echo "  Description: " . ($first['description'] ?? 'N/A') . "\n";
        echo "  Created: " . ($first['created_at'] ?? 'N/A') . "\n";
    }
} catch (\Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    echo "Trace: " . $e->getTraceAsString() . "\n";
}
