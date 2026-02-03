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
        // Add approval tracking to finance_expenses
        if (Schema::hasTable('finance_expenses')) {
            Schema::table('finance_expenses', function (Blueprint $table) {
                if (!Schema::hasColumn('finance_expenses', 'approval_id')) {
                    $table->unsignedBigInteger('approval_id')->nullable()->after('status');
                    $table->foreign('approval_id')->references('id')->on('approvals')->onDelete('set null');
                }
                if (!Schema::hasColumn('finance_expenses', 'requires_approval')) {
                    $table->boolean('requires_approval')->default(false)->after('status');
                }
                if (!Schema::hasColumn('finance_expenses', 'created_by')) {
                    $table->unsignedBigInteger('created_by')->nullable()->after('shop_id');
                    $table->foreign('created_by')->references('id')->on('users')->onDelete('set null');
                }
            });
        }

        // Add approval tracking to finance_invoices
        if (Schema::hasTable('finance_invoices')) {
            Schema::table('finance_invoices', function (Blueprint $table) {
                if (!Schema::hasColumn('finance_invoices', 'approval_id')) {
                    $table->unsignedBigInteger('approval_id')->nullable()->after('status');
                    $table->foreign('approval_id')->references('id')->on('approvals')->onDelete('set null');
                }
                if (!Schema::hasColumn('finance_invoices', 'requires_approval')) {
                    $table->boolean('requires_approval')->default(false)->after('status');
                }
                if (!Schema::hasColumn('finance_invoices', 'created_by')) {
                    $table->unsignedBigInteger('created_by')->nullable()->after('shop_id');
                    $table->foreign('created_by')->references('id')->on('users')->onDelete('set null');
                }
            });
        }

        // Add approval tracking to finance_journal_entries
        if (Schema::hasTable('finance_journal_entries')) {
            Schema::table('finance_journal_entries', function (Blueprint $table) {
                if (!Schema::hasColumn('finance_journal_entries', 'approval_id')) {
                    $table->unsignedBigInteger('approval_id')->nullable()->after('status');
                    $table->foreign('approval_id')->references('id')->on('approvals')->onDelete('set null');
                }
                if (!Schema::hasColumn('finance_journal_entries', 'requires_approval')) {
                    $table->boolean('requires_approval')->default(false)->after('status');
                }
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('finance_expenses')) {
            Schema::table('finance_expenses', function (Blueprint $table) {
                if (Schema::hasColumn('finance_expenses', 'approval_id')) {
                    $table->dropForeign(['approval_id']);
                    $table->dropColumn(['approval_id', 'requires_approval', 'created_by']);
                }
            });
        }

        if (Schema::hasTable('finance_invoices')) {
            Schema::table('finance_invoices', function (Blueprint $table) {
                if (Schema::hasColumn('finance_invoices', 'approval_id')) {
                    $table->dropForeign(['approval_id']);
                    $table->dropColumn(['approval_id', 'requires_approval', 'created_by']);
                }
            });
        }

        if (Schema::hasTable('finance_journal_entries')) {
            Schema::table('finance_journal_entries', function (Blueprint $table) {
                if (Schema::hasColumn('finance_journal_entries', 'approval_id')) {
                    $table->dropForeign(['approval_id']);
                    $table->dropColumn(['approval_id', 'requires_approval']);
                }
            });
        }
    }
};
