# 👥 HR MODULE - COMPLETE WORKFLOW GUIDE

**Author:** AI Assistant  
**Date:** January 31, 2026  
**Purpose:** Comprehensive explanation of HR Module architecture and workflows

---

## 📚 TABLE OF CONTENTS

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Complete Workflows](#workflows)
4. [Authentication & Security](#security)
5. [React Query Optimization](#optimization)
6. [User Scenarios](#scenarios)
7. [Troubleshooting](#troubleshooting)
8. [Presentation Script](#script)

---

<a name="overview"></a>
## 🎯 1. OVERVIEW

### What is the HR Module?

The HR Module is a **complete human resources management system** integrated into the ERP platform. It handles:

- ✅ **Employee Management** - Create, update, track employee records and profiles
- ✅ **Attendance Tracking** - View attendance records and patterns
- ✅ **Leave Management** - Submit, approve, and track leave requests
- ✅ **Payroll Management** - Generate and view pay slips
- ✅ **Performance Reviews** - Conduct and track employee performance evaluations
- ✅ **Dashboard Overview** - HR metrics, KPIs, and analytics
- ✅ **Department Management** - Organize employees by departments and positions
- ✅ **Approval Workflow** - Multi-level approval for leave requests

### Key Benefits

1. **Centralized Employee Data** - Single source of truth for all employee information
2. **Automated Leave Tracking** - Streamlined leave request and approval process
3. **Role-Based Access** - HR Staff access with proper permissions
4. **Multi-Tenant Support** - Each shop owner has isolated employee data
5. **Real-time Updates** - Instant synchronization across all HR modules
6. **Performance Monitoring** - Track attendance patterns and performance metrics

---

<a name="architecture"></a>
## 🏗️ 2. ARCHITECTURE

### Technology Stack

```
┌─────────────────────────────────────────────────────┐
│  FRONTEND                                            │
│  - React 18 + TypeScript                            │
│  - Inertia.js (SPA with Laravel backend)            │
│  - TanStack React Query v4 (State + Cache)          │
│  - TailwindCSS (Styling)                            │
│  - ApexCharts (Analytics & Visualization)           │
└──────────────────┬──────────────────────────────────┘
                   │
                   │ HTTP/JSON API
                   │
┌──────────────────▼──────────────────────────────────┐
│  BACKEND                                             │
│  - Laravel 10 PHP Framework                          │
│  - MySQL Database                                    │
│  - Laravel Guards (auth:user)                        │
│  - Middleware (role=HR, shop.isolation)              │
└──────────────────┬──────────────────────────────────┘
                   │
                   │ Eloquent ORM
                   │
┌──────────────────▼──────────────────────────────────┐
│  DATABASE                                            │
│  - employees                                         │
│  - attendance_records                                │
│  - leave_requests                                    │
│  - payrolls                                         │
│  - performance_reviews                               │
│  - departments                                       │
│  - positions                                        │
└──────────────────────────────────────────────────────┘
```

### Frontend Components

**Location:** `resources/js/components/ERP/HR/`

| Component | Purpose | Key Features |
|-----------|---------|--------------|
| `HR.tsx` | Main HR module container | Route management, section navigation |
| `overview.tsx` | HR dashboard | KPIs, metrics, charts, quick stats |
| `employee.tsx` | Employee management | Create, edit, view, suspend employees |
| `leaveRequests.tsx` | Leave management | Submit, approve, track leave requests |
| `viewAttendance.tsx` | Attendance tracking | View attendance records and patterns |
| `generateSlip.tsx` | Payroll generation | Generate pay slips for employees |
| `viewSlip.tsx` | Payroll viewing | View generated pay slips |
| `performance.tsx` | Performance reviews | Conduct and track performance evaluations |

### Backend Controllers

**Location:** `app/Http/Controllers/`

| Controller | Purpose | Key Methods |
|------------|---------|-------------|
| `EmployeeController.php` | Employee CRUD | index, store, show, update, destroy, suspend |
| `AttendanceController.php` | Attendance tracking | index, store, show, bulkUpdate |
| `LeaveController.php` | Leave management | index, store, approve, reject |
| `PayrollController.php` | Payroll processing | index, generate, show, process |
| `PerformanceController.php` | Performance reviews | index, store, show, update |
| `DepartmentController.php` | Department management | index, store, update, destroy |

### Database Schema

**Key Tables:**

```sql
-- Employees
employees
├── id (PK)
├── firstName
├── lastName
├── email (unique)
├── phone
├── position
├── department
├── hireDate
├── status (active, inactive, on-leave, suspended)
├── salary
├── address, city, state, zipCode
├── emergencyContact, emergencyPhone
├── shop_owner_id (tenant isolation)
├── created_at, updated_at

-- Attendance Records
attendance_records
├── id (PK)
├── employee_id (FK)
├── date
├── checkInTime
├── checkOutTime
├── status (present, absent, late, half-day)
├── biometricId
├── notes
├── shop_owner_id

-- Leave Requests
leave_requests
├── id (PK)
├── employee_id (FK)
├── leaveType (vacation, sick, personal, maternity, paternity, unpaid)
├── startDate, endDate, noOfDays
├── reason
├── status (pending, approved, rejected)
├── approvedBy (FK to users)
├── approvalDate, rejectionReason
├── shop_owner_id

-- Payroll
payrolls
├── id (PK)
├── employee_id (FK)
├── payrollPeriod
├── baseSalary, allowances, deductions, netSalary
├── status (pending, processed, paid)
├── paymentDate, paymentMethod
├── shop_owner_id

-- Performance Reviews
performance_reviews
├── id (PK)
├── employee_id (FK)
├── reviewerName
├── reviewDate, reviewPeriod
├── rating, communication, teamwork, reliability, productivity
├── comments, goals, improvementAreas
├── status (draft, submitted, completed)
├── shop_owner_id
```

---

<a name="workflows"></a>
## 🔄 3. COMPLETE WORKFLOWS

### A. EMPLOYEE ONBOARDING WORKFLOW 👤

**Scenario:** New employee joins the company

#### Step 1: Create Employee Profile

**Frontend:** `employee.tsx`

```typescript
// HR staff fills employee form
{
  firstName: "Juan",
  lastName: "Dela Cruz",
  email: "juan.delacruz@company.com",
  phone: "09123456789",
  position: "Software Developer",
  department: "Engineering",
  hireDate: "2026-02-01",
  salary: 45000,
  address: "123 Main St",
  city: "Manila",
  state: "Metro Manila",
  zipCode: "1000",
  emergencyContact: "Maria Dela Cruz",
  emergencyPhone: "09987654321"
}
```

**Backend:** `EmployeeController@store`

```php
// Creates employee record
$employee = Employee::create([
    'firstName' => 'Juan',
    'lastName' => 'Dela Cruz',
    'email' => 'juan.delacruz@company.com',
    'status' => 'active',
    'shop_owner_id' => $shopOwnerId,
    'created_by' => Auth::id()
]);
```

**Database:**
```
employees: 1 record (status=active)
```

#### Step 2: Set Up Department & Position

**Frontend:** Department assignment during employee creation

**Backend:** Links employee to existing department or creates new one

```php
$department = Department::firstOrCreate([
    'name' => 'Engineering',
    'shop_owner_id' => $shopOwnerId
]);

$employee->update(['department' => $department->name]);
```

#### Step 3: Initialize Leave Balance

**Backend:** Create initial leave balance for new employee

```php
LeaveBalance::create([
    'employee_id' => $employee->id,
    'vacation' => 15, // 15 days vacation leave
    'sick' => 10,     // 10 days sick leave
    'personal' => 5,  // 5 days personal leave
    'year' => date('Y')
]);
```

**Frontend Updates (React Query):**

```typescript
// Automatic cache invalidation
queryClient.invalidateQueries(['hr', 'employees']);
queryClient.invalidateQueries(['hr', 'departments']);
// UI refreshes automatically showing new employee
```

---

### B. LEAVE REQUEST WORKFLOW 🏖️

**Scenario:** Employee submits leave request

#### Step 1: Submit Leave Request

**Frontend:** `leaveRequests.tsx`

```typescript
// Employee fills leave request form
{
  employeeId: "12",
  leaveType: "vacation",
  startDate: "2026-03-15",
  endDate: "2026-03-20",
  noOfDays: 6,
  reason: "Family vacation to Boracay"
}
```

**Backend:** `LeaveController@store`

```php
// Validate leave balance
$leaveBalance = LeaveBalance::where('employee_id', $employeeId)
    ->where('year', date('Y'))
    ->first();

if ($leaveBalance->vacation < $noOfDays) {
    return response()->json(['error' => 'Insufficient leave balance'], 400);
}

// Create leave request
$leaveRequest = LeaveRequest::create([
    'employee_id' => $employeeId,
    'leave_type' => 'vacation',
    'start_date' => '2026-03-15',
    'end_date' => '2026-03-20',
    'no_of_days' => 6,
    'reason' => 'Family vacation to Boracay',
    'status' => 'pending',
    'shop_owner_id' => $shopOwnerId
]);
```

**Database:**
```
leave_requests: 1 record (status=pending)
```

#### Step 2: HR Review & Approval

**Frontend:** `leaveRequests.tsx` - HR sees pending requests

```typescript
// Displays leave request in pending table
{
  id: 1,
  employeeName: "Juan Dela Cruz",
  department: "Engineering",
  leaveType: "vacation",
  startDate: "2026-03-15",
  endDate: "2026-03-20",
  noOfDays: 6,
  status: "pending"
}

// HR clicks "Approve" or "Reject"
```

**Backend:** `LeaveController@approve`

```php
public function approve(Request $request, $id) {
    $user = Auth::guard('user')->user();
    
    // Verify HR role
    if ($user->role !== 'HR') {
        return response()->json(['error' => 'Unauthorized'], 403);
    }
    
    $leaveRequest = LeaveRequest::findOrFail($id);
    
    // Update leave request
    $leaveRequest->update([
        'status' => 'approved',
        'approved_by' => $user->id,
        'approval_date' => now()
    ]);
    
    // Deduct from leave balance
    $leaveBalance = LeaveBalance::where('employee_id', $leaveRequest->employee_id)
        ->where('year', date('Y'))
        ->first();
        
    $leaveBalance->decrement($leaveRequest->leave_type, $leaveRequest->no_of_days);
    
    // Send notification email
    Mail::to($leaveRequest->employee->email)->send(new LeaveApprovedEmail($leaveRequest));
    
    return response()->json(['message' => 'Leave request approved']);
}
```

**Database:**
```
leave_requests: status updated to 'approved'
leave_balances: vacation balance decreased by 6
```

**Frontend Updates:**

```typescript
// Cache invalidation triggers UI update
queryClient.invalidateQueries(['hr', 'leaveRequests']);
queryClient.invalidateQueries(['hr', 'leaveBalance']);
// Pending request moves to approved tab
```

---

### C. PAYROLL GENERATION WORKFLOW 💰

**Scenario:** Generate monthly payroll for employees

#### Step 1: Initiate Payroll Generation

**Frontend:** `generateSlip.tsx`

```typescript
// HR selects payroll period and employees
{
  payrollPeriod: "2026-01",
  employeeIds: [1, 2, 3, 4],
  paymentDate: "2026-01-31",
  paymentMethod: "bank-transfer"
}
```

**Backend:** `PayrollController@generate`

```php
public function generate(Request $request) {
    $payrollPeriod = $request->payrollPeriod;
    $employeeIds = $request->employeeIds;
    
    foreach ($employeeIds as $employeeId) {
        $employee = Employee::findOrFail($employeeId);
        
        // Calculate attendance days
        $workDays = AttendanceRecord::where('employee_id', $employeeId)
            ->where('date', 'like', $payrollPeriod . '%')
            ->where('status', 'present')
            ->count();
            
        // Calculate basic salary (assuming 22 working days per month)
        $dailySalary = $employee->salary / 22;
        $baseSalary = $dailySalary * $workDays;
        
        // Calculate allowances (example: 5000 monthly allowance)
        $allowances = 5000;
        
        // Calculate deductions (example: SSS, PhilHealth, Pag-IBIG, Tax)
        $sss = $baseSalary * 0.045; // 4.5% SSS
        $philHealth = $baseSalary * 0.0175; // 1.75% PhilHealth
        $pagIbig = 200; // Fixed Pag-IBIG
        $tax = $this->calculateTax($baseSalary); // Progressive tax
        $deductions = $sss + $philHealth + $pagIbig + $tax;
        
        // Net salary
        $netSalary = $baseSalary + $allowances - $deductions;
        
        // Create payroll record
        Payroll::create([
            'employee_id' => $employeeId,
            'payroll_period' => $payrollPeriod,
            'base_salary' => $baseSalary,
            'allowances' => $allowances,
            'deductions' => $deductions,
            'net_salary' => $netSalary,
            'status' => 'processed',
            'payment_date' => $request->paymentDate,
            'payment_method' => $request->paymentMethod,
            'shop_owner_id' => $shopOwnerId
        ]);
    }
    
    return response()->json(['message' => 'Payroll generated successfully']);
}
```

**Database:**
```
payrolls: Multiple records created (status=processed)
```

#### Step 2: View Pay Slips

**Frontend:** `viewSlip.tsx`

```typescript
// Displays generated payroll data
{
  employee: "Juan Dela Cruz",
  period: "January 2026",
  baseSalary: 41591.00, // 20 present days * (45000/22)
  allowances: 5000.00,
  deductions: 8234.50,
  netSalary: 38356.50,
  status: "processed"
}
```

#### Step 3: Send Pay Slips

**Backend:** Generate PDF and email pay slips

```php
public function sendPaySlips(Request $request) {
    $payrolls = Payroll::where('payroll_period', $request->period)->get();
    
    foreach ($payrolls as $payroll) {
        // Generate PDF pay slip
        $pdf = PDF::loadView('payroll.slip', compact('payroll'));
        
        // Email to employee
        Mail::to($payroll->employee->email)
            ->send(new PaySlipEmail($payroll, $pdf));
        
        $payroll->update(['status' => 'paid']);
    }
}
```

---

### D. ATTENDANCE TRACKING WORKFLOW ⏰

**Scenario:** Track and manage employee attendance

#### Step 1: View Attendance Records

**Frontend:** `viewAttendance.tsx`

```typescript
// Displays attendance data with filters
{
  employeeName: "Juan Dela Cruz",
  date: "2026-01-31",
  checkIn: "08:00 AM",
  checkOut: "05:00 PM",
  status: "present",
  workingHours: 8
}
```

**Backend:** `AttendanceController@index`

```php
public function index(Request $request) {
    $query = AttendanceRecord::with('employee')
        ->where('shop_owner_id', $shopOwnerId);
        
    // Apply filters
    if ($request->employee_id) {
        $query->where('employee_id', $request->employee_id);
    }
    
    if ($request->date_from && $request->date_to) {
        $query->whereBetween('date', [$request->date_from, $request->date_to]);
    }
    
    $attendance = $query->orderBy('date', 'desc')->paginate(50);
    
    return response()->json($attendance);
}
```

#### Step 2: Attendance Analytics

**Frontend:** Dashboard attendance charts

```typescript
// Attendance statistics display
const attendanceStats = {
  totalEmployees: 25,
  presentToday: 23,
  absentToday: 2,
  lateToday: 3,
  attendanceRate: 92.0
};
```

---

### E. PERFORMANCE REVIEW WORKFLOW 📊

**Scenario:** Conduct employee performance evaluation

#### Step 1: Create Performance Review

**Frontend:** `performance.tsx`

```typescript
// HR creates performance review
{
  employeeId: "12",
  reviewerName: "HR Manager",
  reviewPeriod: "Q1 2026",
  rating: 4,
  communication: 4,
  teamwork: 5,
  reliability: 4,
  productivity: 4,
  comments: "Excellent team player with strong technical skills",
  goals: "Lead a project team in Q2",
  improvementAreas: "Time management"
}
```

**Backend:** `PerformanceController@store`

```php
$performanceReview = PerformanceReview::create([
    'employee_id' => $employeeId,
    'reviewer_name' => 'HR Manager',
    'review_date' => now(),
    'review_period' => 'Q1 2026',
    'rating' => 4,
    'communication' => 4,
    'teamwork' => 5,
    'reliability' => 4,
    'productivity' => 4,
    'comments' => 'Excellent team player with strong technical skills',
    'goals' => 'Lead a project team in Q2',
    'improvement_areas' => 'Time management',
    'status' => 'completed',
    'shop_owner_id' => $shopOwnerId
]);
```

---

<a name="security"></a>
## 🔒 4. AUTHENTICATION & SECURITY

### Role-Based Access Control

```php
// Middleware: CheckHRRole
public function handle($request, Closure $next) {
    $user = Auth::guard('user')->user();
    
    if (!$user || $user->role !== 'HR') {
        return response()->json(['error' => 'HR access required'], 403);
    }
    
    return $next($request);
}
```

### Shop Isolation

```php
// All HR queries include shop_owner_id filter
Employee::where('shop_owner_id', $shopOwnerId)->get();
LeaveRequest::where('shop_owner_id', $shopOwnerId)->get();
Payroll::where('shop_owner_id', $shopOwnerId)->get();
```

### Data Validation

```php
// Employee validation rules
$rules = [
    'firstName' => 'required|string|max:50',
    'lastName' => 'required|string|max:50',
    'email' => 'required|email|unique:employees,email,' . $employee->id,
    'phone' => 'required|string|max:20',
    'salary' => 'required|numeric|min:0',
    'hireDate' => 'required|date'
];
```

---

<a name="optimization"></a>
## ⚡ 5. REACT QUERY OPTIMIZATION

### Query Keys Structure

```typescript
const hrQueryKeys = {
  all: ['hr'] as const,
  employees: () => [...hrQueryKeys.all, 'employees'] as const,
  employee: (id: string) => [...hrQueryKeys.employees(), id] as const,
  leaveRequests: () => [...hrQueryKeys.all, 'leaveRequests'] as const,
  attendance: () => [...hrQueryKeys.all, 'attendance'] as const,
  payroll: () => [...hrQueryKeys.all, 'payroll'] as const,
  performance: () => [...hrQueryKeys.all, 'performance'] as const
};
```

### Caching Strategy

```typescript
// Employee list with 5-minute cache
const { data: employees } = useQuery({
  queryKey: hrQueryKeys.employees(),
  queryFn: () => employeeService.getAll(),
  staleTime: 5 * 60 * 1000, // 5 minutes
  cacheTime: 10 * 60 * 1000  // 10 minutes
});

// Individual employee with longer cache
const { data: employee } = useQuery({
  queryKey: hrQueryKeys.employee(employeeId),
  queryFn: () => employeeService.getById(employeeId),
  staleTime: 10 * 60 * 1000, // 10 minutes
  enabled: !!employeeId
});
```

### Mutation Optimizations

```typescript
const updateEmployeeMutation = useMutation({
  mutationFn: (data: Partial<Employee>) => 
    employeeService.update(employeeId, data),
  onSuccess: () => {
    // Invalidate related queries
    queryClient.invalidateQueries(hrQueryKeys.employees());
    queryClient.invalidateQueries(hrQueryKeys.employee(employeeId));
  }
});
```

---

<a name="scenarios"></a>
## 👥 6. USER SCENARIOS

### Scenario 1: New Employee Onboarding

**User:** HR Manager  
**Goal:** Add new employee to system

1. Navigate to Employee Management
2. Click "Add New Employee"
3. Fill employee details form
4. Upload profile photo (optional)
5. Set department and position
6. Save employee record
7. System automatically creates leave balance

**Expected Result:** Employee appears in employee list, can now submit leave requests

### Scenario 2: Monthly Payroll Processing

**User:** HR Staff  
**Goal:** Generate payroll for all employees

1. Navigate to Payroll → Generate Slip
2. Select payroll period (e.g., "January 2026")
3. Select employees for payroll
4. Review calculated salaries and deductions
5. Generate pay slips
6. Send pay slips via email
7. Mark payroll as processed

**Expected Result:** Employees receive pay slips, payroll records created

### Scenario 3: Leave Request Approval

**User:** HR Manager  
**Goal:** Review and approve employee leave requests

1. Navigate to Leave Management
2. View "Pending Approvals" tab
3. Review leave request details
4. Check employee leave balance
5. Approve or reject with comments
6. System updates leave balance
7. Employee receives notification

**Expected Result:** Leave request processed, leave balance updated

---

<a name="troubleshooting"></a>
## 🔧 7. TROUBLESHOOTING

### Common Issues

#### Issue 1: Employee Not Appearing in List

**Symptoms:** New employee created but not visible
**Solution:**
```typescript
// Check React Query cache
queryClient.invalidateQueries(['hr', 'employees']);
// Verify shop isolation
console.log('Shop Owner ID:', auth.user.shop_owner_id);
```

#### Issue 2: Leave Balance Not Updating

**Symptoms:** Approved leave not deducted from balance
**Solution:**
```php
// Check leave balance calculation
$leaveBalance = LeaveBalance::where('employee_id', $employeeId)->first();
if (!$leaveBalance) {
    // Create initial leave balance
    LeaveBalance::create([...]);
}
```

#### Issue 3: Payroll Calculation Errors

**Symptoms:** Incorrect net salary calculations
**Solution:**
```php
// Debug payroll calculation
Log::info('Payroll Debug', [
    'base_salary' => $baseSalary,
    'allowances' => $allowances,
    'deductions' => $deductions,
    'net_salary' => $netSalary
]);
```

### Performance Issues

#### Slow Employee Loading

```typescript
// Add pagination to employee queries
const { data: employees } = useInfiniteQuery({
  queryKey: ['hr', 'employees', filters],
  queryFn: ({ pageParam = 1 }) => 
    employeeService.getAll({ page: pageParam, ...filters }),
  getNextPageParam: (lastPage) => lastPage.next_page_url ? lastPage.current_page + 1 : undefined
});
```

#### Large Attendance Data

```php
// Add database indexes
Schema::table('attendance_records', function (Blueprint $table) {
    $table->index(['employee_id', 'date']);
    $table->index(['shop_owner_id', 'date']);
});
```

---

<a name="script"></a>
## 🎤 8. PRESENTATION SCRIPT

### Demo Flow (10 minutes)

**1. Overview & Dashboard (2 min)**
"Welcome to the HR Module. Let me show you the dashboard with key HR metrics..."

**2. Employee Management (3 min)**
"Here's how we add new employees and manage their information..."

**3. Leave Management (2 min)**
"Employees can submit leave requests, and HR can approve them with automatic balance tracking..."

**4. Attendance & Payroll (2 min)**
"We can view attendance records and generate payroll with automatic calculations..."

**5. Performance Reviews (1 min)**
"Finally, we can conduct performance reviews and track employee development..."

### Key Talking Points

- **Integrated System:** "Everything is connected - employee data flows seamlessly between modules"
- **Role-Based Access:** "Only HR staff can access employee data, ensuring data security"
- **Real-time Updates:** "Changes are reflected immediately across the system"
- **Automation:** "Leave balances, payroll calculations, and notifications are all automated"

---

## 🚀 CONCLUSION

The HR Module provides a comprehensive solution for human resources management with:

✅ **Complete Employee Lifecycle** - From onboarding to performance reviews  
✅ **Automated Processes** - Leave tracking, payroll generation, approval workflows  
✅ **Real-time Data** - Instant updates and synchronization  
✅ **Security & Isolation** - Role-based access and tenant isolation  
✅ **Performance Optimized** - React Query caching and efficient database queries  

This module empowers HR teams to efficiently manage employees, streamline processes, and make data-driven decisions for organizational growth.

---

**Next Steps:**
1. Review this workflow with HR team
2. Test all scenarios in staging environment
3. Train HR staff on new features
4. Deploy to production with monitoring

**Questions?** Contact the development team for clarification on any workflow or implementation details.