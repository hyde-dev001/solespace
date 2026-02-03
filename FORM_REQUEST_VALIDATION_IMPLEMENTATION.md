# Form Request Validation Classes - HR Module

## Overview

This document provides comprehensive documentation for all Form Request validation classes in the HR module. Laravel Form Request classes centralize validation logic, authorization checks, and data preparation, keeping controllers clean and maintainable.

## Architecture Benefits

### Before (Controller Validation)
```php
public function store(Request $request)
{
    $request->validate([
        'first_name' => 'required|string|max:100',
        'email' => 'required|email|unique:hr_employees',
        // ... many more rules
    ]);
    
    // Check authorization
    if (!auth()->user()->hasRole('HR')) {
        abort(403);
    }
    
    // Business logic...
}
```

### After (Form Request)
```php
public function store(StoreEmployeeRequest $request)
{
    // Validation and authorization already handled
    // $request->validated() contains clean, validated data
    $employee = Employee::create($request->validated());
}
```

## Directory Structure

```
app/Http/Requests/HR/
├── Employee
│   ├── StoreEmployeeRequest.php
│   └── UpdateEmployeeRequest.php
├── Leave
│   ├── StoreLeaveRequest.php
│   ├── ApproveLeaveRequest.php
│   └── RejectLeaveRequest.php
├── Attendance
│   ├── CheckInRequest.php
│   └── CheckOutRequest.php
├── Payroll
│   └── GeneratePayrollRequest.php
├── Performance
│   └── StorePerformanceReviewRequest.php
├── Department
│   ├── StoreDepartmentRequest.php
│   └── UpdateDepartmentRequest.php
└── Training
    ├── StoreTrainingProgramRequest.php
    └── EnrollTrainingRequest.php
```

---

## Employee Validation Requests

### 1. StoreEmployeeRequest

**Purpose**: Validate and authorize new employee creation.

**Authorization**:
- Only users with `HR` or `shop_owner` roles can create employees

**Key Features**:
- ✅ Unique email per shop
- ✅ Unique employee_id per shop
- ✅ Department validation (must exist in same shop)
- ✅ Manager validation (must be active employee in same shop)
- ✅ Automatic shop_owner_id injection
- ✅ Automatic probation_end_date calculation

**Validation Rules**:

| Field | Rules | Description |
|-------|-------|-------------|
| `first_name` | required, string, max:100 | Employee's first name |
| `last_name` | required, string, max:100 | Employee's last name |
| `email` | required, email, unique per shop | Work email address |
| `employee_id` | required, string, unique per shop | Unique employee identifier |
| `department_id` | required, exists in shop | Department assignment |
| `position` | required, string, max:100 | Job title |
| `hire_date` | required, date, <= today | Date of joining |
| `employment_type` | required, enum | full_time, part_time, contract, intern |
| `status` | required, enum | active, suspended, on_leave |
| `salary` | required, numeric, >= 0 | Annual/monthly salary |
| `manager_id` | nullable, exists in shop | Reporting manager |
| `probation_period_months` | nullable, integer, 0-24 | Probation duration |
| `date_of_birth` | nullable, date, < today | Date of birth |

**Usage Example**:
```php
use App\Http\Requests\HR\StoreEmployeeRequest;

class EmployeeController extends Controller
{
    public function store(StoreEmployeeRequest $request)
    {
        $employee = Employee::create($request->validated());
        return response()->json($employee, 201);
    }
}
```

**Auto-Calculated Fields**:
```php
// If probation_period_months provided without probation_end_date
$probation_end_date = $hire_date->addMonths($probation_period_months);

// Always injected
$shop_owner_id = auth()->user()->shop_owner_id;
```

---

### 2. UpdateEmployeeRequest

**Purpose**: Validate employee updates with unique constraints excluding current record.

**Key Differences from Store**:
- Uses `sometimes` instead of `required` (partial updates allowed)
- Ignores current employee in uniqueness checks
- All other validations same as StoreEmployeeRequest

