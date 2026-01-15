<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Add rejection_reason column to shop_owners table
 * 
 * This migration adds an optional text field to store the reason
 * why an admin rejected a shop owner registration.
 * 
 * Helps provide feedback to rejected applicants and maintain
 * audit trail for admin decisions.
 */
return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * Adds rejection_reason as nullable text column
     */
    public function up(): void
    {
        Schema::table('shop_owners', function (Blueprint $table) {
            // <!-- Add rejection_reason column after status -->
            // <!-- Nullable because only rejected registrations have a reason -->
            $table->text('rejection_reason')->nullable()->after('status');
        });
    }

    /**
     * Reverse the migrations.
     * 
     * Removes rejection_reason column if migration is rolled back
     */
    public function down(): void
    {
        Schema::table('shop_owners', function (Blueprint $table) {
            $table->dropColumn('rejection_reason');
        });
    }
};
