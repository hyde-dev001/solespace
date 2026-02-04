<?php

/**
 * Core API Routes
 * 
 * Purpose: Common API endpoints for authentication, payments, and core features
 * 
 * Note: Module-specific routes are in separate files:
 * - routes/hr-api.php          (HR module)
 * - routes/finance-api.php     (Finance module)
 * - routes/shop-owner-api.php  (Shop Owner module)
 */

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\FinancialReportController;
use App\Http\Controllers\Api\Finance\BudgetController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:web');

/**
 * PayMongo Payment Routes - PUBLIC
 * No authentication required for payment link creation
 */
Route::withoutMiddleware(['web', 'api'])->post('/create-payment-link', function (Request $request) {
    try {
        $amount = $request->input('amount');
        $description = $request->input('description', 'SoleSpace Purchase');
        $currency = $request->input('currency', 'PHP');

        if (!$amount || $amount <= 0) {
            return response()->json(['error' => 'Invalid amount'], 400);
        }

        $paymongo_secret = env('PAYMONGO_SECRET_KEY');
        if (!$paymongo_secret) {
            return response()->json(['error' => 'PayMongo not configured'], 500);
        }

        // Create a payment link via PayMongo API using Laravel's HTTP client
        $response = \Illuminate\Support\Facades\Http::withBasicAuth($paymongo_secret, '')
            ->post('https://api.paymongo.com/v1/links', [
                'data' => [
                    'attributes' => [
                        'amount' => (int)($amount * 100), // Convert to cents
                        'currency' => $currency,
                        'description' => $description,
                    ],
                ],
            ]);

        if ($response->failed()) {
            return response()->json([
                'error' => 'PayMongo API error: ' . ($response->json('message') ?? 'Unknown error')
            ], $response->status());
        }

        $data = $response->json();
        $checkoutUrl = $data['data']['attributes']['checkout_url'] ?? null;
        $shortUrl = $data['data']['attributes']['short_url'] ?? null;

        if (!$checkoutUrl && !$shortUrl) {
            return response()->json([
                'error' => 'No checkout URL in PayMongo response'
            ], 500);
        }

        return response()->json([
            'checkout_url' => $checkoutUrl,
            'payment_link' => $shortUrl,
            'url' => $checkoutUrl ?? $shortUrl,
        ]);
    } catch (\Exception $e) {
        return response()->json(['error' => 'Payment link creation failed: ' . $e->getMessage()], 500);
    }
});

/**
 * PayMongo Checkout Session - PUBLIC
 * Creates a checkout session and returns checkout_url
 */
Route::withoutMiddleware(['web', 'api'])->post('/paymongo/checkout', function (Request $request) {
    try {
        $amount = $request->input('amount');
        $description = $request->input('description', 'SoleSpace Purchase');
        $currency = $request->input('currency', 'PHP');
        $items = $request->input('items', []);

        if (!$amount || $amount <= 0) {
            return response()->json(['error' => 'Invalid amount'], 400);
        }

        $paymongo_secret = env('PAYMONGO_SECRET_KEY');
        if (!$paymongo_secret) {
            return response()->json(['error' => 'PayMongo not configured'], 500);
        }

        $appUrl = config('app.url', 'http://localhost');

        $lineItems = [];
        if (is_array($items) && count($items) > 0) {
            foreach ($items as $item) {
                $name = $item['name'] ?? 'Item';
                $price = isset($item['price']) ? (float) $item['price'] : 0;
                $qty = isset($item['qty']) ? (int) $item['qty'] : 1;
                if ($price <= 0 || $qty <= 0) {
                    continue;
                }
                $lineItems[] = [
                    'name' => $name,
                    'amount' => (int) round($price * 100),
                    'quantity' => $qty,
                    'currency' => $currency,
                    'description' => $description,
                ];
            }
        }

        if (count($lineItems) === 0) {
            $lineItems[] = [
                'name' => $description,
                'amount' => (int) round($amount * 100),
                'quantity' => 1,
                'currency' => $currency,
                'description' => $description,
            ];
        }

        $response = \Illuminate\Support\Facades\Http::withBasicAuth($paymongo_secret, '')
            ->post('https://api.paymongo.com/v1/checkout_sessions', [
                'data' => [
                    'attributes' => [
                        'line_items' => $lineItems,
                        'payment_method_types' => ['gcash', 'paymaya', 'card'],
                        'success_url' => rtrim($appUrl, '/') . '/checkout',
                        'cancel_url' => rtrim($appUrl, '/') . '/checkout',
                    ],
                ],
            ]);

        if ($response->failed()) {
            $detail = $response->json('errors.0.detail')
                ?? $response->json('message')
                ?? 'Unknown error';
            return response()->json([
                'error' => 'PayMongo API error: ' . $detail
            ], $response->status());
        }

        $data = $response->json();
        $checkoutUrl = $data['data']['attributes']['checkout_url'] ?? null;

        if (!$checkoutUrl) {
            return response()->json(['error' => 'No checkout URL in PayMongo response'], 500);
        }

        return response()->json([
            'checkout_url' => $checkoutUrl,
        ]);
    } catch (\Exception $e) {
        return response()->json(['error' => 'Checkout session failed: ' . $e->getMessage()], 500);
    }
});