**Usage Example**:
```php
public function update(UpdateEmployeeRequest $request, $id)
{
    $employee = Employee::findOrFail($id);
    $employee->update($request->validated());
    return response()->json($employee);
}
```

---

## Leave Management Validation Requests

### 3. StoreLeaveRequest

**Purpose**: Validate leave application with balance checking and overlap detection.

**Authorization**:
- Employees can request for themselves
- HR/shop_owner can request for anyone

**Advanced Validations**:

1. **Overlapping Leave Detection**:
   ```php
   // Checks for overlapping approved/pending leaves
   // Prevents double-booking dates
   ```

2. **Minimum Reason Length**:
   ```php
   'reason' => 'required|min:10|max:1000'
   // Ensures detailed justification
   ```

3. **Auto Employee Detection**:
   ```php
   // If employee_id not provided, finds from current user's email
   ```

4. **Auto Days Calculation**:
   ```php
   // Calculates leave days from start_date to end_date if not provided
   ```

**Validation Rules**:

| Field | Rules | Description |
|-------|-------|-------------|
| `employee_id` | required, exists (active) | Employee requesting leave |
| `leave_type` | required, enum | annual, sick, casual, maternity, paternity, unpaid, etc. |
| `start_date` | required, date, >= today | Leave start date (no backdating) |
| `end_date` | required, date, >= start_date | Leave end date |
| `days` | required, numeric, 0.5-365 | Number of leave days |
| `reason` | required, string, 10-1000 chars | Detailed leave reason |
| `attachment` | nullable, file, max:5MB | Supporting document (PDF/image) |

**Usage Example**:
```php
public function store(StoreLeaveRequest $request)
{
    $leave = LeaveRequest::create($request->validated());
    
    // Send notification to manager
    Notification::send($leave->employee->manager, new LeaveRequestSubmitted($leave));
    
    return response()->json($leave, 201);
}
```

**Custom Error Messages**:
```php
'start_date.after_or_equal' => 'Leave cannot be backdated. Start date must be today or later.'
'reason.min' => 'Please provide a detailed reason (minimum 10 characters).'
```

---

### 4. ApproveLeaveRequest

**Purpose**: Validate leave approval with balance verification.

**Authorization** (Complex):
```php
1. HR or shop_owner can approve any leave
2. Employee's direct manager can approve
3. Others are denied
```

**Advanced Validations**:

1. **Leave Status Check**:
   ```php
   // Only pending leaves can be approved
   if ($leave->status !== 'pending') {
       $validator->errors()->add('status', 'Only pending leaves can be approved');
   }
   ```

2. **Balance Validation** (for annual/sick/casual):
   ```php
   $balance = LeaveBalance::where('employee_id', $employee_id)
       ->where('leave_type', $leave_type)
       ->where('year', now()->year)
       ->first();
   
   $available = $balance->allocated_days - $balance->used_days;
   if ($available < $requested_days) {
       $validator->errors()->add('balance', 'Insufficient leave balance');
   }
   ```

3. **Shop Isolation**:
   ```php
   // Ensures user can't approve leaves from other shops
   ```

**Usage Example**:
```php
public function approve($id, ApproveLeaveRequest $request)
{
    $leave = LeaveRequest::findOrFail($id);
    
    DB::transaction(function () use ($leave, $request) {
        // Approve leave
        $leave->update([
            'status' => 'approved',
            'approved_by' => auth()->id(),
            'approved_at' => now(),
            'approver_remarks' => $request->approver_remarks
        ]);
        
        // Update leave balance
        LeaveBalance::where('employee_id', $leave->employee_id)
            ->where('leave_type', $leave->leave_type)
            ->where('year', now()->year)
            ->increment('used_days', $leave->days);
    });
    
    // Notify employee
    Notification::send($leave->employee, new LeaveApproved($leave));
    
    return response()->json($leave);
}
```

