// Example: Migrating Invoice.tsx to useFinanceApi Hook
// This file demonstrates the migration pattern - DO NOT COMMIT

import React, { useState, useMemo } from "react";
import { createPortal } from "react-dom";
import { usePage } from '@inertiajs/react';
import { useFinanceApi } from "../../../hooks/useFinanceApi"; // ✅ NEW: Add hook import
// import { fetchWithCsrf } from "../../../utils/fetch-with-csrf"; // ❌ OLD: Remove this

// ... existing imports and components ...

const Invoice: React.FC = () => {
  const page = usePage();
  const user = page.props.auth?.user as any;
  const api = useFinanceApi(); // ✅ NEW: Initialize API hook

  // ... existing state ...
  const [loading, setLoading] = useState(true);
  const [postingInvoiceId, setPostingInvoiceId] = useState<string | null>(null);

  // ✅ NEW: Simplified post invoice handler
  const handlePostInvoice = async (invoiceId: string) => {
    setPostingInvoiceId(invoiceId);
    try {
      // Replace fetchWithCsrf with api.post
      const response = await api.post(`/api/finance/invoices/${invoiceId}/post`);

      if (!response.ok) {
        throw new Error(response.error || 'Failed to post invoice');
      }

      // Refresh invoice list
      const refreshResponse = await api.get('/api/finance/invoices');
      
      if (refreshResponse.ok) {
        setInvoices(refreshResponse.data);
      }

      // Success notification...
      showSuccessNotification();
    } catch (error) {
      console.error('Error posting invoice:', error);
      showErrorNotification(error);
    } finally {
      setPostingInvoiceId(null);
    }
  };

  // ✅ NEW: Load invoices on mount
  React.useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        
        // Replace fetchWithCsrf with api.get
        const response = await api.get('/api/finance/invoices');
        
        if (response.ok) {
          setInvoices(response.data);
        } else {
          console.error('Failed to load invoices:', response.error);
        }
      } catch (err) {
        console.error('Failed to load invoices', err);
      } finally {
        setLoading(false);
      }
    })();
  }, [api]);

  // ... rest of component ...
};

// MIGRATION SUMMARY:
// 1. ✅ Added: import { useFinanceApi } from '../../../hooks/useFinanceApi'
// 2. ✅ Removed: import { fetchWithCsrf } from '../../../utils/fetch-with-csrf'
// 3. ✅ Added: const api = useFinanceApi() at component start
// 4. ✅ Replaced: fetchWithCsrf() calls with api.get() / api.post()
// 5. ✅ Simplified: No manual CSRF handling needed
// 6. ✅ Improved: Better error handling with response.ok / response.error

export default Invoice;
