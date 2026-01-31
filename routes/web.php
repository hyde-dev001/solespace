<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Http\Controllers\ShopOwner\CalendarController;
use App\Http\Controllers\ShopOwner\EcommerceController;
use App\Http\Controllers\ShopOwner\UserAccessControlController;
use App\Http\Controllers\UserSide\LandingPageController;
use App\Http\Controllers\superAdmin\SuperAdminUserManagementController;
use App\Http\Controllers\superAdmin\FlaggedAccountsController;
use App\Http\Controllers\superAdmin\ShopOwnerRegistrationViewController;
use App\Http\Controllers\superAdmin\SystemMonitoringDashboardController;
use App\Http\Controllers\superAdmin\NotificationCommunicationToolsController;
use App\Http\Controllers\superAdmin\DataReportAccessController;
use App\Http\Controllers\ShopRegistrationController;
use App\Http\Controllers\SuperAdminController;
use App\Http\Controllers\SuperAdminAuthController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\ShopOwnerAuthController;
use App\Http\Controllers\UserProfileController;
use App\Http\Controllers\Api\Finance\AccountController as FinanceAccountController;
use App\Http\Controllers\Api\Finance\JournalEntryController as FinanceJournalEntryController;
use App\Http\Controllers\RecurringTransactionController;
use App\Http\Controllers\CostCenterController;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "web" middleware group.
|
*/

// Public Routes (User Side)
Route::get('/', [LandingPageController::class, 'index'])->name('landing');
Route::get('/products', [LandingPageController::class, 'products'])->name('products');
Route::get('/products/{slug}', [LandingPageController::class, 'productShow'])->name('products.show');
Route::get('/checkout', function () { return Inertia::render('UserSide/Checkout'); })->name('checkout');
Route::get('/repair-services', [LandingPageController::class, 'repair'])->name('repair');
Route::get('/services', [LandingPageController::class, 'services'])->name('services');
Route::get('/contact', [LandingPageController::class, 'contact'])->name('contact');
Route::get('/register', [LandingPageController::class, 'register'])->name('register');
Route::get('/login', [LandingPageController::class, 'login'])->name('login');
Route::get('/shop-owner-register', [LandingPageController::class, 'shopOwnerRegister'])->name('shop-owner-register');

// User Login Page
Route::get('/user/login', function () { return Inertia::render('UserSide/UserLogin'); })->name('user.login.form');

// Shop Owner Login Page (redirect to customer login)
Route::get('/shop-owner/login', function () { return redirect()->route('user.login.form'); })->name('shop-owner.login.form');

// User Authentication Routes
Route::post('/user/register', [UserController::class, 'register'])->name('user.register');
Route::post('/user/login', [UserController::class, 'login'])->name('user.login');
Route::post('/user/logout', [UserController::class, 'logout'])->name('user.logout');
Route::get('/api/user/me', [UserController::class, 'me'])->middleware('auth:user')->name('user.me');

// Shop Owner Authentication Routes
Route::post('/shop-owner/register', [ShopOwnerAuthController::class, 'register'])->name('shop-owner.register');
Route::post('/shop-owner/login', [UserController::class, 'login'])->name('shop-owner.login');
Route::post('/shop-owner/logout', [ShopOwnerAuthController::class, 'logout'])->name('shop-owner.logout');
Route::get('/api/shop-owner/me', [ShopOwnerAuthController::class, 'me'])->middleware('auth:shop_owner')->name('shop-owner.me');

// Common Routes (for testing/development)
Route::group([], function () {
    Route::get('/profile', function () { return Inertia::render('UserProfiles'); })->name('profile');
    Route::get('/blank', function () { return Inertia::render('Blank'); })->name('blank');
    Route::get('/form-elements', function () { return Inertia::render('Forms/FormElements'); })->name('form-elements');
    Route::get('/basic-tables', function () { return Inertia::render('Tables/BasicTables'); })->name('basic-tables');
    Route::get('/alerts', function () { return Inertia::render('UiElements/Alerts'); })->name('alerts');
    Route::get('/avatars', function () { return Inertia::render('UiElements/Avatars'); })->name('avatars');
    Route::get('/badge', function () { return Inertia::render('UiElements/Badges'); })->name('badge');
    Route::get('/buttons', function () { return Inertia::render('UiElements/Buttons'); })->name('buttons');
    Route::get('/images', function () { return Inertia::render('UiElements/Images'); })->name('images');
    Route::get('/videos', function () { return Inertia::render('UiElements/Videos'); })->name('videos');
    Route::get('/line-chart', function () { return Inertia::render('Charts/LineChart'); })->name('line-chart');
    Route::get('/bar-chart', function () { return Inertia::render('Charts/BarChart'); })->name('bar-chart');
});

