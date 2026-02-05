# Permission-Based UI Access - Implementation Guide

## Problem Fixed

When you granted Finance permissions to a Staff user (e.g., `approve-budgets`, `create-invoice`), the Finance pages didn't appear in the dashboard because the frontend was checking **roles** instead of **permissions**.

## What Was Fixed

### 1. Backend - Share Permissions with Frontend
**File:** `app/Http/Middleware/HandleInertiaRequests.php`

Added permissions array to the auth object:
```php
'permissions' => Auth::guard('user')->check() 
    ? Auth::guard('user')->user()->getAllPermissions()->pluck('name')->toArray()
    : []
```

Now the frontend receives: `auth.permissions = ['view-expenses', 'create-invoices', ...]`

### 2. Frontend - Sidebar Navigation
**File:** `resources/js/layout/AppSidebar_ERP.tsx`

**Before:**
```tsx
{(role === "FINANCE_STAFF" || role === "FINANCE_MANAGER") && (
  <nav>Finance Menu</nav>
)}
```

**After:**
```tsx
{hasFinanceAccess() && (
  <nav>Finance Menu</nav>
)}

const hasFinanceAccess = () => {
  const financePermissions = ['view-expenses', 'create-expenses', ...];
  return financePermissions.some(perm => permissions.includes(perm));
};
```

### 3. Frontend - Permission Helper
**File:** `resources/js/utils/permissions.ts` (NEW)

Created reusable permission check functions:
```typescript
import { hasPermission, canApproveExpenses } from '@/utils/permissions';

// Check single permission
if (hasPermission(auth, 'approve-expenses')) {
  // Show approve button
}

// Check Finance-specific permission
if (canApproveExpenses(auth)) {
  // Enable approval workflow
}
```

### 4. Frontend - Expense Component
**File:** `resources/js/components/ERP/Finance/Expense.tsx`

**Before:**
```tsx
const canUserApprove = () => {
  return user.role === "FINANCE_MANAGER";
};
```

**After:**
```tsx
const canUserApprove = () => {
  return canApproveExpenses(auth);
};
```

## How It Works Now

1. **Shop Owner assigns permissions** via User Access Control
2. **Backend stores permissions** in Spatie permission tables
3. **Middleware shares permissions** with frontend on every request
4. **Frontend checks permissions** instead of roles
5. **UI dynamically shows/hides** based on actual permissions

## Example Flow

```
Shop Owner grants Staff user these permissions:
- approve-budgets
- create-invoices
- view-expenses

Backend: User has role "Staff" + these 3 additional permissions
Frontend receives: auth.permissions = ["approve-budgets", "create-invoices", "view-expenses", ...]

Sidebar checks: hasFinanceAccess() → TRUE (has finance permissions)
Finance menu appears ✅

Expense page checks: canApproveExpenses() → FALSE (doesn't have this permission)
Approve button hidden ✅

Budget page checks: canApproveBudgets() → TRUE
Approve button shown ✅
```

## Still Need to Update

Other Finance components that check roles:
- `Invoice.tsx` (line 227)
- `JournalEntries.tsx` (lines 337, 342)
- `InlineApprovalUtils.tsx` (lines 26, 241)
- `BudgetAnalysis.tsx` (line 179)

**How to fix:** Import `permissions.ts` helpers and replace role checks:
```tsx
// OLD:
if (user.role === "FINANCE_MANAGER") { ... }

// NEW:
import { canApproveExpenses } from '@/utils/permissions';
if (canApproveExpenses(auth)) { ... }
```

## Testing Checklist

- [ ] Staff user with no Finance permissions → Finance menu hidden
- [ ] Staff user with `view-expenses` → Finance menu visible, only Expenses page accessible
- [ ] Staff user with `approve-budgets` → Budget page shows approve button
- [ ] Staff user with `create-invoices` → Can create invoices
- [ ] Finance Staff role → All Finance Staff permissions work
- [ ] Finance Manager role → All Finance Manager permissions work

## Benefits

✅ Flexible access control - Grant specific permissions to any role  
✅ Real-time updates - Permission changes reflect immediately  
✅ Audit trail - Spatie logs all permission changes  
✅ Scalable - Easy to add new permissions without code changes  
✅ Role-independent - Staff can have Finance permissions, CRM can have HR permissions, etc.
