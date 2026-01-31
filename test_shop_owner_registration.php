<?php

require_once __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\ShopOwner;
use Illuminate\Support\Facades\Hash;

try {
    // Test creating a shop owner
    $shopOwner = ShopOwner::create([
        'first_name' => 'Maria',
        'last_name' => 'Santos',
        'email' => 'maria.santos.test@example.com',
        'phone' => '09181234567',
        'password' => Hash::make('Password123'),
        'business_name' => 'Santos Shoe Repair',
        'business_address' => '456 Business St, Quezon City',
        'business_type' => 'repair',
        'registration_type' => 'individual',
        'operating_hours' => [
            ['day' => 'Monday', 'open' => '09:00', 'close' => '18:00', 'is_closed' => false],
            ['day' => 'Tuesday', 'open' => '09:00', 'close' => '18:00', 'is_closed' => false],
            ['day' => 'Wednesday', 'open' => '09:00', 'close' => '18:00', 'is_closed' => false],
            ['day' => 'Thursday', 'open' => '09:00', 'close' => '18:00', 'is_closed' => false],
            ['day' => 'Friday', 'open' => '09:00', 'close' => '18:00', 'is_closed' => false],
            ['day' => 'Saturday', 'open' => '10:00', 'close' => '16:00', 'is_closed' => false],
            ['day' => 'Sunday', 'open' => '00:00', 'close' => '00:00', 'is_closed' => true],
        ],
        'status' => 'pending'
    ]);
    
    echo "✓ Shop Owner created successfully!\n";
    echo "  ID: {$shopOwner->id}\n";
    echo "  Name: {$shopOwner->first_name} {$shopOwner->last_name}\n";
    echo "  Business: {$shopOwner->business_name}\n";
    echo "  Email: {$shopOwner->email}\n";
    echo "  Status: {$shopOwner->status} (requires admin approval)\n\n";
    
    // Test finding the shop owner
    $foundShopOwner = ShopOwner::where('email', 'maria.santos.test@example.com')->first();
    if ($foundShopOwner) {
        echo "✓ Shop Owner found in database\n";
        
        // Test password verification
        if (Hash::check('Password123', $foundShopOwner->password)) {
            echo "✓ Password verification works\n";
        } else {
            echo "✗ Password verification failed\n";
        }
        
        // Test operating hours JSON storage
        echo "✓ Operating hours stored as JSON: " . count($foundShopOwner->operating_hours) . " days\n\n";
        
        // Test approval workflow
        echo "Testing approval workflow...\n";
        $foundShopOwner->status = 'approved';
        $foundShopOwner->save();
        echo "✓ Shop owner approved (status: {$foundShopOwner->status})\n";
        
        // Clean up - delete test shop owner
        $foundShopOwner->delete();
        echo "✓ Test shop owner deleted\n";
    }
    
    echo "\n=== Shop Owner Registration System Test Complete ===\n";
    
} catch (\Exception $e) {
    echo "✗ Error: " . $e->getMessage() . "\n";
    echo "Trace: " . $e->getTraceAsString() . "\n";
}
