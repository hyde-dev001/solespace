<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ShopRegistrationController;
use App\Http\Controllers\SuperAdminController;
use App\Http\Controllers\SuperAdminAuthController;
use Inertia\Inertia;

// <!-- CSRF Token endpoint for API requests -->
Route::get('/api/csrf-token', function () {
    return response()->json(['csrf_token' => csrf_token()]);
});

// <!-- Inertia Routes for Shop Registration -->
// <!-- Main Pages -->
Route::get('/', function () {
    return Inertia::render('userSide/LandingPage');
})->name('home');

Route::get('/navigation', function () {
    return Inertia::render('userSide/Navigation');
})->name('navigation');

Route::get('/products', function () {
    return Inertia::render('userSide/Products');
})->name('products');

Route::get('/repair', function () {
    return Inertia::render('userSide/Repair');
})->name('repair');

Route::get('/repair-services', function () {
    return Inertia::render('userSide/Repair');
})->name('repair-services');

Route::get('/services', function () {
    return Inertia::render('userSide/Services');
})->name('services');

Route::get('/contact', function () {
    return Inertia::render('userSide/Contact');
})->name('contact');

Route::get('/login', function () {
    return Inertia::render('userSide/Login');
})->name('login');

Route::get('/register', function () {
    return Inertia::render('userSide/UserRegistration');
})->name('register');

Route::get('/shop-owner/login', function () {
    return Inertia::render('userSide/ShopOwnerLogin');
})->name('shop-owner.login');

Route::get('/shop-owner/dashboard', function () {
    return Inertia::render('shopOwner/EcommerceDashboard');
})->middleware('auth:shop_owner')->name('shop-owner.dashboard');

Route::get('/shop-owner/calendar', function () {
    return Inertia::render('shopOwner/Calendar');
})->middleware('auth:shop_owner')->name('shop-owner.calendar');

Route::get('/shop-owner/access-control', function () {
    return Inertia::render('shopOwner/UserAccessControl');
})->middleware('auth:shop_owner')->name('shop-owner.access-control');

Route::get('/user/register', function () {
    return Inertia::render('userSide/UserRegistration');
})->name('user.register.form');

// <!-- Shop Registration Routes -->
Route::get('/shop/register', function () {
    return Inertia::render('userSide/ShopOwnerRegistration');
})->name('shop.register.form');

Route::post('/shop/register-full', [ShopRegistrationController::class, 'storeFullInertia'])->name('shop.register');

// <!-- User Registration and Authentication Routes -->
Route::post('/user/register', [\App\Http\Controllers\UserController::class, 'register'])->name('user.register');
Route::post('/user/login', [\App\Http\Controllers\UserController::class, 'login'])->name('user.login');
Route::post('/user/logout', [\App\Http\Controllers\UserController::class, 'logout'])->name('user.logout');

// <!-- Super Admin Authentication Routes -->
// <!-- Public routes for super admin login -->

// <!-- Display the super admin login form -->
Route::get('/admin/login', [SuperAdminAuthController::class, 'showLoginForm'])
    ->name('admin.login');

// <!-- Process super admin login -->
Route::post('/admin/login', [SuperAdminAuthController::class, 'login'])
    ->name('admin.login.post');

// <!-- Super admin logout -->
Route::post('/admin/logout', [SuperAdminAuthController::class, 'logout'])
    ->name('admin.logout');

// <!-- Admin Routes -->
// <!-- These routes are protected by super admin authentication -->
// <!-- Users must be logged in as super admin to access -->

// <!-- Default Admin Dashboard - redirects to shop registrations -->
Route::get('/admin', function () {
    return redirect()->route('admin.shop-registrations');
})->middleware('super_admin.auth')
    ->name('admin.dashboard');

// <!-- Super Admin Profile -->
Route::get('/admin/profile', [SuperAdminAuthController::class, 'showProfile'])
    ->middleware('super_admin.auth')
    ->name('admin.profile');

// <!-- Update Super Admin Password -->
Route::post('/admin/profile/password', [SuperAdminAuthController::class, 'updatePassword'])
    ->middleware('super_admin.auth')
    ->name('admin.profile.password');

// <!-- Shop Owner Registration Management -->
// <!-- Display all pending shop registrations for approval -->
Route::get('/admin/shop-registrations', [SuperAdminController::class, 'showShopRegistrations'])
    ->middleware('super_admin.auth')
    ->name('admin.shop-registrations');

// <!-- Approve a shop owner registration -->
Route::post('/admin/shop-registrations/{id}/approve', [SuperAdminController::class, 'approveShopOwner'])
    ->middleware('super_admin.auth')
    ->name('admin.shop-registrations.approve');

// <!-- Reject a shop owner registration -->
Route::post('/admin/shop-registrations/{id}/reject', [SuperAdminController::class, 'rejectShopOwner'])
    ->middleware('super_admin.auth')
    ->name('admin.shop-registrations.reject');

