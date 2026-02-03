# Advanced Payroll System - Quick Reference

## Quick Commands

### Generate Payroll (API)
```bash
POST /api/erp/hr/payroll/generate
{
  "payrollPeriod": "2026-02",
  "employeeIds": [1, 2, 3],
  "paymentMethod": "bank_transfer",
  "overrides": [
    {"employee_id": 1, "attendance_days": 25, "overtime_hours": 10}
  ]
}
```

### Get Components
```bash
GET /api/erp/hr/payroll/101/components
```

### Add Component
```bash
POST /api/erp/hr/payroll/101/components
{
  "component_type": "earning",
  "component_name": "Bonus",
  "amount": 5000,
  "is_taxable": true
}
```

### Recalculate
```bash
POST /api/erp/hr/payroll/101/recalculate
{
  "attendance_days": 28,
  "overtime_hours": 12
}
```

---

## Component Types

| Type | Description | Examples |
|------|-------------|----------|
| **earning** | Income components | Basic, Allowances, Bonus, Overtime |
| **deduction** | Subtractions | Tax, PF, Professional Tax, Loans |
| **benefit** | Non-cash benefits | Insurance, Meal, Transport |

---

## Calculation Methods

| Method | Description | Formula |
|--------|-------------|---------|
| `fixed` | Fixed amount | base_amount |
| `percentage_of_basic` | % of basic salary | basic × (base_amount / 100) |
| `percentage_of_gross` | % of gross salary | gross × (base_amount / 100) |
| `days_worked` | Pro-rata by days | (basic / 30) × days |
| `hours_worked` | Pro-rata by hours | (basic / 160) × hours |
| `allowance` | Fixed allowance | base_amount |
| `overtime` | Overtime pay | hourly_rate × 1.5 × hours |
| `commission` | Commission-based | base_amount |
| `custom` | Custom logic | base_amount |

---

## Tax Calculation

Progressive tax across brackets:

```
Income: ₹100,000
Bracket 1: 0-50k @ 10% = ₹5,000
Bracket 2: 50k-100k @ 20% = ₹10,000
Total Tax: ₹15,000
```

Code:
```php
TaxBracket::calculateTax($shopOwnerId, $grossIncome);
```

---

## Code Snippets

### Create Tax Bracket
```php
TaxBracket::create([
    'shop_owner_id' => 1,
    'bracket_name' => 'Slab 1',
    'min_annual_income' => 0,
    'max_annual_income' => 50000,
    'tax_rate' => 10.00,
    'fixed_amount' => 0,
    'applicable_from' => '2026-01-01',
    'is_active' => true
]);
```

### Generate Payroll (Service)
```php
$payrollService = app(PayrollService::class);

$payroll = $payrollService->generatePayroll(
    $employee,
    '2026-02',
    [],  // custom components
    ['attendance_days' => 26, 'overtime_hours' => 8]
);
```

### Add Custom Component
```php
PayrollComponent::create([
    'payroll_id' => $payroll->id,
    'shop_owner_id' => 1,
    'component_type' => PayrollComponent::TYPE_EARNING,
    'component_name' => 'Performance Bonus',
    'base_amount' => 5000,
    'calculation_method' => PayrollComponent::METHOD_FIXED,
    'calculated_amount' => 5000,
    'is_taxable' => true,
    'is_recurring' => false
]);
```

### Get Component Totals
```php
$earnings = PayrollComponent::getTypeTotal($payrollId, 'earning');
$deductions = PayrollComponent::getTypeTotal($payrollId, 'deduction');
$taxable = PayrollComponent::getTaxableTotal($payrollId);
```

### Query Components
```php
// Get all taxable earnings
PayrollComponent::forPayroll($payrollId)
    ->ofType('earning')
    ->taxable()
    ->get();

// Get recurring deductions
PayrollComponent::forPayroll($payrollId)
    ->ofType('deduction')
    ->recurring()
    ->get();
```

---

## Standard Components Created

When generating payroll, these components are automatically created:

| Component | Type | Method | Amount | Taxable |
|-----------|------|--------|--------|---------|
| Basic Salary | Earning | Fixed | Employee salary | ✓ |
| House Rent (HRA) | Earning | % of Basic | 40% | ✓ |
| Transport | Earning | Allowance | ₹2,000 | ✗ |
| Provident Fund | Deduction | % of Basic | 12% | ✗ |
| Professional Tax | Deduction | Fixed | ₹200 | ✗ |
| Overtime Pay | Earning | Overtime | 1.5× hourly | ✓ |
| Income Tax | Deduction | Custom | Progressive | ✗ |

---

## Database Tables

### hr_payroll_components
```sql
CREATE TABLE hr_payroll_components (
    id BIGINT PRIMARY KEY,
    payroll_id BIGINT,
    shop_owner_id BIGINT,
    component_type ENUM('earning', 'deduction', 'benefit'),
    component_name VARCHAR(100),
    base_amount DECIMAL(15,2),
    calculation_method ENUM(...),
    calculated_amount DECIMAL(15,2),
    is_taxable BOOLEAN,
    is_recurring BOOLEAN,
    -- ... more fields
);
```

### hr_tax_brackets
```sql
CREATE TABLE hr_tax_brackets (
    id BIGINT PRIMARY KEY,
    shop_owner_id BIGINT,
    bracket_name VARCHAR(100),
    min_annual_income DECIMAL(15,2),
    max_annual_income DECIMAL(15,2),
    tax_rate DECIMAL(5,2),
    fixed_amount DECIMAL(15,2),
    applicable_from DATE,
    applicable_to DATE,
    is_active BOOLEAN
);
```

---

## Model Scopes

### PayrollComponent
```php
->forShopOwner($id)
->forPayroll($id)
->ofType('earning')
->taxable()
->nonTaxable()
->recurring()
->forGrade('L3')
->forDepartment('Engineering')
->byMethod('fixed')
```

### TaxBracket
```php
->forShopOwner($id)
->active()
->currentlyApplicable()
->forIncome($amount)
->inRange($min, $max)
->named('Slab 1')
```

### Payroll
```php
->forShopOwner($id)
->forEmployee($id)
->forPeriod('2026-02')
->pending()
->processed()
->withStatus('paid')
->withComponents()
```

---

## Security Checks

### Role Requirements

| Action | Allowed Roles |
|--------|---------------|
| Generate Payroll | PAYROLL_MANAGER, shop_owner, HR |
| Approve Payroll | PAYROLL_APPROVER, shop_owner (no self-approval) |
| Manage Components | HR |
| Export Payslip | HR, PAYROLL_MANAGER, PAYROLL_APPROVER, shop_owner |

### Status Protection

- Components: Only **pending** payrolls
- Recalculation: Only **pending** payrolls
- Core components: Cannot be deleted
- Self-approval: Blocked

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Tax = 0 | Create tax brackets for shop_owner |
| Components missing | Check PayrollService logs |
| Wrong net salary | Recalculate payroll |
| Cannot modify | Check status = 'pending' |
| Service not found | Run `php artisan config:clear` |

---

## Files Location

- **Models**: `app/Models/HR/`
  - `PayrollComponent.php`
  - `TaxBracket.php`
  - `Payroll.php` (updated)

- **Service**: `app/Services/HR/`
  - `PayrollService.php`

- **Controller**: `app/Http/Controllers/Erp/HR/`
  - `PayrollController.php` (updated)

- **Migrations**: `database/migrations/`
  - `2026_02_01_100012_create_hr_payroll_components_table.php`
  - `2026_02_01_100013_create_hr_tax_brackets_table.php`

---

## Related Documentation

- [ADVANCED_PAYROLL_SYSTEM_COMPLETE.md](ADVANCED_PAYROLL_SYSTEM_COMPLETE.md) - Full documentation
- [HR_MODULE_GUIDE.md](HR_MODULE_GUIDE.md) - HR module overview
- [API_DOCUMENTATION.md](API_DOCUMENTATION.md) - API reference

---

**Last Updated**: February 1, 2026  
**Status**: ✅ Fully Implemented
