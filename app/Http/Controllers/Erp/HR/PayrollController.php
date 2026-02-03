<?php

namespace App\Http\Controllers\ERP\HR;

use App\Http\Controllers\Controller;
use App\Models\HR\Payroll;
use App\Models\HR\PayrollComponent;
use App\Models\Employee;
use App\Models\HR\AttendanceRecord;
use App\Models\HR\AuditLog;
use App\Services\HR\PayrollService;
use App\Traits\HR\LogsHRActivity;
use App\Notifications\HR\PayslipGenerated;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;

class PayrollController extends Controller
{
    use LogsHRActivity;
    
    protected PayrollService $payrollService;
    
    public function __construct(PayrollService $payrollService)
    {
        $this->payrollService = $payrollService;
    }
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
            ->with('employee:id,first_name,last_name,department');

        // Apply search filter
        if ($request->filled('search')) {
            $searchTerm = $request->search;
            $query->where(function ($q) use ($searchTerm) {
                $q->where('payroll_period', 'like', "%{$searchTerm}%")
                  ->orWhere('employee_id', 'like', "%{$searchTerm}%")
                  ->orWhereHas('employee', function ($empQuery) use ($searchTerm) {
                      $empQuery->where('first_name', 'like', "%{$searchTerm}%")
                               ->orWhere('last_name', 'like', "%{$searchTerm}%")
                               ->orWhere('department', 'like', "%{$searchTerm}%")
                               ->orWhere('employee_id', 'like', "%{$searchTerm}%");
                  });
            });
        }

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

        $payrolls = $query->orderBy('payroll_period', 'desc')
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
            'paymentMethod' => 'required|in:bank_transfer,check,cash',
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

        // Map camelCase request fields to snake_case database columns
        $payrollData = [
            'employee_id' => $request->employee_id,
            'shop_owner_id' => $user->shop_owner_id,
            'payroll_period' => $request->payrollPeriod,
            'base_salary' => $request->baseSalary,
            'allowances' => $request->allowances ?? 0,
            'deductions' => $request->deductions ?? 0,
            'payment_method' => $request->paymentMethod,
            'status' => 'pending',
        ];
        
        // Calculate gross and net salary
        $payrollData['gross_salary'] = $payrollData['base_salary'] + $payrollData['allowances'];
        $payrollData['net_salary'] = $payrollData['gross_salary'] - $payrollData['deductions'];

        $payroll = Payroll::create($payrollData);

