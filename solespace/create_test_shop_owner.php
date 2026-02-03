<?php

use App\Models\ShopOwner;
use Illuminate\Support\Facades\Hash;

// Get the application instance
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

// Create test shop owner account
try {
    $shopOwner = ShopOwner::create([
        'first_name' => 'John',
        'last_name' => 'Smith',
        'email' => 'shopowner@test.com',
        'phone' => '09123456789',
        'password' => Hash::make('password123'),
        'business_name' => 'Test Electronics Repair Shop',
        'business_address' => '123 Main Street, City Center',
        'business_type' => 'repair',
        'registration_type' => 'individual',
        'operating_hours' => json_encode([
            ['day' => 'Monday', 'open' => '09:00', 'close' => '18:00'],
            ['day' => 'Tuesday', 'open' => '09:00', 'close' => '18:00'],
            ['day' => 'Wednesday', 'open' => '09:00', 'close' => '18:00'],
            ['day' => 'Thursday', 'open' => '09:00', 'close' => '18:00'],
            ['day' => 'Friday', 'open' => '09:00', 'close' => '18:00'],
            ['day' => 'Saturday', 'open' => '10:00', 'close' => '16:00'],
            ['day' => 'Sunday', 'open' => null, 'close' => null],
        ]),
        'status' => 'approved', // Set to approved so can login immediately
    ]);

    echo "✓ Test Shop Owner Account Created!\n";
    echo "─────────────────────────────────────\n";
    echo "Email: {$shopOwner->email}\n";
    echo "Password: password123\n";
    echo "Business: {$shopOwner->business_name}\n";
    echo "Status: {$shopOwner->status}\n";
    echo "─────────────────────────────────────\n";
} catch (\Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
