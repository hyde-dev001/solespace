<?php

namespace App\Http\Controllers\ERP\HR;

use App\Http\Controllers\Controller;
use App\Models\HR\LeaveRequest;
use App\Models\HR\Employee;
use App\Models\HR\LeaveBalance;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Mail;

class LeaveController extends Controller
{
    /**
     * Display a listing of leave requests.
     */
    public function index(Request $request): JsonResponse
    {
        $user = Auth::guard('user')->user();
        
        if ($user->role !== 'HR') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $query = LeaveRequest::forShopOwner($user->shop_owner_id)
            ->with(['employee:id,firstName,lastName,department', 'approver:id,name']);

        // Apply filters
        if ($request->filled('employee_id')) {
            $query->forEmployee($request->employee_id);
        }

        if ($request->filled('status')) {
            $query->withStatus($request->status);
        }

        if ($request->filled('leave_type')) {
            $query->ofType($request->leave_type);
        }

        if ($request->filled('department')) {
            $query->whereHas('employee', function ($q) use ($request) {
                $q->where('department', $request->department);
            });
        }

        if ($request->filled('date_from') && $request->filled('date_to')) {
            $query->where(function ($q) use ($request) {
                $q->whereBetween('startDate', [$request->date_from, $request->date_to])
                  ->orWhereBetween('endDate', [$request->date_from, $request->date_to]);
            });
        }

        $leaveRequests = $query->orderBy('created_at', 'desc')
            ->paginate($request->get('per_page', 20));

        return response()->json($leaveRequests);
    }

