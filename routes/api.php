<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UsersController;
use App\Http\Controllers\EmployeeController;
use App\Http\Controllers\FinancialReportController;
use App\Http\Controllers\ReconciliationController;
use App\Http\Controllers\AuditLogController;
use App\Http\Controllers\Api\Finance\BudgetController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:web');

// Debug endpoint to check current user
Route::get('/debug/me', function() {
    $user = Auth::guard('web')->user() ?? Auth::guard('user')->user();
    if (!$user) {
        return response()->json(['error' => 'Not authenticated']);
    }
    return response()->json([
        'id' => $user->id,
        'email' => $user->email,
        'role' => $user->role,
        'shop_owner_id' => $user->shop_owner_id,
    ]);
})->middleware('web');

Route::group(['middleware' => ['web', 'auth:user']], function () {
    /**
     * HR Module Routes
     * Protected by: HR or shop_owner role + Shop isolation
     */
    Route::middleware(['role:HR,shop_owner', 'shop.isolation'])->prefix('hr')->group(function () {
        Route::apiResource('employees', EmployeeController::class);
        Route::get('statistics', [EmployeeController::class, 'statistics'])->name('employees.statistics');
    });

    /**
     * Audit Logs Routes
     * Protected by: Manager/Admin role
     */
    Route::middleware(['role:MANAGER,STAFF,shop_owner'])->prefix('audit-logs')->group(function () {
        Route::get('/', [AuditLogController::class, 'index']);
        Route::get('/stats', [AuditLogController::class, 'stats']);
        Route::get('/export', [AuditLogController::class, 'export']);
    });
});

Route::prefix('finance/public')->group(function () {
    Route::get('budgets', [BudgetController::class, 'index']);
});

/**
 * Finance Module API Routes
 * Protected by session-based authentication and role-based middleware
 * Allows: FINANCE_STAFF, FINANCE_MANAGER, MANAGER, STAFF roles
 */
