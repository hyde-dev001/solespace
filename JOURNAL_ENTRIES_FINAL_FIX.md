# Final Fix Required for JournalEntries.tsx

## Summary
JournalEntries.tsx still has 1 function (`handleSaveDraft`) that references the removed helper functions (`ensureCsrf`, `getAuthHeaders`, `protectedBase`). All other functions have been successfully migrated.

## Status Check
✅ Imports updated - useFinanceApi imported
✅ Hook initialized - `const api = useFinanceApi()`
✅ Initial data load - migrated to api.get()
✅ handleUpdateDraft - migrated to api.patch() 
✅ handlePostEntry - migrated to api.post()
✅ handleConfirmReverse - migrated to api.post()
✅ handleDeleteEntry - migrated to api.delete()
⚠️ **handleSaveDraft - NEEDS FIX** (line 489)

## The Problem
Line 489 still contains:
```typescript
await ensureCsrf();
const url = `${protectedBase}/journal-entries`;
const res = await fetch(url, {
  method: 'POST',
  headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify(payload),
});
```

These functions (`ensureCsrf`, `getAuthHeaders`, `protectedBase`) were removed but the code still references them.

## The Fix
Replace lines 484-541 (the entire complex fetch block) with this simple code:

```typescript
console.log('[JournalEntries] Saving draft');
console.log('[JournalEntries] Payload:', payload);

const response = await api.post('/api/finance/journal-entries', payload);

console.log('[JournalEntries] Response:', response.status);

if (response.ok) {
    const entry = response.data?.data ?? response.data;
    setJournalEntries([entry, ...journalEntries]);
    resetForm();
    setIsCreateModalOpen(false);
    Swal.fire({ icon: 'success', title: 'Success', text: 'Journal entry saved as draft', timer: 1500 });
    return;
}

console.error('[JournalEntries] Save failed:', response.error);
Swal.fire({ icon: 'error', title: 'Save Failed', text: response.error || 'Failed to save entry' });
```

## Manual Steps
1. Open `resources/js/components/ERP/Finance/JournalEntries.tsx`
2. Find line 484 which says: `console.log('[JournalEntries] Saving draft, isAuthenticated:', isAuthenticated);`
3. Delete from line 484 through line 541 (the entire if/else block with fetch calls)
4. Replace with the simplified code above
5. Save the file

## Why This is Simpler
- **Before**: 60 lines with complex if/else, retry logic, fallback endpoints
- **After**: 18 lines with automatic CSRF, auth, and error handling
- **Removed**: Manual CSRF fetching, auth header construction, JSON parsing, duplicate error handling

## Verification
After the fix, search the file for these terms - they should have ZERO matches:
- `ensureCsrf`
- `getAuthHeaders` 
- `protectedBase`
- `publicBase`

## Result
Once fixed, ALL 8 Finance components will be using the unified `useFinanceApi()` hook with:
- ✅ Automatic CSRF management
- ✅ Consistent auth headers  
- ✅ Type-safe ApiResponse<T>
- ✅ Standardized error handling
- ✅ ~250 lines of boilerplate removed across all components
