# Repository Pattern Implementation - HR Module

## Overview

This document provides comprehensive documentation for the Repository Pattern implementation in the HR module. The repository pattern abstracts database queries from controllers and services, providing a clean separation between business logic and data access logic.

## Architecture

```
Controller → Service → Repository → Model → Database
```

### Benefits

1. **Separation of Concerns**: Database queries are isolated from business logic
2. **Testability**: Repositories can be easily mocked in tests
3. **Reusability**: Common queries defined once, used everywhere
4. **Maintainability**: Changes to data access logic are centralized
5. **Multi-tenancy Support**: Shop isolation can be enforced at repository level

## Directory Structure

```
app/
└── Repositories/
    └── HR/
        ├── BaseRepository.php
        ├── EmployeeRepository.php
        ├── LeaveRepository.php
        ├── TrainingRepository.php
        ├── AttendanceRepository.php
        └── PayrollRepository.php
```

## BaseRepository

### Purpose

Abstract base class providing common CRUD operations for all HR repositories.

### Features

- Type-safe CRUD operations
- Query builder abstraction
- Relationship eager loading
- Pagination support
- Existence checking
- Model management

### Common Methods

| Method | Description | Return Type |
|--------|-------------|-------------|
| `all($columns)` | Get all records | Collection |
| `paginate($perPage, $columns)` | Get paginated records | LengthAwarePaginator |
| `find($id, $columns)` | Find by ID | ?Model |
| `findOrFail($id, $columns)` | Find or throw exception | Model |
| `findBy($column, $value)` | Find by column | ?Model |
| `getAllBy($column, $value)` | Get all by column | Collection |
| `create($attributes)` | Create record | Model |
| `update($id, $attributes)` | Update record | bool |
| `delete($id)` | Delete record | ?bool |
| `count($where)` | Count records | int |
| `exists($where)` | Check existence | bool |
| `with($relations)` | Eager load relationships | Collection |
| `withPaginate($relations, $perPage)` | Paginate with relationships | LengthAwarePaginator |

### Usage Example

```php
// All repositories extend BaseRepository
class EmployeeRepository extends BaseRepository
{
    public function __construct(Employee $model)
    {
        $this->model = $model;
    }
    
    // Inherits all base methods
    // Add domain-specific methods below
}
```

---

## EmployeeRepository

### Purpose

Handles all employee-related database queries.

### Key Methods

#### 1. `findActiveByShop(int $shopOwnerId, array $with = []): Collection`

Get active employees for a specific shop.

```php
$employees = $repository->findActiveByShop($shopId, ['department', 'leaveBalances']);
```

#### 2. `getShopEmployees(int $shopOwnerId, array $filters = [], int $perPage = 15): LengthAwarePaginator`

Get employees with pagination and filters.

**Supported Filters:**
- `status`: Filter by employee status (active, suspended)
- `department_id`: Filter by department
- `search`: Search by name, email, or employee_id
- `order_by`: Sort column (default: created_at)
- `order_direction`: Sort direction (default: desc)
- `with`: Relationships to eager load

```php
$employees = $repository->getShopEmployees($shopId, [
    'status' => 'active',
    'department_id' => 5,
    'search' => 'John',
    'order_by' => 'first_name',
    'with' => ['department', 'leaveBalances']
], 20);
```

#### 3. `findByEmployeeId(string $employeeId, int $shopOwnerId): ?Employee`

Find employee by their unique employee ID (not database ID).

```php
$employee = $repository->findByEmployeeId('EMP-001', $shopId);
```

#### 4. `findByEmail(string $email, int $shopOwnerId): ?Employee`

Find employee by email address.

```php
$employee = $repository->findByEmail('john@example.com', $shopId);
```

#### 5. `getStatistics(int $shopOwnerId): array`

Get employee count statistics.

**Returns:**
```php
[
    'total' => 50,
    'active' => 45,
    'suspended' => 5,
    'by_department' => [
        ['department' => 'IT', 'count' => 15],
        ['department' => 'HR', 'count' => 10],
        // ...
    ]
]
```

#### 6. `suspend(int $id, int $shopOwnerId): bool`

Suspend an employee.

```php
$repository->suspend($employeeId, $shopId);
```

#### 7. `activate(int $id, int $shopOwnerId): bool`

Activate a suspended employee.

```php
$repository->activate($employeeId, $shopId);
```

#### 8. `getUpcomingBirthdays(int $shopOwnerId, int $daysAhead = 30): Collection`

