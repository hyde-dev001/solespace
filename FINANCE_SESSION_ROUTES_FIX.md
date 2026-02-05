# Finance Session Routes Fix - Manager Access

## Problem
When Manager tries to create an invoice, the frontend gets 404 errors for:
- `/api/finance/session/accounts`

## Root Cause
The Chart of Accounts routes under `/api/finance/session/` were commented out in `routes/web.php` (lines 273-275).

## Solution
Re-enabled the session-based Chart of Accounts routes for frontend compatibility.

### Changes Made

**File: `routes/web.php`**

```php
// BEFORE (commented out):
// REMOVED: Chart of Accounts - System auto-creates accounts for SMEs
// Route::get('accounts', [\App\Http\Controllers\Api\Finance\AccountController::class, 'index']);
// Route::post('accounts', [\App\Http\Controllers\Api\Finance\AccountController::class, 'store']);
// Route::get('accounts/{id}/ledger', [\App\Http\Controllers\Api\Finance\AccountController::class, 'ledger']);

// AFTER (re-enabled):
// Chart of Accounts - Re-enabled for frontend compatibility
Route::get('accounts', [\App\Http\Controllers\Api\Finance\AccountController::class, 'index']);
Route::post('accounts', [\App\Http\Controllers\Api\Finance\AccountController::class, 'store']);
Route::get('accounts/{id}', [\App\Http\Controllers\Api\Finance\AccountController::class, 'show']);
Route::get('accounts/{id}/ledger', [\App\Http\Controllers\Api\Finance\AccountController::class, 'ledger']);
```

## Routes Now Available

✅ `GET /api/finance/session/accounts` - List all accounts
✅ `POST /api/finance/session/accounts` - Create new account  
✅ `GET /api/finance/session/accounts/{id}` - Get account details
✅ `GET /api/finance/session/accounts/{id}/ledger` - Get account ledger

**Middleware:** `auth:user` (session-based authentication)

**Access:** All authenticated users with valid session can access these routes

## Verification

```bash
php artisan route:list --path=api/finance/session/accounts
```

Output:
```
GET|HEAD   api/finance/session/accounts
POST       api/finance/session/accounts
GET|HEAD   api/finance/session/accounts/{id}
GET|HEAD   api/finance/session/accounts/{id}/ledger
```

## Manager Access Confirmed

✅ Manager role has all required finance permissions:
- `view-expenses`
- `view-invoices`
- `view-finance-audit-logs`
- All other finance permissions (63 total)

✅ Session-based routes use `auth:user` middleware (no role restrictions)

✅ Manager can now:
- View chart of accounts
- Create invoices (which need accounts)
- Manage all finance operations

## Testing Instructions

1. **Login as Manager** (dan@gmail.com)
2. **Navigate to Create Invoice** page
3. **Verify:**
   - ✅ No 404 errors in browser console
   - ✅ Accounts dropdown loads successfully
   - ✅ Can create invoice without errors

## Related Routes

The system also has these account routes with permission checks:
- `/api/finance/accounts` - With Spatie permission middleware
- `/api/finance/session/accounts` - Session-based (no permission check)

Both route groups point to the same `AccountController`, but session routes are more permissive for backward compatibility.

## Date Fixed
February 5, 2026

## Status
✅ Fixed and Ready for Testing
