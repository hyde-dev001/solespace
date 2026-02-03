import { useCallback, useEffect, useRef, useState } from "react";
import { Link, usePage } from "@inertiajs/react";
import { route } from "ziggy-js";

// Assume these icons are imported from an icon library
import {
  CheckLineIcon,
  ChevronDownIcon,
  HorizontaLDots,
  CurrencyDollarIcon,
} from "../icons";
import { useSidebar } from "../context/SidebarContext";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  route?: string; // Changed from path to route
  params?: Record<string, any>;
  extraPaths?: string[];
  subItems?: { name: string; route: string; params?: Record<string, any>; icon?: React.ReactNode; pro?: boolean; new?: boolean }[];
};

const navItems: NavItem[] = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 12c0-4.97-4.03-9-9-9S3 7.03 3 12"></path>
        <path d="M3 12h18"></path>
        <path d="M12 3v9l4 2"></path>
      </svg>
    ),
    name: "Dashboard",
    route: "erp.hr",
    params: { section: "overview" },
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
        <circle cx="9" cy="7" r="4"></circle>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
      </svg>
    ),
    name: "Employees",
    route: "erp.hr",
    params: { section: "employees" },
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
        <rect x="8" y="2" width="8" height="4"></rect>
        <path d="M9 14h6"></path>
        <path d="M9 10h6"></path>
      </svg>
    ),
    name: "Attendance",
    subItems: [
      {
        name: "View Attendance",
        route: "erp.hr",
        params: { section: "view-attendance" },
        icon: (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
        ),
        pro: false,
      },
      {
        name: "Leave Requests",
        route: "erp.hr",
        params: { section: "leave" },
        icon: (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"></path>
          </svg>
        ),
        pro: false,
      },
    ],
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="1"></circle>
        <path d="M12 1v6m0 6v6"></path>
        <path d="M4.22 4.22l4.24 4.24m5.08 0l4.24-4.24"></path>
        <path d="M1 12h6m6 0h6"></path>
        <path d="M4.22 19.78l4.24-4.24m5.08 0l4.24 4.24"></path>
      </svg>
    ),
    name: "Payroll",
    subItems: [
      {
        name: "View Slip",
        route: "erp.hr",
        params: { section: "payroll-view" },
        icon: (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 4h11a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"></path>
            <path d="M8 2v4"></path>
            <path d="M12 11h4"></path>
            <path d="M8 15h8"></path>
          </svg>
        ),
      },
      {
        name: "Generate Slip",
        route: "erp.hr",
        params: { section: "payroll-generate" },
        icon: (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 4h16v6H4z"></path>
            <path d="M4 14h16v6H4z"></path>
            <path d="M9 8h6"></path>
            <path d="M9 18h6"></path>
          </svg>
        ),
      },
    ],
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 17"></polyline>
        <polyline points="17 6 23 6 23 12"></polyline>
      </svg>
    ),
    name: "Performance",
    route: "erp.hr",
    params: { section: "performance" },
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
      </svg>
    ),
    name: "Training",
    route: "erp.hr",
    params: { section: "training" },
  },
];

