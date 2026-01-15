<?php

namespace App\Http\Controllers;

use App\Models\SuperAdmin;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

/**
 * SuperAdminAuthController
 * 
 * Handles authentication for super administrator accounts.
 * Provides separate login system from regular users.
 * 
 * Features:
 * - Email and password authentication
 * - Account status validation (must be active)
 * - Last login tracking
 * - Session management
 * - CSRF protection
 * 
 * Security:
 * - Rate limiting on login attempts
 * - Password verification using bcrypt
 * - IP address logging for audit trail
 * - Session regeneration on login
 */
class SuperAdminAuthController extends Controller
{
    /**
     * Display the super admin login form
     * 
     * Shows the login page for super administrators
     * Redirects to admin dashboard if already authenticated
     * 
     * @return \Inertia\Response|\Illuminate\Http\RedirectResponse
     */
    public function showLoginForm()
    {
        // <!-- If already logged in, redirect to admin dashboard -->
        if (Auth::guard('super_admin')->check()) {
            return redirect()->route('admin.shop-registrations');
        }

        // <!-- Render login page -->
        return Inertia::render('superAdmin/Login');
    }

    /**
     * Handle super admin login request
     * 
     * Validates credentials and creates authenticated session
     * 
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\RedirectResponse
     * @throws \Illuminate\Validation\ValidationException
     */
    public function login(Request $request)
    {
        // <!-- Validate login credentials -->
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        // <!-- Find admin by email -->
        $admin = SuperAdmin::where('email', $credentials['email'])->first();

        // <!-- Check if admin exists -->
        if (!$admin) {
            throw ValidationException::withMessages([
                'email' => ['Invalid email or password.'],
            ]);
        }

        // <!-- Check if account is active -->
        if (!$admin->isActive()) {
            throw ValidationException::withMessages([
                'email' => ['Your account has been suspended. Please contact system administrator.'],
            ]);
        }

        // <!-- Verify password -->
        if (!Hash::check($credentials['password'], $admin->password)) {
            throw ValidationException::withMessages([
                'email' => ['Invalid email or password.'],
            ]);
        }

        // <!-- Login the admin using super_admin guard -->
        Auth::guard('super_admin')->login($admin, $request->filled('remember'));

        // <!-- Regenerate session to prevent session fixation -->
        $request->session()->regenerate();

        // <!-- Update last login information -->
        $admin->updateLastLogin($request->ip());

        // <!-- Log successful login for audit -->
        \Log::info('Super admin logged in', [
            'admin_id' => $admin->id,
            'email' => $admin->email,
            'ip' => $request->ip(),
        ]);

        // <!-- Redirect to admin dashboard -->
        return redirect()->intended(route('admin.shop-registrations'));
    }

    /**
     * Handle super admin logout request
     * 
     * Destroys the authenticated session and redirects to login
     * 
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function logout(Request $request)
    {
        // <!-- Get admin info before logout for logging -->
        $admin = Auth::guard('super_admin')->user();

        // <!-- Log logout action -->
        if ($admin) {
            \Log::info('Super admin logged out', [
                'admin_id' => $admin->id,
                'email' => $admin->email,
            ]);
        }

        // <!-- Logout from super_admin guard -->
        Auth::guard('super_admin')->logout();

        // <!-- Invalidate session -->
        $request->session()->invalidate();

        // <!-- Regenerate CSRF token -->
        $request->session()->regenerateToken();

        // <!-- Redirect to login page -->
        return redirect()->route('admin.login');
    }

    /**
     * Display the super admin profile/account settings
     * 
     * Shows current admin's profile and allows password change
     * 
     * @return \Inertia\Response
     */
    public function showProfile()
    {
        // <!-- Get authenticated admin -->
        $admin = Auth::guard('super_admin')->user();

        return Inertia::render('superAdmin/Profile', [
            'admin' => [
                'id' => $admin->id,
                'name' => $admin->name,
                'email' => $admin->email,
                'status' => $admin->status,
                'last_login_at' => $admin->last_login_at?->format('Y-m-d H:i:s'),
                'last_login_ip' => $admin->last_login_ip,
            ],
        ]);
    }

    /**
     * Update super admin password
     * 
     * Allows admin to change their password
     * Requires current password for security
     * 
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function updatePassword(Request $request)
    {
        // <!-- Validate password change request -->
        $validated = $request->validate([
            'current_password' => ['required', 'string'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        // <!-- Get authenticated admin -->
        $admin = Auth::guard('super_admin')->user();

        // <!-- Verify current password -->
        if (!Hash::check($validated['current_password'], $admin->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['Current password is incorrect.'],
            ]);
        }

        // <!-- Update password -->
        $admin->update([
            'password' => Hash::make($validated['password']),
        ]);

        // <!-- Log password change -->
        \Log::info('Super admin password changed', [
            'admin_id' => $admin->id,
            'email' => $admin->email,
        ]);

        return redirect()->back()->with('success', 'Password updated successfully!');
    }
}