---

### 5. RejectLeaveRequest

**Purpose**: Validate leave rejection (requires reason).

**Key Difference from Approve**:
- `approver_remarks` is **required** (min 10 chars)
- Ensures proper justification for rejection

**Usage Example**:
```php
public function reject($id, RejectLeaveRequest $request)
{
    $leave = LeaveRequest::findOrFail($id);
    
    $leave->update([
        'status' => 'rejected',
        'approved_by' => auth()->id(),
        'approved_at' => now(),
        'approver_remarks' => $request->approver_remarks
    ]);
    
    // Notify employee
    Notification::send($leave->employee, new LeaveRejected($leave));
    
    return response()->json($leave);
}
```

---

## Attendance Validation Requests

### 6. CheckInRequest

**Purpose**: Validate employee check-in with duplicate detection.

**Authorization**:
- Employees can check in for themselves
- HR/shop_owner can check in anyone

**Advanced Validations**:

1. **Duplicate Check-In Prevention**:
   ```php
   $existingToday = AttendanceRecord::where('employee_id', $employee_id)
       ->whereDate('date', today())
       ->first();
   
   if ($existingToday && $existingToday->check_in_time) {
       $validator->errors()->add('check_in', 'Already checked in today');
   }
   ```

2. **Future Time Prevention**:
   ```php
   if (Carbon::parse($check_in_time)->isFuture()) {
       $validator->errors()->add('check_in_time', 'Cannot be in the future');
   }
   ```

3. **GPS Validation**:
   ```php
   'latitude' => 'between:-90,90'
   'longitude' => 'between:-180,180'
   ```

**Validation Rules**:

| Field | Rules | Description |
|-------|-------|-------------|
| `employee_id` | required, exists (active) | Employee checking in |
| `check_in_time` | nullable, datetime format | Defaults to now() |
| `location` | nullable, string, max:200 | Location name |
| `latitude` | nullable, numeric, -90 to 90 | GPS latitude |
| `longitude` | nullable, numeric, -180 to 180 | GPS longitude |
| `notes` | nullable, string, max:500 | Check-in notes |

**Usage Example**:
```php
public function checkIn(CheckInRequest $request)
{
    $attendance = AttendanceRecord::create($request->validated());
    
    // Determine if late
    $scheduledTime = Carbon::parse('09:00:00');
    $checkInTime = Carbon::parse($attendance->check_in_time);
    
    if ($checkInTime->greaterThan($scheduledTime)) {
        $attendance->update(['status' => 'late']);
    }
    
    return response()->json($attendance, 201);
}
```

---

### 7. CheckOutRequest

**Purpose**: Validate employee check-out with check-in verification.

**Advanced Validations**:

1. **Must Check In First**:
   ```php
   $attendance = AttendanceRecord::whereDate('date', today())
       ->where('employee_id', $employee_id)
       ->first();
   
   if (!$attendance || !$attendance->check_in_time) {
       $validator->errors()->add('check_out', 'Must check in before checking out');
   }
   ```

2. **No Duplicate Check-Out**:
   ```php
   if ($attendance && $attendance->check_out_time) {
       $validator->errors()->add('check_out', 'Already checked out today');
   }
   ```

3. **Check-Out After Check-In**:
   ```php
   if ($checkOutTime->lessThanOrEqualTo($checkInTime)) {
       $validator->errors()->add('check_out_time', 'Must be after check-in time');
   }
   ```

**Usage Example**:
```php
public function checkOut(CheckOutRequest $request)
{
    $attendance = AttendanceRecord::where('employee_id', $request->employee_id)
        ->whereDate('date', today())
        ->firstOrFail();
    
    $checkInTime = Carbon::parse($attendance->check_in_time);
    $checkOutTime = Carbon::parse($request->check_out_time ?? now());
    
    // Calculate working hours
    $workingHours = $checkOutTime->diffInHours($checkInTime, true);
    
    $attendance->update([
        'check_out_time' => $checkOutTime,
        'working_hours' => $workingHours
    ]);
    
    return response()->json($attendance);
}
```

