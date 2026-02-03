<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\Finance\AccountController;
use App\Http\Controllers\Api\Finance\JournalEntryController;
use App\Http\Controllers\Api\Finance\InvoiceController;
use App\Http\Controllers\Api\Finance\ExpenseController;
use App\Http\Controllers\Api\Finance\ReportController;

// Finance API Routes - These are registered in web.php to have session support
Route::prefix('api/finance')->group(function () {
    // Public endpoints for development (READ ONLY)
    Route::prefix('public')->group(function () {
        Route::get('accounts', [AccountController::class, 'index']);
        Route::get('accounts/{id}/ledger', [AccountController::class, 'ledger']);
        Route::get('journal-entries', [JournalEntryController::class, 'index']);
        Route::get('expenses', [ExpenseController::class, 'index']);
        Route::get('expenses/{id}', [ExpenseController::class, 'show']);
        // ⚠️ WRITE OPERATIONS REMOVED - Use authenticated endpoints instead
    });

    // Protected endpoints (require web session authentication)
    Route::middleware('auth:user')->group(function () {
        Route::get('accounts', [AccountController::class, 'index']);
        Route::get('accounts/{id}', [AccountController::class, 'show']);
        Route::post('accounts', [AccountController::class, 'store']);
        Route::patch('accounts/{id}', [AccountController::class, 'update']);
        Route::get('accounts/{id}/ledger', [AccountController::class, 'ledger']);

        Route::get('journal-entries', [JournalEntryController::class, 'index']);
        Route::get('journal-entries/{id}', [JournalEntryController::class, 'show']);
        Route::post('journal-entries', [JournalEntryController::class, 'store']);
        Route::patch('journal-entries/{id}', [JournalEntryController::class, 'update']);
            // Only Finance Manager/Director can post or reverse entries
            Route::middleware('role:FINANCE_MANAGER')->group(function () {
                Route::post('journal-entries/{id}/post', [JournalEntryController::class, 'post']);
                Route::post('journal-entries/{id}/reverse', [JournalEntryController::class, 'reverse']);
            });
        Route::delete('journal-entries/{id}', [JournalEntryController::class, 'destroy']);

        // Expense endpoints
        Route::get('expenses', [ExpenseController::class, 'index']);
        Route::get('expenses/{id}', [ExpenseController::class, 'show']);
        Route::post('expenses', [ExpenseController::class, 'store']);
        Route::patch('expenses/{id}', [ExpenseController::class, 'update']);
            // Only Finance Manager can approve/reject expenses
            Route::middleware('role:FINANCE_MANAGER')->group(function () {
                Route::post('expenses/{id}/approve', [ExpenseController::class, 'approve']);
                Route::post('expenses/{id}/reject', [ExpenseController::class, 'reject']);
                Route::post('expenses/{id}/post', [ExpenseController::class, 'post']);
            });
        Route::delete('expenses/{id}', [ExpenseController::class, 'destroy']);

        // Invoice endpoints
        Route::get('invoices', [InvoiceController::class, 'index']);
        Route::get('invoices/{id}', [InvoiceController::class, 'show']);
        Route::post('invoices', [InvoiceController::class, 'store']);
        Route::post('invoices/from-job', [InvoiceController::class, 'createFromJob']);
        Route::patch('invoices/{id}', [InvoiceController::class, 'update']);
            // Only Finance Manager/Director can post to ledger
            Route::middleware('role:FINANCE_MANAGER')->post('invoices/{id}/post', [InvoiceController::class, 'post']);
        Route::delete('invoices/{id}', [InvoiceController::class, 'destroy']);

        // Bank Reconciliation endpoints
        Route::prefix('reconciliation')->group(function () {
            Route::get('transactions', [\App\Http\Controllers\ReconciliationController::class, 'getTransactions']);
            Route::post('/', [\App\Http\Controllers\ReconciliationController::class, 'store']);
            Route::post('auto-match', [\App\Http\Controllers\ReconciliationController::class, 'autoMatch']);
            Route::post('batch-reconcile', [\App\Http\Controllers\ReconciliationController::class, 'batchReconcile']);
            Route::get('history', [\App\Http\Controllers\ReconciliationController::class, 'history']);
            Route::delete('{id}/unmatch', [\App\Http\Controllers\ReconciliationController::class, 'unmatch']);
        });

        // Financial Reports endpoints
        Route::get('reports/balance-sheet', [ReportController::class, 'balanceSheet']);
        Route::get('reports/profit-loss', [ReportController::class, 'profitLoss']);
        Route::get('reports/trial-balance', [ReportController::class, 'trialBalance']);
        Route::get('reports/ar-aging', [ReportController::class, 'arAging']);
        Route::get('reports/ap-aging', [ReportController::class, 'apAging']);
    });
});