    /**
     * Store a newly created leave request.
     */
    public function store(Request $request): JsonResponse
    {
        $user = Auth::guard('user')->user();
        
        if ($user->role !== 'HR') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validator = Validator::make($request->all(), [
            'employee_id' => 'required|exists:employees,id',
            'leaveType' => 'required|in:vacation,sick,personal,maternity,paternity,unpaid',
            'startDate' => 'required|date|after_or_equal:today',
            'endDate' => 'required|date|after_or_equal:startDate',
            'reason' => 'required|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Check if employee belongs to the same shop owner
        $employee = Employee::forShopOwner($user->shop_owner_id)
            ->findOrFail($request->employee_id);

        // Calculate number of days
        $noOfDays = LeaveRequest::calculateDays($request->startDate, $request->endDate);

        // Check leave balance
        $leaveBalance = LeaveBalance::forEmployee($request->employee_id)
            ->forYear(date('Y', strtotime($request->startDate)))
            ->first();

        if (!$leaveBalance) {
            return response()->json([
                'error' => 'No leave balance found for this employee'
            ], 422);
        }

        if (!$leaveBalance->hasSufficientBalance($request->leaveType, $noOfDays)) {
            return response()->json([
                'error' => "Insufficient {$request->leaveType} leave balance. Available: {$leaveBalance->{$request->leaveType}} days"
            ], 422);
        }

        // Check for overlapping leave requests
        $overlapping = LeaveRequest::forEmployee($request->employee_id)
            ->where('status', '!=', 'rejected')
            ->where(function ($q) use ($request) {
                $q->whereBetween('startDate', [$request->startDate, $request->endDate])
                  ->orWhereBetween('endDate', [$request->startDate, $request->endDate])
                  ->orWhere(function ($q2) use ($request) {
                      $q2->where('startDate', '<=', $request->startDate)
                         ->where('endDate', '>=', $request->endDate);
                  });
            })
            ->exists();

        if ($overlapping) {
            return response()->json([
                'error' => 'Leave request overlaps with existing leave request'
            ], 422);
        }

        $data = $validator->validated();
        $data['noOfDays'] = $noOfDays;
        $data['shop_owner_id'] = $user->shop_owner_id;

        $leaveRequest = LeaveRequest::create($data);

        return response()->json([
            'message' => 'Leave request created successfully',
            'leaveRequest' => $leaveRequest->load(['employee', 'approver'])
        ], 201);
    }

    /**
     * Display the specified leave request.
     */
    public function show(Request $request, $id): JsonResponse
    {
        $user = Auth::guard('user')->user();
        
        if ($user->role !== 'HR') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $leaveRequest = LeaveRequest::forShopOwner($user->shop_owner_id)
            ->with(['employee', 'approver'])
            ->findOrFail($id);

        return response()->json($leaveRequest);
    }

    /**
     * Update the specified leave request.
     */
    public function update(Request $request, $id): JsonResponse
    {
        $user = Auth::guard('user')->user();
        
        if ($user->role !== 'HR') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $leaveRequest = LeaveRequest::forShopOwner($user->shop_owner_id)
            ->findOrFail($id);

        // Only allow updates if status is pending
        if ($leaveRequest->status !== 'pending') {
            return response()->json([
                'error' => 'Cannot update leave request that is not pending'
            ], 422);
        }

        $validator = Validator::make($request->all(), [
            'leaveType' => 'sometimes|required|in:vacation,sick,personal,maternity,paternity,unpaid',
            'startDate' => 'sometimes|required|date|after_or_equal:today',
            'endDate' => 'sometimes|required|date|after_or_equal:startDate',
            'reason' => 'sometimes|required|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $validator->validated();

        // Recalculate days if dates changed
        if (isset($data['startDate']) || isset($data['endDate'])) {
            $startDate = $data['startDate'] ?? $leaveRequest->startDate;
            $endDate = $data['endDate'] ?? $leaveRequest->endDate;
            $data['noOfDays'] = LeaveRequest::calculateDays($startDate, $endDate);
        }

        $leaveRequest->update($data);

        return response()->json([
            'message' => 'Leave request updated successfully',
            'leaveRequest' => $leaveRequest->load(['employee', 'approver'])
        ]);
    }

    /**
     * Remove the specified leave request.
     */
    public function destroy(Request $request, $id): JsonResponse
    {
        $user = Auth::guard('user')->user();
        
        if ($user->role !== 'HR') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $leaveRequest = LeaveRequest::forShopOwner($user->shop_owner_id)
            ->findOrFail($id);

        // Only allow deletion if status is pending
        if ($leaveRequest->status !== 'pending') {
            return response()->json([
                'error' => 'Cannot delete leave request that is not pending'
            ], 422);
        }

        $leaveRequest->delete();

        return response()->json(['message' => 'Leave request deleted successfully']);
    }

    /**
     * Approve a leave request.
     */
    public function approve(Request $request, $id): JsonResponse
    {
        $user = Auth::guard('user')->user();
        
        if ($user->role !== 'HR') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $leaveRequest = LeaveRequest::forShopOwner($user->shop_owner_id)
            ->findOrFail($id);

        if ($leaveRequest->status !== 'pending') {
            return response()->json([
                'error' => 'Leave request is not pending'
            ], 422);
        }

        // Check leave balance again before approval
        $leaveBalance = LeaveBalance::forEmployee($leaveRequest->employee_id)
            ->forYear($leaveRequest->startDate->year)
            ->first();

        if (!$leaveBalance || !$leaveBalance->hasSufficientBalance($leaveRequest->leaveType, $leaveRequest->noOfDays)) {
            return response()->json([
                'error' => 'Insufficient leave balance'
            ], 422);
        }

        $leaveRequest->approve($user->id);

        // TODO: Send approval email to employee
        // Mail::to($leaveRequest->employee->email)->send(new LeaveApprovedEmail($leaveRequest));

        return response()->json([
            'message' => 'Leave request approved successfully',
            'leaveRequest' => $leaveRequest->load(['employee', 'approver'])
        ]);
    }

    /**
     * Reject a leave request.
     */
    public function reject(Request $request, $id): JsonResponse
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

        $leaveRequest = LeaveRequest::forShopOwner($user->shop_owner_id)
            ->findOrFail($id);

        if ($leaveRequest->status !== 'pending') {
            return response()->json([
                'error' => 'Leave request is not pending'
            ], 422);
        }

        $leaveRequest->reject($request->reason);

        // TODO: Send rejection email to employee
        // Mail::to($leaveRequest->employee->email)->send(new LeaveRejectedEmail($leaveRequest));

        return response()->json([
            'message' => 'Leave request rejected successfully',
            'leaveRequest' => $leaveRequest->load(['employee', 'approver'])
        ]);
    }

    /**
     * Get leave statistics.
     */
    public function stats(Request $request): JsonResponse
    {
        $user = Auth::guard('user')->user();
        
        if ($user->role !== 'HR') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $totalRequests = LeaveRequest::forShopOwner($user->shop_owner_id)->count();
        $pendingRequests = LeaveRequest::forShopOwner($user->shop_owner_id)->pending()->count();
        $approvedRequests = LeaveRequest::forShopOwner($user->shop_owner_id)->approved()->count();
        $rejectedRequests = LeaveRequest::forShopOwner($user->shop_owner_id)
            ->withStatus('rejected')->count();

        // Leave requests by type
        $leaveByType = LeaveRequest::forShopOwner($user->shop_owner_id)
            ->approved()
            ->selectRaw('leaveType, COUNT(*) as count, SUM(noOfDays) as totalDays')
            ->groupBy('leaveType')
            ->get()
            ->pluck('count', 'leaveType');

        return response()->json([
            'totalRequests' => $totalRequests,
            'pendingRequests' => $pendingRequests,
            'approvedRequests' => $approvedRequests,
            'rejectedRequests' => $rejectedRequests,
            'leaveByType' => $leaveByType,
        ]);
    }

    /**
     * Get leave balance for an employee.
     */
    public function balance(Request $request, $employeeId): JsonResponse
    {
        $user = Auth::guard('user')->user();
        
        if ($user->role !== 'HR') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        // Check if employee belongs to the same shop owner
        $employee = Employee::forShopOwner($user->shop_owner_id)
            ->findOrFail($employeeId);

        $year = $request->get('year', date('Y'));

        $leaveBalance = LeaveBalance::forEmployee($employeeId)
            ->forYear($year)
            ->first();

        if (!$leaveBalance) {
            // Create initial leave balance if not exists
            $leaveBalance = LeaveBalance::createForNewEmployee(
                $employeeId,
                $user->shop_owner_id,
                $year
            );
        }

        return response()->json($leaveBalance);
    }
}