Get employees with birthdays in the next N days.

```php
$birthdays = $repository->getUpcomingBirthdays($shopId, 7); // Next 7 days
```

#### 9. `getProbationEnding(int $shopOwnerId, int $daysAhead = 30): Collection`

Get employees whose probation period is ending soon.

```php
$probationEnding = $repository->getProbationEnding($shopId, 14);
```

#### 10. `isEmployeeIdUnique(string $employeeId, int $shopOwnerId, ?int $excludeId = null): bool`

Check if employee ID is unique within shop.

```php
$isUnique = $repository->isEmployeeIdUnique('EMP-001', $shopId, $existingEmployeeId);
```

---

## LeaveRepository

### Purpose

Handles all leave request and leave balance queries.

### Models Managed

1. `LeaveRequest` - Leave applications
2. `LeaveBalance` - Employee leave balances

### Key Methods

#### Leave Request Methods

##### 1. `getShopLeaveRequests(int $shopOwnerId, array $filters = [], int $perPage = 15): LengthAwarePaginator`

Get leave requests with pagination and filters.

**Supported Filters:**
- `status`: pending, approved, rejected, cancelled
- `employee_id`: Filter by employee
- `leave_type`: annual, sick, casual, etc.
- `start_date`: From date
- `end_date`: To date
- `with`: Relationships to load
- `order_by`: Sort column
- `order_direction`: Sort direction

```php
$leaves = $repository->getShopLeaveRequests($shopId, [
    'status' => 'pending',
    'leave_type' => 'annual',
    'start_date' => '2024-01-01'
]);
```

##### 2. `getPendingRequests(int $shopOwnerId): Collection`

Get all pending leave requests for approval.

```php
$pendingLeaves = $repository->getPendingRequests($shopId);
```

##### 3. `getOverlappingLeaves(int $employeeId, Carbon $startDate, Carbon $endDate, ?int $excludeId = null): Collection`

Check for overlapping leave requests.

```php
$overlapping = $repository->getOverlappingLeaves(
    $employeeId,
    Carbon::parse('2024-01-10'),
    Carbon::parse('2024-01-15'),
    $currentRequestId // Exclude current request when updating
);
```

##### 4. `approveLeave(int $id, int $approverId, ?string $remarks = null): bool`

Approve a leave request.

```php
$repository->approveLeave($leaveId, $approverId, 'Approved for vacation');
```

##### 5. `rejectLeave(int $id, int $approverId, ?string $remarks = null): bool`

Reject a leave request.

```php
$repository->rejectLeave($leaveId, $approverId, 'Insufficient staff coverage');
```

##### 6. `cancelLeave(int $id, ?string $reason = null): bool`

Cancel a leave request.

```php
$repository->cancelLeave($leaveId, 'Employee requested cancellation');
```

##### 7. `getLeaveStatistics(int $shopOwnerId, ?int $year = null): array`

Get leave statistics for shop.

**Returns:**
```php
[
    'total' => 150,
    'pending' => 10,
    'approved' => 120,
    'rejected' => 20,
    'by_type' => [
        'annual' => 80,
        'sick' => 40,
        'casual' => 30
    ]
]
```

#### Leave Balance Methods

##### 8. `getLeaveBalance(int $employeeId, string $leaveType, int $year): ?LeaveBalance`

Get leave balance for employee.

```php
$balance = $repository->getLeaveBalance($employeeId, 'annual', 2024);
```

##### 9. `getEmployeeLeaveBalances(int $employeeId, int $year): Collection`

Get all leave balances for employee in a year.

```php
$balances = $repository->getEmployeeLeaveBalances($employeeId, 2024);
```

##### 10. `upsertLeaveBalance(int $employeeId, string $leaveType, int $year, array $data): LeaveBalance`

Create or update leave balance.

```php
$balance = $repository->upsertLeaveBalance($employeeId, 'annual', 2024, [
    'allocated_days' => 15,
    'used_days' => 5
]);
```

##### 11. `incrementUsedDays(int $employeeId, string $leaveType, int $year, float $days): bool`

Increment used leave days (when leave is approved).

```php
$repository->incrementUsedDays($employeeId, 'annual', 2024, 3.5);
```

##### 12. `decrementUsedDays(int $employeeId, string $leaveType, int $year, float $days): bool`

Decrement used days (when leave is cancelled).

```php
$repository->decrementUsedDays($employeeId, 'annual', 2024, 3.5);
```

##### 13. `initializeEmployeeBalances(int $employeeId, int $shopOwnerId, int $year): Collection`

