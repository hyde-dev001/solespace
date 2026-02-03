# 🧮 Tax Calculation Engine - Quick Reference

## ✅ Status: COMPLETE

## 🎯 What's New

Automatic tax calculation for expenses with configurable tax rates. No more manual tax entry!

## 📁 Files Created

- ✅ Migration: `2026_01_31_150000_create_finance_tax_rates_table.php`
- ✅ Model: `app/Models/Finance/TaxRate.php`
- ✅ Controller: `app/Http/Controllers/Api/Finance/TaxRateController.php`
- ✅ Routes: 8 new tax rate endpoints
- ✅ Frontend: Enhanced Expense component with auto-calculation

## 🔌 API Endpoints

### Tax Rate Management
```
GET    /api/finance/tax-rates              - List tax rates
POST   /api/finance/tax-rates              - Create tax rate
GET    /api/finance/tax-rates/effective    - Get effective rates
GET    /api/finance/tax-rates/default      - Get default rate
POST   /api/finance/tax-rates/calculate    - Calculate tax
GET    /api/finance/tax-rates/{id}         - Get single rate
PUT    /api/finance/tax-rates/{id}         - Update rate
DELETE /api/finance/tax-rates/{id}         - Delete rate
```

## 🎨 Usage in Expense Form

**User Flow**:
1. Enter amount: `₱1,000.00`
2. Select tax rate: `VAT 12%`
3. Tax auto-calculates: `₱120.00`
4. Total displays: `₱1,120.00`

**Features**:
- Real-time calculation as you type
- Optional tax (select "No Tax")
- Visual breakdown: Subtotal + Tax = Total
- Support for inclusive/exclusive tax

## ⚙️ Create Tax Rate

```bash
curl -X POST http://localhost:8000/api/finance/tax-rates \
  -H "Content-Type: application/json" \
  -d '{
    "name": "VAT 12%",
    "code": "VAT12",
    "rate": 12.00,
    "type": "percentage",
    "applies_to": "expenses",
    "is_default": true,
    "is_inclusive": false,
    "is_active": true
  }'
```

## 📊 Tax Rate Fields

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| name | string | Display name | "VAT 12%" |
| code | string | Unique code | "VAT12" |
| rate | decimal | Percentage (0-100) | 12.00 |
| type | enum | percentage \| fixed | "percentage" |
| fixed_amount | decimal | For fixed taxes | 50.00 |
| applies_to | enum | all \| expenses \| invoices \| journal_entries | "expenses" |
| is_default | boolean | Default for new records | true |
| is_inclusive | boolean | Tax included in price | false |
| is_active | boolean | Enable/disable | true |
| effective_from | date | Start date | "2026-01-01" |
| effective_to | date | End date | "2026-12-31" |

## 🧮 Calculation Examples

### Percentage Tax (Exclusive)
```
Amount: ₱1,000.00
Tax (12%): ₱120.00
Total: ₱1,120.00
```

### Percentage Tax (Inclusive)
```
Total: ₱1,120.00
Subtotal: ₱1,000.00  (calculated: 1120 / 1.12)
Tax (12%): ₱120.00
```

### Fixed Tax
```
Amount: ₱1,000.00
Fixed Fee: ₱50.00
Total: ₱1,050.00
```

## 🔒 Security

- ✅ Authentication required
- ✅ Shop isolation
- ✅ Role-based access (Finance staff)
- ✅ Audit logging
- ✅ Input validation

## ⚡ Setup Commands

```bash
# Run migration
php artisan migrate

# Verify routes
php artisan route:list --path=tax-rates

# Check migration status
php artisan migrate:status
```

## 🧪 Testing

### Create Test Tax Rate
```bash
curl -X POST http://localhost:8000/api/finance/tax-rates \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "name": "Test VAT 10%",
    "code": "TEST10",
    "rate": 10.00,
    "type": "percentage",
    "applies_to": "all",
    "is_default": false,
    "is_inclusive": false,
    "is_active": true
  }'
```

### Test Calculation
```bash
curl -X POST http://localhost:8000/api/finance/tax-rates/calculate \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"tax_rate_id": 1, "subtotal": 1000.00}'
```

### Test in UI
1. Go to Finance → Expense Tracking
2. Click "Add Expense"
3. Enter amount and select tax rate
4. ✅ Tax calculates automatically

## 🐛 Troubleshooting

**Tax not calculating**:
- Check tax rate is active
- Verify effective dates
- Check browser console for errors

**Tax rates not loading**:
- Verify API endpoint: `/api/finance/tax-rates/effective?applies_to=expenses`
- Check authentication
- Verify shop_id

**Calculation incorrect**:
- Check tax rate percentage in database
- Verify inclusive/exclusive setting
- Test calculation endpoint directly

## 💡 Common Tax Configurations

### Philippines VAT
```json
{
  "name": "VAT 12%",
  "code": "VAT12",
  "rate": 12.00,
  "type": "percentage",
  "is_inclusive": false
}
```

### US Sales Tax (varies by state)
```json
{
  "name": "Sales Tax 8%",
  "code": "SALES8",
  "rate": 8.00,
  "type": "percentage",
  "is_inclusive": false
}
```

### Australia GST
```json
{
  "name": "GST 10%",
  "code": "GST10",
  "rate": 10.00,
  "type": "percentage",
  "is_inclusive": true
}
```

### Processing Fee (Fixed)
```json
{
  "name": "Processing Fee",
  "code": "PROC_FEE",
  "type": "fixed",
  "fixed_amount": 50.00
}
```

## 📈 Database Queries

### Get Active Tax Rates
```sql
SELECT * FROM finance_tax_rates 
WHERE is_active = 1 AND shop_id = 1
ORDER BY is_default DESC, name;
```

### Get Default Tax for Expenses
```sql
SELECT * FROM finance_tax_rates 
WHERE is_active = 1 
  AND shop_id = 1
  AND (applies_to = 'all' OR applies_to = 'expenses')
  AND is_default = 1
LIMIT 1;
```

### Check Effective Rates
```sql
SELECT * FROM finance_tax_rates 
WHERE is_active = 1 
  AND (effective_from IS NULL OR effective_from <= CURDATE())
  AND (effective_to IS NULL OR effective_to >= CURDATE())
ORDER BY name;
```

## 🎓 Model Methods

```php
// Calculate tax from subtotal
$tax = $taxRate->calculateTax(1000.00);  // Returns 120.00 for 12%

// Calculate total
$total = $taxRate->calculateTotal(1000.00);  // Returns 1120.00

// Reverse calculate (for inclusive tax)
$subtotal = $taxRate->calculateSubtotalFromTotal(1120.00);  // Returns 1000.00

// Check if effective
if ($taxRate->isEffective()) { /* ... */ }
```

## ✨ Features

- ✅ Auto-calculation as you type
- ✅ Percentage & fixed tax support
- ✅ Inclusive vs exclusive tax
- ✅ Time-limited tax rates
- ✅ Default tax selection
- ✅ Per-transaction-type rates
- ✅ Shop isolation
- ✅ Audit logging

## 📝 Next Steps

1. Create your tax rates (VAT, Sales Tax, etc.)
2. Set default tax for expenses
3. Test in expense form
4. Extend to invoices if needed
5. Configure region-specific rates

---

**Status**: ✅ Production Ready  
**Priority**: P3 (Complete)  
**Date**: January 31, 2026  
**Impact**: Tax compliance automated!
