<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->string('tracking_number')->nullable()->after('payment_status');
            $table->string('carrier_company')->nullable()->after('tracking_number');
            $table->string('carrier_name')->nullable()->after('carrier_company');
            $table->string('carrier_phone', 50)->nullable()->after('carrier_name');
            $table->string('tracking_link', 500)->nullable()->after('carrier_phone');
            $table->string('eta')->nullable()->after('tracking_link');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn([
                'tracking_number',
                'carrier_company',
                'carrier_name',
                'carrier_phone',
                'tracking_link',
                'eta'
            ]);
        });
    }
};