Initialize leave balances for new employee.

```php
$balances = $repository->initializeEmployeeBalances($employeeId, $shopId, 2024);
// Creates balances for: annual, sick, casual, maternity, paternity
```

---

## TrainingRepository

### Purpose

Handles training programs, enrollments, and certifications.

### Models Managed

1. `TrainingProgram` - Training programs
2. `TrainingEnrollment` - Employee enrollments
3. `Certification` - Employee certifications

### Key Methods

#### Training Program Methods

##### 1. `getShopPrograms(int $shopOwnerId, array $filters = [], int $perPage = 15): LengthAwarePaginator`

Get training programs with pagination and filters.

**Supported Filters:**
- `status`: active, completed, scheduled
- `type`: Training type
- `search`: Search title/description
- `with`: Relationships
- `order_by`: Sort column
- `order_direction`: Sort direction

```php
$programs = $repository->getShopPrograms($shopId, [
    'status' => 'active',
    'type' => 'technical',
    'search' => 'Laravel'
]);
```

##### 2. `getActivePrograms(int $shopOwnerId): Collection`

Get currently active training programs.

```php
$activePrograms = $repository->getActivePrograms($shopId);
```

##### 3. `getUpcomingPrograms(int $shopOwnerId, int $daysAhead = 30): Collection`

Get scheduled programs starting within N days.

```php
$upcoming = $repository->getUpcomingPrograms($shopId, 7);
```

##### 4. `getTrainingStatistics(int $shopOwnerId, ?int $year = null): array`

Get training statistics.

**Returns:**
```php
[
    'total' => 25,
    'active' => 5,
    'completed' => 15,
    'scheduled' => 5,
    'by_type' => [
        'technical' => 10,
        'soft_skills' => 8,
        'compliance' => 7
    ]
]
```

#### Training Enrollment Methods

##### 5. `getProgramEnrollments(int $programId): Collection`

Get all enrollments for a training program.

```php
$enrollments = $repository->getProgramEnrollments($programId);
```

##### 6. `getEmployeeEnrollments(int $employeeId, array $filters = []): Collection`

Get employee's training enrollments.

**Supported Filters:**
- `status`: enrolled, in_progress, completed
- `year`: Filter by year

```php
$enrollments = $repository->getEmployeeEnrollments($employeeId, [
    'status' => 'completed',
    'year' => 2024
]);
```

##### 7. `enrollEmployee(int $programId, int $employeeId, array $additionalData = []): TrainingEnrollment`

Enroll employee in training program.

```php
$enrollment = $repository->enrollEmployee($programId, $employeeId, [
    'enrolled_by' => $managerId,
    'notes' => 'Mandatory training'
]);
```

##### 8. `completeEnrollment(int $enrollmentId, ?float $score = null, ?string $feedback = null): bool`

Mark enrollment as completed.

```php
$repository->completeEnrollment($enrollmentId, 85.5, 'Excellent performance');
```

##### 9. `getProgramCompletionStats(int $programId): array`

Get completion statistics for program.

**Returns:**
```php
[
    'total_enrolled' => 20,
    'completed' => 15,
    'in_progress' => 5,
    'completion_rate' => 75.00
]
```

#### Certification Methods

##### 10. `getEmployeeCertifications(int $employeeId, array $filters = []): Collection`

Get employee's certifications.

**Supported Filters:**
- `status`: active, expired
- `expiring`: Days ahead for expiring filter

```php
$certs = $repository->getEmployeeCertifications($employeeId, [
    'status' => 'active',
    'expiring' => 30 // Expiring in next 30 days
]);
```

##### 11. `getExpiringCertificates(int $shopOwnerId, int $daysAhead = 30): Collection`

Get certifications expiring soon.

```php
$expiring = $repository->getExpiringCertificates($shopId, 90);
```

##### 12. `createCertification(array $data): Certification`

Create new certification.

```php
$cert = $repository->createCertification([
    'employee_id' => $employeeId,
    'certification_name' => 'AWS Solutions Architect',
    'issue_date' => now(),
    'expiry_date' => now()->addYears(3),
    'issuing_authority' => 'Amazon Web Services'
]);
```

##### 13. `renewCertification(int $certificationId, Carbon $newExpiryDate): bool`

Renew an expiring or expired certification.

```php
$repository->renewCertification($certId, Carbon::now()->addYears(3));
```

---

## AttendanceRepository

### Purpose

Handles employee attendance tracking and reporting.

### Key Methods

