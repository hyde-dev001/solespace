<?php

require_once __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use Illuminate\Support\Facades\Hash;

try {
    // Test creating a user
    $user = User::create([
        'first_name' => 'John',
        'last_name' => 'Doe',
        'email' => 'john.doe.test@example.com',
        'phone' => '09171234567',
        'age' => 25,
        'address' => '123 Main St, Manila',
        'password' => Hash::make('Password123'),
        'status' => 'active'
    ]);
    
    echo "✓ User created successfully!\n";
    echo "  ID: {$user->id}\n";
    echo "  Name: {$user->first_name} {$user->last_name}\n";
    echo "  Email: {$user->email}\n";
    echo "  Status: {$user->status}\n\n";
    
    // Test finding the user
    $foundUser = User::where('email', 'john.doe.test@example.com')->first();
    if ($foundUser) {
        echo "✓ User found in database\n";
        
        // Test password verification
        if (Hash::check('Password123', $foundUser->password)) {
            echo "✓ Password verification works\n\n";
        } else {
            echo "✗ Password verification failed\n\n";
        }
        
        // Clean up - delete test user
        $foundUser->delete();
        echo "✓ Test user deleted\n";
    }
    
    echo "\n=== User Registration System Test Complete ===\n";
    
} catch (\Exception $e) {
    echo "✗ Error: " . $e->getMessage() . "\n";
    echo "Trace: " . $e->getTraceAsString() . "\n";
}
