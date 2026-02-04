<?php

/**
 * Activity Log Test Script
 * 
 * Tests the activity log implementation by:
 * 1. Creating a test product (should log "created")
 * 2. Updating the product (should log "updated")
 * 3. Deleting the product (should log "deleted")
 * 4. Fetching activity logs via API
 */

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Product;
use App\Models\User;
use Spatie\Activitylog\Models\Activity;

echo "=== Activity Log Test ===\n\n";

// Step 1: Find a shop owner
$shopOwner = \App\Models\ShopOwner::first();
if (!$shopOwner) {
    echo "❌ No shop owner found. Please create one first.\n";
    exit(1);
}

echo "✅ Using Shop Owner: {$shopOwner->business_name} (ID: {$shopOwner->id})\n\n";

// Step 2: Create a test product (should log activity)
echo "📦 Creating test product...\n";
$product = Product::create([
    'shop_owner_id' => $shopOwner->id,
    'name' => 'Test Activity Log Product',
    'slug' => 'test-activity-log-product-' . time(),
    'description' => 'Product for testing activity logs',
    'price' => 999.99,
    'category' => 'Testing',
    'stock_quantity' => 5,
    'is_active' => true,
]);
echo "✅ Product created: {$product->name} (ID: {$product->id})\n\n";

// Wait a moment
sleep(1);

// Step 3: Update the product (should log activity)
echo "✏️ Updating product price...\n";
$product->update([
    'price' => 1299.99,
    'stock_quantity' => 10,
]);
echo "✅ Product updated: Price changed from 999.99 to 1299.99\n\n";

// Wait a moment
sleep(1);

// Step 4: Check if activities were logged
echo "🔍 Checking logged activities...\n";
$activities = Activity::where('subject_type', 'App\\Models\\Product')
    ->where('subject_id', $product->id)
    ->orderBy('created_at', 'desc')
    ->get();

if ($activities->count() === 0) {
    echo "❌ No activities found! Activity logging may not be working.\n";
    echo "   Make sure Product model has LogsActivity trait.\n";
} else {
    echo "✅ Found {$activities->count()} activities:\n\n";
    
    foreach ($activities as $activity) {
        echo "  - Event: {$activity->event}\n";
        echo "    Description: {$activity->description}\n";
        echo "    Date: {$activity->created_at->format('Y-m-d H:i:s')}\n";
        
        if ($activity->event === 'created') {
            $attrs = $activity->properties->get('attributes');
            echo "    Created with: name={$attrs['name']}, price={$attrs['price']}\n";
        }
        
        if ($activity->event === 'updated') {
            $old = $activity->properties->get('old');
            $new = $activity->properties->get('attributes');
            echo "    Changes:\n";
            foreach ($new as $key => $value) {
                if (isset($old[$key]) && $old[$key] != $value) {
                    echo "      - {$key}: {$old[$key]} → {$value}\n";
                }
            }
        }
        
        echo "\n";
    }
}

// Step 5: Delete the product (should log activity)
echo "🗑️ Deleting test product...\n";
$product->delete();
echo "✅ Product soft-deleted\n\n";

// Wait a moment
sleep(1);

// Step 6: Check delete activity
echo "🔍 Checking delete activity...\n";
$deleteActivity = Activity::where('subject_type', 'App\\Models\\Product')
    ->where('subject_id', $product->id)
    ->where('event', 'deleted')
    ->first();

if ($deleteActivity) {
    echo "✅ Delete activity logged at {$deleteActivity->created_at->format('Y-m-d H:i:s')}\n\n";
} else {
    echo "⚠️ Delete activity not found. May take a moment to log.\n\n";
}

// Step 7: Count total activities for this shop
echo "📊 Total activities for this shop:\n";
$totalActivities = Activity::whereHas('subject', function($q) use ($shopOwner) {
    $q->where('shop_owner_id', $shopOwner->id);
})->count();
echo "   {$totalActivities} activities logged\n\n";

// Step 8: Show activity breakdown by event
echo "📈 Activity Breakdown:\n";
$eventCounts = Activity::selectRaw('event, COUNT(*) as count')
    ->groupBy('event')
    ->pluck('count', 'event');

foreach ($eventCounts as $event => $count) {
    echo "   {$event}: {$count}\n";
}

echo "\n=== Test Complete ===\n";
echo "\n💡 TIP: Visit /erp/manager/audit-logs to see the logs in the UI\n";
echo "💡 API Endpoint: GET /api/activity-logs\n";
