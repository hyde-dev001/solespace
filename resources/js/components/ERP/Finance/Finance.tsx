import { useMemo, useState, useEffect } from "react";
import { Head, usePage } from "@inertiajs/react";
import AppLayoutERP from "../../../layout/AppLayout_ERP";
import ChartoOfAccounts from "../Finance/ChartoOfAccounts";
import { JournalEntries } from "../Finance/JournalEntries";
import Invoice from "../Finance/Invoice";
import Expense from "../Finance/Expense";
import FinancialReporting from "../Finance/FinancialReporting";
import BudgetAnalysis from "../Finance/BudgetAnalysis";
import Reconciliation from "../Finance/Reconciliation";
import CreateInvoice from "../Finance/createInvoice";
import RepairPriceApproval from "../Finance/repairPriceApproval";
import ShoePriceApproval from "../Finance/shoePriceApproval";
import ErrorModal from "../../common/ErrorModal";

type Section = "chart-of-accounts" | "journal-entries" | "invoice-generation" | "create-invoice" | "expense-tracking" | "financial-reporting" | "budget-analysis" | "reconciliation" | "repair-pricing" | "shoe-pricing";

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
      const value = urlParams.get("section") || "chart-of-accounts";
      if (["chart-of-accounts", "journal-entries", "invoice-generation", "create-invoice", "expense-tracking", "financial-reporting", "budget-analysis", "reconciliation", "repair-pricing", "shoe-pricing"].includes(value)) return value as Section;
      return "chart-of-accounts";
    }
    return "chart-of-accounts";
  }, []);

  const headTitle = useMemo(() => {
    if (section === "chart-of-accounts") return "Chart of Accounts - Solespace ERP";
    if (section === "journal-entries") return "Journal Entries - Solespace ERP";
    if (section === "invoice-generation") return "Invoices - Solespace ERP";
    if (section === "create-invoice") return "Create Invoice - Solespace ERP";
    if (section === "expense-tracking") return "Expense Tracking - Solespace ERP";
    if (section === "financial-reporting") return "Financial Reporting - Solespace ERP";
    if (section === "budget-analysis") return "Budget Analysis - Solespace ERP";
    if (section === "reconciliation") return "Bank Reconciliation - Solespace ERP";
    if (section === "repair-pricing") return "Repair Price Approval - Solespace ERP";
    if (section === "shoe-pricing") return "Shoe Price Approval - Solespace ERP";
    return "Finance - Solespace ERP";
  }, [section]);

  const renderContent = () => {
    try {
      switch (section) {
        case "journal-entries":
          return <JournalEntries />;
        case "invoice-generation":
          return <Invoice />;
        case "create-invoice":
          return <CreateInvoice />;
        case "expense-tracking":
          return <Expense />;
        case "financial-reporting":
          return <FinancialReporting />;
        case "budget-analysis":
          return <BudgetAnalysis />;
        case "reconciliation":
          return <Reconciliation />;
        case "repair-pricing":
          return <RepairPriceApproval />;
        case "shoe-pricing":
          return <ShoePriceApproval />;
        case "chart-of-accounts":
        default:
          return <ChartoOfAccounts />;
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
