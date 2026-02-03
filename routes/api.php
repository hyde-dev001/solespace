<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UsersController;
use App\Http\Controllers\ERP\HR\EmployeeController;
use App\Http\Controllers\FinancialReportController;
use App\Http\Controllers\ReconciliationController;
use App\Http\Controllers\AuditLogController;
use App\Http\Controllers\Api\Finance\BudgetController;
use App\Http\Controllers\ERP\HR\AttendanceController;
use App\Http\Controllers\ERP\HR\LeaveController;
use App\Http\Controllers\ERP\HR\PayrollController;
use App\Http\Controllers\ERP\HR\PerformanceController;
use App\Http\Controllers\ERP\HR\DepartmentController;
use App\Http\Controllers\ERP\HR\DocumentController;
use App\Http\Controllers\ERP\HR\AuditLogController as HRAuditLogController;
use App\Http\Controllers\ERP\HR\NotificationController;
use App\Http\Controllers\ERP\HR\TrainingController;
use App\Http\Controllers\ERP\HR\HRAnalyticsController;
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

Route::group(['middleware' => ['web', 'auth:user']], function () {
    /**
     * HR Module Routes
     * Protected by: HR or shop_owner role + Shop isolation
     */
    Route::middleware(['role:HR,shop_owner', 'shop.isolation'])->prefix('hr')->group(function () {
        // Dashboard Analytics
        Route::get('dashboard', [HRAnalyticsController::class, 'dashboard'])->name('hr.dashboard');

        // Employees
        Route::apiResource('employees', EmployeeController::class);
        Route::get('employees/statistics', [EmployeeController::class, 'statistics'])->name('employees.statistics');
        Route::post('employees/{id}/suspend', [EmployeeController::class, 'suspend'])->name('employees.suspend');
        Route::post('employees/{id}/activate', [EmployeeController::class, 'activate'])->name('employees.activate');

        // Attendance
        Route::apiResource('attendance', AttendanceController::class);
        Route::post('attendance/check-in', [AttendanceController::class, 'checkIn'])->name('attendance.checkin');
        Route::post('attendance/check-out', [AttendanceController::class, 'checkOut'])->name('attendance.checkout');
        Route::get('attendance/employee/{employeeId}', [AttendanceController::class, 'getByEmployee'])->name('attendance.by_employee');
        Route::get('attendance/statistics', [AttendanceController::class, 'statistics'])->name('attendance.statistics');

        // Leave Requests
        Route::apiResource('leave-requests', LeaveController::class);
        Route::post('leave-requests/{id}/approve', [LeaveController::class, 'approve'])->name('leave.approve');
        Route::post('leave-requests/{id}/reject', [LeaveController::class, 'reject'])->name('leave.reject');
        Route::get('leave-requests/pending', [LeaveController::class, 'getPending'])->name('leave.pending');
        Route::get('leave-requests/employee/{employeeId}/balance', [LeaveController::class, 'getBalance'])->name('leave.balance');

        // Payroll
        Route::apiResource('payroll', PayrollController::class);
        Route::post('payroll/generate', [PayrollController::class, 'generatePayroll'])->name('payroll.generate');
        Route::post('payroll/process', [PayrollController::class, 'processPayroll'])->name('payroll.process');
        Route::get('payroll/{id}/export', [PayrollController::class, 'exportPayslip'])->name('payroll.export');
        Route::get('payroll/employee/{employeeId}', [PayrollController::class, 'getByEmployee'])->name('payroll.by_employee');

        // Performance Reviews
        Route::apiResource('performance-reviews', PerformanceController::class);
        Route::post('performance-reviews/{id}/submit', [PerformanceController::class, 'submit'])->name('performance.submit');
        Route::get('performance-reviews/employee/{employeeId}', [PerformanceController::class, 'getByEmployee'])->name('performance.by_employee');

        // Departments
        Route::apiResource('departments', DepartmentController::class);
        Route::get('departments/statistics', [DepartmentController::class, 'statistics'])->name('departments.statistics');

        // Employee Documents
        Route::apiResource('documents', DocumentController::class);
        Route::get('documents/{id}/download', [DocumentController::class, 'download'])->name('documents.download');
        Route::post('documents/{id}/verify', [DocumentController::class, 'verify'])->name('documents.verify');
        Route::post('documents/{id}/reject', [DocumentController::class, 'reject'])->name('documents.reject');
        Route::get('documents/reports/expiring', [DocumentController::class, 'expiringDocuments'])->name('documents.expiring');
        Route::get('documents/reports/expired', [DocumentController::class, 'expiredDocuments'])->name('documents.expired');
        Route::get('documents/employee/{employeeId}', [DocumentController::class, 'employeeDocuments'])->name('documents.by_employee');
        Route::get('documents/metadata/types', [DocumentController::class, 'documentTypes'])->name('documents.types');
        Route::get('documents/reports/statistics', [DocumentController::class, 'statistics'])->name('documents.statistics');

        // Audit Logs
        Route::get('audit-logs', [HRAuditLogController::class, 'index'])->name('audit.index');
        Route::get('audit-logs/{id}', [HRAuditLogController::class, 'show'])->name('audit.show');
        Route::get('audit-logs/statistics', [HRAuditLogController::class, 'statistics'])->name('audit.statistics');
        Route::get('audit-logs/entity/history', [HRAuditLogController::class, 'entityHistory'])->name('audit.entity_history');
        Route::get('audit-logs/user/{userId}/activity', [HRAuditLogController::class, 'userActivity'])->name('audit.user_activity');
        Route::get('audit-logs/employee/{employeeId}/activity', [HRAuditLogController::class, 'employeeActivity'])->name('audit.employee_activity');
        Route::get('audit-logs/critical', [HRAuditLogController::class, 'criticalLogs'])->name('audit.critical');
        Route::get('audit-logs/export', [HRAuditLogController::class, 'export'])->name('audit.export');
        Route::get('audit-logs/filters/options', [HRAuditLogController::class, 'filterOptions'])->name('audit.filter_options');

        // Notifications
        Route::prefix('notifications')->group(function () {
            Route::get('/', [NotificationController::class, 'index'])->name('notifications.index');
            Route::get('/unread-count', [NotificationController::class, 'unreadCount'])->name('notifications.unread_count');
            Route::get('/stats', [NotificationController::class, 'stats'])->name('notifications.stats');
            Route::post('/{id}/mark-as-read', [NotificationController::class, 'markAsRead'])->name('notifications.mark_as_read');
            Route::post('/mark-all-as-read', [NotificationController::class, 'markAllAsRead'])->name('notifications.mark_all_as_read');
            Route::delete('/{id}', [NotificationController::class, 'destroy'])->name('notifications.destroy');
            Route::delete('/clear-read', [NotificationController::class, 'clearRead'])->name('notifications.clear_read');
        });

        // Training Management
        Route::prefix('training')->group(function () {
            // Training Programs
            Route::get('/programs', [TrainingController::class, 'index'])->name('training.programs.index');
            Route::post('/programs', [TrainingController::class, 'store'])->name('training.programs.store');
            Route::get('/programs/{id}', [TrainingController::class, 'show'])->name('training.programs.show');
            Route::put('/programs/{id}', [TrainingController::class, 'update'])->name('training.programs.update');
            Route::delete('/programs/{id}', [TrainingController::class, 'destroy'])->name('training.programs.destroy');

            // Training Sessions
            Route::get('/sessions', [TrainingController::class, 'sessions'])->name('training.sessions.index');
            Route::post('/sessions', [TrainingController::class, 'storeSession'])->name('training.sessions.store');
            Route::put('/sessions/{id}', [TrainingController::class, 'updateSession'])->name('training.sessions.update');
            Route::delete('/sessions/{id}', [TrainingController::class, 'destroySession'])->name('training.sessions.destroy');

            // Enrollments
            Route::get('/enrollments', [TrainingController::class, 'enrollments'])->name('training.enrollments.index');
            Route::post('/enroll', [TrainingController::class, 'enroll'])->name('training.enroll');
            Route::put('/enrollments/{id}', [TrainingController::class, 'updateEnrollment'])->name('training.enrollments.update');
            Route::post('/enrollments/{id}/complete', [TrainingController::class, 'completeEnrollment'])->name('training.enrollments.complete');

            // Certifications
            Route::get('/certifications', [TrainingController::class, 'certifications'])->name('training.certifications.index');

            // Statistics
            Route::get('/statistics', [TrainingController::class, 'statistics'])->name('training.statistics');
        });
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

/**
 * Staff/Manager Self-Service Attendance Routes
 * Protected by: STAFF or MANAGER role
 */
Route::middleware(['web', 'auth:user', 'role:STAFF,MANAGER,shop_owner'])->prefix('staff')->group(function () {
    // Self check-in/out
    Route::post('attendance/check-in', [AttendanceController::class, 'selfCheckIn'])->name('staff.attendance.checkin');
    Route::post('attendance/check-out', [AttendanceController::class, 'selfCheckOut'])->name('staff.attendance.checkout');
    Route::get('attendance/my-records', [AttendanceController::class, 'myRecords'])->name('staff.attendance.my_records');
    Route::get('attendance/status', [AttendanceController::class, 'checkStatus'])->name('staff.attendance.status');

    // Self-service leave request
    Route::post('leave/request', [LeaveController::class, 'selfRequestLeave'])->name('staff.leave.request');
});
