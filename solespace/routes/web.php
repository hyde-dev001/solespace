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

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "web" middleware group. Make something great!
|
*/

// Public Routes (User Side)
Route::get('/', [LandingPageController::class, 'index'])->name('landing');
Route::get('/products', [LandingPageController::class, 'products'])->name('products');
Route::get('/repair-services', [LandingPageController::class, 'repair'])->name('repair');
Route::get('/services', [LandingPageController::class, 'services'])->name('services');
Route::get('/contact', [LandingPageController::class, 'contact'])->name('contact');
Route::get('/register', [LandingPageController::class, 'register'])->name('register');
Route::get('/login', [LandingPageController::class, 'login'])->name('login');
Route::get('/shop-owner-register', [LandingPageController::class, 'shopOwnerRegister'])->name('shop-owner-register');

// User Login Page
Route::get('/user/login', function () {
    return Inertia::render('UserSide/UserLogin');
})->name('user.login.form');

// Shop Owner Login Page
Route::get('/shop-owner/login', function () {
    return Inertia::render('UserSide/ShopOwnerLogin');
})->name('shop-owner.login.form');

// User Authentication Routes
Route::post('/user/register', [UserController::class, 'register'])->name('user.register');
Route::post('/user/login', [UserController::class, 'login'])->name('user.login');
Route::post('/user/logout', [UserController::class, 'logout'])->name('user.logout');
Route::get('/api/user/me', [UserController::class, 'me'])->middleware('auth:user')->name('user.me');

// Shop Owner Authentication Routes
Route::post('/shop-owner/register', [ShopOwnerAuthController::class, 'register'])->name('shop-owner.register');
Route::post('/shop-owner/login', [ShopOwnerAuthController::class, 'login'])->name('shop-owner.login');
Route::post('/shop-owner/logout', [ShopOwnerAuthController::class, 'logout'])->name('shop-owner.logout');
Route::get('/api/shop-owner/me', [ShopOwnerAuthController::class, 'me'])->middleware('auth:shop_owner')->name('shop-owner.me');

