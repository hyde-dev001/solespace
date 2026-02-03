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
        Schema::table('finance_expenses', function (Blueprint $table) {
            // Only add job_order_id if it doesn't exist
            if (!Schema::hasColumn('finance_expenses', 'job_order_id')) {
                $table->unsignedBigInteger('job_order_id')->nullable()->after('id');
                $table->foreign('job_order_id')->references('id')->on('orders')->onDelete('set null');
                $table->index('job_order_id');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('finance_expenses', function (Blueprint $table) {
            if (Schema::hasColumn('finance_expenses', 'job_order_id')) {
                $table->dropForeign(['job_order_id']);
                $table->dropColumn('job_order_id');
            }
        });
    }
};
