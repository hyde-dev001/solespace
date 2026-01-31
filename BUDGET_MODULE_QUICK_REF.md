# Budget Module - Quick Reference

## 📍 API Endpoints

### Basic CRUD
```bash
GET    /api/finance/budgets                    # List all
POST   /api/finance/budgets                    # Create
PATCH  /api/finance/budgets/{id}               # Update
DELETE /api/finance/budgets/{id}               # Delete
```

### Advanced Features ⭐
```bash
GET    /api/finance/budgets/variance           # Variance report
GET    /api/finance/budgets/utilization        # Utilization metrics
POST   /api/finance/budgets/{id}/sync-actuals  # Sync from expenses
```

## 🎣 React Query Hooks

### Queries (Read)
```typescript
const { data, isLoading } = useBudgets();
const { data } = useBudgetVariance(startDate, endDate);
const { data } = useBudgetUtilization();
```

### Mutations (Write)
```typescript
const create = useCreateBudget();
const update = useUpdateBudget();
const remove = useDeleteBudget();
const sync = useSyncBudgetActuals();

// Usage
await create.mutateAsync({ category: 'Marketing', budgeted: 50000 });
await update.mutateAsync({ id: '1', budgeted: 55000 });
await remove.mutateAsync('1');
await sync.mutateAsync({ id: '1', startDate: '2026-01-01' });
```

## 🔑 Key Features

### 1. Variance Tracking
Compares budgeted vs actual spending from approved expenses:
```json
{
  "budgeted": 50000,
  "actual": 32500,
  "variance": 17500,
  "variance_percent": 35.00
}
```

### 2. Utilization Monitoring
```json
{
  "utilization_rate": 65.67,
  "categories": {
    "on_track": 5,      // < 80% spent
    "at_risk": 2,       // 80-99% spent
    "over_budget": 1    // 100%+ spent
  }
}
```

### 3. Actuals Sync
Updates budget with real expense data:
```bash
POST /api/finance/budgets/{id}/sync-actuals?start_date=2026-01-01&end_date=2026-01-31
```

## 📂 File Locations

```
Backend:
└── app/Http/Controllers/Api/Finance/BudgetController.php

Frontend:
├── resources/js/components/ERP/Finance/BudgetAnalysis.tsx
└── resources/js/hooks/useFinanceQueries.ts

Routes:
└── routes/api.php

Docs:
├── BUDGET_MODULE_COMPLETE.md (full docs)
├── BUDGET_MODULE_SUMMARY.md (summary)
└── BUDGET_MODULE_QUICK_REF.md (this file)
```

## 🔒 Security

- **Auth:** `auth:user` middleware
- **Roles:** FINANCE_STAFF or FINANCE_MANAGER
- **Isolation:** Shop-level data separation

## 🎯 Status: ✅ PRODUCTION READY