const financeItems: NavItem[] = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="18" height="18" rx="4" ry="4"></rect>
        <path d="M7 15l3-3 2 2 4-4"></path>
        <path d="M7 10h2"></path>
        <path d="M7 7h4"></path>
      </svg>
    ),
    name: "Chart of Accounts",
    route: "finance.index",
    params: { section: "chart-of-accounts" },
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
        <polyline points="14 2 14 8 20 8"></polyline>
        <line x1="12" y1="18" x2="12" y2="12"></line>
        <line x1="9" y1="15" x2="15" y2="15"></line>
      </svg>
    ),
    name: "Journal Entries",
    route: "finance.index",
    params: { section: "journal-entries" },
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
        <polyline points="14 2 14 8 20 8"></polyline>
        <line x1="16" y1="13" x2="8" y2="13"></line>
        <line x1="16" y1="17" x2="8" y2="17"></line>
        <polyline points="10 9 9 9 8 9"></polyline>
      </svg>
    ),
    name: "Invoice Generation",
    route: "finance.index",
    params: { section: "invoice-generation" },
    extraPaths: ["/create-invoice"],
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path>
      </svg>
    ),
    name: "Pricing Approvals",
    subItems: [
      {
        name: "Repair Pricing",
        route: "finance.index",
        params: { section: "repair-pricing" },
        icon: (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
          </svg>
        ),
      },
      {
        name: "Shoe Pricing",
        route: "finance.index",
        params: { section: "shoe-pricing" },
        icon: (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M2 17s.5-3.5 4-3.5 4 3.5 4 3.5m6 0s.5-3.5 4-3.5 4 3.5 4 3.5M2 17h20v4H2z"></path>
          </svg>
        ),
      },
    ],
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10"></circle>
        <path d="M12 6v6l4 2"></path>
      </svg>
    ),
    name: "Expense Tracking",
    route: "finance.index",
    params: { section: "expense-tracking" },
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 3v18h18"></path>
        <path d="M18 17V9"></path>
        <path d="M13 17V5"></path>
        <path d="M8 17v-3"></path>
      </svg>
    ),
    name: "Financial Reporting",
    route: "finance.index",
    params: { section: "financial-reporting" },
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="12" y1="1" x2="12" y2="23"></line>
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
      </svg>
    ),
    name: "Budget Analysis",
    route: "finance.index",
    params: { section: "budget-analysis" },
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z"></path>
      </svg>
    ),
    name: "Bank Reconciliation",
    route: "finance.index",
    params: { section: "reconciliation" },
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 12a8 8 0 018-8V0c-4.418 0-8 3.582-8 8s3.582 8 8 8v-4c-2.209 0-4-1.791-4-4zm15.293-4.707a1 1 0 00-1.414 1.414L17.586 10H15a1 1 0 000 2h4a1 1 0 001-1V7a1 1 0 10-2 0v1.293l-1.293-1.293z"/>
      </svg>
    ),
    name: "Recurring Transactions",
    route: "erp.finance.recurring-transactions.index",
    new: true,
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10"></circle>
        <path d="M12 6v6l4 2"></path>
      </svg>
    ),
    name: "Cost Centers",
    route: "erp.finance.cost-centers.index",
    new: true,
  },
  {
    /* Approval Workflow removed */
  },
];

const crmItems: NavItem[] = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z"></path>
      </svg>
    ),
    name: "CRM Dashboard",
    route: "crm.dashboard",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
        <circle cx="12" cy="7" r="4"></circle>
      </svg>
    ),
    name: "Opportunities",
    route: "crm.opportunities",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 10a8 8 0 1 0-18 0"></path>
        <circle cx="12" cy="14" r="3"></circle>
      </svg>
    ),
    name: "Leads",
    route: "crm.leads",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="4" width="18" height="16" rx="2"></rect>
        <path d="M16 2v4"></path>
        <path d="M8 2v4"></path>
      </svg>
    ),
    name: "Customers",
    route: "crm.customers",
  },
];

const scmItems: NavItem[] = [];

const othersItems: NavItem[] = [];

const managerItems: NavItem[] = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 16V8l-9-5-9 5v8l9 5 9-5z"></path>
        <path d="M12 3v13"></path>
        <path d="M3 8l9 5 9-5"></path>
      </svg>
    ),
    name: "Manager Dashboard",
    route: "erp.manager.dashboard",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 16V8a2 2 0 0 0-1-1.73L12 3 4 6.27A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73L12 21l8-4.27A2 2 0 0 0 21 16z"></path>
        <path d="M12 12v9"></path>
      </svg>
    ),
    name: "Inventory Overview",
    route: "erp.manager.inventory-overview",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
        <line x1="7" y1="7" x2="7.01" y2="7"></line>
      </svg>
    ),
    name: "Pricing & Services",
    subItems: [
      {
        name: "Repair Pricing",
        route: "erp.manager.pricing-services",
      },
      {
        name: "Shoe Pricing",
        route: "erp.manager.shoe-pricing",
      },
    ],
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 2v6M5 8h14M5 14h14M12 18v4" />
      </svg>
    ),
    name: "Reports",
    route: "erp.manager.reports",
  },
];