// Common Routes (for testing/development - these are not superadmin specific)
Route::group([], function () {
    Route::get('/profile', function () {
        return Inertia::render('UserProfiles');
    })->name('profile');
    Route::get('/blank', function () {
        return Inertia::render('Blank');
    })->name('blank');
    Route::get('/form-elements', function () {
        return Inertia::render('Forms/FormElements');
    })->name('form-elements');
    Route::get('/basic-tables', function () {
        return Inertia::render('Tables/BasicTables');
    })->name('basic-tables');
    Route::get('/alerts', function () {
        return Inertia::render('UiElements/Alerts');
    })->name('alerts');
    Route::get('/avatars', function () {
        return Inertia::render('UiElements/Avatars');
    })->name('avatars');
    Route::get('/badge', function () {
        return Inertia::render('UiElements/Badges');
    })->name('badge');
    Route::get('/buttons', function () {
        return Inertia::render('UiElements/Buttons');
    })->name('buttons');
    Route::get('/images', function () {
        return Inertia::render('UiElements/Images');
    })->name('images');
    Route::get('/videos', function () {
        return Inertia::render('UiElements/Videos');
    })->name('videos');
    Route::get('/line-chart', function () {
        return Inertia::render('Charts/LineChart');
    })->name('line-chart');
    Route::get('/bar-chart', function () {
        return Inertia::render('Charts/BarChart');
    })->name('bar-chart');
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

// Shop Owner Routes (with authentication middleware - add later)
Route::prefix('shopOwner')->name('shopOwner.')->group(function () {
    Route::get('/calendar', [CalendarController::class, 'index'])->name('calendar');
    Route::get('/ecommerce', [EcommerceController::class, 'index'])->name('ecommerce');
    Route::get('/user-access-control', [UserAccessControlController::class, 'index'])->name('user-access-control');
});

// Shop Owner Protected Routes
Route::middleware('auth:shop_owner')->prefix('shop-owner')->name('shop-owner.')->group(function () {
    Route::get('/dashboard', function () {
        $shopOwner = Auth::guard('shop_owner')->user();
        return Inertia::render('ShopOwner/Dashboard', [
            'shop_owner' => $shopOwner,
        ]);
    })->name('dashboard');
});

// <!-- Backend Routes from backend project -->
// <!-- CSRF Token endpoint for API requests -->
Route::get('/api/csrf-token', function () {
    return response()->json(['csrf_token' => csrf_token()]);
});

// <!-- Shop Registration Routes -->
Route::get('/shop/register', function () {
    return Inertia::render('userSide/ShopOwnerRegistration');
})->name('shop.register.form');

Route::post('/shop/register-full', [ShopRegistrationController::class, 'storeFullInertia'])->name('shop.register');

// <!-- Super Admin Authentication Routes -->
Route::get('/admin/login', [SuperAdminAuthController::class, 'showLoginForm'])->name('admin.login');
Route::post('/admin/login', [SuperAdminAuthController::class, 'login'])->name('admin.login.post');
Route::post('/admin/logout', [SuperAdminAuthController::class, 'logout'])->name('admin.logout');

// <!-- Admin Protected Routes -->
Route::middleware('super_admin.auth')->prefix('admin')->name('admin.')->group(function () {
    Route::get('/', function () {
        return redirect()->route('admin.system-monitoring');
    })->name('dashboard');
    
    // Profile routes disabled - super admin doesn't need profile customization
    // Route::get('/profile', [SuperAdminAuthController::class, 'showProfile'])->name('profile');
    // Route::post('/profile/password', [SuperAdminAuthController::class, 'updatePassword'])->name('profile.password');
    
    // Shop Owner Registration Management
    Route::get('/shop-registrations', [SuperAdminController::class, 'showShopRegistrations'])->name('shop-registrations');
    Route::post('/shop-registrations/{id}/approve', [SuperAdminController::class, 'approveShopOwner'])->name('shop-registrations.approve');
    Route::post('/shop-registrations/{id}/reject', [SuperAdminController::class, 'rejectShopOwner'])->name('shop-registrations.reject');
    
    // Flagged Accounts
    Route::get('/flagged-accounts', [SuperAdminController::class, 'showFlaggedAccounts'])->name('flagged-accounts');
    
    // Notifications
    Route::get('/notifications', function () {
        return Inertia::render('superAdmin/NotificationCommunicationTools');
    })->name('notifications');
    
    // Reports
    Route::get('/data-reports', [SuperAdminController::class, 'showDataReports'])->name('data-reports');
    
    // User Management
    Route::get('/user-management', [SuperAdminController::class, 'showUserManagement'])->name('user-management');
    Route::post('/users/{id}/suspend', [SuperAdminController::class, 'suspendUser'])->name('users.suspend');
    Route::post('/users/{id}/activate', [SuperAdminController::class, 'activateUser'])->name('users.activate');
    // Delete user - Super Admin Only
    Route::middleware('super_admin.role')->delete('/users/{id}', [SuperAdminController::class, 'deleteUser'])->name('users.delete');
    
    // Admin Management (Super Admin Only)
    Route::middleware('super_admin.role')->group(function () {
        Route::get('/admin', [SuperAdminController::class, 'showAdminManagement'])->name('admin-management');
        Route::get('/create-admin', function () {
            return Inertia::render('superAdmin/CreateAdmin');
        })->name('create-admin');
        Route::post('/create-admin', [SuperAdminController::class, 'createAdmin'])->name('create-admin.store');
        Route::post('/admins/{id}/suspend', [SuperAdminController::class, 'suspendAdmin'])->name('admins.suspend');
        Route::post('/admins/{id}/activate', [SuperAdminController::class, 'activateAdmin'])->name('admins.activate');
        Route::delete('/admins/{id}', [SuperAdminController::class, 'deleteAdmin'])->name('admins.delete');
    });
    
    // Registered Shops
    Route::get('/registered-shops', [SuperAdminController::class, 'showRegisteredShops'])->name('registered-shops');
    Route::post('/shops/{id}/suspend', [SuperAdminController::class, 'suspendShop'])->name('shops.suspend');
    Route::post('/shops/{id}/activate', [SuperAdminController::class, 'activateShop'])->name('shops.activate');
    // Delete shop - Super Admin Only
    Route::middleware('super_admin.role')->delete('/shops/{id}', [SuperAdminController::class, 'deleteShop'])->name('shops.delete');
    
    // System Monitoring
    Route::get('/system-monitoring', function () {
        return Inertia::render('superAdmin/SystemMonitoringDashboard');
    })->name('system-monitoring');
});

// <!-- Legacy API Routes -->
Route::post('/api/shop/register', [ShopRegistrationController::class, 'store']);
Route::post('/api/shop/register-full', [ShopRegistrationController::class, 'storeFull']);
