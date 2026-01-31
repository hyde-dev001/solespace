<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Update the role enum to include new finance roles
        DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('HR', 'FINANCE_STAFF', 'FINANCE_MANAGER', 'CRM', 'MANAGER', 'STAFF', 'SUPER_ADMIN') NULL");
        
        // Add approval_limit column for finance users
        if (!Schema::hasColumn('users', 'approval_limit')) {
            Schema::table('users', function (Blueprint $table) {
                $table->decimal('approval_limit', 15, 2)->nullable()->after('role');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revert role enum to original
        DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('HR', 'CRM', 'MANAGER', 'STAFF', 'SUPER_ADMIN') NULL");
        
        // Drop approval_limit column
        if (Schema::hasColumn('users', 'approval_limit')) {
            Schema::table('users', function (Blueprint $table) {
                $table->dropColumn('approval_limit');
            });
        }
    }
};
