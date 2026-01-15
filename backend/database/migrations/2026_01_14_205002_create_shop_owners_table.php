<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Create shop_owners table
 * 
 * This table stores shop owner/business registrations.
 * Shop owners must be approved by super admin before accessing the system.
 * 
 * Registration Flow:
 * 1. Shop owner submits registration form with business details
 * 2. Documents are uploaded (DTI, Mayor's Permit, BIR, Valid ID)
 * 3. Status starts as 'pending'
 * 4. Super admin reviews and approves/rejects
 * 5. Approved owners can login and manage their shop
 */
return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * Creates the shop_owners table with all required fields
     */
    public function up()
    {
        Schema::create('shop_owners', function (Blueprint $table) {
            // <!-- Primary key -->
            $table->id();
            
            // <!-- Personal Information -->
            $table->string('first_name');  // Shop owner's first name
            $table->string('last_name');   // Shop owner's last name
            $table->string('email')->unique();  // Contact email (must be unique)
            $table->string('phone');       // Contact phone number
            
            // <!-- Business Information -->
            $table->string('business_name');     // Registered business name
            $table->string('business_address');  // Physical business location
            $table->string('business_type');     // retail, repair, or both
            $table->string('registration_type'); // individual or company
            
            // <!-- Operating Schedule -->
            // <!-- JSON field stores array of operating hours for each day -->
            // <!-- Format: [{day: "Monday", open: "09:00", close: "17:00"}, ...] -->
            $table->json('operating_hours')->nullable();
            
            // <!-- Approval Status -->
            // <!-- pending: Awaiting super admin review -->
            // <!-- approved: Can access system and post listings -->
            // <!-- rejected: Application denied -->
            $table->string('status')->default('pending');
            
            // <!-- Timestamps (created_at, updated_at) -->
            $table->timestamps();
        });
    }


    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('shop_owners');
    }
};