// Debug endpoint to check current user
Route::get('/debug/me', function () {
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

/**
 * Legacy Finance Routes (to be migrated to finance-api.php)
 * These are kept for backward compatibility
 * TODO: Move to finance-api.php and update frontend to use new endpoints
 */
Route::prefix('finance/public')->group(function () {
    Route::get('budgets', [BudgetController::class, 'index']);
});

/**
 * Legacy Finance Module Routes (for backward compatibility)
 * Protected by session-based authentication and role-based middleware
 * TODO: Migrate frontend to use routes/finance-api.php
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

    // REMOVED: Bank Reconciliation - Too complex for SMEs
    // Route::prefix('reconciliation')->group(function () {
    //     Route::get('transactions', [ReconciliationController::class, 'getTransactions']);
    //     Route::post('/', [ReconciliationController::class, 'store']);
    //     Route::post('auto-match', [ReconciliationController::class, 'autoMatch']);
    //     Route::post('batch-reconcile', [ReconciliationController::class, 'batchReconcile']);
    //     Route::get('history', [ReconciliationController::class, 'history']);
    //     Route::delete('{id}/unmatch', [ReconciliationController::class, 'unmatch']);
    // });

    // REMOVED: Budgets - Too advanced for SMEs
    // Route::apiResource('budgets', BudgetController::class);
    // Route::get('budgets/variance', [BudgetController::class, 'variance']);
    // Route::get('budgets/utilization', [BudgetController::class, 'utilization']);
    // Route::post('budgets/{budget}/sync-actuals', [BudgetController::class, 'syncActuals']);

    // REMOVED: Chart of Accounts - System auto-creates accounts for SMEs
    // Route::get('accounts', [\App\Http\Controllers\Api\Finance\AccountController::class, 'index']);
    // Route::post('accounts', [\App\Http\Controllers\Api\Finance\AccountController::class, 'store']);
    // Route::get('accounts/{id}', [\App\Http\Controllers\Api\Finance\AccountController::class, 'show']);
    // Route::put('accounts/{id}', [\App\Http\Controllers\Api\Finance\AccountController::class, 'update']);
    // Route::delete('accounts/{id}', [\App\Http\Controllers\Api\Finance\AccountController::class, 'destroy']);
    // Route::get('accounts/{id}/ledger', [\App\Http\Controllers\Api\Finance\AccountController::class, 'ledger']);

    // REMOVED: Journal Entries - Auto-posting for SMEs
    // Route::get('journal-entries', [\App\Http\Controllers\Api\Finance\JournalEntryController::class, 'index']);
    // Route::post('journal-entries', [\App\Http\Controllers\Api\Finance\JournalEntryController::class, 'store']);
    // Route::get('journal-entries/{id}', [\App\Http\Controllers\Api\Finance\JournalEntryController::class, 'show']);
    // Route::patch('journal-entries/{id}', [\App\Http\Controllers\Api\Finance\JournalEntryController::class, 'update']);
    // Route::delete('journal-entries/{id}', [\App\Http\Controllers\Api\Finance\JournalEntryController::class, 'destroy']);
    // Route::post('journal-entries/{id}/post', [\App\Http\Controllers\Api\Finance\JournalEntryController::class, 'post']);
    // Route::post('journal-entries/{id}/reverse', [\App\Http\Controllers\Api\Finance\JournalEntryController::class, 'reverse']);

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

/**
 * Module Routes are loaded via web.php
 * - routes/hr-api.php
 * - routes/finance-api.php  
 * - routes/shop-owner-api.php
 */
