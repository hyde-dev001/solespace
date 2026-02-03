# Advanced Payroll System - Complete Implementation

**Status**: ✅ Fully Implemented  
**Date**: February 1, 2026  
**Phase**: 2, Task 2

## Overview

The Advanced Payroll System provides component-based payroll calculation with progressive tax computation, flexible earning/deduction management, and comprehensive audit tracking.

## Architecture

### Component-Based Design

The system uses a **component-based architecture** where each payroll consists of multiple components:

- **Earnings**: Basic salary, allowances, overtime, bonuses
- **Deductions**: Tax, provident fund, professional tax, loans
- **Benefits**: Insurance, transport allowance, meal allowance

Each component can be:
- **Taxable** or **Non-taxable**
- **Recurring** (monthly) or **One-time**
- Calculated using 9 different methods
- Applied to specific grades or departments

### Progressive Tax Calculation

Tax is calculated using **marginal tax rates** across configurable brackets:

```
Example:
Income: ₹100,000
Brackets:
  0 - 50,000    @ 10% = ₹5,000
  50,000 - 100,000 @ 20% = ₹10,000
Total Tax: ₹15,000
```

---

## Database Schema

### 1. hr_payroll_components

Stores individual components of each payroll.

| Column | Type | Description |
|--------|------|-------------|
| id | bigint | Primary key |
| payroll_id | bigint | FK to hr_payroll |
| shop_owner_id | bigint | FK to shop_owners |
| component_type | enum | earning, deduction, benefit |
| component_name | string(100) | Display name |
| base_amount | decimal(15,2) | Base value before calculation |
| calculation_method | enum | How to calculate (9 methods) |
| calculated_amount | decimal(15,2) | Final computed amount |
| is_taxable | boolean | Whether component is taxable |
| is_recurring | boolean | Monthly vs one-time |
| applies_to_grade | string | Grade filter (optional) |
| applies_to_department | string | Department filter (optional) |
| description | text | Additional notes |

**Indexes**:
- `payroll_id` (foreign key)
- `shop_owner_id` (multi-tenant isolation)
- `component_type` (filtering)
- `is_taxable` (tax calculation)

**Constraints**:
- `payroll_component_type_name` (unique per payroll)

### 2. hr_tax_brackets

Defines progressive tax brackets for calculation.

| Column | Type | Description |
|--------|------|-------------|
| id | bigint | Primary key |
| shop_owner_id | bigint | FK to shop_owners |
| bracket_name | string(100) | Display name |
| min_annual_income | decimal(15,2) | Lower bound |
| max_annual_income | decimal(15,2) | Upper bound |
| tax_rate | decimal(5,2) | Percentage rate |
| fixed_amount | decimal(15,2) | Base tax amount |
| applicable_from | date | Start date |
| applicable_to | date | End date (nullable) |
| is_active | boolean | Enable/disable bracket |

**Indexes**:
- `shop_owner_id` (multi-tenant isolation)
- `is_active` (filtering)
- `(applicable_from, applicable_to)` (date range queries)

**Constraints**:
- `max_annual_income >= min_annual_income`

---

## Models

### 1. PayrollComponent

**Location**: `app/Models/HR/PayrollComponent.php`

#### Constants

**Component Types**:
```php
TYPE_EARNING = 'earning'
TYPE_DEDUCTION = 'deduction'
TYPE_BENEFIT = 'benefit'
```

**Calculation Methods**:
```php
METHOD_FIXED = 'fixed'                    // Fixed amount
METHOD_PERCENTAGE_OF_BASIC = 'percentage_of_basic'  // % of basic salary
METHOD_PERCENTAGE_OF_GROSS = 'percentage_of_gross'  // % of gross salary
METHOD_DAYS_WORKED = 'days_worked'        // (Salary / 30) × days
METHOD_HOURS_WORKED = 'hours_worked'      // (Salary / 160) × hours
METHOD_ALLOWANCE = 'allowance'            // Fixed allowance
METHOD_OVERTIME = 'overtime'              // Overtime calculation
METHOD_COMMISSION = 'commission'          // Commission-based
METHOD_CUSTOM = 'custom'                  // Custom logic
```

#### Relationships

```php
payroll()      // BelongsTo Payroll
shopOwner()    // BelongsTo ShopOwner
```

#### Scopes

