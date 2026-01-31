<?php

namespace App\Http\Controllers\ERP\HR;

use App\Http\Controllers\Controller;
use App\Models\HR\AttendanceRecord;
use App\Models\HR\Employee;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;

class AttendanceController extends Controller
{
    /**
     * Display a listing of attendance records.
     */
    public function index(Request $request): JsonResponse
    {
        $user = Auth::guard('user')->user();
        
        if ($user->role !== 'HR') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $query = AttendanceRecord::forShopOwner($user->shop_owner_id)
            ->with('employee:id,firstName,lastName,department');

        // Apply filters
        if ($request->filled('employee_id')) {
            $query->forEmployee($request->employee_id);
        }

        if ($request->filled('department')) {
            $query->whereHas('employee', function ($q) use ($request) {
                $q->where('department', $request->department);
            });
        }

        if ($request->filled('date_from') && $request->filled('date_to')) {
            $query->betweenDates($request->date_from, $request->date_to);
        } elseif ($request->filled('date')) {
            $query->where('date', $request->date);
        }

        if ($request->filled('status')) {
            $query->withStatus($request->status);
        }

        $attendance = $query->orderBy('date', 'desc')
            ->orderBy('checkInTime', 'asc')
            ->paginate($request->get('per_page', 20));

        return response()->json($attendance);
    }

