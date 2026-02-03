# HR Module Database Connections
**Last Updated: February 1, 2026**

This document shows the complete mapping between HR pages (controllers), models, and database tables.

---

## 📊 Complete Connection Map

### 1. Employee Management
- **Controller**: `app/Http/Controllers/Erp/HR/EmployeeController.php`
- **Models**: 
  - `App\Models\Employee` → **employees** table
  - `App\Models\HR\LeaveBalance` → **leave_balances** table
  - `App\Models\HR\AuditLog` → **hr_audit_logs** table
- **Frontend**: `resources/js/components/ERP/HR/employee.tsx`
- **Routes**: `/api/hr/employees/*`

### 2. Attendance Management
- **Controller**: `app/Http/Controllers/Erp/HR/AttendanceController.php`
- **Models**:
  - `App\Models\HR\AttendanceRecord` → **attendance_records** table ✅
  - `App\Models\Employee` → **employees** table
  - `App\Models\HR\AuditLog` → **hr_audit_logs** table
- **Frontend**: `resources/js/components/ERP/HR/viewAttendance.tsx`
- **Routes**: `/api/hr/attendance/*`

### 3. Leave Management
- **Controller**: `app/Http/Controllers/Erp/HR/LeaveController.php`
- **Models**:
  - `App\Models\HR\LeaveRequest` → **leave_requests** table ✅
  - `App\Models\HR\LeaveBalance` → **leave_balances** table ✅
  - `App\Models\HR\LeavePolicy` → **hr_leave_policies** table ✅
  - `App\Models\HR\LeaveApprovalHierarchy` → **hr_leave_approval_hierarchy** table ✅
  - `App\Models\Employee` → **employees** table
  - `App\Models\HR\AuditLog` → **hr_audit_logs** table
- **Frontend**: `resources/js/components/ERP/HR/leaveRequests.tsx`
- **Routes**: `/api/hr/leave-requests/*`

### 4. Payroll Management
- **Controller**: `app/Http/Controllers/Erp/HR/PayrollController.php`
- **Models**:
  - `App\Models\HR\Payroll` → **payrolls** table ✅
  - `App\Models\HR\PayrollComponent` → **hr_payroll_components** table ✅
  - `App\Models\HR\AttendanceRecord` → **attendance_records** table ✅
  - `App\Models\Employee` → **employees** table
  - `App\Models\HR\AuditLog` → **hr_audit_logs** table
- **Service**: `App\Services\HR\PayrollService`
- **Frontend**: 
  - `resources/js/components/ERP/HR/generateSlip.tsx`
  - `resources/js/components/ERP/HR/viewSlip.tsx`
- **Routes**: `/api/hr/payroll/*`

### 5. Performance Management
- **Controller**: `app/Http/Controllers/Erp/HR/PerformanceController.php`
- **Models**:
  - `App\Models\HR\PerformanceReview` → **performance_reviews** table ✅
  - `App\Models\HR\PerformanceCycle` → **hr_performance_cycles** table ✅
  - `App\Models\HR\PerformanceGoal` → **hr_performance_goals** table ✅
  - `App\Models\HR\CompetencyEvaluation` → **hr_competency_evaluations** table ✅
  - `App\Models\Employee` → **employees** table
  - `App\Models\HR\AuditLog` → **hr_audit_logs** table
- **Frontend**: `resources/js/components/ERP/HR/performance.tsx`
- **Routes**: `/api/hr/performance-reviews/*`

### 6. Department Management
- **Controller**: `app/Http/Controllers/Erp/HR/DepartmentController.php`
- **Models**:
  - `App\Models\HR\Department` → **departments** table ✅
  - `App\Models\Employee` → **employees** table
  - `App\Models\HR\AuditLog` → **hr_audit_logs** table
- **Frontend**: Integrated in `employee.tsx`
- **Routes**: `/api/hr/departments/*`

