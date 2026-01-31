<?php

namespace App\Http\Controllers\ERP\HR;

use App\Http\Controllers\Controller;
use App\Models\HR\Employee;
use App\Models\HR\LeaveBalance;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;

class EmployeeController extends Controller
{
    /**
     * Display a listing of employees.
     */
    public function index(Request $request): JsonResponse
    {
        $user = Auth::guard('user')->user();
        
        if ($user->role !== 'HR') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $query = Employee::forShopOwner($user->shop_owner_id)
            ->with(['attendanceRecords', 'leaveRequests', 'performanceReviews']);

        // Apply filters
        if ($request->filled('department')) {
            $query->inDepartment($request->department);
        }

        if ($request->filled('status')) {
            $query->withStatus($request->status);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('firstName', 'like', "%{$search}%")
                  ->orWhere('lastName', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $employees = $query->orderBy('firstName')
            ->paginate($request->get('per_page', 15));

        return response()->json($employees);
    }

    /**
     * Store a newly created employee.
     */
    public function store(Request $request): JsonResponse
    {
        $user = Auth::guard('user')->user();
        
        if ($user->role !== 'HR') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validator = Validator::make($request->all(), [
            'firstName' => 'required|string|max:50',
            'lastName' => 'required|string|max:50',
            'email' => 'required|email|unique:employees,email',
            'phone' => 'required|string|max:20',
            'position' => 'required|string|max:100',
            'department' => 'required|string|max:100',
            'hireDate' => 'required|date',
            'salary' => 'required|numeric|min:0',
            'address' => 'required|string',
            'city' => 'required|string|max:100',
            'state' => 'required|string|max:100',
            'zipCode' => 'required|string|max:20',
            'emergencyContact' => 'required|string|max:100',
            'emergencyPhone' => 'required|string|max:20',
            'profileImage' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $validator->validated();
        $data['shop_owner_id'] = $user->shop_owner_id;
        $data['createdBy'] = $user->id;
        $data['status'] = 'active';

        // Handle profile image upload
        if ($request->hasFile('profileImage')) {
            $path = $request->file('profileImage')->store('employees/profiles', 'public');
            $data['profileImage'] = $path;
        }

        $employee = Employee::create($data);

        // Create initial leave balance
        LeaveBalance::createForNewEmployee(
            $employee->id,
            $user->shop_owner_id,
            date('Y')
        );

        return response()->json([
            'message' => 'Employee created successfully',
            'employee' => $employee->load(['leaveBalances'])
        ], 201);
    }

    /**
     * Display the specified employee.
     */
    public function show(Request $request, $id): JsonResponse
    {
        $user = Auth::guard('user')->user();
        
        if ($user->role !== 'HR') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $employee = Employee::forShopOwner($user->shop_owner_id)
            ->with([
                'attendanceRecords' => function ($query) {
                    $query->latest()->take(10);
                },
                'leaveRequests' => function ($query) {
                    $query->latest()->take(10);
                },
                'payrolls' => function ($query) {
                    $query->latest()->take(5);
                },
                'performanceReviews' => function ($query) {
                    $query->latest()->take(5);
                },
                'leaveBalances' => function ($query) {
                    $query->where('year', date('Y'));
                }
            ])
            ->findOrFail($id);

        return response()->json($employee);
    }

    /**
     * Update the specified employee.
     */
    public function update(Request $request, $id): JsonResponse
    {
        $user = Auth::guard('user')->user();
        
        if ($user->role !== 'HR') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $employee = Employee::forShopOwner($user->shop_owner_id)->findOrFail($id);

        $validator = Validator::make($request->all(), [
            'firstName' => 'sometimes|required|string|max:50',
            'lastName' => 'sometimes|required|string|max:50',
            'email' => 'sometimes|required|email|unique:employees,email,' . $employee->id,
            'phone' => 'sometimes|required|string|max:20',
            'position' => 'sometimes|required|string|max:100',
            'department' => 'sometimes|required|string|max:100',
            'hireDate' => 'sometimes|required|date',
            'salary' => 'sometimes|required|numeric|min:0',
            'status' => 'sometimes|required|in:active,inactive,on-leave,suspended',
            'address' => 'sometimes|required|string',
            'city' => 'sometimes|required|string|max:100',
            'state' => 'sometimes|required|string|max:100',
            'zipCode' => 'sometimes|required|string|max:20',
            'emergencyContact' => 'sometimes|required|string|max:100',
            'emergencyPhone' => 'sometimes|required|string|max:20',
            'suspensionReason' => 'nullable|string',
            'profileImage' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $validator->validated();

        // Handle profile image upload
        if ($request->hasFile('profileImage')) {
            // Delete old image
            if ($employee->profileImage) {
                Storage::disk('public')->delete($employee->profileImage);
            }
            
            $path = $request->file('profileImage')->store('employees/profiles', 'public');
            $data['profileImage'] = $path;
        }

        $employee->update($data);
        $employee->updateLastActive();

        return response()->json([
            'message' => 'Employee updated successfully',
            'employee' => $employee
        ]);
    }

    /**
     * Remove the specified employee.
     */
    public function destroy(Request $request, $id): JsonResponse
    {
        $user = Auth::guard('user')->user();
        
        if ($user->role !== 'HR') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $employee = Employee::forShopOwner($user->shop_owner_id)->findOrFail($id);

        // Delete profile image
        if ($employee->profileImage) {
            Storage::disk('public')->delete($employee->profileImage);
        }

        $employee->delete();

        return response()->json(['message' => 'Employee deleted successfully']);
    }

    /**
     * Suspend an employee.
     */
    public function suspend(Request $request, $id): JsonResponse
    {
        $user = Auth::guard('user')->user();
        
        if ($user->role !== 'HR') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validator = Validator::make($request->all(), [
            'reason' => 'required|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $employee = Employee::forShopOwner($user->shop_owner_id)->findOrFail($id);

        $employee->update([
            'status' => 'suspended',
            'suspensionReason' => $request->reason,
        ]);

        return response()->json([
            'message' => 'Employee suspended successfully',
            'employee' => $employee
        ]);
    }

    /**
     * Get employee statistics.
     */
    public function stats(Request $request): JsonResponse
    {
        $user = Auth::guard('user')->user();
        
        if ($user->role !== 'HR') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $totalEmployees = Employee::forShopOwner($user->shop_owner_id)->count();
        $activeEmployees = Employee::forShopOwner($user->shop_owner_id)->active()->count();
        $onLeaveEmployees = Employee::forShopOwner($user->shop_owner_id)->withStatus('on-leave')->count();
        $suspendedEmployees = Employee::forShopOwner($user->shop_owner_id)->withStatus('suspended')->count();

        return response()->json([
            'totalEmployees' => $totalEmployees,
            'activeEmployees' => $activeEmployees,
            'onLeaveEmployees' => $onLeaveEmployees,
            'suspendedEmployees' => $suspendedEmployees,
            'inactiveEmployees' => $totalEmployees - $activeEmployees,
        ]);
    }
}