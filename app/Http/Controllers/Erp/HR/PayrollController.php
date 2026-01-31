<?php

namespace App\Http\Controllers\ERP\HR;

use App\Http\Controllers\Controller;
use App\Models\HR\Payroll;
use App\Models\HR\Employee;
use App\Models\HR\AttendanceRecord;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;

class PayrollController extends Controller
{
    /**
     * Display a listing of payrolls.
     */
    public function index(Request $request): JsonResponse
    {
        $user = Auth::guard('user')->user();
        
        if ($user->role !== 'HR') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $query = Payroll::forShopOwner($user->shop_owner_id)
            ->with('employee:id,firstName,lastName,department');

        // Apply filters
        if ($request->filled('employee_id')) {
            $query->forEmployee($request->employee_id);
        }

        if ($request->filled('period')) {
            $query->forPeriod($request->period);
        }

        if ($request->filled('status')) {
            $query->withStatus($request->status);
        }

        if ($request->filled('department')) {
            $query->whereHas('employee', function ($q) use ($request) {
                $q->where('department', $request->department);
            });
        }

        $payrolls = $query->orderBy('payrollPeriod', 'desc')
            ->orderBy('created_at', 'desc')
            ->paginate($request->get('per_page', 20));

        return response()->json($payrolls);
    }