#### 1. `getShopAttendance(int $shopOwnerId, array $filters = [], int $perPage = 15): LengthAwarePaginator`

Get attendance records with pagination and filters.

**Supported Filters:**
- `employee_id`: Filter by employee
- `status`: present, absent, late, on_leave
- `date`: Specific date
- `start_date`: From date
- `end_date`: To date
- `with`: Relationships
- `order_by`: Sort column
- `order_direction`: Sort direction

```php
$attendance = $repository->getShopAttendance($shopId, [
    'status' => 'late',
    'start_date' => '2024-01-01',
    'end_date' => '2024-01-31'
]);
```

#### 2. `getTodaysAttendance(int $shopOwnerId): Collection`

Get today's attendance for all employees.

```php
$today = $repository->getTodaysAttendance($shopId);
```

#### 3. `getEmployeeAttendance(int $employeeId, Carbon $startDate, Carbon $endDate): Collection`

Get employee's attendance for date range.

```php
$attendance = $repository->getEmployeeAttendance(
    $employeeId,
    Carbon::parse('2024-01-01'),
    Carbon::parse('2024-01-31')
);
```

#### 4. `getMonthlyAttendance(int $employeeId, int $year, int $month): Collection`

Get employee's monthly attendance.

```php
$monthly = $repository->getMonthlyAttendance($employeeId, 2024, 1);
```

#### 5. `hasCheckedInToday(int $employeeId): bool`

Check if employee has checked in today.

```php
if ($repository->hasCheckedInToday($employeeId)) {
    // Already checked in
}
```

#### 6. `getLateArrivals(int $shopOwnerId, Carbon $date, string $lateThreshold = '09:00:00'): Collection`

Get employees who arrived late on a specific date.

```php
$lateEmployees = $repository->getLateArrivals($shopId, Carbon::today(), '09:00:00');
```

#### 7. `getAbsentEmployees(int $shopOwnerId, Carbon $date): Collection`

Get absent employees for a date.

```php
$absent = $repository->getAbsentEmployees($shopId, Carbon::today());
```

#### 8. `getCurrentlyCheckedIn(int $shopOwnerId): Collection`

Get employees currently at work (checked in but not out).

```php
$atWork = $repository->getCurrentlyCheckedIn($shopId);
```

#### 9. `checkIn(int $employeeId, int $shopOwnerId, ?Carbon $checkInTime = null): Attendance`

Record employee check-in.

```php
$attendance = $repository->checkIn($employeeId, $shopId);
// Or with custom time:
$attendance = $repository->checkIn($employeeId, $shopId, Carbon::parse('08:30:00'));
```

#### 10. `checkOut(int $employeeId, ?Carbon $checkOutTime = null): bool`

Record employee check-out (calculates working hours automatically).

```php
$repository->checkOut($employeeId);
// Or with custom time:
$repository->checkOut($employeeId, Carbon::parse('17:30:00'));
```

#### 11. `getAttendanceStatistics(int $shopOwnerId, Carbon $startDate, Carbon $endDate): array`

Get attendance statistics for period.

**Returns:**
```php
[
    'total_records' => 500,
    'present' => 450,
    'absent' => 30,
    'late' => 15,
    'on_leave' => 5,
    'attendance_rate' => 90.00
]
```

#### 12. `getEmployeeAttendanceSummary(int $employeeId, Carbon $startDate, Carbon $endDate): array`

Get employee's attendance summary.

**Returns:**
```php
[
    'total_days' => 22,
    'present_days' => 20,
    'absent_days' => 1,
    'late_days' => 1,
    'leave_days' => 0,
    'total_working_hours' => 176.50,
    'average_working_hours' => 8.02,
    'attendance_rate' => 90.91
]
```

---

## PayrollRepository

### Purpose

Handles payroll processing and salary calculations.

### Key Methods

#### 1. `getShopPayrolls(int $shopOwnerId, array $filters = [], int $perPage = 15): LengthAwarePaginator`

Get payroll records with pagination and filters.

**Supported Filters:**
- `employee_id`: Filter by employee
- `status`: pending, processed, paid
- `month`: Pay period month
- `year`: Pay period year
- `payment_method`: bank_transfer, cash, cheque
- `with`: Relationships
- `order_by`: Sort column
- `order_direction`: Sort direction

```php
$payrolls = $repository->getShopPayrolls($shopId, [
    'status' => 'pending',
    'month' => 'January',
    'year' => 2024
]);
```

