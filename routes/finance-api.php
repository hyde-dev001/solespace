<?php

/**
 * Finance Module API Routes
 * 
 * Purpose: All finance-related API endpoints
 * Middleware: web, auth:user (session-based), role-based access control
 * Protected by: FINANCE_STAFF, FINANCE_MANAGER roles + shop isolation
 * 
 * Endpoints:
 * - Accounts management
 * - Journal entries
 * - Invoices
 * - Expenses
 * - Financial reports
 * - Audit logs (Finance module)
 */

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\Finance\AccountController;
use App\Http\Controllers\Api\Finance\JournalEntryController;
use App\Http\Controllers\Api\Finance\InvoiceController;
use App\Http\Controllers\Api\Finance\ExpenseController;
use App\Http\Controllers\Api\Finance\ReportController;
use App\Http\Controllers\ERP\HR\AuditLogController;

/**
 * Finance Module Routes - Audit Logs (FINANCE_MANAGER only)
 * Restricted to managers for security/compliance
 */
Route::prefix('api/finance')->middleware(['web', 'auth:user', 'role:FINANCE_MANAGER', 'shop.isolation'])->group(function () {
    // ============================================
    // AUDIT LOGS (FINANCE_MANAGER ONLY)
    // ============================================
    Route::prefix('audit-logs')->group(function () {
        Route::get('/', [AuditLogController::class, 'index'])->name('finance.audit.index');
        Route::get('/statistics', [AuditLogController::class, 'statistics'])->name('finance.audit.statistics');
        Route::get('/export', [AuditLogController::class, 'export'])->name('finance.audit.export');
        Route::get('/{id}', [AuditLogController::class, 'show'])->name('finance.audit.show');
    });
});

/**
 * Finance Module Routes - General Operations
 * Accessible by both FINANCE_STAFF and FINANCE_MANAGER
 */
Route::prefix('api/finance')->middleware(['web', 'auth:user', 'role:FINANCE_STAFF,FINANCE_MANAGER', 'shop.isolation'])->group(function () {

    // ============================================
    // CHART OF ACCOUNTS
    // ============================================
    Route::prefix('accounts')->group(function () {
        Route::get('/', [AccountController::class, 'index'])->name('finance.accounts.index');
        Route::get('/{id}', [AccountController::class, 'show'])->name('finance.accounts.show');
        Route::post('/', [AccountController::class, 'store'])->name('finance.accounts.store');
        Route::patch('/{id}', [AccountController::class, 'update'])->name('finance.accounts.update');
        Route::get('/{id}/ledger', [AccountController::class, 'ledger'])->name('finance.accounts.ledger');
    });


    // ============================================
    // JOURNAL ENTRIES
    // ============================================
    Route::prefix('journal-entries')->group(function () {
        Route::get('/', [JournalEntryController::class, 'index'])->name('finance.journal.index');
        Route::get('/{id}', [JournalEntryController::class, 'show'])->name('finance.journal.show');
        Route::post('/', [JournalEntryController::class, 'store'])->name('finance.journal.store');
        Route::patch('/{id}', [JournalEntryController::class, 'update'])->name('finance.journal.update');
        Route::delete('/{id}', [JournalEntryController::class, 'destroy'])->name('finance.journal.destroy');
        
        // Finance Manager only actions
        Route::middleware('role:FINANCE_MANAGER')->group(function () {
            Route::post('/{id}/post', [JournalEntryController::class, 'post'])->name('finance.journal.post');
            Route::post('/{id}/reverse', [JournalEntryController::class, 'reverse'])->name('finance.journal.reverse');
        });
    });


    // ============================================
    // EXPENSES
    // ============================================
    Route::prefix('expenses')->group(function () {
        Route::get('/', [ExpenseController::class, 'index'])->name('finance.expenses.index');
        Route::get('/{id}', [ExpenseController::class, 'show'])->name('finance.expenses.show');
        Route::post('/', [ExpenseController::class, 'store'])->name('finance.expenses.store');
        Route::patch('/{id}', [ExpenseController::class, 'update'])->name('finance.expenses.update');
        Route::delete('/{id}', [ExpenseController::class, 'destroy'])->name('finance.expenses.destroy');
        
        // Finance Manager only actions
        Route::middleware('role:FINANCE_MANAGER')->group(function () {
            Route::post('/{id}/approve', [ExpenseController::class, 'approve'])->name('finance.expenses.approve');
            Route::post('/{id}/reject', [ExpenseController::class, 'reject'])->name('finance.expenses.reject');
            Route::post('/{id}/post', [ExpenseController::class, 'post'])->name('finance.expenses.post');
        });
    });


    // ============================================
    // INVOICES
    // ============================================
    Route::prefix('invoices')->group(function () {
        Route::get('/', [InvoiceController::class, 'index'])->name('finance.invoices.index');
        Route::get('/{id}', [InvoiceController::class, 'show'])->name('finance.invoices.show');
        Route::post('/', [InvoiceController::class, 'store'])->name('finance.invoices.store');
        Route::post('/from-job', [InvoiceController::class, 'createFromJob'])->name('finance.invoices.from_job');
        Route::patch('/{id}', [InvoiceController::class, 'update'])->name('finance.invoices.update');
        Route::delete('/{id}', [InvoiceController::class, 'destroy'])->name('finance.invoices.destroy');
        
        // Finance Manager only - post to ledger
        Route::middleware('role:FINANCE_MANAGER')->post('/{id}/post', [InvoiceController::class, 'post'])->name('finance.invoices.post');
    });


    // ============================================
    // BANK RECONCILIATION
    // ============================================
    Route::prefix('reconciliation')->group(function () {
        Route::get('/transactions', [\App\Http\Controllers\ReconciliationController::class, 'getTransactions'])->name('finance.reconciliation.transactions');
        Route::get('/history', [\App\Http\Controllers\ReconciliationController::class, 'history'])->name('finance.reconciliation.history');
        Route::post('/', [\App\Http\Controllers\ReconciliationController::class, 'store'])->name('finance.reconciliation.store');
        Route::post('/auto-match', [\App\Http\Controllers\ReconciliationController::class, 'autoMatch'])->name('finance.reconciliation.auto_match');
        Route::post('/batch-reconcile', [\App\Http\Controllers\ReconciliationController::class, 'batchReconcile'])->name('finance.reconciliation.batch');
        Route::delete('/{id}/unmatch', [\App\Http\Controllers\ReconciliationController::class, 'unmatch'])->name('finance.reconciliation.unmatch');
    });

    // ============================================
    // FINANCIAL REPORTS
    // ============================================
    Route::prefix('reports')->group(function () {
        Route::get('/balance-sheet', [ReportController::class, 'balanceSheet'])->name('finance.reports.balance_sheet');
        Route::get('/profit-loss', [ReportController::class, 'profitLoss'])->name('finance.reports.profit_loss');
        Route::get('/trial-balance', [ReportController::class, 'trialBalance'])->name('finance.reports.trial_balance');
        Route::get('/ar-aging', [ReportController::class, 'arAging'])->name('finance.reports.ar_aging');
        Route::get('/ap-aging', [ReportController::class, 'apAging'])->name('finance.reports.ap_aging');
    });
});
