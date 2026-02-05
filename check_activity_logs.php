<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Spatie\Activitylog\Models\Activity;
use App\Models\ShopOwner;

echo "Activity Logs Count: " . Activity::count() . "\n";
echo "Shop Owners Count: " . ShopOwner::count() . "\n";

$shopOwner = ShopOwner::first();
if ($shopOwner) {
    echo "First Shop Owner ID: " . $shopOwner->id . "\n";
    echo "First Shop Owner Name: " . $shopOwner->shop_name . "\n";
}
