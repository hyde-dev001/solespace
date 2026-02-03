# Finance API Standardization - Migration Guide

## Overview

All Finance components now use the unified `useFinanceApi()` hook for consistent data fetching patterns.

## Benefits

✅ **Consistent auth handling** - No more 3 different patterns  
✅ **Automatic CSRF management** - Handled internally  
✅ **Type-safe responses** - ApiResponse<T> interface  
✅ **Better error handling** - Standardized error format  
✅ **Cleaner code** - Less boilerplate in components  
✅ **Easier testing** - Mock once, test everywhere  

## Hook Location

```typescript
import { useFinanceApi } from '../../../hooks/useFinanceApi';
```

## Basic Usage

```typescript
const MyComponent: React.FC = () => {
  const api = useFinanceApi();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/finance/expenses');
      
      if (response.ok) {
        setData(response.data);
      } else {
        console.error('Failed to load:', response.error);
      }
    } catch (error) {
      console.error('Request failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return <div>...</div>;
};
```

## API Methods

### GET Request
```typescript
const response = await api.get<Expense[]>('/api/finance/expenses');
```

### POST Request
```typescript
const response = await api.post('/api/finance/expenses', {
  amount: 1000,
  category: 'Office Supplies'
});
```

### PUT Request
```typescript
const response = await api.put(`/api/finance/expenses/${id}`, updatedData);
```

### PATCH Request
```typescript
const response = await api.patch(`/api/finance/expenses/${id}`, { status: 'approved' });
```

### DELETE Request
```typescript
const response = await api.delete(`/api/finance/expenses/${id}`);
```

## Response Format

```typescript
interface ApiResponse<T = any> {
  ok: boolean;          // Request succeeded
  status: number;       // HTTP status code
  data?: T;            // Response data (unwrapped from Laravel format)
  error?: string;      // Error message if failed
}
```

## Advanced Features

### Public Endpoints (Skip Auth)
```typescript
const response = await api.get('/api/finance/public/accounts', {
  skipAuth: true
});
```

### Custom Headers
```typescript
const response = await api.post('/api/finance/expenses', data, {
  headers: {
    'X-Custom-Header': 'value'
  }
});
```

### Get Auth State
```typescript
const api = useFinanceApi();

if (api.isAuthenticated) {
  // User is logged in
}

const baseUrl = api.getBaseUrl(); // Returns correct URL based on auth state
```

## Migration Steps

### Before (Manual CSRF)
```typescript
// ❌ OLD WAY - Manual CSRF handling
const csrfReady = useRef(false);

const ensureCsrf = async () => {
  if (csrfReady.current) return true;
  const r = await fetch('/sanctum/csrf-cookie', { credentials: 'include' });
  if (r.ok) csrfReady.current = true;
  return r.ok;
};

const loadData = async () => {
  await ensureCsrf();
  const res = await fetch('/api/finance/expenses', {
    credentials: 'include',
    headers: { 'Accept': 'application/json' }
  });
  const data = await res.json();
  setExpenses(data);
};
```

### After (useFinanceApi)
```typescript
// ✅ NEW WAY - Clean and consistent
const api = useFinanceApi();

const loadData = async () => {
  const response = await api.get('/api/finance/expenses');
  if (response.ok) {
    setExpenses(response.data);
  }
};
```

## Component Migration Checklist

### 1. Remove old imports
```typescript
// Remove these:
import { usePage } from '@inertiajs/react';
import { useRef } from 'react'; // if only used for CSRF
import { fetchWithCsrf } from '../../../utils/fetch-with-csrf';
```

### 2. Add new import
```typescript
import { useFinanceApi } from '../../../hooks/useFinanceApi';
```

### 3. Replace manual auth setup
```typescript
// Remove:
const { auth } = usePage().props;
const csrfReady = useRef(false);
const ensureCsrf = async () => { ... };
const getAuthHeaders = () => { ... };

// Add:
const api = useFinanceApi();
```

### 4. Update fetch calls
```typescript
// Replace all:
await ensureCsrf();
const res = await fetch(url, { ... });
const data = await res.json();

// With:
const response = await api.get(url);
if (response.ok) {
  const data = response.data;
}
```

### 5. Update POST/PUT/DELETE calls
```typescript
// Replace:
await ensureCsrf();
const res = await fetch(url, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data)
});

// With:
const response = await api.post(url, data);
```

## Components Migrated

- ✅ **ApprovalWorkflow.tsx** - Complete (reference implementation)
- ⏳ **Invoice.tsx** - Uses fetchWithCsrf (needs migration)
- ⏳ **Expense.tsx** - Uses fetchWithCsrf (needs migration)
- ⏳ **JournalEntries.tsx** - Manual CSRF (needs migration)
- ⏳ **Reconciliation.tsx** - Manual CSRF (needs migration)
- ⏳ **BudgetAnalysis.tsx** - Mixed fetchWithCsrf + direct fetch (needs migration)
- ⏳ **FinancialReporting.tsx** - Uses fetchWithCsrf (needs migration)
- ⏳ **InlineApprovalUtils.tsx** - Uses fetchWithCsrf (needs migration)

## Testing

After migration, test each component:

1. **Data loading** - Verify data loads on mount
2. **Mutations** - Test create, update, delete operations
3. **Error handling** - Check error messages display correctly
4. **Auth state** - Test both authenticated and public endpoints
5. **CSRF protection** - Verify POST/PUT/DELETE work without manual CSRF calls

## Common Issues

### Issue: Response data is undefined
**Solution:** Hook unwraps Laravel's `{data: [...]}` format automatically. Access via `response.data` not `response.data.data`.

### Issue: 401 errors after migration
**Solution:** Check if endpoint requires session auth. Use `api.getBaseUrl()` to get correct URL prefix.

### Issue: Public endpoints return 403
**Solution:** Add `{ skipAuth: true }` option for public endpoints.

## Performance Notes

- ✅ CSRF cookie is fetched **once** per component lifecycle
- ✅ Requests use `useCallback` to prevent unnecessary re-renders
- ✅ Auth headers computed only when needed
- ✅ Base URL determined once at hook initialization

## Next Steps

1. Migrate remaining Finance components one at a time
2. Update tests to use mocked useFinanceApi hook
3. Consider deprecating old fetchWithCsrf helper
4. Add centralized error toast/notification system

---

**Created:** January 31, 2026  
**Status:** In Progress (1/8 components migrated)  
**Priority:** P2 - Code Quality & Maintainability