    /**
     * Store a newly created payroll.
     */
    public function store(Request $request): JsonResponse
    {
        $user = Auth::guard('user')->user();
        
        if ($user->role !== 'HR') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validator = Validator::make($request->all(), [
            'employee_id' => 'required|exists:employees,id',
            'payrollPeriod' => 'required|string', // e.g., "2026-01"
            'baseSalary' => 'required|numeric|min:0',
            'allowances' => 'nullable|numeric|min:0',
            'deductions' => 'nullable|numeric|min:0',
            'paymentMethod' => 'required|in:bank-transfer,check,cash',
            'notes' => 'nullable|string|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Check if employee belongs to the same shop owner
        $employee = Employee::forShopOwner($user->shop_owner_id)
            ->findOrFail($request->employee_id);

        // Check if payroll already exists for this employee and period
        $existingPayroll = Payroll::forEmployee($request->employee_id)
            ->forPeriod($request->payrollPeriod)
            ->first();

        if ($existingPayroll) {
            return response()->json([
                'error' => 'Payroll already exists for this employee and period'
            ], 422);
        }

        $data = $validator->validated();
        $data['allowances'] = $data['allowances'] ?? 0;
        $data['deductions'] = $data['deductions'] ?? 0;
        $data['netSalary'] = $data['baseSalary'] + $data['allowances'] - $data['deductions'];
        $data['shop_owner_id'] = $user->shop_owner_id;

        $payroll = Payroll::create($data);

        return response()->json([
            'message' => 'Payroll created successfully',
            'payroll' => $payroll->load('employee')
        ], 201);
    }

    /**
     * Display the specified payroll.
     */
    public function show(Request $request, $id): JsonResponse
    {
        $user = Auth::guard('user')->user();
        
        if ($user->role !== 'HR') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $payroll = Payroll::forShopOwner($user->shop_owner_id)
            ->with('employee')
            ->findOrFail($id);

        return response()->json($payroll);
    }

    /**
     * Update the specified payroll.
     */
    public function update(Request $request, $id): JsonResponse
    {
        $user = Auth::guard('user')->user();
        
        if ($user->role !== 'HR') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $payroll = Payroll::forShopOwner($user->shop_owner_id)->findOrFail($id);

        // Only allow updates if status is pending
        if ($payroll->status !== 'pending') {
            return response()->json([
                'error' => 'Cannot update payroll that is not pending'
            ], 422);
        }

        $validator = Validator::make($request->all(), [
            'baseSalary' => 'sometimes|required|numeric|min:0',
            'allowances' => 'sometimes|nullable|numeric|min:0',
            'deductions' => 'sometimes|nullable|numeric|min:0',
            'paymentMethod' => 'sometimes|required|in:bank-transfer,check,cash',
            'notes' => 'nullable|string|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $validator->validated();

        // Recalculate net salary if any amounts changed
        if (isset($data['baseSalary']) || isset($data['allowances']) || isset($data['deductions'])) {
            $baseSalary = $data['baseSalary'] ?? $payroll->baseSalary;
            $allowances = $data['allowances'] ?? $payroll->allowances;
            $deductions = $data['deductions'] ?? $payroll->deductions;
            $data['netSalary'] = $baseSalary + $allowances - $deductions;
        }

        $payroll->update($data);

        return response()->json([
            'message' => 'Payroll updated successfully',
            'payroll' => $payroll->load('employee')
        ]);
    }

    /**
     * Remove the specified payroll.
     */
    public function destroy(Request $request, $id): JsonResponse
    {
        $user = Auth::guard('user')->user();
        
        if ($user->role !== 'HR') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $payroll = Payroll::forShopOwner($user->shop_owner_id)->findOrFail($id);

        // Only allow deletion if status is pending
        if ($payroll->status !== 'pending') {
            return response()->json([
                'error' => 'Cannot delete payroll that is not pending'
            ], 422);
        }

        $payroll->delete();

        return response()->json(['message' => 'Payroll deleted successfully']);
    }

    /**
     * Generate payroll for multiple employees.
     */
    public function generate(Request $request): JsonResponse
    {
        $user = Auth::guard('user')->user();
        
        if ($user->role !== 'HR') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validator = Validator::make($request->all(), [
            'payrollPeriod' => 'required|string',
            'employeeIds' => 'required|array',
            'employeeIds.*' => 'exists:employees,id',
            'paymentMethod' => 'required|in:bank-transfer,check,cash',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $payrollPeriod = $request->payrollPeriod;
        $employeeIds = $request->employeeIds;
        $paymentMethod = $request->paymentMethod;

        $createdPayrolls = [];
        $errors = [];

        foreach ($employeeIds as $employeeId) {
            try {
                // Check if employee belongs to the same shop owner
                $employee = Employee::forShopOwner($user->shop_owner_id)
                    ->findOrFail($employeeId);

                // Check if payroll already exists
                $existingPayroll = Payroll::forEmployee($employeeId)
                    ->forPeriod($payrollPeriod)
                    ->first();

                if ($existingPayroll) {
                    $errors[] = "Payroll already exists for {$employee->fullName}";
                    continue;
                }

                // Get attendance days for the period
                $attendanceDays = $this->getAttendanceDays($employeeId, $payrollPeriod);

                // Calculate payroll
                $payrollData = Payroll::calculatePayroll($employee, $payrollPeriod, $attendanceDays);

                // Create payroll record
                $payroll = Payroll::create([
                    'employee_id' => $employeeId,
                    'payrollPeriod' => $payrollPeriod,
                    'baseSalary' => $payrollData['baseSalary'],
                    'allowances' => $payrollData['allowances'],
                    'deductions' => $payrollData['deductions'],
                    'netSalary' => $payrollData['netSalary'],
                    'status' => 'processed',
                    'paymentMethod' => $paymentMethod,
                    'breakdown' => $payrollData['breakdown'],
                    'shop_owner_id' => $user->shop_owner_id,
                ]);

                $createdPayrolls[] = $payroll->load('employee');

            } catch (\Exception $e) {
                $errors[] = "Error creating payroll for employee ID {$employeeId}: " . $e->getMessage();
            }
        }

        return response()->json([
            'message' => 'Payroll generation completed',
            'created' => count($createdPayrolls),
            'errors' => $errors,
            'payrolls' => $createdPayrolls
        ]);
    }

    /**
     * Process payroll (mark as paid).
     */
    public function process(Request $request): JsonResponse
    {
        $user = Auth::guard('user')->user();
        
        if ($user->role !== 'HR') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validator = Validator::make($request->all(), [
            'payrollIds' => 'required|array',
            'payrollIds.*' => 'exists:payrolls,id',
            'paymentDate' => 'required|date',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $processedCount = 0;
        $errors = [];

        foreach ($request->payrollIds as $payrollId) {
            try {
                $payroll = Payroll::forShopOwner($user->shop_owner_id)
                    ->findOrFail($payrollId);

                if ($payroll->status === 'paid') {
                    $errors[] = "Payroll for {$payroll->employee->fullName} is already paid";
                    continue;
                }

                $payroll->markAsPaid($request->paymentDate);
                $processedCount++;

            } catch (\Exception $e) {
                $errors[] = "Error processing payroll ID {$payrollId}: " . $e->getMessage();
            }
        }

        return response()->json([
            'message' => 'Payroll processing completed',
            'processed' => $processedCount,
            'errors' => $errors
        ]);
    }

    /**
     * Get payroll statistics.
     */
    public function stats(Request $request): JsonResponse
    {
        $user = Auth::guard('user')->user();
        
        if ($user->role !== 'HR') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $period = $request->get('period');

        $query = Payroll::forShopOwner($user->shop_owner_id);

        if ($period) {
            $query->forPeriod($period);
        }

        $totalPayrolls = $query->count();
        $pendingPayrolls = $query->pending()->count();
        $processedPayrolls = $query->processed()->count();
        $paidPayrolls = $query->withStatus('paid')->count();

        $totalAmount = $query->sum('netSalary');
        $pendingAmount = $query->pending()->sum('netSalary');
        $paidAmount = $query->withStatus('paid')->sum('netSalary');

        return response()->json([
            'totalPayrolls' => $totalPayrolls,
            'pendingPayrolls' => $pendingPayrolls,
            'processedPayrolls' => $processedPayrolls,
            'paidPayrolls' => $paidPayrolls,
            'totalAmount' => $totalAmount,
            'pendingAmount' => $pendingAmount,
            'paidAmount' => $paidAmount,
        ]);
    }

    /**
     * Export payslip as PDF.
     */
    public function exportPayslip(Request $request, $id): JsonResponse
    {
        $user = Auth::guard('user')->user();
        
        if ($user->role !== 'HR') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $payroll = Payroll::forShopOwner($user->shop_owner_id)
            ->with('employee')
            ->findOrFail($id);

        // TODO: Generate PDF payslip
        // $pdf = PDF::loadView('payroll.payslip', compact('payroll'));
        // return $pdf->download("payslip_{$payroll->employee->fullName}_{$payroll->payrollPeriod}.pdf");

        return response()->json([
            'message' => 'PDF generation not implemented yet',
            'payroll' => $payroll
        ]);
    }

    /**
     * Get attendance days for payroll period.
     */
    private function getAttendanceDays($employeeId, $period)
    {
        // Parse period (e.g., "2026-01" to get year and month)
        [$year, $month] = explode('-', $period);
        
        $startDate = Carbon::createFromDate($year, $month, 1)->startOfMonth();
        $endDate = Carbon::createFromDate($year, $month, 1)->endOfMonth();

        return AttendanceRecord::forEmployee($employeeId)
            ->betweenDates($startDate->toDateString(), $endDate->toDateString())
            ->whereIn('status', ['present', 'late'])
            ->count();
    }
}