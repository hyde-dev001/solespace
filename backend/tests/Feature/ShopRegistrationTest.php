<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\ShopOwner;

class ShopRegistrationTest extends TestCase
{
    use RefreshDatabase;

    public function test_shop_registration_saves_to_database()
    {
        $payload = [
            'firstName' => 'Test',
            'lastName' => 'User',
            'email' => 'test@example.com',
            'phone' => '09171234567',
            'businessName' => "Test Shop",
            'businessAddress' => '123 Test St',
            'businessType' => 'retail',
            'registrationType' => 'individual',
            'operatingHours' => [
                ['day' => 'Monday', 'open' => '09:00', 'close' => '17:00']
            ],
            'agreesToRequirements' => true,
        ];

        $response = $this->post('/shop/register-full', $payload);

        // Controller redirects back on success
        $response->assertRedirect();

        $this->assertDatabaseHas('shop_owners', [
            'email' => 'test@example.com',
            'first_name' => 'Test',
            'last_name' => 'User',
            'business_name' => 'Test Shop',
        ]);
    }
}