---

## Payroll Validation Request

### 8. GeneratePayrollRequest

**Purpose**: Validate comprehensive payroll generation with salary calculations.

**Authorization**:
- Only HR and shop_owner can generate payroll

**Advanced Validations**:

1. **Duplicate Payroll Prevention**:
   ```php
   $exists = Payroll::where('employee_id', $employee_id)
       ->where('pay_period_month', $month)
       ->where('pay_period_year', $year)
       ->exists();
   
   if ($exists) {
       $validator->errors()->add('payroll', 'Already exists for this period');
   }
   ```

2. **Gross Salary Validation**:
   ```php
   $calculatedGross = $basic_salary + $allowances + $bonus + $overtime + $commission;
   
   if (abs($calculatedGross - $gross_salary) > 0.01) {
       $validator->errors()->add('gross_salary', 'Does not match earnings sum');
   }
   ```

3. **Net Salary Validation**:
   ```php
   $calculatedNet = $gross_salary - $total_deductions;
   
   if (abs($calculatedNet - $net_salary) > 0.01) {
       $validator->errors()->add('net_salary', 'Does not match calculation');
   }
   ```

4. **Attendance Days Validation**:
   ```php
   if (($present_days + $absent_days) > $working_days) {
       $validator->errors()->add('working_days', 'Sum exceeds total working days');
   }
   ```

**Validation Rules**:

| Field | Rules | Description |
|-------|-------|-------------|
| `employee_id` | required, exists (active) | Employee for payroll |
| `pay_period_month` | required, enum | January-December |
| `pay_period_year` | required, integer, 2020-2027 | Payroll year |
| `pay_period_start` | required, date | Period start date |
| `pay_period_end` | required, date, >= start | Period end date |
| `pay_date` | required, date, >= end | Payment date |
| `basic_salary` | required, numeric, >= 0 | Base salary |
| `gross_salary` | required, numeric, >= 0 | Total earnings |
| `allowances` | nullable, numeric, >= 0 | Total allowances |
| `bonus` | nullable, numeric, >= 0 | Performance bonus |
| `overtime_pay` | nullable, numeric, >= 0 | OT payment |
| `deductions` | nullable, numeric, >= 0 | Total deductions |
| `tax_deduction` | nullable, numeric, >= 0 | Income tax |
| `insurance_deduction` | nullable, numeric, >= 0 | Insurance premium |
| `pension_deduction` | nullable, numeric, >= 0 | Pension contribution |
| `net_salary` | required, numeric, >= 0 | Take-home salary |
| `working_days` | nullable, integer, 0-31 | Total working days |
| `present_days` | nullable, integer, 0-31 | Days present |
| `absent_days` | nullable, integer, 0-31 | Days absent |
| `overtime_hours` | nullable, numeric, 0-744 | OT hours (max month) |

**Auto-Calculated Fields**:
```php
// Total deductions
$total_deductions = $tax + $insurance + $pension + $loan + $other;

// Net salary
$net_salary = $gross_salary - $total_deductions;

// Gross salary
$gross_salary = $basic + $allowances + $bonus + $overtime + $commission;
```

**Usage Example**:
```php
public function generate(GeneratePayrollRequest $request)
{
    $payroll = Payroll::create($request->validated());
    
    // Generate payslip PDF
    $pdf = PDF::loadView('payroll.payslip', compact('payroll'));
    Storage::put("payslips/{$payroll->id}.pdf", $pdf->output());
    
    // Notify employee
    Notification::send($payroll->employee, new PayslipGenerated($payroll));
    
    return response()->json($payroll, 201);
}
```

---

## Performance Review Validation Request

### 9. StorePerformanceReviewRequest

**Purpose**: Validate performance review with competency ratings and authority checks.

