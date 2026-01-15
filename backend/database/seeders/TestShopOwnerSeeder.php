<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\ShopOwner;
use Illuminate\Support\Facades\Hash;

class TestShopOwnerSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create a test shop owner for development/testing
        ShopOwner::create([
            'first_name' => 'Juan',
            'last_name' => 'Dela Cruz',
            'email' => 'shopowner@test.com',
            'password' => Hash::make('password123'),
            'phone' => '09123456789',
            'business_name' => 'Test Shop',
            'business_address' => '123 Test Street, Manila City',
            'business_type' => 'Retail',
            'registration_type' => 'Business',
            'operating_hours' => json_encode([
                'monday' => '9:00 AM - 6:00 PM',
                'tuesday' => '9:00 AM - 6:00 PM',
                'wednesday' => '9:00 AM - 6:00 PM',
                'thursday' => '9:00 AM - 6:00 PM',
                'friday' => '9:00 AM - 6:00 PM',
                'saturday' => '9:00 AM - 3:00 PM',
                'sunday' => 'Closed'
            ]),
            'status' => 'approved',
        ]);

        $this->command->info('Test shop owner created successfully!');
        $this->command->info('Email: shopowner@test.com');
        $this->command->info('Password: password123');
        $this->command->info('Business: Test Shop');
    }
}
