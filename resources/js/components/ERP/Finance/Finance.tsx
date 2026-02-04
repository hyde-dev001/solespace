import { useMemo, useState, useEffect } from "react";
import { Head, usePage } from "@inertiajs/react";
import AppLayoutERP from "../../../layout/AppLayout_ERP";
// REMOVED: Enterprise-level features not needed for SMEs
// import ChartoOfAccounts from "../Finance/ChartoOfAccounts";
// import { JournalEntries } from "../Finance/JournalEntries";
import Invoice from "../Finance/Invoice";
import Expense from "../Finance/Expense";
// import FinancialReporting from "../Finance/FinancialReporting";
// import BudgetAnalysis from "../Finance/BudgetAnalysis";
// import Reconciliation from "../Finance/Reconciliation";
import CreateInvoice from "../Finance/createInvoice";
import RepairPriceApproval from "../Finance/repairPriceApproval";
import ShoePriceApproval from "../Finance/shoePriceApproval";
import ErrorModal from "../../common/ErrorModal";

// Simplified for SMEs - only essential features
type Section = "invoice-generation" | "create-invoice" | "expense-tracking" | "repair-pricing" | "shoe-pricing";

export default function FinancePage() {
  const { auth, url } = usePage().props as any;
  const userRole = auth?.user?.role;
  const [error, setError] = useState<string | null>(null);

  // Mark page as successfully loaded
  useEffect(() => {
    sessionStorage.setItem('finance_page_loaded', Date.now().toString());
  }, []);

  const section: Section = useMemo(() => {
    // Extract section from the URL query parameter
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const value = urlParams.get("section") || "invoice-generation";
      if (["invoice-generation", "create-invoice", "expense-tracking", "repair-pricing", "shoe-pricing"].includes(value)) return value as Section;
      return "invoice-generation";
    }
    return "invoice-generation";
  }, []);

  const headTitle = useMemo(() => {
    if (section === "invoice-generation") return "Invoices - Solespace ERP";
    if (section === "create-invoice") return "Create Invoice - Solespace ERP";
    if (section === "expense-tracking") return "Expense Tracking - Solespace ERP";
    if (section === "repair-pricing") return "Repair Price Approval - Solespace ERP";
    if (section === "shoe-pricing") return "Shoe Price Approval - Solespace ERP";
    return "Finance - Solespace ERP";
  }, [section]);

  const renderContent = () => {
    try {
      switch (section) {
        case "invoice-generation":
          return <Invoice />;
        case "create-invoice":
          return <CreateInvoice />;
        case "expense-tracking":
          return <Expense />;
        case "repair-pricing":
          return <RepairPriceApproval />;
        case "shoe-pricing":
          return <ShoePriceApproval />;
        default:
          return <Invoice />;
      }
    } catch (e: any) {
      setError(e?.message || "An unexpected error occurred. Please try again later.");
      return null;
    }
  };

  return (
    <AppLayoutERP>
      <Head title={headTitle} />
      {error && (
        <ErrorModal message={error} onClose={() => setError(null)} />
      )}
      <div className="w-full">{renderContent()}</div>
    </AppLayoutERP>
  );
}
