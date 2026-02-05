<?php

namespace App\Http\Controllers\ShopOwner;

use App\Http\Controllers\Controller;
use App\Models\Employee;
use App\Models\User;
use App\Models\AuditLog;
use App\Models\PermissionAuditLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use App\Models\PositionTemplate;
use App\Models\PositionTemplatePermission;

class UserAccessControlController extends Controller
{
    /**
     * Display the user access control page.
     */
    public function index()
    {
        $shopOwner = Auth::guard('shop_owner')->user();

        // If the request is unauthenticated for a shop owner, redirect to the shop-owner login
        if (!$shopOwner) {
            return redirect()->route('shop-owner.login.form');
        }
        
        // Fetch employees for this shop owner with their user account role and permissions
        $employees = Employee::where('shop_owner_id', $shopOwner->id)
            ->with('user:id,email,role,phone,address')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function($employee) {
                $user = $employee->user;
                return [
                    'id' => $employee->id,
                    'name' => $employee->name,
                    'email' => $employee->email,
                    'phone' => $employee->phone ?? $user?->phone ?? null,
                    'address' => $user?->address ?? null,
                    'role' => $user?->role ?? 'STAFF',
                    'status' => $employee->status,
                    'createdAt' => $employee->created_at,
                    // Include Spatie permissions
                    'userId' => $user?->id,
                    'roleName' => $user?->getRoleNames()->first() ?? null,
                    'permissions' => $user?->getAllPermissions()->pluck('name')->toArray() ?? [],
                    'rolePermissions' => $user?->getPermissionsViaRoles()->pluck('name')->toArray() ?? [],
                    'directPermissions' => $user?->getDirectPermissions()->pluck('name')->toArray() ?? [],
                ];
            });
        