```php
forShopOwner($shopOwnerId)          // Filter by shop owner
forPayroll($payrollId)              // Filter by payroll
ofType($type)                       // Filter by component type
taxable()                           // Only taxable components
nonTaxable()                        // Only non-taxable components
recurring()                         // Only recurring components
forGrade($grade)                    // Filter by grade
forDepartment($department)          // Filter by department
byMethod($method)                   // Filter by calculation method
```

#### Static Methods

```php
PayrollComponent::createComponent($payrollId, $data)
// Creates component with automatic amount calculation

PayrollComponent::calculateAmount($method, $baseAmount, $basicSalary, $overrides)
// Calculates final amount based on method

PayrollComponent::getTypeTotal($payrollId, $type)
// Sum all components of specific type

PayrollComponent::getComponentsByType($payrollId)
// Group components by type

PayrollComponent::getTaxableTotal($payrollId)
// Sum all taxable components
```

#### Calculated Attributes

```php
$component->formatted_amount  // Formatted currency string
```

### 2. TaxBracket

**Location**: `app/Models/HR/TaxBracket.php`

#### Relationships

```php
shopOwner()    // BelongsTo ShopOwner
```

#### Scopes

```php
forShopOwner($shopOwnerId)          // Filter by shop owner
active()                            // Only active brackets
currentlyApplicable()               // Valid for current date
forIncome($income)                  // Applicable to income level
inRange($min, $max)                 // Within income range
named($name)                        // Filter by bracket name
```

#### Static Methods

```php
TaxBracket::calculateTax($shopOwnerId, $grossIncome)
// Calculates progressive tax across all applicable brackets
// Returns: Total tax amount (decimal)
```

**Algorithm**:
1. Retrieve all active, applicable brackets for shop owner
2. Sort by min_annual_income ascending
3. For each bracket:
   - Calculate taxable amount in bracket: `min(remaining_income, bracket_range)`
   - Apply: `fixed_amount + (taxable_amount × rate / 100)`
   - Subtract taxable amount from remaining income
4. Return total tax rounded to 2 decimals

### 3. Payroll (Updated)

**Location**: `app/Models/HR/Payroll.php`

#### New Fields

```php
pay_period_start       // Date - Start of pay period
pay_period_end         // Date - End of pay period
basic_salary           // Decimal - Base salary
gross_salary           // Decimal - Total earnings + benefits
total_deductions       // Decimal - Sum of all deductions
tax_amount             // Decimal - Calculated tax
attendance_days        // Integer - Days present
leave_days             // Integer - Leave days
overtime_hours         // Decimal - OT hours
generated_by           // Integer - User who generated
generated_at           // Timestamp - Generation time
approved_by            // Integer - User who approved
approved_at            // Timestamp - Approval time
```

#### New Relationships

```php
components()           // HasMany PayrollComponent
```

#### New Scopes

```php
pending()              // Status = pending
processed()            // Status = processed
withStatus($status)    // Filter by status
withComponents()       // Eager load components with ordering
```

#### New Methods

```php
getTotalEarnings()     // Sum earnings components
getTotalDeductions()   // Sum deduction components
getTotalBenefits()     // Sum benefit components
getTaxableAmount()     // Sum taxable components
```

---

## Service Layer

### PayrollService

**Location**: `app/Services/HR/PayrollService.php`

The PayrollService orchestrates payroll generation with component calculation and tax computation.

#### Main Method

```php
generatePayroll(
    Employee $employee,
    string $payPeriod,      // 'YYYY-MM' or 'YYYY-MM-DD to YYYY-MM-DD'
    array $customComponents = [],
    array $overrides = []
): Payroll
```

**Workflow**:
1. ✅ Create base payroll record
2. ✅ Calculate standard components (earnings, deductions)
3. ✅ Add overtime components if applicable
4. ✅ Create custom components
5. ✅ Calculate gross pay (earnings + benefits)
6. ✅ Calculate tax on taxable components
7. ✅ Calculate net pay (gross - deductions - tax)
8. ✅ Update payroll totals
9. ✅ Create tax component record
10. ✅ Log audit trail
11. ✅ Return payroll with components

**Standard Components Created**:

| Component | Type | Method | Amount | Taxable |
|-----------|------|--------|--------|---------|
| Basic Salary | Earning | Fixed | Employee salary | Yes |
| House Rent Allowance | Earning | % of Basic | 40% of basic | Yes |
| Transport Allowance | Earning | Allowance | ₹2,000 | No |
| Provident Fund | Deduction | % of Basic | 12% of basic | No |
| Professional Tax | Deduction | Fixed | ₹200 | No |
| Overtime Pay | Earning | Overtime | 1.5x hourly rate | Yes |
| Income Tax | Deduction | Custom | Progressive calculation | No |

#### Other Methods

```php
recalculatePayroll(Payroll $payroll, array $overrides): Payroll
// Deletes recurring components and regenerates payroll

calculateTax(int $shopOwnerId, float $grossIncome): float
// Wrapper for TaxBracket::calculateTax()

getPayrollSummary(int $shopOwnerId, string $periodStart, string $periodEnd): array
// Returns aggregated statistics for period

validatePayroll(Payroll $payroll): array
// Validates calculations and returns issues
```

---

## API Endpoints

### Updated Endpoints

#### POST /api/erp/hr/payroll/generate

Generate payroll for multiple employees using PayrollService.

**Request**:
```json
{
  "payrollPeriod": "2026-02",
  "employeeIds": [1, 2, 3],
  "paymentMethod": "bank_transfer",
  "overrides": [
    {
      "employee_id": 1,
      "attendance_days": 25,
      "leave_days": 3,
      "overtime_hours": 10
    }
  ]
}
```

**Response**:
```json
{
  "message": "Payroll generation completed",
  "created": 3,
  "errors": [],
  "payrolls": [
    {
      "id": 101,
      "employee_id": 1,
      "gross_salary": 50000.00,
      "tax_amount": 7500.00,
      "net_salary": 42500.00,
      "components": [...]
    }
  ]
}
```

### New Endpoints

#### GET /api/erp/hr/payroll/{id}/components

Get all components for a payroll.

**Response**:
```json
{
  "payroll_id": 101,
  "employee": {...},
  "components": {
    "earnings": [...],
    "deductions": [...],
    "benefits": [...]
  },
  "totals": {
    "total_earnings": 52000.00,
    "total_deductions": 9500.00,
    "total_benefits": 2000.00,
    "gross_salary": 54000.00,
    "tax_amount": 8100.00,
    "net_salary": 45900.00
  }
}
```

#### POST /api/erp/hr/payroll/{id}/components

Add a custom component to payroll.

**Request**:
```json
{
  "component_type": "earning",
  "component_name": "Performance Bonus",
  "amount": 5000.00,
  "is_taxable": true,
  "description": "Q1 performance incentive"
}
```

**Response**:
```json
{
  "message": "Component added successfully",
  "component": {...},
  "payroll": {...}
}
```

#### PUT /api/erp/hr/payroll/{payrollId}/components/{componentId}

Update an existing component.

**Request**:
```json
{
  "amount": 6000.00,
  "is_taxable": false,
  "description": "Updated bonus amount"
}
```

#### DELETE /api/erp/hr/payroll/{payrollId}/components/{componentId}

Delete a component (except core components).

#### POST /api/erp/hr/payroll/{id}/recalculate

Recalculate payroll with new parameters.

**Request**:
```json
{
  "attendance_days": 28,
  "leave_days": 2,
  "overtime_hours": 15
}
```

**Response**:
```json
{
  "message": "Payroll recalculated successfully",
  "payroll": {...}
}
```

#### GET /api/erp/hr/payroll/summary

Get aggregated payroll summary for a period.

**Request**:
```json
{
  "period_start": "2026-02-01",
  "period_end": "2026-02-28"
}
```

**Response**:
```json
{
  "total_employees": 15,
  "total_gross": 750000.00,
  "total_deductions": 120000.00,
  "total_tax": 112500.00,
  "total_net": 517500.00,
  "components_breakdown": {
    "earnings": {
      "Basic Salary": 600000.00,
      "House Rent Allowance": 240000.00,
      "Overtime Pay": 25000.00
    },
    "deductions": {
      "Provident Fund": 72000.00,
      "Professional Tax": 3000.00,
      "Income Tax": 112500.00
    },
    "benefits": {...}
  },
  "payrolls": [...]
}
```

---

## Usage Examples

### Example 1: Generate Payroll with Standard Components