### 7. Onboarding Management
- **Controller**: `app/Http/Controllers/Erp/HR/OnboardingController.php`
- **Models**:
  - `App\Models\HR\EmployeeOnboarding` → **hr_employee_onboarding** table ✅
  - `App\Models\HR\OnboardingChecklist` → **hr_onboarding_checklists** table ✅
  - `App\Models\HR\OnboardingTask` → **hr_onboarding_tasks** table ✅
  - `App\Models\Employee` → **employees** table
  - `App\Models\HR\AuditLog` → **hr_audit_logs** table
- **Routes**: `/api/hr/onboarding/*`

### 8. Document Management
- **Controller**: `app/Http/Controllers/Erp/HR/DocumentController.php`
- **Models**:
  - `App\Models\HR\EmployeeDocument` → **hr_employee_documents** table ✅
  - `App\Models\Employee` → **employees** table
  - `App\Models\HR\AuditLog` → **hr_audit_logs** table
- **Routes**: `/api/hr/documents/*`

### 9. Training Management
- **Controller**: `app/Http/Controllers/Erp/HR/TrainingController.php`
- **Models**:
  - `App\Models\HR\TrainingProgram` → **hr_training_programs** table
  - `App\Models\HR\TrainingSession` → **hr_training_sessions** table
  - `App\Models\HR\TrainingEnrollment` → **hr_training_enrollments** table
  - `App\Models\HR\Certification` → **hr_certifications** table
  - `App\Models\Employee` → **employees** table
- **Routes**: `/api/hr/training/*`

### 10. Audit Logs
- **Controller**: `app/Http/Controllers/Erp/HR/AuditLogController.php`
- **Models**:
  - `App\Models\HR\AuditLog` → **hr_audit_logs** table ✅
- **Frontend**: `resources/js/components/ERP/HR/AuditLogs.tsx`
- **Routes**: `/api/hr/audit-logs/*`

### 11. HR Analytics
- **Controller**: `app/Http/Controllers/Erp/HR/HRAnalyticsController.php`
- **Models**: Aggregates data from multiple models
  - `App\Models\Employee`
  - `App\Models\HR\AttendanceRecord`
  - `App\Models\HR\LeaveRequest`
  - `App\Models\HR\Payroll`
  - `App\Models\HR\PerformanceReview`
- **Frontend**: `resources/js/components/ERP/HR/overview.tsx`
- **Routes**: `/api/hr/analytics/*`

### 12. Employee Self-Service
- **Controller**: `app/Http/Controllers/Erp/HR/EmployeeSelfServiceController.php`
- **Models**: Uses same models as main HR but with employee-scoped access
  - `App\Models\Employee`
  - `App\Models\HR\LeaveRequest`
  - `App\Models\HR\LeaveBalance`
  - `App\Models\HR\AttendanceRecord`
  - `App\Models\HR\Payroll`
  - `App\Models\HR\EmployeeDocument`
- **Frontend**: 
  - `resources/js/components/ERP/HR/SelfService/MyProfile.tsx`
  - `resources/js/components/ERP/HR/SelfService/MyLeaves.tsx`
  - `resources/js/components/ERP/HR/SelfService/MyAttendance.tsx`
  - `resources/js/components/ERP/HR/SelfService/MyPayslips.tsx`
  - `resources/js/components/ERP/HR/SelfService/MyDocuments.tsx`
- **Routes**: `/api/hr/self-service/*`

### 13. Notification System
- **Controller**: `app/Http/Controllers/Erp/HR/NotificationController.php`
- **Notifications**:
  - `App\Notifications\HR\LeaveRequestSubmitted`
  - `App\Notifications\HR\LeaveRequestApproved`
  - `App\Notifications\HR\LeaveRequestRejected`
  - `App\Notifications\HR\PayslipGenerated`
  - `App\Notifications\HR\EmployeeOnboarded`
  - `App\Notifications\HR\DocumentExpiring`
  - `App\Notifications\HR\PerformanceReviewDue`
- **Routes**: `/api/hr/notifications/*`

---

## ✅ Model-Table Mapping Summary

All HR models now have explicit `protected $table` properties:

| Model Class | Table Name | Status |
|-------------|------------|--------|
| Employee | employees | ✅ Connected |
| AttendanceRecord | attendance_records | ✅ Connected |
| LeaveRequest | leave_requests | ✅ Connected |
| LeaveBalance | leave_balances | ✅ Connected |
| LeavePolicy | hr_leave_policies | ✅ Connected |
| LeaveApprovalHierarchy | hr_leave_approval_hierarchy | ✅ Connected |
| Payroll | payrolls | ✅ Connected |
| PayrollComponent | hr_payroll_components | ✅ Connected |
| PerformanceReview | performance_reviews | ✅ Connected |
| PerformanceCycle | hr_performance_cycles | ✅ Connected |
| PerformanceGoal | hr_performance_goals | ✅ Connected |
| CompetencyEvaluation | hr_competency_evaluations | ✅ Connected |
| Department | departments | ✅ Connected |
| EmployeeDocument | hr_employee_documents | ✅ Connected |
| EmployeeOnboarding | hr_employee_onboarding | ✅ Connected |
| OnboardingChecklist | hr_onboarding_checklists | ✅ Connected |
| OnboardingTask | hr_onboarding_tasks | ✅ Connected |
| AuditLog | hr_audit_logs | ✅ Connected |
| Shift | hr_shifts | ✅ Connected |
| TaxBracket | hr_tax_brackets | ✅ Connected |

---

## 🔗 Relationship Map

### Employee Model Relationships
```php
// app/Models/Employee.php
shopOwner()           → ShopOwner
department()          → Department
user()                → User
attendanceRecords()   → AttendanceRecord (HasMany)
leaveRequests()       → LeaveRequest (HasMany)
payrolls()            → Payroll (HasMany)
performanceReviews()  → PerformanceReview (HasMany)
leaveBalances()       → LeaveBalance (HasMany)
documents()           → EmployeeDocument (HasMany)
onboarding()          → EmployeeOnboarding (HasOne)
```

### LeaveRequest Model Relationships
```php
// app/Models/HR/LeaveRequest.php
employee()    → Employee
shopOwner()   → ShopOwner
approver()    → User
approvedBy()  → User
```

### Payroll Model Relationships
```php
// app/Models/HR/Payroll.php
employee()           → Employee
shopOwner()          → ShopOwner
components()         → PayrollComponent (HasMany)
generatedBy()        → User
approvedBy()         → User
```

### AttendanceRecord Model Relationships
```php
// app/Models/HR/AttendanceRecord.php
employee()    → Employee
shopOwner()   → ShopOwner
shift()       → Shift
```

### Department Model Relationships
```php
// app/Models/HR/Department.php
shopOwner()   → ShopOwner
employees()   → Employee (HasMany)
```

### PerformanceReview Model Relationships
```php
// app/Models/HR/PerformanceReview.php
employee()          → Employee
shopOwner()         → ShopOwner
reviewer()          → User
cycle()             → PerformanceCycle
goals()             → PerformanceGoal (HasMany)
competencies()      → CompetencyEvaluation (HasMany)
```

---

## 📝 Notes

### All Models Updated ✅
- All 19 HR models now have explicit `$table` properties
- Database connections are properly configured
- All unit tests passing (13/13)

### Controller Namespace
- Controllers are located in `App\Http\Controllers\Erp\HR\`
- Note the `ERP` namespace (capitalized)
- Tests expect lowercase `HR` namespace - this is a known issue

### Service Layer
- `App\Services\HR\PayrollService` - Handles payroll calculations
- `App\Services\HR\LeaveService` - Handles leave logic
- `App\Services\HR\OnboardingService` - Handles onboarding workflows

### Repository Layer
- `App\Repositories\HR\EmployeeRepository`
- `App\Repositories\HR\LeaveRepository`
- `App\Repositories\HR\PayrollRepository`
- `App\Repositories\HR\AttendanceRepository`

### Traits
- `App\Traits\HR\LogsHRActivity` - Used by all controllers for audit logging

---

## 🚀 Next Steps

1. **Fix Controller Namespace**: Update tests to use correct namespace `App\Http\Controllers\Erp\HR\`
2. **Configure Routes**: Ensure all routes in `routes/api.php` point to correct controllers
3. **Complete Role Enum**: Add missing roles to users table
4. **Run Feature Tests**: Test all 26 feature tests after namespace fixes
