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
        Schema::create('roles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('shop_owner_id')->constrained('shop_owners')->onDelete('cascade');
            $table->string('name'); // HR, FINANCE, MANAGER, STAFF
            $table->string('description')->nullable();
            $table->json('permissions')->nullable(); // List of allowed permissions
            $table->timestamps();

            $table->index('shop_owner_id');
            $table->unique(['shop_owner_id', 'name']); // One role per shop
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('roles');
    }
};