// <!-- Flagged Accounts Management -->
// <!-- Display user accounts flagged for suspicious activity -->
Route::get('/admin/flagged-accounts', [SuperAdminController::class, 'showFlaggedAccounts'])
    ->middleware('super_admin.auth')
    ->name('admin.flagged-accounts');

// <!-- System Notifications and Communication Tools -->
// <!-- Interface for sending notifications to users and shop owners -->
Route::get('/admin/notifications', function () {
    return Inertia::render('superAdmin/NotificationCommunicationTools');
})->middleware('super_admin.auth')
    ->name('admin.notifications');

// <!-- Data Reports and Analytics -->
// <!-- Comprehensive dashboard showing system statistics and trends -->
Route::get('/admin/data-reports', [SuperAdminController::class, 'showDataReports'])
    ->middleware('super_admin.auth')
    ->name('admin.data-reports');

// <!-- User Management (Temporarily disabled - requires users table migration) -->
// Route::get('/admin/user-management', [SuperAdminController::class, 'showUserManagement'])
//     ->middleware('super_admin.auth')
//     ->name('admin.user-management');

// <!-- User Management Interface -->
// <!-- Manage all registered users (view, edit, suspend, delete) -->
Route::get('/admin/user-management', [SuperAdminController::class, 'showUserManagement'])
    ->middleware('super_admin.auth')
    ->name('admin.user-management');

// <!-- Admin Management Interface -->
// <!-- Manage administrator accounts (view, edit, suspend, delete) -->
Route::get('/admin/admin-management', [SuperAdminController::class, 'showAdminManagement'])
    ->middleware('super_admin.auth')
    ->name('admin.admin-management');

// <!-- Create Admin Page -->
Route::get('/admin/create-admin', function () {
    return Inertia::render('superAdmin/CreateAdmin');
})->middleware('super_admin.auth')
    ->name('admin.create-admin');

// <!-- Create Admin API -->
Route::post('/admin/create-admin', [SuperAdminController::class, 'createAdmin'])
    ->middleware('super_admin.auth')
    ->name('admin.create-admin.store');

// <!-- Registered Shops Management -->
// <!-- Display all registered and active shops for management -->
Route::get('/admin/registered-shops', [SuperAdminController::class, 'showRegisteredShops'])
    ->middleware('super_admin.auth')
    ->name('admin.registered-shops');

// <!-- Suspend a shop -->
Route::post('/admin/shops/{id}/suspend', [SuperAdminController::class, 'suspendShop'])
    ->middleware('super_admin.auth')
    ->name('admin.shops.suspend');

// <!-- Activate a shop -->
Route::post('/admin/shops/{id}/activate', [SuperAdminController::class, 'activateShop'])
    ->middleware('super_admin.auth')
    ->name('admin.shops.activate');

// <!-- Delete a shop -->
Route::delete('/admin/shops/{id}', [SuperAdminController::class, 'deleteShop'])
    ->middleware('super_admin.auth')
    ->name('admin.shops.delete');

// <!-- User Management Routes -->
// <!-- Suspend a user -->
Route::post('/admin/users/{id}/suspend', [SuperAdminController::class, 'suspendUser'])
    ->middleware('super_admin.auth')
    ->name('admin.users.suspend');

// <!-- Activate a user -->
Route::post('/admin/users/{id}/activate', [SuperAdminController::class, 'activateUser'])
    ->middleware('super_admin.auth')
    ->name('admin.users.activate');

// <!-- Delete a user -->
Route::delete('/admin/users/{id}', [SuperAdminController::class, 'deleteUser'])
    ->middleware('super_admin.auth')
    ->name('admin.users.delete');

// <!-- Admin Management Routes -->
// <!-- Suspend an admin -->
Route::post('/admin/admins/{id}/suspend', [SuperAdminController::class, 'suspendAdmin'])
    ->middleware('super_admin.auth')
    ->name('admin.admins.suspend');

// <!-- Activate an admin -->
Route::post('/admin/admins/{id}/activate', [SuperAdminController::class, 'activateAdmin'])
    ->middleware('super_admin.auth')
    ->name('admin.admins.activate');

// <!-- Delete an admin -->
Route::delete('/admin/admins/{id}', [SuperAdminController::class, 'deleteAdmin'])
    ->middleware('super_admin.auth')
    ->name('admin.admins.delete');

// <!-- System Monitoring Dashboard -->
// <!-- Real-time system monitoring and performance metrics -->
Route::get('/admin/system-monitoring', function () {
    return Inertia::render('superAdmin/SystemMonitoringDashboard');
})->middleware('super_admin.auth')
    ->name('admin.system-monitoring');

// <!-- Legacy API Routes for backward compatibility -->
Route::post('/api/shop/register', [ShopRegistrationController::class, 'store']);
Route::post('/api/shop/register-full', [ShopRegistrationController::class, 'storeFull']);