// Super Admin Routes
Route::prefix('superAdmin')->name('superAdmin.')->middleware('auth:super_admin')->group(function () {
    Route::get('/super-admin-user-management', [SuperAdminUserManagementController::class, 'index'])->name('super-admin-user-management');
    Route::get('/flagged-accounts', [FlaggedAccountsController::class, 'index'])->name('flagged-accounts');
    Route::get('/shop-owner-registration-view', [ShopOwnerRegistrationViewController::class, 'index'])->name('shop-owner-registration-view');
    Route::post('/shop-owner-registration/{id}/approve', [ShopOwnerRegistrationViewController::class, 'approve'])->name('shop-owner-approve');
    Route::post('/shop-owner-registration/{id}/reject', [ShopOwnerRegistrationViewController::class, 'reject'])->name('shop-owner-reject');
    Route::get('/system-monitoring-dashboard', [SystemMonitoringDashboardController::class, 'index'])->name('system-monitoring-dashboard');
    Route::get('/notification-communication-tools', [NotificationCommunicationToolsController::class, 'index'])->name('notification-communication-tools');
    Route::get('/data-report-access', [DataReportAccessController::class, 'index'])->name('data-report-access');
});

// Shop Owner Routes
Route::prefix('shopOwner')->name('shopOwner.')->group(function () {
    Route::get('/calendar', [CalendarController::class, 'index'])->name('calendar');
    Route::get('/ecommerce', [EcommerceController::class, 'index'])->name('ecommerce');
    Route::get('/user-access-control', [UserAccessControlController::class, 'index'])->name('user-access-control');
});

// Shop Owner Protected Routes
Route::middleware('auth:shop_owner')->prefix('shop-owner')->name('shop-owner.')->group(function () {
    Route::get('/dashboard', function () {
        $shopOwner = Auth::guard('shop_owner')->user();
        return Inertia::render('ShopOwner/Dashboard', ['shop_owner' => $shopOwner]);
    })->name('dashboard');

    Route::post('/employees', [UserAccessControlController::class, 'storeEmployee'])->name('employees.store');
    Route::delete('/employees/{employee}', [\App\Http\Controllers\EmployeeController::class, 'destroy'])->middleware('shop.isolation')->name('employees.destroy');
    Route::post('/employees/{employee}/suspend', [\App\Http\Controllers\EmployeeController::class, 'suspend'])->middleware('shop.isolation')->name('employees.suspend');
    Route::post('/employees/{employee}/activate', [\App\Http\Controllers\EmployeeController::class, 'activate'])->middleware('shop.isolation')->name('employees.activate');
});

// CSRF Token endpoint for API requests
Route::get('/api/csrf-token', function () { return response()->json(['csrf_token' => csrf_token()]); });