Route::middleware(['web', 'auth:web,user', 'role:FINANCE_STAFF,FINANCE_MANAGER,MANAGER,STAFF', 'shop.isolation'])->prefix('finance')->group(function () {
    // Financial Reports
    Route::prefix('reports')->group(function () {
        Route::get('balance-sheet', [FinancialReportController::class, 'balanceSheet']);
        Route::get('profit-loss', [FinancialReportController::class, 'profitLoss']);
        Route::get('trial-balance', [FinancialReportController::class, 'trialBalance']);
        Route::get('ar-aging', [FinancialReportController::class, 'arAging']);
        Route::get('ap-aging', [FinancialReportController::class, 'apAging']);
    });

    // Bank Reconciliation routes
    Route::prefix('reconciliation')->group(function () {
        Route::get('transactions', [ReconciliationController::class, 'getTransactions']);
        Route::post('/', [ReconciliationController::class, 'store']);
        Route::post('auto-match', [ReconciliationController::class, 'autoMatch']);
        Route::post('batch-reconcile', [ReconciliationController::class, 'batchReconcile']);
        Route::get('history', [ReconciliationController::class, 'history']);
        Route::delete('{id}/unmatch', [ReconciliationController::class, 'unmatch']);
    });
    
    // Budgets
    Route::apiResource('budgets', BudgetController::class);
    Route::get('budgets/variance', [BudgetController::class, 'variance']);
    Route::get('budgets/utilization', [BudgetController::class, 'utilization']);
    Route::post('budgets/{budget}/sync-actuals', [BudgetController::class, 'syncActuals']);
    
    // Chart of Accounts
    Route::get('accounts', [\App\Http\Controllers\Api\Finance\AccountController::class, 'index']);
    Route::post('accounts', [\App\Http\Controllers\Api\Finance\AccountController::class, 'store']);
    Route::get('accounts/{id}', [\App\Http\Controllers\Api\Finance\AccountController::class, 'show']);
    Route::put('accounts/{id}', [\App\Http\Controllers\Api\Finance\AccountController::class, 'update']);
    Route::delete('accounts/{id}', [\App\Http\Controllers\Api\Finance\AccountController::class, 'destroy']);
    Route::get('accounts/{id}/ledger', [\App\Http\Controllers\Api\Finance\AccountController::class, 'ledger']);
    
    // Journal Entries
    Route::get('journal-entries', [\App\Http\Controllers\Api\Finance\JournalEntryController::class, 'index']);
    Route::post('journal-entries', [\App\Http\Controllers\Api\Finance\JournalEntryController::class, 'store']);
    Route::get('journal-entries/{id}', [\App\Http\Controllers\Api\Finance\JournalEntryController::class, 'show']);
    Route::patch('journal-entries/{id}', [\App\Http\Controllers\Api\Finance\JournalEntryController::class, 'update']);
    Route::delete('journal-entries/{id}', [\App\Http\Controllers\Api\Finance\JournalEntryController::class, 'destroy']);
    Route::post('journal-entries/{id}/post', [\App\Http\Controllers\Api\Finance\JournalEntryController::class, 'post']);
    Route::post('journal-entries/{id}/reverse', [\App\Http\Controllers\Api\Finance\JournalEntryController::class, 'reverse']);
    
    // Invoices
    Route::get('invoices', [\App\Http\Controllers\Api\Finance\InvoiceController::class, 'index']);
    Route::post('invoices', [\App\Http\Controllers\Api\Finance\InvoiceController::class, 'store']);
    Route::get('invoices/{id}', [\App\Http\Controllers\Api\Finance\InvoiceController::class, 'show']);
    Route::put('invoices/{id}', [\App\Http\Controllers\Api\Finance\InvoiceController::class, 'update']);
    Route::delete('invoices/{id}', [\App\Http\Controllers\Api\Finance\InvoiceController::class, 'destroy']);
    Route::post('invoices/{id}/send', [\App\Http\Controllers\Api\Finance\InvoiceController::class, 'send']);
    Route::post('invoices/{id}/void', [\App\Http\Controllers\Api\Finance\InvoiceController::class, 'void']);
    
    // Expenses
    Route::get('expenses', [\App\Http\Controllers\Api\Finance\ExpenseController::class, 'index']);
    Route::post('expenses', [\App\Http\Controllers\Api\Finance\ExpenseController::class, 'store']);
    Route::get('expenses/{id}', [\App\Http\Controllers\Api\Finance\ExpenseController::class, 'show']);
    Route::put('expenses/{id}', [\App\Http\Controllers\Api\Finance\ExpenseController::class, 'update']);
    Route::delete('expenses/{id}', [\App\Http\Controllers\Api\Finance\ExpenseController::class, 'destroy']);
    Route::post('expenses/{id}/approve', [\App\Http\Controllers\Api\Finance\ExpenseController::class, 'approve'])->middleware('role:FINANCE_MANAGER');
    Route::post('expenses/{id}/reject', [\App\Http\Controllers\Api\Finance\ExpenseController::class, 'reject'])->middleware('role:FINANCE_MANAGER');
    
    // Expense Receipt Management
    Route::post('expenses/{id}/receipt', [\App\Http\Controllers\Api\Finance\ExpenseController::class, 'uploadReceipt']);
    Route::get('expenses/{id}/receipt/download', [\App\Http\Controllers\Api\Finance\ExpenseController::class, 'downloadReceipt']);
    Route::delete('expenses/{id}/receipt', [\App\Http\Controllers\Api\Finance\ExpenseController::class, 'deleteReceipt']);
    
    // Tax Rates Management
    Route::get('tax-rates', [\App\Http\Controllers\Api\Finance\TaxRateController::class, 'index']);
    Route::post('tax-rates', [\App\Http\Controllers\Api\Finance\TaxRateController::class, 'store']);
    Route::get('tax-rates/effective', [\App\Http\Controllers\Api\Finance\TaxRateController::class, 'effective']);
    Route::get('tax-rates/default', [\App\Http\Controllers\Api\Finance\TaxRateController::class, 'getDefault']);
    Route::post('tax-rates/calculate', [\App\Http\Controllers\Api\Finance\TaxRateController::class, 'calculate']);
    Route::get('tax-rates/{id}', [\App\Http\Controllers\Api\Finance\TaxRateController::class, 'show']);
    Route::put('tax-rates/{id}', [\App\Http\Controllers\Api\Finance\TaxRateController::class, 'update']);
    Route::delete('tax-rates/{id}', [\App\Http\Controllers\Api\Finance\TaxRateController::class, 'destroy']);
    
    // Approval Workflow routes
    Route::prefix('approvals')->group(function () {
        Route::get('pending', [\App\Http\Controllers\ApprovalController::class, 'getPending']);
        Route::get('history', [\App\Http\Controllers\ApprovalController::class, 'getHistory']);
        Route::get('{id}/history', [\App\Http\Controllers\ApprovalController::class, 'getApprovalHistory']);
        
        // Only Finance Manager can approve/reject transactions
        Route::middleware('role:FINANCE_MANAGER')->group(function () {
            Route::post('{id}/approve', [\App\Http\Controllers\ApprovalController::class, 'approve']);
            Route::post('{id}/reject', [\App\Http\Controllers\ApprovalController::class, 'reject']);
        });
    });
});
