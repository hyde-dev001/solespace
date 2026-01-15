<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

/**
 * SuperAdminAuth Middleware
 * 
 * Protects routes that require super admin authentication.
 * Redirects unauthenticated requests to super admin login page.
 * 
 * Usage in routes:
 * Route::get('/admin/dashboard', [Controller::class, 'method'])->middleware('super_admin.auth');
 * 
 * Features:
 * - Checks authentication using super_admin guard
 * - Validates account status (must be active)
 * - Redirects to login if not authenticated
 * - Supports intended redirect after login
 */
class SuperAdminAuth
{
    /**
     * Handle an incoming request.
     * 
     * Verifies that user is authenticated as super admin
     * and account is active before allowing access
     * 
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // <!-- Check if authenticated using super_admin guard -->
        if (!Auth::guard('super_admin')->check()) {
            // <!-- Store intended URL for redirect after login -->
            return redirect()->route('admin.login')
                ->with('error', 'Please login to access admin panel.');
        }

        // <!-- Get authenticated admin -->
        $admin = Auth::guard('super_admin')->user();

        // <!-- Check if account is active -->
        if (!$admin->isActive()) {
            // <!-- Logout suspended/inactive account -->
            Auth::guard('super_admin')->logout();
            
            return redirect()->route('admin.login')
                ->with('error', 'Your account has been suspended. Please contact system administrator.');
        }

        // <!-- Allow request to continue -->
        return $next($request);
    }
}
