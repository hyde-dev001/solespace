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
        Schema::table('leave_requests', function (Blueprint $table) {
            // Add approval hierarchy support
            $table->integer('approval_level')->default(1)->after('status');
            $table->foreignId('approver_id')->nullable()->after('approval_level')
                ->constrained('users')->nullOnDelete();
            
            // Add document support
            $table->string('supporting_document')->nullable()->after('reason');
            
            // Rename approved_by to match new structure (keep for backward compatibility)
            // approver_id is the current approver, approved_by is final approver
            
            // Add is_half_day flag
            $table->boolean('is_half_day')->default(false)->after('no_of_days');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('leave_requests', function (Blueprint $table) {
            $table->dropColumn(['approval_level', 'approver_id', 'supporting_document', 'is_half_day']);
        });
    }
};
