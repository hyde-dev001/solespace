<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * RoleMiddleware
 * 
 * Checks if the authenticated user has a specific role
 * required to access ERP modules like HR, FINANCE, etc.
 * 
 * Usage in routes:
 * Route::post('/hr/employees', [EmployeeController::class, 'store'])
 *     ->middleware('role:HR');
 */
class RoleMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, ...$roles): Response
    {
        $user = $request->user();

        // If no user is authenticated, deny access
        if (!$user) {
            return response()->json([
                'message' => 'Unauthenticated',
                'error' => 'UNAUTHENTICATED'
            ], Response::HTTP_UNAUTHORIZED);
        }

        // ERP modules are restricted to explicit handler roles only.
        // SUPER_ADMIN should not bypass ERP module access.

        // Check if user has one of the required roles
        if (!in_array($user->role, $roles)) {
            // If this is an Inertia request, redirect to the user's allowed module
            if ($request->header('X-Inertia')) {
                $targetRoute = match ($user->role) {
                    'FINANCE' => 'finance.index',
                    'HR' => 'erp.hr',
                    'CRM' => 'crm.dashboard',
                    default => 'landing',
                };

                return redirect()
                    ->route($targetRoute)
                    ->with('error', 'You do not have permission to access this module');
            }

            return response()->json([
                'message' => 'You do not have permission to access this module',
                'error' => 'UNAUTHORIZED_ROLE',
                'required_role' => $roles[0] ?? null,
                'user_role' => $user->role
            ], Response::HTTP_FORBIDDEN);
        }

        return $next($request);
    }
}
