<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations to add user registration fields
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Split name into first and last name
            $table->string('first_name')->after('id')->nullable();
            $table->string('last_name')->after('first_name')->nullable();
            
            // Additional user information
            $table->string('phone', 15)->after('email')->nullable();
            $table->integer('age')->after('phone')->nullable();
            $table->text('address')->after('age')->nullable();
            $table->string('valid_id_path')->after('address')->nullable();
            
            // Status and tracking
            $table->enum('status', ['active', 'suspended', 'inactive'])->default('active')->after('valid_id_path');
            $table->timestamp('last_login_at')->nullable()->after('status');
            $table->string('last_login_ip', 45)->nullable()->after('last_login_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'first_name',
                'last_name',
                'phone',
                'age',
                'address',
                'valid_id_path',
                'status',
                'last_login_at',
                'last_login_ip',
            ]);
        });
    }
};