**Authorization**:
- HR and shop_owner can create reviews
- Managers can review their team members

**Advanced Validations**:

1. **Reviewer Authority Check**:
   ```php
   $isManager = $employee->manager_id === $reviewer->id;
   $isHR = auth()->user()->hasRole(['HR', 'shop_owner']);
   
   if (!$isManager && !$isHR) {
       $validator->errors()->add('reviewer_id', 'Must be manager or HR');
   }
   ```

2. **Prevent Self-Review**:
   ```php
   if ($employee_id === $reviewer_id) {
       $validator->errors()->add('reviewer_id', 'Cannot self-review');
   }
   ```

3. **Duplicate Period Check**:
   ```php
   // Prevents overlapping review periods for same employee
   ```

**Validation Rules**:

| Field | Rules | Description |
|-------|-------|-------------|
| `employee_id` | required, exists (active) | Employee being reviewed |
| `reviewer_id` | required, exists (active) | Person conducting review |
| `review_period_start` | required, date | Review period start |
| `review_period_end` | required, date, >= start | Review period end |
| `review_date` | required, date, >= end, <= today | Review conducted date |
| `rating` | required, integer, 1-5 | Overall rating |
| `quality_of_work` | nullable, integer, 1-5 | Competency rating |
| `productivity` | nullable, integer, 1-5 | Competency rating |
| `communication` | nullable, integer, 1-5 | Competency rating |
| `teamwork` | nullable, integer, 1-5 | Competency rating |
| `initiative` | nullable, integer, 1-5 | Competency rating |
| `punctuality` | nullable, integer, 1-5 | Competency rating |
| `leadership` | nullable, integer, 1-5 | Competency rating |
| `strengths` | nullable, string, max:1000 | Employee strengths |
| `areas_for_improvement` | nullable, string, max:1000 | Improvement areas |
| `goals_achieved` | nullable, string, max:1000 | Accomplished goals |
| `goals_for_next_period` | nullable, string, max:1000 | Future objectives |
| `status` | nullable, enum | draft, submitted, acknowledged, completed |
| `promotion_recommended` | nullable, boolean | Promotion flag |
| `salary_increase_recommended` | nullable, boolean | Raise flag |
| `training_recommended` | nullable, boolean | Training flag |
| `recommended_salary_increase_percentage` | nullable, numeric, 0-100 | Raise % |

**Usage Example**:
```php
public function store(StorePerformanceReviewRequest $request)
{
    $review = PerformanceReview::create($request->validated());
    
    // Send notification to employee
    Notification::send($review->employee, new PerformanceReviewCompleted($review));
    
    // If promotion recommended, notify HR
    if ($review->promotion_recommended) {
        Notification::send($hrTeam, new PromotionRecommendation($review));
    }
    
    return response()->json($review, 201);
}
```

---

## Department Validation Requests

### 10. StoreDepartmentRequest

**Purpose**: Validate new department creation with unique name/code.

**Key Features**:
- Auto-generates department code from name if not provided
- Validates parent department existence (for hierarchy)
- Ensures manager is active employee

**Validation Rules**:

| Field | Rules | Description |
|-------|-------|-------------|
| `name` | required, string, unique per shop | Department name |
| `code` | nullable, string, unique per shop | Department code |
| `description` | nullable, string, max:500 | Department description |
| `manager_id` | nullable, exists (active) | Department head |
| `parent_department_id` | nullable, exists in shop | Parent dept (hierarchy) |
| `location` | nullable, string, max:200 | Physical location |
| `cost_center` | nullable, string, max:50 | Financial cost center |
| `is_active` | nullable, boolean | Active status (default true) |

**Auto Code Generation**:
```php
// If code not provided, generates from name
$name = "Human Resources";
$code = "HUMANRESOU"; // First 10 alphanumeric chars
```

---

### 11. UpdateDepartmentRequest