        return Inertia::render('ShopOwner/UserAccessControl', [
            'employees' => $employees,
        ]);
    }

    /**
     * Create a new employee for the authenticated shop owner
     */
    public function storeEmployee(Request $request)
    {
        try {
            $shopOwner = Auth::guard('shop_owner')->user();
            
            if (!$shopOwner) {
                return back()->withErrors(['error' => 'Not authenticated as shop owner']);
            }

            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'email' => 'required|email|unique:employees,email',
                'phone' => 'nullable|string|max:20',
                'address' => 'nullable|string|max:255',
                'position' => 'nullable|string|max:100',
                'position_template_id' => 'nullable|exists:position_templates,id',
                'department' => 'nullable|string|max:100',
                'branch' => 'nullable|string|max:100',
                'salary' => 'nullable|numeric|min:0',
                'hire_date' => 'nullable|date',
                'status' => 'nullable|in:active,inactive,on_leave',
                'role' => 'required|in:MANAGER,STAFF,Manager,Staff',
            ], [
                'name.required' => 'Employee name is required',
                'email.required' => 'Email is required',
                'email.unique' => 'This email is already registered',
                'salary.numeric' => 'Salary must be a valid number',
                'role.in' => 'Role must be either Manager or Staff',
            ]);

            // Normalize role to match Spatie role names (capitalize first letter only)
            $validated['role'] = ucfirst(strtolower($validated['role']));

            // Assign to shop owner's shop
            $validated['shop_owner_id'] = $shopOwner->id;
            
            // Set defaults for optional fields
            $validated['salary'] = $validated['salary'] ?? 0;
            $validated['phone'] = $validated['phone'] ?? '';
            $validated['position'] = $validated['position'] ?? 'Staff';
            $validated['department'] = $validated['department'] ?? 'General';
            $validated['hire_date'] = $validated['hire_date'] ?? now()->toDateString();
            $validated['status'] = $validated['status'] ?? 'active';
            $validated['branch'] = $validated['branch'] ?? null;

            // Ensure email is free across employees and users before creating anything
            if (Employee::where('email', $validated['email'])->exists()) {
                return back()->withErrors([
                    'email' => 'This email is already registered as an employee'
                ]);
            }
            if (User::where('email', $validated['email'])->exists()) {
                return back()->withErrors([
                    'email' => 'User account already exists for this email'
                ]);
            }

            // Create both Employee and User atomically
            $temporaryPassword = Str::random(10);
            [$employee, $user] = DB::transaction(function () use ($validated, $shopOwner, $temporaryPassword) {
                $employeeData = collect($validated)->only([
                    'shop_owner_id','name','email','phone','position','department','branch','salary','hire_date','status'
                ])->toArray();
                $employee = Employee::create($employeeData);

                // Split full name into first and last for the User model if possible
                $firstName = '';
                $lastName = '';
                if (!empty($validated['name'])) {
                    $parts = preg_split('/\s+/', trim($validated['name']));
                    $firstName = $parts[0] ?? '';
                    $lastName = count($parts) > 1 ? implode(' ', array_slice($parts, 1)) : '';
                }

                $user = User::create([
                    'name' => $validated['name'],
                    'first_name' => $firstName,
                    'last_name' => $lastName,
                    'email' => $validated['email'],
                    'phone' => $validated['phone'] ?? '',
                    'address' => $validated['address'] ?? '',
                    'shop_owner_id' => $shopOwner->id,
                    'role' => $validated['role'], // Keep old role column for backward compatibility
                    'position' => $validated['position'] ?? null,
                    'password' => Hash::make($temporaryPassword),
                    'force_password_change' => true,
                ]);

                // Assign Spatie role based on simplified system
                if ($validated['role'] === 'Manager') {
                    $user->assignRole('Manager');
                    
                    // Permission Audit Log - COMPLIANCE CRITICAL
                    PermissionAuditLog::logRoleAssigned(
                        $user,
                        'Manager',
                        'New employee created with Manager role',
                        'medium'
                    );
                } else {
                    $user->assignRole('Staff');
                    
                    // Permission Audit Log - COMPLIANCE CRITICAL
                    PermissionAuditLog::logRoleAssigned(
                        $user,
                        'Staff',
                        'New employee created with Staff role',
                        'low'
                    );
                    
                    // Apply position template permissions if provided
                    if (!empty($validated['position_template_id'])) {
                        $template = PositionTemplate::with('permissions')->find($validated['position_template_id']);
                        if ($template) {
                            // Use the relationship collection, not the attribute accessor
                            $permissionNames = $template->permissions()->pluck('permission_name')->toArray();
                            if (!empty($permissionNames)) {
                                $user->givePermissionTo($permissionNames);
                                
                                // Permission Audit Log - Position template application
                                PermissionAuditLog::logPositionAssigned(
                                    $user,
                                    $template->name,
                                    $template->id,
                                    $permissionNames,
                                    "Position template '{$template->name}' applied to new employee"
                                );
                            }
                            
                            // Set position name from template if not provided
                            if (empty($validated['position'])) {
                                $user->position = $template->name;
                                $employee->position = $template->name;
                                $user->save();
                                $employee->save();
                            }
                            
                            // Increment usage count
                            $template->increment('usage_count');
                        }
                    }
                }

                return [$employee, $user];
            });

            // Audit log (optional)
            try {
                AuditLog::create([
                    'shop_owner_id' => $shopOwner->id,
                    'actor_user_id' => $shopOwner->id,
                    'action' => 'employee_created',
                    'target_type' => 'employee',
                    'target_id' => $employee->id,
                    'metadata' => [
                        'assigned_role' => $validated['role'], // Old role column
                        'spatie_role' => $user->getRoleNames()->first() ?? null, // New Spatie role
                        'position' => $user->position ?? null,
                        'employee_email' => $validated['email'],
                        'branch' => $validated['branch'] ?? null,
                    ],
                ]);
            } catch (\Exception $e) {
                // Audit log is optional - don't fail if it errors
            }

            // Return back with success data - Inertia will automatically reload with fresh props
            return back()->with([
                'success' => true,
                'employee' => [
                    'id' => $employee->id,
                    'name' => $employee->name,
                    'email' => $employee->email,
                ],
                'user_id' => $user->id,
                'temporary_password' => $temporaryPassword,
            ]);
        } catch (ValidationException $e) {
            return back()->withErrors($e->errors());
        } catch (\Exception $e) {
            return back()->withErrors([
                'error' => 'Error creating employee: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * Get all available permissions grouped by module
     * Phase 6: Permission Management
     */
    public function getAvailablePermissions()
    {
        $shopOwner = Auth::guard('shop_owner')->user();
        
        if (!$shopOwner) {
            return response()->json(['error' => 'Not authenticated'], 401);
        }

        // Get all permissions for 'user' guard
        $allPermissions = Permission::where('guard_name', 'user')
            ->orderBy('name')
            ->get()
            ->pluck('name')
            ->toArray();

        // Group permissions by module
        $grouped = [
            'finance' => [],
            'hr' => [],
            'crm' => [],
            'manager' => [],
            'staff' => [],
        ];

        foreach ($allPermissions as $permission) {
            if (str_contains($permission, 'expense') || str_contains($permission, 'invoice') || str_contains($permission, 'finance') || str_contains($permission, 'budget')) {
                $grouped['finance'][] = $permission;
            } elseif (str_contains($permission, 'employee') || str_contains($permission, 'attendance') || str_contains($permission, 'payroll') || str_contains($permission, 'hr') || str_contains($permission, 'timeoff')) {
                $grouped['hr'][] = $permission;
            } elseif (str_contains($permission, 'customer') || str_contains($permission, 'lead') || str_contains($permission, 'opportunity') || str_contains($permission, 'crm')) {
                $grouped['crm'][] = $permission;
            } elseif (str_contains($permission, 'user') || str_contains($permission, 'role') || str_contains($permission, 'product') || str_contains($permission, 'inventory') || str_contains($permission, 'pricing') || str_contains($permission, 'audit') || str_contains($permission, 'system') || str_contains($permission, 'shop')) {
                $grouped['manager'][] = $permission;
            } elseif (str_contains($permission, 'job-order') || str_contains($permission, 'dashboard')) {
                $grouped['staff'][] = $permission;
            }
        }

        // Get all roles with their permissions
        $roles = Role::where('guard_name', 'user')
            ->with('permissions')
            ->get()
            ->map(function ($role) {
                return [
                    'name' => $role->name,
                    'permissions' => $role->permissions->pluck('name')->toArray(),
                ];
            });

        return response()->json([
            'all' => $allPermissions,
            'grouped' => $grouped,
            'roles' => $roles,
        ]);
    }

    /**
     * Get employee's permissions
     * Phase 6: Permission Management
     */
    public function getEmployeePermissions($userId)
    {
        $shopOwner = Auth::guard('shop_owner')->user();
        
        if (!$shopOwner) {
            return response()->json(['error' => 'Not authenticated'], 401);
        }

        $user = User::where('id', $userId)
            ->where('shop_owner_id', $shopOwner->id)
            ->first();

        if (!$user) {
            return response()->json(['error' => 'Employee not found'], 404);
        }

        return response()->json([
            'userId' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'roleName' => $user->getRoleNames()->first() ?? null,
            'allPermissions' => $user->getAllPermissions()->pluck('name')->toArray(),
            'rolePermissions' => $user->getPermissionsViaRoles()->pluck('name')->toArray(),
            'directPermissions' => $user->getDirectPermissions()->pluck('name')->toArray(),
        ]);
    }

    /**
     * Update employee's direct permissions (add/remove individual permissions)
     * Phase 6: Permission Management
     */
    public function updateEmployeePermissions(Request $request, $userId)
    {
        try {
            $shopOwner = Auth::guard('shop_owner')->user();
            
            if (!$shopOwner) {
                return response()->json(['error' => 'Not authenticated'], 401);
            }

            $user = User::where('id', $userId)
                ->where('shop_owner_id', $shopOwner->id)
                ->first();

            if (!$user) {
                return response()->json(['error' => 'Employee not found'], 404);
            }

            $validated = $request->validate([
                'action' => 'required|in:give,revoke',
                'permission' => 'required|string|exists:permissions,name',
            ]);

            if ($validated['action'] === 'give') {
                $user->givePermissionTo($validated['permission']);
                $message = "Permission '{$validated['permission']}' granted to {$user->name}";
                
                // Permission Audit Log - COMPLIANCE CRITICAL
                PermissionAuditLog::logPermissionGranted(
                    $user,
                    $validated['permission'],
                    $request->input('reason'),
                    'medium'
                );
            } else {
                $user->revokePermissionTo($validated['permission']);
                $message = "Permission '{$validated['permission']}' revoked from {$user->name}";
                
                // Permission Audit Log - COMPLIANCE CRITICAL
                PermissionAuditLog::logPermissionRevoked(
                    $user,
                    $validated['permission'],
                    $request->input('reason'),
                    'high'
                );
            }

            // Audit log (legacy system)
            try {
                AuditLog::create([
                    'shop_owner_id' => $shopOwner->id,
                    'actor_user_id' => $shopOwner->id,
                    'action' => $validated['action'] === 'give' ? 'permission_granted' : 'permission_revoked',
                    'target_type' => 'user',
                    'target_id' => $user->id,
                    'metadata' => [
                        'permission' => $validated['permission'],
                        'user_name' => $user->name,
                        'user_email' => $user->email,
                    ],
                ]);
            } catch (\Exception $e) {
                // Audit log is optional
            }

            return response()->json([
                'success' => true,
                'message' => $message,
                'allPermissions' => $user->getAllPermissions()->pluck('name')->toArray(),
                'directPermissions' => $user->getDirectPermissions()->pluck('name')->toArray(),
            ]);

        } catch (ValidationException $e) {
            return response()->json(['error' => $e->errors()], 422);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to update permissions: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Sync employee's direct permissions (replace all direct permissions)
     * Phase 6: Permission Management
     */
    public function syncEmployeePermissions(Request $request, $userId)
    {
        try {
            $shopOwner = Auth::guard('shop_owner')->user();
            
            if (!$shopOwner) {
                return response()->json(['error' => 'Not authenticated'], 401);
            }

            $user = User::where('id', $userId)
                ->where('shop_owner_id', $shopOwner->id)
                ->first();

            if (!$user) {
                return response()->json(['error' => 'Employee not found'], 404);
            }

            $validated = $request->validate([
                'permissions' => 'required|array',
                'permissions.*' => 'string|exists:permissions,name',
            ]);

            // Get current direct permissions (before sync)
            $oldDirectPermissions = $user->getDirectPermissions()->pluck('name')->toArray();

            // Get role permissions to preserve them
            $rolePermissions = $user->getPermissionsViaRoles()->pluck('name')->toArray();
            
            // Sync only direct permissions
            $user->syncPermissions(array_merge($rolePermissions, $validated['permissions']));
            
            // Get new direct permissions (after sync)
            $newDirectPermissions = $user->getDirectPermissions()->pluck('name')->toArray();
            
            // Permission Audit Log - COMPLIANCE CRITICAL (High severity for bulk changes)
            PermissionAuditLog::logPermissionsSynced(
                $user,
                $oldDirectPermissions,
                $newDirectPermissions,
                $request->input('reason', 'Bulk permission update')
            );

            // Audit log (legacy system)
            try {
                AuditLog::create([
                    'shop_owner_id' => $shopOwner->id,
                    'actor_user_id' => $shopOwner->id,
                    'action' => 'permissions_synced',
                    'target_type' => 'user',
                    'target_id' => $user->id,
                    'metadata' => [
                        'permissions_count' => count($validated['permissions']),
                        'permissions' => $validated['permissions'],
                        'user_name' => $user->name,
                        'user_email' => $user->email,
                    ],
                ]);
            } catch (\Exception $e) {
                // Audit log is optional
            }

            return response()->json([
                'success' => true,
                'message' => "Permissions updated for {$user->name}",
                'allPermissions' => $user->getAllPermissions()->pluck('name')->toArray(),
                'rolePermissions' => $user->getPermissionsViaRoles()->pluck('name')->toArray(),
                'directPermissions' => $user->getDirectPermissions()->pluck('name')->toArray(),
            ]);

        } catch (ValidationException $e) {
            return response()->json(['error' => $e->errors()], 422);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to sync permissions: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Get all available position templates
     * Phase 6+: Position Templates
     */
    public function getPositionTemplates()
    {
        try {
            $templates = PositionTemplate::where('is_active', true)
                ->with('templatePermissions')
                ->orderBy('category')
                ->orderBy('name')
                ->get()
                ->map(function ($template) {
                    return [
                        'id' => $template->id,
                        'name' => $template->name,
                        'slug' => $template->slug,
                        'description' => $template->description,
                        'category' => $template->category,
                        'recommended_role' => $template->recommended_role,
                        'permissions' => $template->templatePermissions->pluck('permission_name')->toArray(),
                        'permission_count' => $template->templatePermissions->count(),
                        'usage_count' => $template->usage_count,
                    ];
                });

            // Group by category
            $grouped = $templates->groupBy('category')->map(function ($group) {
                return $group->values();
            });

            return response()->json([
                'templates' => $templates,
                'grouped' => $grouped,
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to fetch templates: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Apply a position template to a user
     * Phase 6+: Position Templates
     */
    public function applyPositionTemplate(Request $request, $userId)
    {
        try {
            $shopOwner = Auth::guard('shop_owner')->user();
            
            if (!$shopOwner) {
                return response()->json(['error' => 'Not authenticated'], 401);
            }

            $user = User::where('id', $userId)
                ->where('shop_owner_id', $shopOwner->id)
                ->first();

            if (!$user) {
                return response()->json(['error' => 'Employee not found'], 404);
            }

            $validated = $request->validate([
                'template_id' => 'required|integer|exists:position_templates,id',
                'preserve_existing' => 'boolean',
            ]);

            $template = PositionTemplate::findOrFail($validated['template_id']);
            $preserveExisting = $validated['preserve_existing'] ?? true;

            // Apply template
            $appliedPermissions = $template->applyToUser($user, $preserveExisting);

            // Audit log
            try {
                AuditLog::create([
                    'shop_owner_id' => $shopOwner->id,
                    'actor_user_id' => $shopOwner->id,
                    'action' => 'position_template_applied',
                    'target_type' => 'user',
                    'target_id' => $user->id,
                    'metadata' => [
                        'template_name' => $template->name,
                        'template_id' => $template->id,
                        'permissions_count' => count($appliedPermissions),
                        'preserve_existing' => $preserveExisting,
                        'user_name' => $user->name,
                        'user_email' => $user->email,
                    ],
                ]);
            } catch (\Exception $e) {
                // Audit log is optional
            }

            return response()->json([
                'success' => true,
                'message' => "Applied '{$template->name}' template to {$user->name}",
                'template' => [
                    'name' => $template->name,
                    'permissions_count' => count($appliedPermissions),
                ],
                'allPermissions' => $user->getAllPermissions()->pluck('name')->toArray(),
                'directPermissions' => $user->getDirectPermissions()->pluck('name')->toArray(),
            ]);

        } catch (ValidationException $e) {
            return response()->json(['error' => $e->errors()], 422);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to apply template: ' . $e->getMessage()], 500);
        }
    }
}