// Session-backed API endpoints for finance (allow web-session authenticated users)
Route::middleware('auth:user')->prefix('api/finance/session')->group(function () {
    Route::get('accounts', [\App\Http\Controllers\Api\Finance\AccountController::class, 'index']);
    Route::post('accounts', [\App\Http\Controllers\Api\Finance\AccountController::class, 'store']);
    Route::get('accounts/{id}/ledger', [\App\Http\Controllers\Api\Finance\AccountController::class, 'ledger']);
    
    // Bank Reconciliation routes
    Route::prefix('reconciliation')->group(function () {
        Route::get('transactions', [\App\Http\Controllers\ReconciliationController::class, 'getTransactions']);
        Route::post('/', [\App\Http\Controllers\ReconciliationController::class, 'store']);
        Route::get('history', [\App\Http\Controllers\ReconciliationController::class, 'history']);
        Route::delete('{id}/unmatch', [\App\Http\Controllers\ReconciliationController::class, 'unmatch']);
    });
    
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

// Add budget endpoints that work with web session authentication
Route::middleware(['auth:user', 'role:FINANCE_STAFF,FINANCE_MANAGER'])->prefix('api/finance')->group(function () {
    Route::get('budgets', [\App\Http\Controllers\Api\Finance\BudgetController::class, 'index']);
    Route::post('budgets', [\App\Http\Controllers\Api\Finance\BudgetController::class, 'store']);
    Route::patch('budgets/{budget}', [\App\Http\Controllers\Api\Finance\BudgetController::class, 'update']);
    Route::delete('budgets/{budget}', [\App\Http\Controllers\Api\Finance\BudgetController::class, 'destroy']);
});

// Shop Registration Routes
Route::get('/shop/register', function () { return Inertia::render('userSide/ShopOwnerRegistration'); })->name('shop.register.form');
Route::post('/shop/register-full', [ShopRegistrationController::class, 'storeFullInertia'])->name('shop.register');

// Super Admin Authentication Routes (Second set - removed duplicate, fixing authentication flows)
Route::get('/admin/login', [SuperAdminAuthController::class, 'showLoginForm'])->name('admin.login');
Route::post('/admin/login', [SuperAdminAuthController::class, 'login'])->name('admin.login.post');
Route::post('/admin/logout', [SuperAdminAuthController::class, 'logout'])->name('admin.logout');

// Admin Protected Routes
Route::middleware('super_admin.auth')->prefix('admin')->name('admin.')->group(function () {
    Route::get('/', function () { return redirect()->route('admin.system-monitoring'); })->name('dashboard');
    Route::get('/system-monitoring', [SystemMonitoringDashboardController::class, 'index'])->name('system-monitoring');
    
    // Admin management routes
    Route::get('/admin', [SuperAdminController::class, 'showAdminManagement'])->name('admin-management');
    Route::get('/create-admin', [SuperAdminController::class, 'showCreateAdmin'])->name('create-admin');
    Route::post('/create-admin', [SuperAdminController::class, 'storeAdmin'])->name('create-admin.store');
    Route::post('/admins/{id}/suspend', [SuperAdminController::class, 'suspendAdmin'])->name('admins.suspend');
    Route::post('/admins/{id}/activate', [SuperAdminController::class, 'activateAdmin'])->name('admins.activate');
    Route::delete('/admins/{id}', [SuperAdminController::class, 'deleteAdmin'])->name('admins.delete');
    
    // Shop management routes
    Route::get('/registered-shops', [SuperAdminController::class, 'showRegisteredShops'])->name('registered-shops');
    Route::post('/shops/{id}/suspend', [SuperAdminController::class, 'suspendShop'])->name('shops.suspend');
    Route::post('/shops/{id}/activate', [SuperAdminController::class, 'activateShop'])->name('shops.activate');
    Route::delete('/shops/{id}', [SuperAdminController::class, 'deleteShop'])->name('shops.delete');
    
    // User management routes
    Route::get('/user-management', [SuperAdminController::class, 'showUserManagement'])->name('user-management');
    Route::post('/users/{id}/suspend', [SuperAdminController::class, 'suspendUser'])->name('users.suspend');
    Route::post('/users/{id}/activate', [SuperAdminController::class, 'activateUser'])->name('users.activate');
    Route::delete('/users/{id}', [SuperAdminController::class, 'deleteUser'])->name('users.delete');
    
    // Additional admin routes
    Route::get('/notifications', function () { return Inertia::render('superAdmin/NotificationCommunicationTools'); })->name('notifications');
    Route::get('/data-reports', [SuperAdminController::class, 'showDataReports'])->name('data-reports');
});

// HR and ERP routes
Route::middleware(['auth:user', 'role:HR'])->get('/erp/hr', function () {
    if (Auth::guard('user')->user()?->force_password_change) {
        return redirect()->route('erp.profile');
    }
    return Inertia::render('ERP/HR/HR');
})->name('erp.hr');

Route::middleware(['auth:user'])->group(function () {
    Route::get('/erp/profile', [UserProfileController::class, 'show'])->name('erp.profile');
    Route::post('/erp/password', [UserProfileController::class, 'updatePassword'])->name('erp.password.update');
});

// Finance pages
Route::prefix('finance')->name('finance.')->middleware(['auth:user', 'role:FINANCE_STAFF,FINANCE_MANAGER'])->group(function () {
    Route::get('/', function () {
        if (Auth::guard('user')->user()?->force_password_change) {
            return redirect()->route('erp.profile');
        }
        return Inertia::render('ERP/Finance/Finance');
    })->name('index');
});

// Approval Workflow page (only for Finance Manager with unlimited authority)
Route::get('/approvals', function () {
    if (Auth::guard('user')->user()?->force_password_change) {
        return redirect()->route('erp.profile');
    }
    return Inertia::render('ERP/Finance/ApprovalWorkflow');
})->name('approvals.index')->middleware(['auth:user', 'role:FINANCE_MANAGER']);

Route::get('/create-invoice', function () {
    if (Auth::guard('user')->user()?->force_password_change) {
        return redirect()->route('erp.profile');
    }
    return redirect('/finance?section=create-invoice');
})->middleware(['auth:user', 'role:FINANCE_STAFF,FINANCE_MANAGER'])->name('finance.create-invoice');

// CRM routes
Route::prefix('crm')->name('crm.')->middleware(['auth:user', 'role:CRM'])->group(function () {
    Route::get('/', function () { if (Auth::guard('user')->user()?->force_password_change) { return redirect()->route('erp.profile'); } return Inertia::render('ERP/CRM/CRMDashboard'); })->name('dashboard');
    Route::get('/opportunities', function () { if (Auth::guard('user')->user()?->force_password_change) { return redirect()->route('erp.profile'); } return Inertia::render('ERP/CRM/Opportunities'); })->name('opportunities');
    Route::get('/leads', function () { if (Auth::guard('user')->user()?->force_password_change) { return redirect()->route('erp.profile'); } return Inertia::render('ERP/CRM/Leads'); })->name('leads');
    Route::get('/customers', function () { if (Auth::guard('user')->user()?->force_password_change) { return redirect()->route('erp.profile'); } return Inertia::render('ERP/CRM/Customers'); })->name('customers');
});

// MANAGER routes (only MANAGER can access)
Route::prefix('erp/manager')->name('erp.manager.')->middleware(['auth:user', 'manager.staff:manager'])->group(function () {
    Route::get('/dashboard', function () { if (Auth::guard('user')->user()?->force_password_change) { return redirect()->route('erp.profile'); } return Inertia::render('ERP/Manager/Dashboard'); })->name('dashboard');
    Route::get('/reports', function () { if (Auth::guard('user')->user()?->force_password_change) { return redirect()->route('erp.profile'); } return Inertia::render('ERP/Manager/Reports'); })->name('reports');
    Route::get('/approvals', function () { if (Auth::guard('user')->user()?->force_password_change) { return redirect()->route('erp.profile'); } return Inertia::render('ERP/Manager/Approvals'); })->name('approvals');
    Route::get('/pricing-and-services', function () { if (Auth::guard('user')->user()?->force_password_change) { return redirect()->route('erp.profile'); } return Inertia::render('ERP/Manager/PricingAndServices'); })->name('pricing-services');
    Route::get('/products', function () { if (Auth::guard('user')->user()?->force_password_change) { return redirect()->route('erp.profile'); } return Inertia::render('ERP/Manager/productUpload'); })->name('products');
    Route::get('/inventory-overview', function () { if (Auth::guard('user')->user()?->force_password_change) { return redirect()->route('erp.profile'); } return Inertia::render('ERP/Manager/InventoryOverview'); })->name('inventory-overview');
    Route::get('/user-management', function () { if (Auth::guard('user')->user()?->force_password_change) { return redirect()->route('erp.profile'); } return Inertia::render('ERP/Manager/UserManagement'); })->name('user-management');
    Route::get('/audit-logs', function () { if (Auth::guard('user')->user()?->force_password_change) { return redirect()->route('erp.profile'); } return Inertia::render('ERP/Manager/AuditLogs'); })->name('audit-logs');
});

// STAFF routes (both MANAGER and STAFF can access)
Route::prefix('erp/staff')->name('erp.staff.')->middleware(['auth:user', 'manager.staff:staff'])->group(function () {
    Route::get('/dashboard', function () { if (Auth::guard('user')->user()?->force_password_change) { return redirect()->route('erp.profile'); } return Inertia::render('ERP/STAFF/Dashboard'); })->name('dashboard');
    Route::get('/job-orders', function () { if (Auth::guard('user')->user()?->force_password_change) { return redirect()->route('erp.profile'); } return Inertia::render('ERP/STAFF/JobOrders'); })->name('job-orders');
    Route::get('/repair-status', function () { if (Auth::guard('user')->user()?->force_password_change) { return redirect()->route('erp.profile'); } return Inertia::render('ERP/STAFF/RepairStatus'); })->name('repair-status');
    Route::get('/products', function () { if (Auth::guard('user')->user()?->force_password_change) { return redirect()->route('erp.profile'); } return Inertia::render('ERP/STAFF/productUpload'); })->name('products');
    Route::get('/payments', function () { return redirect()->route('erp.staff.products'); });
    Route::get('/customers', function () { if (Auth::guard('user')->user()?->force_password_change) { return redirect()->route('erp.profile'); } return Inertia::render('ERP/STAFF/Customers'); })->name('customers');
    Route::get('/attendance', function () { if (Auth::guard('user')->user()?->force_password_change) { return redirect()->route('erp.profile'); } return Inertia::render('ERP/STAFF/timeIn'); })->name('attendance');
});

// Common Routes (for testing/development)
Route::group([], function () {
    Route::get('/profile', function () { return Inertia::render('UserProfiles'); })->name('profile');
    Route::get('/blank', function () { return Inertia::render('Blank'); })->name('blank');
    Route::get('/form-elements', function () { return Inertia::render('Forms/FormElements'); })->name('form-elements');
    Route::get('/basic-tables', function () { return Inertia::render('Tables/BasicTables'); })->name('basic-tables');
    Route::get('/alerts', function () { return Inertia::render('UiElements/Alerts'); })->name('alerts');
    Route::get('/avatars', function () { return Inertia::render('UiElements/Avatars'); })->name('avatars');
    Route::get('/badge', function () { return Inertia::render('UiElements/Badges'); })->name('badge');
    Route::get('/buttons', function () { return Inertia::render('UiElements/Buttons'); })->name('buttons');
    Route::get('/images', function () { return Inertia::render('UiElements/Images'); })->name('images');
    Route::get('/videos', function () { return Inertia::render('UiElements/Videos'); })->name('videos');
    Route::get('/line-chart', function () { return Inertia::render('Charts/LineChart'); })->name('line-chart');
    Route::get('/bar-chart', function () { return Inertia::render('Charts/BarChart'); })->name('bar-chart');
});

// Super Admin Routes
Route::prefix('superAdmin')->name('superAdmin.')->middleware('auth:super_admin')->group(function () {
    Route::get('/super-admin-user-management', [SuperAdminUserManagementController::class, 'index'])->name('super-admin-user-management');
    Route::get('/flagged-accounts', [FlaggedAccountsController::class, 'index'])->name('flagged-accounts');
    Route::get('/shop-owner-registration-view', [ShopOwnerRegistrationViewController::class, 'index'])->name('shop-owner-registration-view');
    Route::post('/shop-owner-registration/{id}/approve', [ShopOwnerRegistrationViewController::class, 'approve'])->name('shop-owner-approve');
    Route::post('/shop-owner-registration/{id}/reject', [ShopOwnerRegistrationViewController::class, 'reject'])->name('shop-owner-reject');
    Route::get('/system-monitoring-dashboard', [SystemMonitoringDashboardController::class, 'index'])->name('system-monitoring-dashboard');
    Route::get('/notification-communication-tools', [NotificationCommunicationToolsController::class, 'index'])->name('notification-communication-tools');
    Route::get('/data-report-access', [DataReportAccessController::class, 'index'])->name('data-report-access');
});

// Phase 3a: Recurring Transactions and Cost Center Routes
Route::prefix('erp/finance')->name('erp.finance.')->middleware(['auth:user', 'role:FINANCE_STAFF,FINANCE_MANAGER'])->group(function () {
    // Recurring Transactions routes
    Route::prefix('recurring-transactions')->name('recurring-transactions.')->group(function () {
        Route::get('/', [RecurringTransactionController::class, 'index'])->name('index');
        Route::get('/create', [RecurringTransactionController::class, 'create'])->name('create');
        Route::post('/', [RecurringTransactionController::class, 'store'])->name('store');
        Route::get('/{recurringTransaction}/edit', [RecurringTransactionController::class, 'edit'])->name('edit');
        Route::put('/{recurringTransaction}', [RecurringTransactionController::class, 'update'])->name('update');
        Route::delete('/{recurringTransaction}', [RecurringTransactionController::class, 'destroy'])->name('destroy');
        Route::post('/{recurringTransaction}/toggle-active', [RecurringTransactionController::class, 'toggleActive'])->name('toggle-active');
        Route::get('/{recurringTransaction}/history', [RecurringTransactionController::class, 'executionHistory'])->name('execution-history');
        Route::post('/{recurringTransaction}/execute', [RecurringTransactionController::class, 'executeNow'])->name('execute-now');
    });

    // Cost Center routes
    Route::prefix('cost-centers')->name('cost-centers.')->group(function () {
        Route::get('/', [CostCenterController::class, 'index'])->name('index');
        Route::get('/create', [CostCenterController::class, 'create'])->name('create');
        Route::post('/', [CostCenterController::class, 'store'])->name('store');
        Route::get('/{costCenter}/edit', [CostCenterController::class, 'edit'])->name('edit');
        Route::put('/{costCenter}', [CostCenterController::class, 'update'])->name('update');
        Route::delete('/{costCenter}', [CostCenterController::class, 'destroy'])->name('destroy');
        Route::get('/{costCenter}/analytics', [CostCenterController::class, 'analytics'])->name('analytics');
        Route::post('/{costCenter}/allocate', [CostCenterController::class, 'allocateExpense'])->name('allocate-expense');
    });
});

// Legacy API Routes
Route::post('/api/shop/register', [ShopRegistrationController::class, 'store']);
Route::post('/api/shop/register-full', [ShopRegistrationController::class, 'storeFull']);