// ============================================================
// Shop Owner Authentication Routes
// ============================================================

// <!-- Shop Owner Login -->
Route::post('/shop-owner/login', [\App\Http\Controllers\ShopOwner\AuthController::class, 'login'])->name('shop-owner.login');

// <!-- Shop Owner Logout -->
Route::post('/shop-owner/logout', [\App\Http\Controllers\ShopOwner\AuthController::class, 'logout'])->name('shop-owner.logout');

// <!-- Shop Owner Profile (Protected) -->
Route::get('/shop-owner/profile', [\App\Http\Controllers\ShopOwner\AuthController::class, 'profile'])
    ->middleware('auth:shop_owner')
    ->name('shop-owner.profile');

Route::put('/shop-owner/profile', [\App\Http\Controllers\ShopOwner\AuthController::class, 'updateProfile'])
    ->middleware('auth:shop_owner')
    ->name('shop-owner.profile.update');

Route::post('/shop-owner/change-password', [\App\Http\Controllers\ShopOwner\AuthController::class, 'changePassword'])
    ->middleware('auth:shop_owner')
    ->name('shop-owner.change-password');

// ============================================================
// Shop Owner Routes
// ============================================================
// These routes are for shop owners to manage their business operations

// <!-- Shop Owner Calendar Management - API Routes (Currently Disabled) -->
// Route::prefix('shop-owner/calendar')->middleware('auth:shop_owner')->group(function () {
//     Route::get('/', [\App\Http\Controllers\ShopOwner\CalendarController::class, 'index'])->name('shop-owner.calendar.index');
//     Route::post('/', [\App\Http\Controllers\ShopOwner\CalendarController::class, 'store'])->name('shop-owner.calendar.store');
//     Route::get('/{id}', [\App\Http\Controllers\ShopOwner\CalendarController::class, 'show'])->name('shop-owner.calendar.show');
//     Route::put('/{id}', [\App\Http\Controllers\ShopOwner\CalendarController::class, 'update'])->name('shop-owner.calendar.update');
//     Route::delete('/{id}', [\App\Http\Controllers\ShopOwner\CalendarController::class, 'destroy'])->name('shop-owner.calendar.destroy');
// });

// <!-- Shop Owner Ecommerce Dashboard - API Routes (Currently Disabled) -->
// Route::prefix('shop-owner/ecommerce')->middleware('auth:shop_owner')->group(function () {
//     Route::get('/', [\App\Http\Controllers\ShopOwner\EcommerceController::class, 'index'])->name('shop-owner.ecommerce.index');
//     Route::post('/target', [\App\Http\Controllers\ShopOwner\EcommerceController::class, 'updateTarget'])->name('shop-owner.ecommerce.target');
// });

// <!-- Shop Owner User Access Control - API Routes (Currently Disabled) -->
// Route::prefix('shop-owner/access-control')->middleware('auth:shop_owner')->group(function () {
//     // Dashboard stats
//     Route::get('/', [\App\Http\Controllers\ShopOwner\AccessControlController::class, 'index'])->name('shop-owner.access-control.index');
//     
//     // Employee Management
//     Route::get('/employees', [\App\Http\Controllers\ShopOwner\AccessControlController::class, 'getEmployees'])->name('shop-owner.employees.index');
//     Route::post('/employees', [\App\Http\Controllers\ShopOwner\AccessControlController::class, 'storeEmployee'])->name('shop-owner.employees.store');
//     Route::put('/employees/{id}', [\App\Http\Controllers\ShopOwner\AccessControlController::class, 'updateEmployee'])->name('shop-owner.employees.update');
//     Route::delete('/employees/{id}', [\App\Http\Controllers\ShopOwner\AccessControlController::class, 'deleteEmployee'])->name('shop-owner.employees.delete');
//     
//     // Role Management
//     Route::get('/roles', [\App\Http\Controllers\ShopOwner\AccessControlController::class, 'getRoles'])->name('shop-owner.roles.index');
//     Route::post('/roles', [\App\Http\Controllers\ShopOwner\AccessControlController::class, 'storeRole'])->name('shop-owner.roles.store');
//     Route::put('/roles/{id}', [\App\Http\Controllers\ShopOwner\AccessControlController::class, 'updateRole'])->name('shop-owner.roles.update');
//     Route::delete('/roles/{id}', [\App\Http\Controllers\ShopOwner\AccessControlController::class, 'deleteRole'])->name('shop-owner.roles.delete');
//     
//     // User Account Management
//     Route::get('/users', [\App\Http\Controllers\ShopOwner\AccessControlController::class, 'getUsers'])->name('shop-owner.users.index');
//     Route::post('/users/{id}/status', [\App\Http\Controllers\ShopOwner\AccessControlController::class, 'updateUserStatus'])->name('shop-owner.users.status');
// });
