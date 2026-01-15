<?php

namespace App\Http\Controllers\ShopOwner;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\ShopOwner\Employee;
use App\Models\ShopOwner\Role;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class AccessControlController extends Controller
{
    /**
     * Display access control dashboard with stats.
     */
    public function index()
    {
        $shopOwnerId = Auth::id();

        $stats = [
            'totalUsers' => User::where('shop_owner_id', $shopOwnerId)->count(),
            'activeUsers' => User::where('shop_owner_id', $shopOwnerId)->where('status', 'active')->count(),
            'suspendedUsers' => User::where('shop_owner_id', $shopOwnerId)->where('status', 'suspended')->count(),
            'totalEmployees' => Employee::where('shop_owner_id', $shopOwnerId)->count(),
            'activeEmployees' => Employee::where('shop_owner_id', $shopOwnerId)->where('status', 'active')->count(),
            'totalRoles' => Role::where('shop_owner_id', $shopOwnerId)->count(),
        ];

        return response()->json([
            'success' => true,
            'stats' => $stats
        ]);
    }

    // ==================== EMPLOYEE MANAGEMENT ====================

    /**
     * Get all employees.
     */
    public function getEmployees(Request $request)
    {
        $shopOwnerId = Auth::id();
        $filter = $request->get('filter', 'all');
        $search = $request->get('search', '');

        $query = Employee::where('shop_owner_id', $shopOwnerId)
            ->with('role');

        // Apply filters
        if ($filter === 'recent') {
            $query->where('created_at', '>=', Carbon::now()->subDays(7));
        } elseif ($filter !== 'all') {
            $query->whereHas('role', function($q) use ($filter) {
                $q->where('name', $filter);
            });
        }

        // Apply search
        if (!empty($search)) {
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhereHas('role', function($roleQuery) use ($search) {
                      $roleQuery->where('name', 'like', "%{$search}%");
                  });
            });
        }

        $employees = $query->orderBy('created_at', 'desc')->get();

        return response()->json([
            'success' => true,
            'employees' => $employees
        ]);
    }

    /**
     * Store a new employee.
     */
    public function storeEmployee(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:employees,email',
            'role_id' => 'required|exists:roles,id',
            'password' => 'required|string|min:8',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $employee = Employee::create([
            'shop_owner_id' => Auth::id(),
            'name' => $request->name,
            'email' => $request->email,
            'role_id' => $request->role_id,
            'password' => Hash::make($request->password),
            'status' => 'active',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Employee added successfully',
            'employee' => $employee->load('role')
        ], 201);
    }

    /**
     * Update an employee.
     */
    public function updateEmployee(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:employees,email,' . $id,
            'role_id' => 'required|exists:roles,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $employee = Employee::where('shop_owner_id', Auth::id())
            ->findOrFail($id);

        $employee->update([
            'name' => $request->name,
            'email' => $request->email,
            'role_id' => $request->role_id,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Employee updated successfully',
            'employee' => $employee->load('role')
        ]);
    }

    /**
     * Delete an employee.
     */
    public function deleteEmployee($id)
    {
        $employee = Employee::where('shop_owner_id', Auth::id())
            ->findOrFail($id);

        $employee->delete();

        return response()->json([
            'success' => true,
            'message' => 'Employee deleted successfully'
        ]);
    }

    // ==================== ROLE MANAGEMENT ====================

    /**
     * Get all roles.
     */
    public function getRoles(Request $request)
    {
        $shopOwnerId = Auth::id();
        $search = $request->get('search', '');

        $query = Role::where('shop_owner_id', $shopOwnerId)
            ->withCount('employees');

        // Apply search
        if (!empty($search)) {
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('permissions', 'like', "%{$search}%");
            });
        }

        $roles = $query->orderBy('created_at', 'desc')->get();

        return response()->json([
            'success' => true,
            'roles' => $roles
        ]);
    }

    /**
     * Store a new role.
     */
    public function storeRole(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'permissions' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $role = Role::create([
            'shop_owner_id' => Auth::id(),
            'name' => $request->name,
            'permissions' => json_encode($request->permissions ?? []),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Role created successfully',
            'role' => $role
        ], 201);
    }

    /**
     * Update a role.
     */
    public function updateRole(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'permissions' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $role = Role::where('shop_owner_id', Auth::id())
            ->findOrFail($id);

        $role->update([
            'name' => $request->name,
            'permissions' => json_encode($request->permissions ?? []),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Role updated successfully',
            'role' => $role
        ]);
    }

    /**
     * Delete a role.
     */
    public function deleteRole($id)
    {
        $role = Role::where('shop_owner_id', Auth::id())
            ->findOrFail($id);

        // Check if role is assigned to any employees
        if ($role->employees()->count() > 0) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete role. It is assigned to one or more employees.'
            ], 422);
        }

        $role->delete();

        return response()->json([
            'success' => true,
            'message' => 'Role deleted successfully'
        ]);
    }

    // ==================== USER ACCOUNT MANAGEMENT ====================

    /**
     * Get all user accounts.
     */
    public function getUsers(Request $request)
    {
        $shopOwnerId = Auth::id();
        $search = $request->get('search', '');

        $query = User::where('shop_owner_id', $shopOwnerId);

        // Apply search
        if (!empty($search)) {
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('status', 'like', "%{$search}%");
            });
        }

        $users = $query->orderBy('created_at', 'desc')->get();

        return response()->json([
            'success' => true,
            'users' => $users
        ]);
    }

    /**
     * Update user account status (activate/suspend).
     */
    public function updateUserStatus(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'action' => 'required|in:activate,suspend',
            'reason' => 'nullable|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $user = User::where('shop_owner_id', Auth::id())
            ->findOrFail($id);

        $status = $request->action === 'activate' ? 'active' : 'suspended';

        $user->update([
            'status' => $status,
            'suspension_reason' => $request->action === 'suspend' ? $request->reason : null,
        ]);

        return response()->json([
            'success' => true,
            'message' => "Account {$request->action}d successfully",
            'user' => $user
        ]);
    }
}