        // Audit log
        $this->auditCustom(
            AuditLog::MODULE_PAYROLL,
            AuditLog::ACTION_GENERATED,
            "Payroll generated: {$employee->first_name} {$employee->last_name} - Period {$request->payrollPeriod} - Net: {$payrollData['net_salary']}",
            [
                'severity' => AuditLog::SEVERITY_WARNING,
                'tags' => ['financial', 'payroll', 'sensitive'],
                'employee_id' => $employee->id,
                'entity_type' => Payroll::class,
                'entity_id' => $payroll->id,
            ]
        );

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
     * Generate payroll for multiple employees using PayrollService.
     * 
     * Security: Requires PAYROLL_MANAGER role or shop_owner
     */
    public function generate(Request $request): JsonResponse
    {
        $user = Auth::guard('user')->user();
        
        // Security Check: Role Validation - Only PAYROLL_MANAGER or shop_owner can generate payroll
        $allowedRoles = ['PAYROLL_MANAGER', 'shop_owner', 'HR'];
        if (!in_array($user->role, $allowedRoles)) {
            \Log::warning('Unauthorized payroll generation attempt', [
                'user_id' => $user->id,
                'user_role' => $user->role
            ]);
            return response()->json([
                'error' => 'Unauthorized. Only Payroll Managers, HR, or shop owners can generate payroll.'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'payrollPeriod' => 'required|string',
            'employeeIds' => 'required|array',
            'employeeIds.*' => 'exists:employees,id',
            'paymentMethod' => 'sometimes|in:bank_transfer,check,cash',
            'overrides' => 'sometimes|array',
            'overrides.*.employee_id' => 'required|exists:employees,id',
            'overrides.*.attendance_days' => 'sometimes|integer|min:0|max:31',
            'overrides.*.leave_days' => 'sometimes|integer|min:0|max:31',
            'overrides.*.overtime_hours' => 'sometimes|numeric|min:0|max:744',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $payrollPeriod = $request->payrollPeriod;
        $employeeIds = $request->employeeIds;
        $paymentMethod = $request->get('paymentMethod', 'bank_transfer');
        $overridesData = $request->get('overrides', []);

        // Build overrides map by employee_id
        $overridesMap = [];
        foreach ($overridesData as $override) {
            $overridesMap[$override['employee_id']] = $override;
        }

        $createdPayrolls = [];
        $errors = [];

        foreach ($employeeIds as $employeeId) {
            try {
                // Check if employee belongs to the same shop owner
                $employee = Employee::forShopOwner($user->shop_owner_id)
                    ->where('status', 'active')
                    ->findOrFail($employeeId);

                // Check if payroll already exists
                $existingPayroll = Payroll::forEmployee($employeeId)
                    ->forPeriod($payrollPeriod)
                    ->first();

                if ($existingPayroll) {
                    $errors[] = "Payroll already exists for {$employee->first_name} {$employee->last_name}";
                    continue;
                }

                // Get employee-specific overrides
                $employeeOverrides = $overridesMap[$employeeId] ?? [];
                $employeeOverrides['payment_method'] = $paymentMethod;

                // Generate payroll using service
                $payroll = $this->payrollService->generatePayroll(
                    $employee,
                    $payrollPeriod,
                    [], // custom components (empty for now)
                    $employeeOverrides
                );

                $createdPayrolls[] = $payroll;

                \Log::info('Payroll generated via service', [
                    'generator_id' => $user->id,
                    'generator_role' => $user->role,
                    'payroll_id' => $payroll->id,
                    'employee_id' => $employeeId,
                    'period' => $payrollPeriod,
                    'net_salary' => $payroll->net_salary,
                    'components_count' => $payroll->components->count()
                ]);

            } catch (\Exception $e) {
                $errors[] = "Error creating payroll for employee ID {$employeeId}: " . $e->getMessage();
                \Log::error('Payroll generation error', [
                    'employee_id' => $employeeId,
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString()
                ]);
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
     * Approve payroll (separate from generation for dual control).
     * 
     * Security: Requires PAYROLL_APPROVER role or shop_owner, prevents self-approval
     */
    public function approve(Request $request, $id): JsonResponse
    {
        $user = Auth::guard('user')->user();
        
        // Security Check: Role Validation
        $allowedRoles = ['PAYROLL_APPROVER', 'shop_owner'];
        if (!in_array($user->role, $allowedRoles)) {
            \Log::warning('Unauthorized payroll approval attempt', [
                'user_id' => $user->id,
                'user_role' => $user->role,
                'payroll_id' => $id
            ]);
            return response()->json([
                'error' => 'Unauthorized. Only Payroll Approvers or shop owners can approve payroll.'
            ], 403);
        }

        $payroll = Payroll::forShopOwner($user->shop_owner_id)
            ->with('employee')
            ->findOrFail($id);

        // Security Check: Prevent self-approval
        if ($payroll->generated_by == $user->id) {
            \Log::warning('Attempted self-approval of payroll', [
                'user_id' => $user->id,
                'payroll_id' => $id
            ]);
            return response()->json([
                'error' => 'You cannot approve payroll that you generated. Requires independent approval.'
            ], 403);
        }

        // Business Logic: Check status
        if ($payroll->status !== 'pending') {
            return response()->json([
                'error' => 'Payroll is not pending approval'
            ], 422);
        }

        $payroll->update([
            'status' => 'approved',
            'approved_by' => $user->id,
            'approved_at' => now()
        ]);

        // Audit logging
        \Log::info('Payroll approved', [
            'approver_id' => $user->id,
            'approver_role' => $user->role,
            'payroll_id' => $id,
            'employee_id' => $payroll->employee_id,
            'amount' => $payroll->netSalary
        ]);

        // Send payslip notification to employee
        try {
            $employee = $payroll->employee;
            if ($employee && $employee->user) {
                $employee->user->notify(new PayslipGenerated($payroll));
            }
        } catch (\Exception $e) {
            \Log::error('Failed to send payslip notification', [
                'payroll_id' => $payroll->id,
                'error' => $e->getMessage()
            ]);
        }

        return response()->json([
            'message' => 'Payroll approved successfully',
            'payroll' => $payroll
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
     * 
     * Security: Validates role before allowing sensitive data export
     */
    public function exportPayslip(Request $request, $id): JsonResponse
    {
        $user = Auth::guard('user')->user();
        
        // Security Check: Role Validation
        $allowedRoles = ['HR', 'PAYROLL_MANAGER', 'PAYROLL_APPROVER', 'shop_owner'];
        if (!in_array($user->role, $allowedRoles)) {
            \Log::warning('Unauthorized payroll export attempt', [
                'user_id' => $user->id,
                'user_role' => $user->role,
                'payroll_id' => $id
            ]);
            return response()->json([
                'error' => 'Unauthorized. You do not have permission to export payslips.'
            ], 403);
        }

        $payroll = Payroll::forShopOwner($user->shop_owner_id)
            ->with('employee')
            ->findOrFail($id);

        // Audit logging
        \Log::info('Payroll exported', [
            'exporter_id' => $user->id,
            'exporter_role' => $user->role,
            'payroll_id' => $id,
            'employee_id' => $payroll->employee_id
        ]);

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
    
    /**
     * Get payroll components for a specific payroll.
     */
    public function getComponents(Request $request, $id): JsonResponse
    {
        $user = Auth::guard('user')->user();
        
        if ($user->role !== 'HR') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $payroll = Payroll::forShopOwner($user->shop_owner_id)
            ->with(['components' => function($query) {
                $query->orderBy('component_type')->orderBy('component_name');
            }])
            ->findOrFail($id);

        $components = $payroll->components->groupBy('component_type');

        return response()->json([
            'payroll_id' => $payroll->id,
            'employee' => $payroll->employee,
            'components' => [
                'earnings' => $components->get(PayrollComponent::TYPE_EARNING, collect()),
                'deductions' => $components->get(PayrollComponent::TYPE_DEDUCTION, collect()),
                'benefits' => $components->get(PayrollComponent::TYPE_BENEFIT, collect()),
            ],
            'totals' => [
                'total_earnings' => $components->get(PayrollComponent::TYPE_EARNING, collect())->sum('calculated_amount'),
                'total_deductions' => $components->get(PayrollComponent::TYPE_DEDUCTION, collect())->sum('calculated_amount'),
                'total_benefits' => $components->get(PayrollComponent::TYPE_BENEFIT, collect())->sum('calculated_amount'),
                'gross_salary' => $payroll->gross_salary,
                'tax_amount' => $payroll->tax_amount,
                'net_salary' => $payroll->net_salary,
            ]
        ]);
    }
    
    /**
     * Add a custom component to existing payroll.
     */
    public function addComponent(Request $request, $id): JsonResponse
    {
        $user = Auth::guard('user')->user();
        
        if ($user->role !== 'HR') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $payroll = Payroll::forShopOwner($user->shop_owner_id)->findOrFail($id);

        // Only allow adding components to pending payrolls
        if ($payroll->status !== 'pending') {
            return response()->json([
                'error' => 'Cannot add components to non-pending payroll'
            ], 422);
        }

        $validator = Validator::make($request->all(), [
            'component_type' => 'required|in:' . implode(',', [
                PayrollComponent::TYPE_EARNING,
                PayrollComponent::TYPE_DEDUCTION,
                PayrollComponent::TYPE_BENEFIT
            ]),
            'component_name' => 'required|string|max:100',
            'amount' => 'required|numeric',
            'is_taxable' => 'sometimes|boolean',
            'description' => 'nullable|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $component = PayrollComponent::create([
            'payroll_id' => $payroll->id,
            'shop_owner_id' => $user->shop_owner_id,
            'component_type' => $request->component_type,
            'component_name' => $request->component_name,
            'base_amount' => $request->amount,
            'calculation_method' => PayrollComponent::METHOD_CUSTOM,
            'calculated_amount' => $request->amount,
            'is_taxable' => $request->get('is_taxable', false),
            'is_recurring' => false,
            'description' => $request->description,
        ]);

        // Recalculate payroll totals
        $this->recalculateTotals($payroll);

        return response()->json([
            'message' => 'Component added successfully',
            'component' => $component,
            'payroll' => $payroll->fresh()
        ], 201);
    }
    
    /**
     * Update a payroll component.
     */
    public function updateComponent(Request $request, $payrollId, $componentId): JsonResponse
    {
        $user = Auth::guard('user')->user();
        
        if ($user->role !== 'HR') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $payroll = Payroll::forShopOwner($user->shop_owner_id)->findOrFail($payrollId);

        if ($payroll->status !== 'pending') {
            return response()->json([
                'error' => 'Cannot update components of non-pending payroll'
            ], 422);
        }

        $component = PayrollComponent::where('payroll_id', $payrollId)
            ->where('shop_owner_id', $user->shop_owner_id)
            ->findOrFail($componentId);

        $validator = Validator::make($request->all(), [
            'amount' => 'sometimes|required|numeric',
            'is_taxable' => 'sometimes|boolean',
            'description' => 'nullable|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        if ($request->has('amount')) {
            $component->base_amount = $request->amount;
            $component->calculated_amount = $request->amount;
        }

        if ($request->has('is_taxable')) {
            $component->is_taxable = $request->is_taxable;
        }

        if ($request->has('description')) {
            $component->description = $request->description;
        }

        $component->save();

        // Recalculate payroll totals
        $this->recalculateTotals($payroll);

        return response()->json([
            'message' => 'Component updated successfully',
            'component' => $component,
            'payroll' => $payroll->fresh()
        ]);
    }
    
    /**
     * Delete a payroll component.
     */
    public function deleteComponent(Request $request, $payrollId, $componentId): JsonResponse
    {
        $user = Auth::guard('user')->user();
        
        if ($user->role !== 'HR') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $payroll = Payroll::forShopOwner($user->shop_owner_id)->findOrFail($payrollId);

        if ($payroll->status !== 'pending') {
            return response()->json([
                'error' => 'Cannot delete components from non-pending payroll'
            ], 422);
        }

        $component = PayrollComponent::where('payroll_id', $payrollId)
            ->where('shop_owner_id', $user->shop_owner_id)
            ->findOrFail($componentId);

        // Prevent deletion of core components (basic salary, etc.)
        if ($component->is_recurring && in_array($component->component_name, ['Basic Salary', 'Income Tax'])) {
            return response()->json([
                'error' => 'Cannot delete core payroll components'
            ], 422);
        }

        $component->delete();

        // Recalculate payroll totals
        $this->recalculateTotals($payroll);

        return response()->json([
            'message' => 'Component deleted successfully',
            'payroll' => $payroll->fresh()
        ]);
    }
    
    /**
     * Recalculate payroll using service.
     */
    public function recalculate(Request $request, $id): JsonResponse
    {
        $user = Auth::guard('user')->user();
        
        if ($user->role !== 'HR') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $payroll = Payroll::forShopOwner($user->shop_owner_id)->findOrFail($id);

        if ($payroll->status !== 'pending') {
            return response()->json([
                'error' => 'Cannot recalculate non-pending payroll'
            ], 422);
        }

        $validator = Validator::make($request->all(), [
            'attendance_days' => 'sometimes|integer|min:0|max:31',
            'leave_days' => 'sometimes|integer|min:0|max:31',
            'overtime_hours' => 'sometimes|numeric|min:0|max:744',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            $recalculated = $this->payrollService->recalculatePayroll(
                $payroll,
                $request->only(['attendance_days', 'leave_days', 'overtime_hours'])
            );

            return response()->json([
                'message' => 'Payroll recalculated successfully',
                'payroll' => $recalculated->load('components', 'employee')
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Recalculation failed: ' . $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Get payroll summary for a period.
     */
    public function summary(Request $request): JsonResponse
    {
        $user = Auth::guard('user')->user();
        
        if ($user->role !== 'HR') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validator = Validator::make($request->all(), [
            'period_start' => 'required|date',
            'period_end' => 'required|date|after_or_equal:period_start',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            $summary = $this->payrollService->getPayrollSummary(
                $user->shop_owner_id,
                $request->period_start,
                $request->period_end
            );

            return response()->json($summary);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Summary generation failed: ' . $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Helper method to recalculate payroll totals.
     */
    private function recalculateTotals(Payroll $payroll): void
    {
        $components = $payroll->components;
        
        $earnings = $components->where('component_type', PayrollComponent::TYPE_EARNING)->sum('calculated_amount');
        $deductions = $components->where('component_type', PayrollComponent::TYPE_DEDUCTION)->sum('calculated_amount');
        $benefits = $components->where('component_type', PayrollComponent::TYPE_BENEFIT)->sum('calculated_amount');
        
        $grossPay = $earnings + $benefits;
        
        // Recalculate tax on taxable components
        $taxableAmount = $components->where('is_taxable', true)->sum('calculated_amount');
        $taxAmount = $this->payrollService->calculateTax($payroll->shop_owner_id, $taxableAmount);
        
        $netPay = $grossPay - $deductions - $taxAmount;
        
        $payroll->update([
            'gross_salary' => $grossPay,
            'total_deductions' => $deductions,
            'tax_amount' => $taxAmount,
            'net_salary' => $netPay,
        ]);
        
        // Update or create tax component
        $taxComponent = $components->firstWhere('component_name', 'Income Tax');
        if ($taxComponent) {
            $taxComponent->update(['calculated_amount' => $taxAmount]);
        } elseif ($taxAmount > 0) {
            PayrollComponent::create([
                'payroll_id' => $payroll->id,
                'shop_owner_id' => $payroll->shop_owner_id,
                'component_type' => PayrollComponent::TYPE_DEDUCTION,
                'component_name' => 'Income Tax',
                'base_amount' => 0,
                'calculation_method' => PayrollComponent::METHOD_CUSTOM,
                'calculated_amount' => $taxAmount,
                'is_taxable' => false,
                'is_recurring' => true,
                'description' => 'Progressive income tax'
            ]);
        }
    }
}