```php
use App\Services\HR\PayrollService;
use App\Models\Employee;

$payrollService = app(PayrollService::class);
$employee = Employee::find(1);

$payroll = $payrollService->generatePayroll(
    $employee,
    '2026-02',  // Pay period
    [],         // No custom components
    [           // Overrides
        'attendance_days' => 26,
        'leave_days' => 2,
        'overtime_hours' => 8
    ]
);

echo "Gross: {$payroll->gross_salary}";
echo "Tax: {$payroll->tax_amount}";
echo "Net: {$payroll->net_salary}";
```

### Example 2: Add Custom Component

```php
$component = PayrollComponent::create([
    'payroll_id' => $payroll->id,
    'shop_owner_id' => $employee->shop_owner_id,
    'component_type' => PayrollComponent::TYPE_EARNING,
    'component_name' => 'Special Allowance',
    'base_amount' => 3000,
    'calculation_method' => PayrollComponent::METHOD_FIXED,
    'calculated_amount' => 3000,
    'is_taxable' => true,
    'is_recurring' => false,
    'description' => 'Project completion bonus'
]);
```

### Example 3: Create Tax Brackets

```php
use App\Models\HR\TaxBracket;

// Bracket 1: 0 - 50,000 @ 10%
TaxBracket::create([
    'shop_owner_id' => 1,
    'bracket_name' => 'Slab 1',
    'min_annual_income' => 0,
    'max_annual_income' => 50000,
    'tax_rate' => 10.00,
    'fixed_amount' => 0,
    'applicable_from' => '2026-01-01',
    'applicable_to' => null,
    'is_active' => true
]);

// Bracket 2: 50,000 - 100,000 @ 20%
TaxBracket::create([
    'shop_owner_id' => 1,
    'bracket_name' => 'Slab 2',
    'min_annual_income' => 50000,
    'max_annual_income' => 100000,
    'tax_rate' => 20.00,
    'fixed_amount' => 5000,  // Fixed + percentage
    'applicable_from' => '2026-01-01',
    'applicable_to' => null,
    'is_active' => true
]);
```

### Example 4: Calculate Tax

```php
use App\Models\HR\TaxBracket;

$shopOwnerId = 1;
$grossIncome = 75000;

$tax = TaxBracket::calculateTax($shopOwnerId, $grossIncome);
// Returns: ₹12,500 (10% on first 50k + 20% on next 25k)
```

### Example 5: Get Component Totals

```php
$earnings = PayrollComponent::getTypeTotal($payrollId, PayrollComponent::TYPE_EARNING);
$deductions = PayrollComponent::getTypeTotal($payrollId, PayrollComponent::TYPE_DEDUCTION);
$taxable = PayrollComponent::getTaxableTotal($payrollId);

echo "Earnings: {$earnings}";
echo "Deductions: {$deductions}";
echo "Taxable Amount: {$taxable}";
```

### Example 6: Recalculate Payroll

```php
$payrollService = app(PayrollService::class);

$recalculated = $payrollService->recalculatePayroll(
    $payroll,
    [
        'attendance_days' => 30,
        'overtime_hours' => 0
    ]
);

echo "New Net Salary: {$recalculated->net_salary}";
```

---

## Security Features

### 1. Role-Based Access Control

- **Payroll Generation**: PAYROLL_MANAGER, shop_owner, HR
- **Approval**: PAYROLL_APPROVER, shop_owner (no self-approval)
- **Component Management**: HR only
- **Export**: HR, PAYROLL_MANAGER, PAYROLL_APPROVER, shop_owner

### 2. Multi-Tenant Isolation

All queries filtered by `shop_owner_id`:
```php
Payroll::forShopOwner($user->shop_owner_id)
PayrollComponent::forShopOwner($shopOwnerId)
TaxBracket::forShopOwner($shopOwnerId)
```

### 3. Status Validation

- Components can only be modified on **pending** payrolls
- Core components (Basic Salary, Income Tax) cannot be deleted
- Recalculation only allowed for **pending** payrolls

### 4. Audit Logging

All operations logged:
```php
AuditLog::createLog(
    'payroll',
    $payroll->id,
    'generated',
    null,
    [
        'employee_id' => $employee->id,
        'gross_salary' => $payroll->gross_salary,
        'net_salary' => $payroll->net_salary,
        'components_count' => $components->count()
    ],
    $payroll->shop_owner_id
);
```

---

## Testing

### 1. Unit Tests