#### 2. `getPayrollsByMonth(int $shopOwnerId, string $month, int $year): Collection`

Get all payrolls for specific month/year.

```php
$payrolls = $repository->getPayrollsByMonth($shopId, 'January', 2024);
```

#### 3. `getPendingPayrolls(int $shopOwnerId): Collection`

Get payrolls pending approval/processing.

```php
$pending = $repository->getPendingPayrolls($shopId);
```

#### 4. `getEmployeePayrollHistory(int $employeeId, int $limit = 12): Collection`

Get employee's payroll history.

```php
$history = $repository->getEmployeePayrollHistory($employeeId, 6); // Last 6 months
```

#### 5. `getPayrollStatistics(int $shopOwnerId, ?int $year = null): array`

Get payroll statistics.

**Returns:**
```php
[
    'total' => 240,
    'pending' => 10,
    'processed' => 230,
    'total_gross_pay' => 1500000.00,
    'total_net_pay' => 1350000.00,
    'total_deductions' => 150000.00,
    'by_month' => [...]
]
```

#### 6. `getMonthlyPayrollSummary(int $shopOwnerId, string $month, int $year): array`

Get comprehensive monthly payroll summary.

**Returns:**
```php
[
    'month' => 'January',
    'year' => 2024,
    'total_employees' => 20,
    'total_gross_pay' => 125000.00,
    'total_net_pay' => 112500.00,
    'total_deductions' => 12500.00,
    'total_bonuses' => 5000.00,
    'total_overtime' => 2000.00,
    'processed_count' => 18,
    'pending_count' => 2
]
```

#### 7. `markAsProcessed(int $payrollId, array $additionalData = []): bool`

Mark payroll as processed.

```php
$repository->markAsProcessed($payrollId, [
    'processed_by' => $userId,
    'processing_notes' => 'Verified and approved'
]);
```

#### 8. `markAsPaid(int $payrollId, string $paymentMethod, ?string $transactionRef = null): bool`

Mark payroll as paid.

```php
$repository->markAsPaid($payrollId, 'bank_transfer', 'TXN-2024-001');
```

#### 9. `bulkCreatePayrolls(array $payrollData): bool`

Create multiple payroll records at once.

```php
$payrollData = [
    [
        'employee_id' => 1,
        'shop_owner_id' => $shopId,
        'gross_salary' => 5000,
        'net_salary' => 4500,
        // ...
    ],
    // ... more payrolls
];
$repository->bulkCreatePayrolls($payrollData);
```

#### 10. `getPayrollCostTrends(int $shopOwnerId, int $year): Collection`

Get payroll cost trends by month.

```php
$trends = $repository->getPayrollCostTrends($shopId, 2024);
```

#### 11. `getDeductionsBreakdown(int $shopOwnerId, string $month, int $year): array`

Get detailed deductions breakdown.

**Returns:**
```php
[
    'tax_deductions' => 5000.00,
    'insurance_deductions' => 2000.00,
    'pension_deductions' => 1500.00,
    'other_deductions' => 500.00,
    'total_deductions' => 9000.00
]
```

---

## Integration with Services

### Before (Direct Model Access)

```php
class PayrollService
{
    public function getMonthlyPayrolls($shopId, $month, $year)
    {
        return Payroll::where('shop_owner_id', $shopId)
            ->where('pay_period_month', $month)
            ->where('pay_period_year', $year)
            ->with('employee')
            ->get();
    }
}
```

### After (Using Repository)

```php
class PayrollService
{
    protected PayrollRepository $payrollRepository;
    
    public function __construct(PayrollRepository $payrollRepository)
    {
        $this->payrollRepository = $payrollRepository;
    }
    
    public function getMonthlyPayrolls($shopId, $month, $year)
    {
        return $this->payrollRepository->getPayrollsByMonth($shopId, $month, $year);
    }
}
```

## Testing Repositories

### Unit Test Example

```php
use Tests\TestCase;
use App\Repositories\HR\EmployeeRepository;
use App\Models\Employee;

class EmployeeRepositoryTest extends TestCase
{
    protected EmployeeRepository $repository;
    
    protected function setUp(): void
    {
        parent::setUp();
        $this->repository = new EmployeeRepository(new Employee());
    }
    
    public function test_finds_active_employees_by_shop()
    {
        $shopId = 1;
        $employees = $this->repository->findActiveByShop($shopId);
        
        $this->assertInstanceOf(Collection::class, $employees);
        $this->assertTrue($employees->every(fn($e) => $e->status === 'active'));
        $this->assertTrue($employees->every(fn($e) => $e->shop_owner_id === $shopId));
    }
    
    public function test_employee_id_uniqueness_check()
    {
        $employeeId = 'EMP-001';
        $shopId = 1;
        
        $isUnique = $this->repository->isEmployeeIdUnique($employeeId, $shopId);
        
        $this->assertIsBool($isUnique);
    }
}
```

