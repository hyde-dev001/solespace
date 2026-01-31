# HR Module Frontend Components - Quick Start Guide

## Overview

The HR module includes 7 fully-featured React/TypeScript components for managing:

- Employee records & profiles
- Attendance tracking (biometric integration ready)
- Payroll processing
- Leave management
- Performance evaluation

## File Structure

```
resources/js/
├── types/
│   └── hr.ts                           # TypeScript interfaces and types
├── services/
│   └── hrService.ts                    # API service layer
└── components/ERP/HR/
    ├── index.ts                        # Export barrel
    ├── HRDashboard.tsx                 # Main dashboard with tabs
    ├── EmployeeDashboard.tsx           # Employee management
    ├── EmployeeTable.tsx               # Reusable table component
    ├── EmployeeForm.tsx                # Employee form component
    ├── AttendanceTracker.tsx           # Attendance tracking
    ├── PayrollManagement.tsx           # Payroll processing
    ├── LeaveManagement.tsx             # Leave requests
    └── PerformanceEvaluation.tsx       # Performance reviews
```

## Component Features

### 1. HRDashboard

**Main entry point for HR module**

- Overview stats dashboard
- Quick action buttons
- Tab navigation between modules
- Real-time statistics

**Usage:**

```tsx
import { HRDashboard } from "@/components/ERP/HR";

export default function HRPage() {
    return <HRDashboard />;
}
```

### 2. EmployeeDashboard

**Employee management with CRUD operations**

- View all employees
- Add new employees
- Edit employee records
- Delete employees
- Search by name/email
- Filter by department and status
- Employee statistics

**Features:**

- Full employee profile management
- Emergency contact information
- Salary tracking
- Status management (Active/Inactive/On-Leave/Suspended)

### 3. AttendanceTracker

**Track employee attendance and check-in/out**

- View attendance records
- Check-in/Check-out functionality
- Biometric integration support
- Attendance statistics
- Date range filtering
- Employee-specific reports
- Attendance rate calculation

**Features:**

- Track daily attendance
- Support for multiple statuses (Present/Absent/Late/Half-day)
- Attendance statistics per employee
- Monthly attendance reports

### 4. PayrollManagement

**Process and manage employee payroll**

- Generate payroll for periods
- View salary components (base, allowances, deductions)
- Track payroll status (Pending/Processed/Paid)
- Export payslips as PDF
- Process multiple payroll records
- Net salary calculations

**Features:**

- Automatic net salary calculation
- Payment method tracking
- Payroll period management
- Payslip PDF export
- Payroll status tracking

### 5. LeaveManagement

**Manage leave requests and approvals**

- Submit leave requests
- Approve/Reject leave
- Track leave balance
- Multiple leave types support
- Leave history tracking

**Features:**

- 6 Leave types: Vacation, Sick, Personal, Maternity, Paternity, Unpaid
- Automatic day calculation
- Leave balance tracking
- Manager approval workflow
- Rejection reason tracking

### 6. PerformanceEvaluation

**Create and manage performance reviews**

- Create performance reviews
- Rate employees on 5-point scale
- Track 5 performance categories
- Set goals and improvement areas
- Review status tracking

**Features:**

- Overall Rating (1-5 scale)
- Communication Skills (1-5 scale)
- Teamwork & Collaboration (1-5 scale)
- Reliability & Responsibility (1-5 scale)
- Productivity & Efficiency (1-5 scale)
- Goals tracking
- Improvement areas
- Detailed comments

## Data Types

All types are defined in `types/hr.ts`:

```typescript
// Core Types
-Employee -
    AttendanceRecord -
    Payroll -
    LeaveRequest -
    PerformanceReview -
    Department -
    Position -
    LeaveBalance -
    AttendanceStats;
```

## API Service Methods

The `hrService.ts` provides methods for all CRUD operations:

### Employee Service

```typescript
employeeService.getAll();
employeeService.getById(id);
employeeService.create(data);
employeeService.update(id, data);
employeeService.delete(id);
employeeService.search(query);
employeeService.getByDepartment(deptId);
employeeService.getStats();
```

### Attendance Service