```php
// Test progressive tax calculation
$tax = TaxBracket::calculateTax(1, 100000);
$this->assertEquals(15000, $tax);

// Test component calculation
$amount = PayrollComponent::calculateAmount(
    PayrollComponent::METHOD_PERCENTAGE_OF_BASIC,
    40,  // 40% rate
    50000,  // Basic salary
    []
);
$this->assertEquals(20000, $amount);
```

### 2. Integration Tests

```php
// Test payroll generation
$payroll = $payrollService->generatePayroll($employee, '2026-02');
$this->assertNotNull($payroll->tax_amount);
$this->assertGreaterThan(0, $payroll->components->count());

// Test component addition
$component = PayrollComponent::create([...]);
$this->assertDatabaseHas('hr_payroll_components', [
    'payroll_id' => $payroll->id,
    'component_name' => 'Special Allowance'
]);
```

### 3. Manual Testing

1. **Create Tax Brackets**:
   - Navigate to Tax Settings
   - Add multiple brackets with different rates
   - Verify progressive calculation

2. **Generate Payroll**:
   - Select employees
   - Set pay period
   - Add overrides (attendance, overtime)
   - Verify component creation
   - Check tax calculation

3. **Manage Components**:
   - Add custom earning/deduction
   - Update component amount
   - Verify recalculation
   - Delete non-core component

4. **Approve & Process**:
   - Approve payroll (different user)
   - Process payment
   - Export payslip
   - Verify audit logs

---

## Troubleshooting

### Issue: Tax not calculated

**Solution**: Ensure tax brackets exist for shop_owner:
```sql
SELECT * FROM hr_tax_brackets 
WHERE shop_owner_id = 1 AND is_active = 1;
```

### Issue: Components not created

**Solution**: Check PayrollService logs:
```php
\Log::error('Payroll generation error', [
    'employee_id' => $employeeId,
    'error' => $e->getMessage()
]);
```

### Issue: Incorrect net salary

**Solution**: Recalculate payroll:
```php
POST /api/erp/hr/payroll/{id}/recalculate
```

### Issue: Cannot modify components

**Solution**: Check payroll status:
```php
$payroll->status === 'pending'  // Must be true
```

---

## Future Enhancements

### Phase 3 Considerations

1. **Multi-Currency Support**
   - Currency conversion for components
   - Exchange rate tracking

2. **Loan Management**
   - Employee loans as deductions
   - Installment tracking
   - Interest calculation

3. **Payslip Generation**
   - PDF template with components breakdown
   - Email distribution
   - Bulk download

4. **Year-End Reports**
   - Annual tax summary
   - Form 16 generation
   - Provident fund statement

5. **Attendance Integration**
   - Auto-calculate attendance days from AttendanceRecord
   - Leave day synchronization
   - Overtime auto-computation

6. **Performance-Based Components**
   - KPI-linked bonuses
   - Commission on sales
   - Target achievement rewards

---

## Files Created

### Migrations
- ✅ `database/migrations/2026_02_01_100012_create_hr_payroll_components_table.php`
- ✅ `database/migrations/2026_02_01_100013_create_hr_tax_brackets_table.php`

### Models
- ✅ `app/Models/HR/PayrollComponent.php` (~180 lines)
- ✅ `app/Models/HR/TaxBracket.php` (~160 lines)
- ✅ `app/Models/HR/Payroll.php` (updated with components relationship)

### Services
- ✅ `app/Services/HR/PayrollService.php` (~450 lines)

### Controllers
- ✅ `app/Http/Controllers/Erp/HR/PayrollController.php` (updated, +300 lines)

### Documentation
- ✅ `ADVANCED_PAYROLL_SYSTEM_COMPLETE.md` (this file)

---

## Summary

✅ **Component-Based Payroll**: Flexible earnings, deductions, benefits  
✅ **Progressive Tax**: Marginal tax rate calculation across brackets  
✅ **9 Calculation Methods**: Fixed, percentage, days/hours-based, custom  
✅ **Service Layer**: PayrollService orchestrates generation workflow  
✅ **8 New API Endpoints**: Component management, recalculation, summary  
✅ **Multi-Tenant**: Complete shop_owner_id isolation  
✅ **Audit Logging**: All operations tracked  
✅ **Status Protection**: Only pending payrolls can be modified  
✅ **Role-Based Security**: Different permissions for different roles  

**Next Steps**: Implement Phase 2, Task 3 or begin testing with sample data.

---

**Implementation Date**: February 1, 2026  
**Migration Status**: ✅ Migrated  
**Test Status**: ⏳ Pending
