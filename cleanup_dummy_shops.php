<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use App\Models\Product;

echo "Cleaning up dummy shops...\n\n";

// Find the test shop owner - try multiple possible emails
$testShop = User::where('email', 'test@example.com')
    ->orWhere('email', 'testshopowner@example.com')
    ->orWhere('name', 'Test ShopOwner')
    ->first();

if (!$testShop) {
    // If not found, show all users
    echo "Test shop owner not found. All users:\n";
    $allUsers = User::all(['id', 'name', 'email', 'role']);
    foreach($allUsers as $user) {
        echo "  {$user->id} - {$user->name} ({$user->email}) - Role: {$user->role}\n";
    }
    exit(1);
}

echo "Keeping: {$testShop->name} ({$testShop->email}) [ID: {$testShop->id}]\n\n";

// Find dummy shops
$dummyShops = User::whereIn('email', [
    'kickstop@solespace.com',
    'urbanfeet@solespace.com',
    'streetrun@solespace.com',
    'stylestep@solespace.com',
    'shop@solespace.com'
])->get();

echo "Removing dummy shops:\n";
foreach($dummyShops as $shop) {
    $productCount = Product::where('shop_owner_id', $shop->id)->count();
    echo "  - {$shop->name} ({$shop->email}): {$productCount} products\n";
    
    // Delete products
    Product::where('shop_owner_id', $shop->id)->delete();
    
    // Delete shop owner
    $shop->delete();
}

echo "\nCleanup complete!\n";
echo "Remaining shop: {$testShop->name}\n";
echo "Remaining products: " . Product::where('shop_owner_id', $testShop->id)->count() . "\n";