### Mocking Repositories in Service Tests

```php
use Mockery;
use App\Repositories\HR\EmployeeRepository;
use App\Services\HR\EmployeeService;

public function test_service_gets_active_employees()
{
    // Mock the repository
    $mockRepo = Mockery::mock(EmployeeRepository::class);
    $mockRepo->shouldReceive('findActiveByShop')
        ->once()
        ->with(1)
        ->andReturn(collect([/* mock data */]));
    
    // Inject mock into service
    $service = new EmployeeService($mockRepo);
    
    $result = $service->getActiveEmployees(1);
    
    $this->assertNotNull($result);
}
```

## Best Practices

### 1. Always Use Shop Filtering

```php
// ✅ Good - Includes shop filtering
public function findByEmail(string $email, int $shopOwnerId): ?Employee
{
    return $this->model->where('email', $email)
        ->where('shop_owner_id', $shopOwnerId)
        ->first();
}

// ❌ Bad - No shop filtering (multi-tenancy violation)
public function findByEmail(string $email): ?Employee
{
    return $this->model->where('email', $email)->first();
}
```

### 2. Use Type Hints

```php
// ✅ Good - Type hints for parameters and return
public function getActivePrograms(int $shopOwnerId): Collection
{
    // ...
}

// ❌ Bad - No type hints
public function getActivePrograms($shopOwnerId)
{
    // ...
}
```

### 3. Provide Flexible Filtering

```php
// ✅ Good - Accepts filters array
public function getShopEmployees(int $shopOwnerId, array $filters = [], int $perPage = 15)
{
    $query = $this->model->where('shop_owner_id', $shopOwnerId);
    
    if (isset($filters['status'])) {
        $query->where('status', $filters['status']);
    }
    
    // ... more filters
}
```

### 4. Keep Business Logic in Services

```php
// ✅ Repository - Simple query
public function getPendingLeaves(int $shopId): Collection
{
    return $this->model->where('shop_owner_id', $shopId)
        ->where('status', 'pending')
        ->get();
}

// ✅ Service - Business logic
public function approveLeaveRequest(int $leaveId, int $approverId)
{
    DB::beginTransaction();
    try {
        // Get leave request
        $leave = $this->leaveRepository->find($leaveId);
        
        // Business rules
        if ($leave->status !== 'pending') {
            throw new \Exception('Can only approve pending leaves');
        }
        
        // Check leave balance
        $balance = $this->leaveRepository->getLeaveBalance(...);
        if ($balance->remaining < $leave->days) {
            throw new \Exception('Insufficient leave balance');
        }
        
        // Approve and update balance
        $this->leaveRepository->approveLeave($leaveId, $approverId);
        $this->leaveRepository->incrementUsedDays(...);
        
        DB::commit();
        return true;
    } catch (\Exception $e) {
        DB::rollBack();
        throw $e;
    }
}
```

### 5. Use Query Scopes Wisely

```php
// Instead of repeating common query patterns, consider model scopes:

// In Employee model:
public function scopeActive($query)
{
    return $query->where('status', 'active');
}

// In Repository:
public function findActiveByShop(int $shopOwnerId): Collection
{
    return $this->model->active()
        ->where('shop_owner_id', $shopOwnerId)
        ->get();
}
```

## Next Steps

1. **Refactor Services**: Update existing services to use repositories instead of direct model access
2. **Add Repository Interfaces**: Create interfaces for better dependency injection
3. **Register in Service Provider**: Bind repositories in IoC container
4. **Write Tests**: Add comprehensive unit tests for all repositories
5. **Update Controllers**: Ensure controllers use services (which use repositories)

## Related Documentation

- [SERVICE_LAYER_IMPLEMENTATION.md](SERVICE_LAYER_IMPLEMENTATION.md) - Service layer documentation
- [HR_MODULE_COMPREHENSIVE_ANALYSIS.md](HR_MODULE_COMPREHENSIVE_ANALYSIS.md) - Overall HR module analysis
- [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md) - Database structure reference

---

**Implementation Status**: ✅ Complete (5/5 repositories implemented)

**Last Updated**: 2024-02-01
