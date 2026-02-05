<?php

/**
 * Shop Owner API Routes
 * 
 * Purpose: Shop owner specific management endpoints
 * Middleware: web, auth:user (session-based), role-based access control
 * Protected by: shop_owner role + shop isolation
 * 
 * Endpoints:
 * - Shop settings
 * - Business analytics
 * - Cross-module access (limited)
 * - Shop profile management
 */

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuditLogController;

/**
 * Shop Owner Routes
 * All routes require authentication and shop_owner role
 */
Route::prefix('api/shop-owner')->middleware(['auth:user', 'old_role:Shop Owner', 'shop.isolation'])->group(function () {
    // ============================================
    // AUDIT LOGS (Shop Owner View)
    // ============================================
    Route::prefix('audit-logs')->group(function () {
        Route::get('/', [AuditLogController::class, 'index'])->name('shop_owner.audit.index');
        Route::get('/stats', [AuditLogController::class, 'stats'])->name('shop_owner.audit.stats');
        Route::get('/export', [AuditLogController::class, 'export'])->name('shop_owner.audit.export');
    });

    // Additional shop owner specific endpoints can be added here
    // e.g., shop settings, business metrics, subscription management, etc.
});