```typescript
attendanceService.getAll()
attendanceService.getByEmployee(employeeId)
attendanceService.checkIn(employeeId, biometricId?)
attendanceService.checkOut(employeeId)
attendanceService.getStats(employeeId)
```

### Payroll Service

```typescript
payrollService.getAll();
payrollService.getByEmployee(employeeId);
payrollService.generatePayroll(period);
payrollService.processPayroll(ids);
payrollService.exportPayslip(payrollId);
payrollService.getReport(params);
```

### Leave Service

```typescript
leaveService.getAll();
leaveService.getByEmployee(employeeId);
leaveService.getPending();
leaveService.create(data);
leaveService.approve(id, approverId);
leaveService.reject(id, reason);
leaveService.getBalance(employeeId);
```

### Performance Service

```typescript
performanceService.getAll();
performanceService.getByEmployee(employeeId);
performanceService.create(data);
performanceService.update(id, data);
performanceService.submit(id);
performanceService.getReport(params);
```

## Integration Steps

### 1. Add Backend API Routes

Add to `routes/api.php`:

```php
Route::prefix('erp/hr')->middleware('auth:sanctum')->group(function () {
    Route::apiResource('employees', EmployeeController::class);
    Route::apiResource('attendance', AttendanceController::class);
    Route::apiResource('payroll', PayrollController::class);
    Route::apiResource('leave-requests', LeaveRequestController::class);
    Route::apiResource('performance-reviews', PerformanceReviewController::class);
});
```

### 2. Create Backend Models & Controllers

Create Laravel models and controllers following the same structure in `app/Models/HR/` and `app/Http/Controllers/ERP/HR/`

### 3. Create Database Migrations

Use the migration structure provided in the main implementation guide.

### 4. Import in Your Routes

```tsx
import { HRDashboard } from '@/components/ERP/HR';

// In your router configuration
{
  path: '/hr',
  component: HRDashboard,
  protected: true
}
```

## Styling

All components use:

- **Tailwind CSS** for styling
- **Responsive design** (mobile-first)
- **Consistent color scheme**:
    - Blue: Primary actions
    - Green: Success/Active status
    - Red: Delete/Danger actions
    - Yellow: Warnings/Pending
    - Orange: Important
    - Purple: Special categories

## Features Implemented

✅ **Employee Management**

- Add, edit, delete employees
- Full profile information
- Department and position tracking
- Status management

✅ **Attendance Tracking**

- Check-in/Check-out system
- Biometric integration ready
- Attendance statistics
- Monthly reports

✅ **Payroll Processing**

- Automatic salary calculation
- Allowances and deductions
- Status tracking
- PDF payslip export

✅ **Leave Management**

- Multiple leave types
- Approval workflow
- Leave balance tracking
- Day calculation

✅ **Performance Evaluation**

- Multi-category rating system
- Goals and improvement tracking
- Review status management
- Performance analytics

## Backend Requirements

The following tables need to exist in your database:

```
- employees
- attendance
- payroll
- leave_requests
- performance_reviews
- departments
- positions
```

See the main implementation guide for migration details.

## Authentication

All API calls include bearer token authentication:

```typescript
Authorization: Bearer {token}
```

Token is automatically fetched from localStorage during API calls.

## Error Handling

- All components include error states
- User-friendly error messages
- Try-catch blocks for API calls
- Validation before submission

## Next Steps

1. Create backend migrations
2. Create Laravel models
3. Create API controllers
4. Add routes to `api.php`
5. Test API endpoints
6. Import components in your app
7. Set up navigation/routing
8. Deploy to production

## Customization

All components can be customized by:

- Modifying Tailwind classes
- Adjusting API endpoints in `hrService.ts`
- Adding custom validation rules
- Extending types in `hr.ts`
- Adding new fields to forms

## Support & Troubleshooting

**API Connection Issues:**

- Verify CORS configuration
- Check auth token in localStorage
- Ensure backend routes are created
- Verify middleware setup

**Type Errors:**

- Ensure all types are properly imported
- Check TypeScript configuration
- Verify API response structure matches types

**Styling Issues:**

- Verify Tailwind CSS is properly configured
- Check for CSS conflicts
- Ensure responsive breakpoints are correct

---

**Created:** January 21, 2026
**Version:** 1.0
**Status:** Ready for implementation