**Purpose**: Update department with circular reference prevention.

**Advanced Validation**:

1. **Prevent Self-Parent**:
   ```php
   'parent_department_id' => 'not_in:' . $departmentId
   ```

2. **Prevent Circular References**:
   ```php
   // Traverses parent chain to detect circular relationships
   // Example: Dept A → Dept B → Dept C → Dept A (invalid)
   ```

---

## Training Validation Requests

### 12. StoreTrainingProgramRequest

**Purpose**: Validate training program creation with mode-specific requirements.

**Advanced Validations**:

1. **Online Mode Requirements**:
   ```php
   if ($mode === 'online' && !$meeting_link && !$online_platform) {
       $validator->errors()->add('meeting_link', 'Required for online training');
   }
   ```

2. **In-Person Mode Requirements**:
   ```php
   if ($mode === 'in_person' && !$location && !$venue) {
       $validator->errors()->add('location', 'Required for in-person training');
   }
   ```

3. **Trainer Validation**:
   ```php
   if (!$trainer_id && !$trainer_name) {
       $validator->errors()->add('trainer_id', 'Either internal or external trainer required');
   }
   ```

4. **Budget Validation**:
   ```php
   $estimatedTotal = $cost_per_participant * $max_participants;
   if ($total_budget < $estimatedTotal) {
       $validator->errors()->add('total_budget', 'Less than estimated cost');
   }
   ```

**Validation Rules**:

| Field | Rules | Description |
|-------|-------|-------------|
| `title` | required, string, max:200 | Training title |
| `type` | required, enum | technical, soft_skills, compliance, etc. |
| `mode` | required, enum | in_person, online, hybrid |
| `start_date` | required, date, >= today | Training start |
| `end_date` | required, date, >= start | Training end |
| `duration_hours` | nullable, numeric, 0.5-1000 | Total hours |
| `max_participants` | nullable, integer, 1-1000 | Capacity |
| `trainer_name` | nullable, string | External trainer name |
| `trainer_id` | nullable, exists (active) | Internal trainer |
| `location` | nullable, string | Training venue |
| `meeting_link` | nullable, url | Online meeting link |
| `cost_per_participant` | nullable, numeric, >= 0 | Per-person cost |
| `certificate_awarded` | nullable, boolean | Certificate flag |
| `certificate_validity_months` | nullable, integer, 1-120 | Cert validity |

---

### 13. EnrollTrainingRequest

**Purpose**: Validate training enrollment with capacity and eligibility checks.

**Advanced Validations**:

1. **Duplicate Enrollment Prevention**:
   ```php
   $alreadyEnrolled = TrainingEnrollment::where('training_program_id', $id)
       ->where('employee_id', $employee_id)
       ->whereIn('status', ['enrolled', 'in_progress'])
       ->exists();
   ```

2. **Capacity Check**:
   ```php
   $currentCount = TrainingEnrollment::where('training_program_id', $id)
       ->whereIn('status', ['enrolled', 'in_progress'])
       ->count();
   
   if ($currentCount >= $max_participants) {
       $validator->errors()->add('training_program_id', 'At capacity');
   }
   ```

3. **Program Status Check**:
   ```php
   if (!in_array($program->status, ['scheduled', 'active'])) {
       $validator->errors()->add('training_program_id', 'Cannot enroll in ' . $status);
   }
   ```

4. **Manager Authority Check**:
   ```php
   // Managers can only enroll their direct reports (unless HR)
   ```

**Usage Example**:
```php
public function enroll(EnrollTrainingRequest $request)
{
    $enrollment = TrainingEnrollment::create($request->validated());
    
    // Send notification
    Notification::send($enrollment->employee, new TrainingEnrollmentConfirmation($enrollment));
    
    // Add to calendar
    CalendarEvent::create([
        'employee_id' => $enrollment->employee_id,
        'title' => $enrollment->trainingProgram->title,
        'start' => $enrollment->trainingProgram->start_date,
        'end' => $enrollment->trainingProgram->end_date,
    ]);
    
    return response()->json($enrollment, 201);
}
```

