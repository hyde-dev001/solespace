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
            // Add receipt_path column for storing file path
            if (!Schema::hasColumn('finance_expenses', 'receipt_path')) {
                $table->string('receipt_path')->nullable()->after('approval_notes');
            }
            
            // Add receipt_original_name to preserve original filename
            if (!Schema::hasColumn('finance_expenses', 'receipt_original_name')) {
                $table->string('receipt_original_name')->nullable()->after('receipt_path');
            }
            
            // Add receipt_mime_type for validation/display
            if (!Schema::hasColumn('finance_expenses', 'receipt_mime_type')) {
                $table->string('receipt_mime_type')->nullable()->after('receipt_original_name');
            }
            
            // Add receipt_size in bytes
            if (!Schema::hasColumn('finance_expenses', 'receipt_size')) {
                $table->unsignedBigInteger('receipt_size')->nullable()->after('receipt_mime_type');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('finance_expenses', function (Blueprint $table) {
            if (Schema::hasColumn('finance_expenses', 'receipt_path')) {
                $table->dropColumn('receipt_path');
            }
            if (Schema::hasColumn('finance_expenses', 'receipt_original_name')) {
                $table->dropColumn('receipt_original_name');
            }
            if (Schema::hasColumn('finance_expenses', 'receipt_mime_type')) {
                $table->dropColumn('receipt_mime_type');
            }
            if (Schema::hasColumn('finance_expenses', 'receipt_size')) {
                $table->dropColumn('receipt_size');
            }
        });
    }
};