    /**
     * Store a new attendance record.
     */
    public function store(Request $request): JsonResponse
    {
        $user = Auth::guard('user')->user();
        
        if ($user->role !== 'HR') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validator = Validator::make($request->all(), [
            'employee_id' => 'required|exists:employees,id',
            'date' => 'required|date',
            'checkInTime' => 'nullable|date_format:H:i',
            'checkOutTime' => 'nullable|date_format:H:i|after:checkInTime',
            'status' => 'required|in:present,absent,late,half-day',
            'biometricId' => 'nullable|string',
            'notes' => 'nullable|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Check if employee belongs to the same shop owner
        $employee = Employee::forShopOwner($user->shop_owner_id)
            ->findOrFail($request->employee_id);

        // Check if attendance record already exists for this date
        $existingRecord = AttendanceRecord::forEmployee($request->employee_id)
            ->where('date', $request->date)
            ->first();

        if ($existingRecord) {
            return response()->json([
                'error' => 'Attendance record already exists for this date'
            ], 422);
        }

        $data = $validator->validated();
        $data['shop_owner_id'] = $user->shop_owner_id;

        $attendance = AttendanceRecord::create($data);

        return response()->json([
            'message' => 'Attendance record created successfully',
            'attendance' => $attendance->load('employee')
        ], 201);
    }

    /**
     * Display the specified attendance record.
     */
    public function show(Request $request, $id): JsonResponse
    {
        $user = Auth::guard('user')->user();
        
        if ($user->role !== 'HR') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $attendance = AttendanceRecord::forShopOwner($user->shop_owner_id)
            ->with('employee')
            ->findOrFail($id);

        return response()->json($attendance);
    }

    /**
     * Update the specified attendance record.
     */
    public function update(Request $request, $id): JsonResponse
    {
        $user = Auth::guard('user')->user();
        
        if ($user->role !== 'HR') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $attendance = AttendanceRecord::forShopOwner($user->shop_owner_id)
            ->findOrFail($id);

        $validator = Validator::make($request->all(), [
            'checkInTime' => 'nullable|date_format:H:i',
            'checkOutTime' => 'nullable|date_format:H:i|after:checkInTime',
            'status' => 'sometimes|required|in:present,absent,late,half-day',
            'biometricId' => 'nullable|string',
            'notes' => 'nullable|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $attendance->update($validator->validated());

        return response()->json([
            'message' => 'Attendance record updated successfully',
            'attendance' => $attendance->load('employee')
        ]);
    }

    /**
     * Remove the specified attendance record.
     */
    public function destroy(Request $request, $id): JsonResponse
    {
        $user = Auth::guard('user')->user();
        
        if ($user->role !== 'HR') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $attendance = AttendanceRecord::forShopOwner($user->shop_owner_id)
            ->findOrFail($id);

        $attendance->delete();

        return response()->json(['message' => 'Attendance record deleted successfully']);
    }

    /**
     * Check in an employee.
     */
    public function checkIn(Request $request): JsonResponse
    {
        $user = Auth::guard('user')->user();
        
        if ($user->role !== 'HR') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validator = Validator::make($request->all(), [
            'employee_id' => 'required|exists:employees,id',
            'biometricId' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Check if employee belongs to the same shop owner
        $employee = Employee::forShopOwner($user->shop_owner_id)
            ->findOrFail($request->employee_id);

        $today = Carbon::today()->toDateString();

        // Check if employee already checked in today
        $existingRecord = AttendanceRecord::forEmployee($request->employee_id)
            ->where('date', $today)
            ->first();

        if ($existingRecord && $existingRecord->checkInTime) {
            return response()->json([
                'error' => 'Employee already checked in today'
            ], 422);
        }

        $now = Carbon::now();
        $checkInTime = $now->format('H:i');

        // Determine status based on check-in time
        $standardTime = Carbon::parse('08:00:00');
        $status = $now->gt($standardTime) ? 'late' : 'present';

        if ($existingRecord) {
            // Update existing record
            $existingRecord->update([
                'checkInTime' => $checkInTime,
                'status' => $status,
                'biometricId' => $request->biometricId,
            ]);
            $attendance = $existingRecord;
        } else {
            // Create new record
            $attendance = AttendanceRecord::create([
                'employee_id' => $request->employee_id,
                'date' => $today,
                'checkInTime' => $checkInTime,
                'status' => $status,
                'biometricId' => $request->biometricId,
                'shop_owner_id' => $user->shop_owner_id,
            ]);
        }

        return response()->json([
            'message' => 'Employee checked in successfully',
            'attendance' => $attendance->load('employee')
        ]);
    }

    /**
     * Check out an employee.
     */
    public function checkOut(Request $request): JsonResponse
    {
        $user = Auth::guard('user')->user();
        
        if ($user->role !== 'HR') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validator = Validator::make($request->all(), [
            'employee_id' => 'required|exists:employees,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Check if employee belongs to the same shop owner
        $employee = Employee::forShopOwner($user->shop_owner_id)
            ->findOrFail($request->employee_id);

        $today = Carbon::today()->toDateString();

        $attendance = AttendanceRecord::forEmployee($request->employee_id)
            ->where('date', $today)
            ->first();

        if (!$attendance || !$attendance->checkInTime) {
            return response()->json([
                'error' => 'Employee has not checked in today'
            ], 422);
        }

        if ($attendance->checkOutTime) {
            return response()->json([
                'error' => 'Employee already checked out today'
            ], 422);
        }

        $attendance->update([
            'checkOutTime' => Carbon::now()->format('H:i'),
        ]);

        return response()->json([
            'message' => 'Employee checked out successfully',
            'attendance' => $attendance->load('employee')
        ]);
    }

    /**
     * Get attendance statistics.
     */
    public function stats(Request $request): JsonResponse
    {
        $user = Auth::guard('user')->user();
        
        if ($user->role !== 'HR') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $employeeId = $request->get('employee_id');
        $startDate = $request->get('start_date', Carbon::now()->startOfMonth()->toDateString());
        $endDate = $request->get('end_date', Carbon::now()->endOfMonth()->toDateString());

        if ($employeeId) {
            // Check if employee belongs to the same shop owner
            Employee::forShopOwner($user->shop_owner_id)
                ->findOrFail($employeeId);

            $stats = AttendanceRecord::getAttendanceStats($employeeId, $startDate, $endDate);
        } else {
            // Get overall stats for all employees
            $query = AttendanceRecord::forShopOwner($user->shop_owner_id)
                ->betweenDates($startDate, $endDate);

            $totalRecords = $query->count();
            $presentRecords = $query->withStatus('present')->count();
            $absentRecords = $query->withStatus('absent')->count();
            $lateRecords = $query->withStatus('late')->count();
            $halfDayRecords = $query->withStatus('half-day')->count();

            $stats = [
                'totalDays' => $totalRecords,
                'presentDays' => $presentRecords,
                'absentDays' => $absentRecords,
                'lateDays' => $lateRecords,
                'halfDays' => $halfDayRecords,
                'attendanceRate' => $totalRecords > 0 ? round(($presentRecords / $totalRecords) * 100, 2) : 0,
                'period' => $startDate . ' to ' . $endDate,
            ];
        }

        return response()->json($stats);
    }

    /**
     * Get today's attendance summary.
     */
    public function todaySummary(Request $request): JsonResponse
    {
        $user = Auth::guard('user')->user();
        
        if ($user->role !== 'HR') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $today = Carbon::today()->toDateString();
        $totalEmployees = Employee::forShopOwner($user->shop_owner_id)->active()->count();

        $todayAttendance = AttendanceRecord::forShopOwner($user->shop_owner_id)
            ->where('date', $today)
            ->get();

        $present = $todayAttendance->where('status', 'present')->count();
        $late = $todayAttendance->where('status', 'late')->count();
        $absent = $totalEmployees - $todayAttendance->count();
        $halfDay = $todayAttendance->where('status', 'half-day')->count();

        return response()->json([
            'date' => $today,
            'totalEmployees' => $totalEmployees,
            'present' => $present,
            'late' => $late,
            'absent' => $absent,
            'halfDay' => $halfDay,
            'attendanceRate' => $totalEmployees > 0 ? round((($present + $late + $halfDay) / $totalEmployees) * 100, 2) : 0,
        ]);
    }
}