---

## Common Patterns

### 1. Authorization Pattern

All requests follow this pattern:
```php
public function authorize(): bool
{
    // Role-based check
    if ($this->user()->hasAnyRole(['HR', 'shop_owner'])) {
        return true;
    }
    
    // Resource-specific check
    // e.g., manager can approve team member's leave
    return $this->checkSpecificAuthorization();
}
```

### 2. Shop Isolation Pattern

All requests enforce multi-tenancy:
```php
protected function prepareForValidation(): void
{
    $this->merge([
        'shop_owner_id' => $this->user()->shop_owner_id,
    ]);
}

// In rules
Rule::exists('hr_employees', 'id')->where('shop_owner_id', $shopOwnerId)
```

### 3. Custom Validation Pattern

Complex validations use `withValidator()`:
```php
public function withValidator($validator): void
{
    $validator->after(function ($validator) {
        // Custom business logic validation
        if ($this->someComplexCondition()) {
            $validator->errors()->add('field', 'Error message');
        }
    });
}
```

---

## Testing Form Requests

### Unit Test Example

```php
use Tests\TestCase;
use App\Http\Requests\HR\StoreEmployeeRequest;
use App\Models\User;
use Illuminate\Support\Facades\Validator;

class StoreEmployeeRequestTest extends TestCase
{
    public function test_validates_required_fields()
    {
        $request = new StoreEmployeeRequest();
        $validator = Validator::make([], $request->rules());
        
        $this->assertTrue($validator->fails());
        $this->assertArrayHasKey('first_name', $validator->errors()->toArray());
        $this->assertArrayHasKey('email', $validator->errors()->toArray());
    }
    
    public function test_validates_unique_email_per_shop()
    {
        $existingEmployee = Employee::factory()->create([
            'email' => 'test@example.com',
            'shop_owner_id' => 1
        ]);
        
        $request = new StoreEmployeeRequest();
        $data = [
            'email' => 'test@example.com',
            // ... other required fields
        ];
        
        $validator = Validator::make($data, $request->rules());
        
        $this->assertTrue($validator->fails());
        $this->assertArrayHasKey('email', $validator->errors()->toArray());
    }
    
    public function test_authorizes_hr_role()
    {
        $hrUser = User::factory()->create();
        $hrUser->assignRole('HR');
        
        $this->actingAs($hrUser);
        
        $request = new StoreEmployeeRequest();
        $this->assertTrue($request->authorize());
    }
    
    public function test_denies_non_hr_role()
    {
        $staffUser = User::factory()->create();
        $staffUser->assignRole('employee');
        
        $this->actingAs($staffUser);
        
        $request = new StoreEmployeeRequest();
        $this->assertFalse($request->authorize());
    }
}
```

---

## Controller Integration Examples

### Example 1: Employee Controller

```php
use App\Http\Requests\HR\StoreEmployeeRequest;
use App\Http\Requests\HR\UpdateEmployeeRequest;

class EmployeeController extends Controller
{
    public function store(StoreEmployeeRequest $request)
    {
        $employee = Employee::create($request->validated());
        
        // Initialize leave balances
        $this->leaveService->initializeBalances($employee->id);
        
        // Send welcome email
        Mail::to($employee->email)->send(new WelcomeEmail($employee));
        
        return response()->json($employee, 201);
    }
    
    public function update(UpdateEmployeeRequest $request, $id)
    {
        $employee = Employee::findOrFail($id);
        $employee->update($request->validated());
        
        return response()->json($employee);
    }
}
```

### Example 2: Leave Controller

