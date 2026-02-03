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
        Schema::table('finance_invoices', function (Blueprint $table) {
            // Add job order reference columns
            $table->unsignedBigInteger('job_order_id')->nullable()->after('id');
            $table->string('job_reference')->nullable()->after('job_order_id');
            
            // Add foreign key to orders table
            $table->foreign('job_order_id')
                  ->references('id')
                  ->on('orders')
                  ->onDelete('set null');
                  
            // Add index for faster lookups
            $table->index('job_order_id');
        });
        
        // Add flag to orders table to track invoice generation
        if (Schema::hasTable('orders')) {
            Schema::table('orders', function (Blueprint $table) {
                if (!Schema::hasColumn('orders', 'invoice_generated')) {
                    $table->boolean('invoice_generated')->default(false)->after('status');
                }
                if (!Schema::hasColumn('orders', 'invoice_id')) {
                    $table->unsignedBigInteger('invoice_id')->nullable()->after('invoice_generated');
                    $table->index('invoice_id');
                }
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('finance_invoices', function (Blueprint $table) {
            $table->dropForeign(['job_order_id']);
            $table->dropIndex(['job_order_id']);
            $table->dropColumn(['job_order_id', 'job_reference']);
        });
        
        if (Schema::hasTable('orders')) {
            Schema::table('orders', function (Blueprint $table) {
                if (Schema::hasColumn('orders', 'invoice_generated')) {
                    $table->dropColumn('invoice_generated');
                }
                if (Schema::hasColumn('orders', 'invoice_id')) {
                    $table->dropIndex(['invoice_id']);
                    $table->dropColumn('invoice_id');
                }
            });
        }
    }
};