const staffItems: NavItem[] = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 11l9-7 9 7"></path>
        <path d="M5 11v8a2 2 0 002 2h10a2 2 0 002-2v-8"></path>
        <path d="M9 21v-6h6v6"></path>
      </svg>
    ),
    name: "Staff Dashboard",
    route: "erp.staff.dashboard",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
        <path d="M6 6h15l-1.5 9h-12z" />
        <circle cx="9" cy="19" r="1.5" />
        <circle cx="18" cy="19" r="1.5" />
        <path d="M6 6L4 2" />
      </svg>
    ),
    name: "Job Orders Retail",
    route: "erp.staff.job-orders",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
        <circle cx="12" cy="12" r="3"></circle>
      </svg>
    ),
    name: "Job Orders Repair",
    route: "erp.staff.job-orders-repair",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="8" />
        <path d="M12 8v4l3 2" />
      </svg>
    ),
    name: "Attendance",
    route: "erp.staff.attendance",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="7" r="3"></circle>
        <path d="M5 21v-2a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v2" />
      </svg>
    ),
    name: "Customers",
    route: "erp.staff.customers",
  },
];

const AppSidebar_ERP: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered, openSubmenu, toggleSubmenu } = useSidebar();
  const { url, props } = usePage();
  const role = (props as any)?.auth?.user?.role;

  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>({});
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Initialize with collapsed menus
  useEffect(() => {
    // Clear any previously stored open submenu on initial load
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('sidebarOpenSubmenu');
      if (stored) {
        localStorage.removeItem('sidebarOpenSubmenu');
        // Don't toggle, just let it stay closed
      }
    }
  }, []);

  const isActive = useCallback(
    (routeName: string, params?: Record<string, any>, extraPaths?: string[]) => {
      try {
        // Frontend-only staff routes: compare against mapped static paths
        if (routeName && routeName.startsWith && routeName.startsWith("erp.staff.")) {
          const staffPath = staffRouteMap[routeName] || "";
          if (!staffPath) return false;
          // Exact match first
          if (url === staffPath) return true;
          // For partial matches, ensure we don't match prefixes (e.g., /job-orders shouldn't match /job-orders-repair)
          if (url.startsWith(staffPath + '/')) return true;
          if (extraPaths && extraPaths.some((p) => url.startsWith(p))) return true;
          return false;
        }

        // Prefer Ziggy's router check when available
        try {
          if (typeof route === "function") {
            const router = (route as any)();
            if (typeof router.current === "function") {
              if (router.current(routeName, params)) return true;
            }
          }
        } catch (e) {
          // ignore and fallback to URL comparison
        }

        // Fallback: compare resolved route URL to current page URL
        try {
          const routeUrl = route(routeName, params || undefined);
          if (url === routeUrl || url.startsWith(routeUrl)) return true;
        } catch {
          // ignore
        }

        if (extraPaths && extraPaths.some((path) => url.startsWith(path))) return true;
        return false;
      } catch {
        return false;
      }
    },
    [url]
  );

  // Map staff route names to static frontend paths (fallback when Ziggy route names are not available)
  const staffRouteMap: Record<string, string> = {
    "erp.staff.dashboard": "/erp/staff/dashboard",
    "erp.staff.job-orders": "/erp/staff/job-orders",
    "erp.staff.job-orders-repair": "/erp/staff/job-orders-repair",
    "erp.staff.repair-status": "/erp/staff/repair-status",
    
    "erp.staff.attendance": "/erp/staff/attendance",
    "erp.staff.customers": "/erp/staff/customers",
  };

  const getHrefByRoute = (routeName?: string, params?: Record<string, any>) => {
    if (!routeName) return "#";
    if (routeName.startsWith && routeName.startsWith("erp.staff.")) {
      return staffRouteMap[routeName] || "#";
    }
    try {
      return route(routeName, params || undefined);
    } catch {
      return staffRouteMap[routeName] || "#";
    }
  };

  const isMenuActive = useCallback(
    (nav: NavItem) => {
      if (nav.route && isActive(nav.route, nav.params, nav.extraPaths)) return true;
      if (nav.subItems) {
        return nav.subItems.some(sub => isActive(sub.route, sub.params));
      }
      return false;
    },
    [isActive]
  );

  useEffect(() => {
    // Don't auto-expand menus on page load - let users manually toggle
    // This prevents the menu from staying expanded when using localStorage
  }, [url, isActive, openSubmenu, toggleSubmenu]);

  useEffect(() => {
    if (openSubmenu !== null) {
      const key = openSubmenu;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prevHeights) => ({
          ...prevHeights,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (index: number, menuType: "main" | "others") => {
    const key = `${menuType}-${index}`;
    toggleSubmenu(key);
  };

  // Filter finance items based on user role
  const getFilteredFinanceItems = () => {
    return financeItems.filter((item) => {
      // Allow approval workflow only for FINANCE_MANAGER
      if (item.route === "approvals.index") {
        return role === "FINANCE_MANAGER";
      }
      // Show all other finance items for any finance role
      return true;
    });
  };

  const renderMenuItems = (items: NavItem[], menuType: "main" | "others") => {
    return (
      <ul className="flex flex-col gap-4">
        {items.map((nav, index) => {
          const subItems = nav.subItems?.filter((s) => s.name !== "Create Admin") || nav.subItems;
          if (nav.subItems && (!subItems || subItems.length === 0)) {
            return null;
          }

          return (
            <li key={nav.name}>
              {subItems ? (
                <button
                  onClick={() => handleSubmenuToggle(index, menuType)}
                  className={`menu-item group ${
                    isMenuActive(nav) || openSubmenu === `${menuType}-${index}`
                      ? "menu-item-active"
                      : "menu-item-inactive"
                  } cursor-pointer ${
                    !isExpanded && !isHovered
                      ? "lg:justify-center"
                      : "lg:justify-start"
                  }`}
                >
                  <span
                    className={`menu-item-icon-size w-6 h-6 ${
                      isMenuActive(nav) || openSubmenu === `${menuType}-${index}`
                        ? "menu-item-icon-active"
                        : "menu-item-icon-inactive"
                    }`}
                  >
                    {nav.icon}
                  </span>
                  {(isExpanded || isHovered || isMobileOpen) && (
                    <span className="menu-item-text">{nav.name}</span>
                  )}
                  {(isExpanded || isHovered || isMobileOpen) && (
                    <ChevronDownIcon
                      className={`ml-auto w-5 h-5 transition-transform duration-200 ${
                        openSubmenu === `${menuType}-${index}`
                          ? "rotate-180"
                          : ""
                      }`}
                    />
                  )}
                </button>
              ) : (
                nav.route && (
                  <Link
                    href={getHrefByRoute(nav.route, nav.params || undefined)}
                    className={`menu-item group ${
                      isActive(nav.route, nav.params, nav.extraPaths) ? "menu-item-active" : "menu-item-inactive"
                    }`}
                  >
                    <span
                      className={`menu-item-icon-size w-6 h-6 ${
                        isActive(nav.route, nav.params, nav.extraPaths)
                          ? "menu-item-icon-active"
                          : "menu-item-icon-inactive"
                      }`}
                    >
                      {nav.icon}
                    </span>
                    {(isExpanded || isHovered || isMobileOpen) && (
                      <span className="menu-item-text">{nav.name}</span>
                    )}
                  </Link>
                )
              )}

              {subItems && (isExpanded || isHovered || isMobileOpen) && (
                <div
                  ref={(el) => {
                    subMenuRefs.current[`${menuType}-${index}`] = el;
                  }}
                  className="overflow-hidden transition-all duration-300"
                  style={{
                    height:
                      openSubmenu === `${menuType}-${index}`
                        ? `${subMenuHeight[`${menuType}-${index}`]}px`
                        : "0px",
                  }}
                >
                  <ul className="mt-2 space-y-1 ml-9">
                    {subItems.map((subItem, subIndex) => (
                      <li key={`${subItem.route}-${subIndex}`}>
                        <Link
                          href={getHrefByRoute(subItem.route, subItem.params || undefined)}
                          className={`menu-dropdown-item ${
                            isActive(subItem.route, subItem.params)
                              ? "menu-dropdown-item-active"
                              : "menu-dropdown-item-inactive"
                          }`}
                        >
                          {subItem.name}
                          <span className="flex items-center gap-1 ml-auto">
                            {isActive(subItem.route) && (
                              <CheckLineIcon className="w-4 h-4 text-green-500" />
                            )}
                            {subItem.new && (
                              <span
                                className={`${
                                  isActive(subItem.route)
                                    ? "menu-dropdown-badge-active"
                                    : "menu-dropdown-badge-inactive"
                                } menu-dropdown-badge`}
                              >
                                new
                              </span>
                            )}
                            {subItem.pro && (
                              <span
                                className={`${
                                  isActive(subItem.route)
                                    ? "menu-dropdown-badge-active"
                                    : "menu-dropdown-badge-inactive"
                                } menu-dropdown-badge`}
                              >
                                pro
                              </span>
                            )}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
        ${
          isExpanded || isMobileOpen
            ? "w-[290px]"
            : isHovered
            ? "w-[290px]"
            : "w-[90px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`py-8 flex ${
          !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
        }`}
      >
        <Link href={route("landing")} className="flex items-center gap-2 hover:scale-105 transition-transform duration-200">
          {isExpanded || isHovered || isMobileOpen ? (
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              SoleSpace
            </span>
          ) : (
            <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">SS</span>
          )}
        </Link>
      </div>
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        {role === "HR" && (
          <nav className="mb-6">
            <div className="flex flex-col gap-4">
              <div>
                <h2
                  className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                    !isExpanded && !isHovered
                      ? "lg:justify-center"
                      : "justify-start"
                  }`}
                >
                  {isExpanded || isHovered || isMobileOpen ? (
                    "HR"
                  ) : (
                    <HorizontaLDots className="size-6" />
                  )}
                </h2>
                {renderMenuItems(navItems, "main")}
              </div>
            </div>
          </nav>
        )}
        {(role === "FINANCE_STAFF" || role === "FINANCE_MANAGER") && (
          <nav className="mb-6">
            <div className="flex flex-col gap-4">
              <div>
                <h2
                  className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                    !isExpanded && !isHovered
                      ? "lg:justify-center"
                      : "justify-start"
                  }`}
                >
                  {isExpanded || isHovered || isMobileOpen ? (
                    "Finance"
                  ) : (
                    <HorizontaLDots className="size-6" />
                  )}
                </h2>
                {renderMenuItems(getFilteredFinanceItems(), "main")}
              </div>
            </div>
          </nav>
        )}
        {role === "CRM" && (
          <nav className="mb-6">
            <div className="flex flex-col gap-4">
              <div>
                <h2
                  className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                    !isExpanded && !isHovered
                      ? "lg:justify-center"
                      : "justify-start"
                  }`}
                >
                  {isExpanded || isHovered || isMobileOpen ? (
                    "CRM"
                  ) : (
                    <HorizontaLDots className="size-6" />
                  )}
                </h2>
                {renderMenuItems(crmItems, "main")}
              </div>
            </div>
          </nav>
        )}
        {role === "STAFF" && (
          <nav className="mb-6">
            <div className="flex flex-col gap-4">
              <div>
                <h2
                  className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                    !isExpanded && !isHovered
                      ? "lg:justify-center"
                      : "justify-start"
                  }`}
                >
                  {isExpanded || isHovered || isMobileOpen ? (
                    "STAFF"
                  ) : (
                    <HorizontaLDots className="size-6" />
                  )}
                </h2>
                {renderMenuItems(staffItems, "main")}
              </div>
            </div>
          </nav>
        )}
        {role === "MANAGER" && (
          <nav className="mb-6">
            <div className="flex flex-col gap-4">
              <div>
                <h2
                  className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                    !isExpanded && !isHovered
                      ? "lg:justify-center"
                      : "justify-start"
                  }`}
                >
                  {isExpanded || isHovered || isMobileOpen ? (
                    "MANAGER"
                  ) : (
                    <HorizontaLDots className="size-6" />
                  )}
                </h2>
                {renderMenuItems(managerItems, "main")}
              </div>
            </div>
          </nav>
        )}
        {role === "MANAGER" && (
          <nav className="mb-6">
            <div className="flex flex-col gap-4">
              <div>
                <h2
                  className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                    !isExpanded && !isHovered
                      ? "lg:justify-center"
                      : "justify-start"
                  }`}
                >
                  {isExpanded || isHovered || isMobileOpen ? (
                    "STAFF"
                  ) : (
                    <HorizontaLDots className="size-6" />
                  )}
                </h2>
                {renderMenuItems(staffItems, "main")}
              </div>
            </div>
          </nav>
        )}
        {othersItems.length > 0 && (role === "FINANCE_STAFF" || role === "FINANCE_MANAGER") && (
          <nav className="mb-6">
            <div className="flex flex-col gap-4">
              <div>
                <h2
                  className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                    !isExpanded && !isHovered
                      ? "lg:justify-center"
                      : "justify-start"
                  }`}
                >
                  {isExpanded || isHovered || isMobileOpen ? (
                    "Others"
                  ) : (
                    <HorizontaLDots className="size-6" />
                  )}
                </h2>
                {renderMenuItems(othersItems, "others")}
              </div>
            </div>
          </nav>
        )}
      </div>
    </aside>
  );
};

export default AppSidebar_ERP;