```php
use App\Http\Requests\HR\StoreLeaveRequest;
use App\Http\Requests\HR\ApproveLeaveRequest;
use App\Http\Requests\HR\RejectLeaveRequest;

class LeaveController extends Controller
{
    public function store(StoreLeaveRequest $request)
    {
        $leave = LeaveRequest::create($request->validated());
        
        // Notify manager
        $manager = $leave->employee->manager;
        if ($manager) {
            Notification::send($manager, new LeaveRequestSubmitted($leave));
        }
        
        return response()->json($leave, 201);
    }
    
    public function approve($id, ApproveLeaveRequest $request)
    {
        return DB::transaction(function () use ($id, $request) {
            $leave = LeaveRequest::findOrFail($id);
            
            // Approve leave
            $leave->update([
                'status' => 'approved',
                'approved_by' => auth()->id(),
                'approved_at' => now(),
                'approver_remarks' => $request->approver_remarks
            ]);
            
            // Deduct from balance
            $this->leaveService->deductFromBalance($leave);
            
            // Notify employee
            Notification::send($leave->employee, new LeaveApproved($leave));
            
            return response()->json($leave);
        });
    }
    
    public function reject($id, RejectLeaveRequest $request)
    {
        $leave = LeaveRequest::findOrFail($id);
        
        $leave->update([
            'status' => 'rejected',
            'approved_by' => auth()->id(),
            'approved_at' => now(),
            'approver_remarks' => $request->approver_remarks
        ]);
        
        Notification::send($leave->employee, new LeaveRejected($leave));
        
        return response()->json($leave);
    }
}
```

---

## Error Response Format

### Validation Failure Response

```json
{
    "message": "The given data was invalid.",
    "errors": {
        "email": [
            "An employee with this email already exists in your organization."
        ],
        "salary": [
            "Salary must be a number."
        ],
        "department_id": [
            "The selected department does not exist."
        ]
    }
}
```

### Authorization Failure Response

```json
{
    "message": "This action is unauthorized."
}
```

Status Code: `403 Forbidden`

---

## Best Practices

### 1. Always Use Form Requests for Complex Validation

✅ **Good**:
```php
public function store(StoreEmployeeRequest $request)
{
    return Employee::create($request->validated());
}
```

❌ **Bad**:
```php
public function store(Request $request)
{
    $request->validate([
        'first_name' => 'required',
        // ... many rules in controller
    ]);
}
```

### 2. Use `prepareForValidation()` for Data Transformation

```php
protected function prepareForValidation(): void
{
    // Auto-inject shop_owner_id
    $this->merge(['shop_owner_id' => $this->user()->shop_owner_id]);
    
    // Calculate derived fields
    if (!$this->has('days')) {
        $this->merge(['days' => $this->calculateDays()]);
    }
}
```

### 3. Use `withValidator()` for Complex Business Logic

```php
public function withValidator($validator): void
{
    $validator->after(function ($validator) {
        // Check overlapping leaves
        if ($this->hasOverlappingLeaves()) {
            $validator->errors()->add('dates', 'Overlapping leave found');
        }
    });
}
```

### 4. Provide Clear Custom Messages

```php
public function messages(): array
{
    return [
        'email.unique' => 'An employee with this email already exists in your organization.',
        'reason.min' => 'Please provide a detailed reason (minimum 10 characters).',
    ];
}
```

### 5. Use Custom Attributes for Better Error Messages

```php
public function attributes(): array
{
    return [
        'first_name' => 'first name',
        'department_id' => 'department',
    ];
}
```

This changes:
- ❌ "The first_name field is required."
- ✅ "The first name field is required."

---

## Next Steps

1. **Update Controllers**: Replace inline validation with Form Requests
2. **Add Tests**: Write comprehensive tests for all Form Requests
3. **Document API**: Update API documentation with validation rules
4. **Frontend Integration**: Update frontend to handle validation errors
5. **Add More Requests**: Create Form Requests for remaining operations (Update operations, bulk actions)

---

**Implementation Status**: ✅ Complete (13 Form Request classes)

**Last Updated**: 2024-02-01
