import React, { useMemo, useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import Swal from "sweetalert2";
import { Inertia } from "@inertiajs/inertia";

type EmployeeStatus = "active" | "on_leave" | "probation" | "inactive" | "suspended";

type Employee = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  department: string;
  position: string;
  status: EmployeeStatus;
  suspensionReason?: string;
  hiredAt: string;
  lastActiveAt?: string;
  location?: string;
  // optional metadata supplied by the backend
  createdBy?: string;
  linkedUser?: string; // username or id of linked user account
};

type MetricCardProps = {
  title: string;
  value: number;
  change?: number;
  changeType?: "increase" | "decrease";
  description?: string;
  color?: "success" | "error" | "warning" | "info";
  icon: React.FC<{ className?: string }>;
};

// Portal wrapper to mirror the registration modal layering and avoid navbar stacking issues
const ModalPortal: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  if (typeof document === "undefined") return null;
  return createPortal(children, document.body);
};

const UserCircleIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const BriefcaseIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-7 8h8a2 2 0 002-2V8a2 2 0 00-2-2h-1V5a2 2 0 00-2-2h-2a2 2 0 00-2 2v1H9a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const CheckCircleIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const AlertIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
);

const LockIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);

const InfoIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const TrashBinIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const CalendarIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const ArrowUpIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
  </svg>
);

const ArrowDownIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
  </svg>
);

const Button: React.FC<{
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "success" | "danger";
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}> = ({ children, variant = "primary", onClick, className = "", disabled = false }) => {
  const baseClasses = "px-4 py-2 rounded-lg transition-colors duration-200 font-medium";
  const variantClasses = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-400",
    secondary: "bg-gray-600 text-white hover:bg-gray-700 disabled:bg-gray-400",
    success: "bg-green-600 text-white hover:bg-green-700 disabled:bg-green-400",
    danger: "bg-red-600 text-white hover:bg-red-700 disabled:bg-red-400",
  } as const;

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  changeType,
  icon: Icon,
  color = "info",
  description,
}) => {
  const getColorClasses = () => {
    switch (color) {
      case "success":
        return "from-green-500 to-emerald-600";
      case "error":
        return "from-red-500 to-rose-600";
      case "warning":
        return "from-yellow-500 to-orange-600";
      case "info":
      default:
        return "from-blue-500 to-indigo-600";
    }
  };

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-500 hover:shadow-xl hover:border-gray-300 hover:-translate-y-1 dark:border-gray-800 dark:bg-white/[0.03] dark:hover:border-gray-700">
      <div className={`absolute inset-0 bg-gradient-to-br ${getColorClasses()} opacity-0 transition-opacity duration-500 group-hover:opacity-5`} />

      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <div className={`flex items-center justify-center w-14 h-14 bg-gradient-to-br ${getColorClasses()} rounded-2xl shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:rotate-6`}>
            <Icon className="text-white size-7 drop-shadow-sm" />
          </div>

          {change !== undefined && changeType && (
            <div
              className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold transition-all duration-300 ${
                changeType === "increase"
                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                  : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
              }`}
            >
              {changeType === "increase" ? (
                <ArrowUpIcon className="size-3" />
              ) : (
                <ArrowDownIcon className="size-3" />
              )}
              {Math.abs(change)}%
            </div>
          )}
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <h3 className="text-3xl font-bold text-gray-900 dark:text-white transition-colors duration-300">
            {value.toLocaleString()}
          </h3>
          {description && <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>}
        </div>
      </div>
    </div>
  );
};

const statusLabel: Record<EmployeeStatus, string> = {
  active: "Active",
  on_leave: "On Leave",
  probation: "Probation",
  inactive: "Inactive",
  suspended: "Suspended",
};

const statusBadge = (status: EmployeeStatus) => {
  if (status === "active") return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
  if (status === "on_leave") return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
  if (status === "probation") return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
  if (status === "inactive") return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
  if (status === "suspended") return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
  return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
};

const seedEmployees: Employee[] = [
  {
    id: 1,
    firstName: "Samantha",
    lastName: "Lopez",
    email: "samantha.lopez@solespace.com",
    phone: "+63 917 123 4567",
    department: "Operations",
    position: "Store Manager",
    status: "active",
    hiredAt: "2022-03-14",
    lastActiveAt: "2026-01-18",
    location: "Makati City",
  },
  {
    id: 2,
    firstName: "Carlos",
    lastName: "Reyes",
    email: "carlos.reyes@solespace.com",
    phone: "+63 928 112 0034",
    department: "Sales",
    position: "Sales Specialist",
    status: "on_leave",
    hiredAt: "2023-07-01",
    lastActiveAt: "2026-01-12",
    location: "Cebu",
  },
  {
    id: 3,
    firstName: "Alicia",
    lastName: "Tan",
    email: "alicia.tan@solespace.com",
    phone: "+63 915 222 9182",
    department: "HR",
    position: "HR Generalist",
    status: "probation",
    hiredAt: "2025-11-20",
    lastActiveAt: "2026-01-19",
    location: "Quezon City",
  },
  {
    id: 4,
    firstName: "Miguel",
    lastName: "Santos",
    email: "miguel.santos@solespace.com",
    phone: "+63 917 808 3311",
    department: "IT",
    position: "Support Engineer",
    status: "inactive",
    hiredAt: "2021-09-05",
    lastActiveAt: "2025-12-28",
    location: "Pasig",
  },
  {
    id: 5,
    firstName: "Erika",
    lastName: "Del Rosario",
    email: "erika.delrosario@solespace.com",
    phone: "+63 927 444 1199",
    department: "Marketing",
    position: "Campaign Lead",
    status: "active",
    hiredAt: "2024-05-18",
    lastActiveAt: "2026-01-20",
    location: "Taguig",
  },
  {
    id: 6,
    firstName: "Paolo",
    lastName: "Dizon",
    email: "paolo.dizon@solespace.com",
    phone: "+63 918 555 7621",
    department: "Finance",
    position: "Accounting Associate",
    status: "suspended",
    suspensionReason: "Misconduct",
    hiredAt: "2020-02-10",
    lastActiveAt: "2025-10-03",
    location: "Mandaluyong",
  },
];

const formatDate = (value?: string) => {
  if (!value) return "Never";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString();
};

const buildName = (employee: Employee) => `${employee.firstName} ${employee.lastName}`;

export const EmployeeManagement: React.FC<{
  employees?:
    | Employee[]
    | {
        data: Employee[];
        meta: { current_page: number; last_page: number; per_page: number; total: number };
      };
}> = ({ employees }) => {
  // detect server paginator shape: { data: [...], meta: { current_page, last_page, per_page, total } }
  const isServerPaginated = !!(
    employees && (employees as any).data !== undefined && (employees as any).meta !== undefined
  );
  const serverData = isServerPaginated ? (employees as any).data as Employee[] : undefined;
  const serverMeta = isServerPaginated ? (employees as any).meta : undefined;

  const [filterStatus, setFilterStatus] = useState<EmployeeStatus | "all">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isTerminateModalOpen, setIsTerminateModalOpen] = useState(false);
  const [terminationReason, setTerminationReason] = useState("");
  const [employeeToTerminate, setEmployeeToTerminate] = useState<Employee | null>(null);

  // rows are seeded from server page or client-provided array (or fallback)
  const [rows, setRows] = useState<Employee[]>(() => {
    if (isServerPaginated && serverData) return serverData;
    if (Array.isArray(employees) && employees.length > 0) return employees as Employee[];
    return seedEmployees;
  });

  // Pagination: use server meta when paginated, otherwise client-side state
  const [currentPage, setCurrentPage] = useState<number>(() => (isServerPaginated && serverMeta ? serverMeta.current_page : 1));
  const [itemsPerPage, setItemsPerPage] = useState<number>(() => (isServerPaginated && serverMeta ? serverMeta.per_page : 7));

  // keep component in sync when parent provides new employees (server or client)
  useEffect(() => {
    if (isServerPaginated && serverData) {
      setRows(serverData);
      setCurrentPage(serverMeta?.current_page ?? 1);
      setItemsPerPage(serverMeta?.per_page ?? itemsPerPage);
    } else if (Array.isArray(employees)) {
      setRows(employees as Employee[]);
      setCurrentPage(1);
      setItemsPerPage(7);
    }
  }, [employees]);

  // debounce ref for server-side queries
  const debounceRef = useRef<number | null>(null);

  // helper to navigate while preserving query params
  const navigateWithQuery = (params: Record<string, any>) => {
    const query: Record<string, any> = {};
    if (params.q !== undefined) query.q = params.q;
    if (params.status !== undefined) query.status = params.status;
    if (params.page !== undefined) query.page = params.page;
    // Use Inertia to request the current path with new query params
    Inertia.get(window.location.pathname, query, { preserveState: true, preserveScroll: true, replace: true });
  };

  // When server paginated, debounce search & filter to call server
  useEffect(() => {
    if (!isServerPaginated) return;
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => {
      navigateWithQuery({ q: searchTerm || undefined, status: filterStatus !== "all" ? filterStatus : undefined, page: 1 });
    }, 400) as unknown as number;
    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, filterStatus, isServerPaginated]);
  
  // Add employee modal state
  const [isAddEmployeeOpen, setIsAddEmployeeOpen] = useState(false);
  const [addEmployeeForm, setAddEmployeeForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    department: "",
    position: "",
    hiredAt: new Date().toISOString().split("T")[0],
    location: "",
  });
  // UI state for in-flight requests / errors
  const [isProcessingId, setIsProcessingId] = useState<number | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const stats = useMemo(() => {
    const total = isServerPaginated ? serverMeta?.total ?? rows.length : rows.length;
    const active = rows.filter((r) => r.status === "active").length;
    const onLeave = rows.filter((r) => r.status === "on_leave").length;
    const probation = rows.filter((r) => r.status === "probation").length;
    return {
      total,
      active,
      onLeave,
      probation,
    };
  }, [rows, serverMeta, isServerPaginated]);

  const filteredEmployees = useMemo(() => {
    if (isServerPaginated) return rows; // server already applied filters
    const term = searchTerm.trim().toLowerCase();
    return rows.filter((employee) => {
      const matchesSearch =
        term.length === 0 ||
        buildName(employee).toLowerCase().includes(term) ||
        employee.email.toLowerCase().includes(term) ||
        employee.department.toLowerCase().includes(term);

      const matchesStatus = filterStatus === "all" ? true : employee.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [rows, filterStatus, searchTerm, isServerPaginated]);

  // Pagination calculations
  const totalPages = isServerPaginated ? serverMeta?.last_page ?? 1 : Math.max(1, Math.ceil(filteredEmployees.length / itemsPerPage));
  const startIndex = isServerPaginated ? ((serverMeta?.current_page ?? 1) - 1) * (serverMeta?.per_page ?? itemsPerPage) : (currentPage - 1) * itemsPerPage;
  const endIndex = isServerPaginated ? startIndex + rows.length : startIndex + itemsPerPage;
  const paginatedEmployees = isServerPaginated ? rows : filteredEmployees.slice(startIndex, endIndex);

  // Reset to page 1 when filters change (client-side only)
  React.useEffect(() => {
    if (!isServerPaginated) setCurrentPage(1);
  }, [searchTerm, filterStatus, isServerPaginated]);

  const handleNavigatePage = (page: number) => {
    if (isServerPaginated) {
      navigateWithQuery({ q: searchTerm || undefined, status: filterStatus !== "all" ? filterStatus : undefined, page });
    } else {
      setCurrentPage(page);
    }
  };

  const displayedPage = isServerPaginated ? serverMeta?.current_page ?? currentPage : currentPage;
  const totalItems = isServerPaginated ? serverMeta?.total ?? filteredEmployees.length : filteredEmployees.length;

  const openViewModal = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsViewModalOpen(true);
  };

  const handleActivate = (employeeId: number, name: string) => {
    Swal.fire({
      title: "Reactivate Account?",
      text: `Activate ${name}?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#16a34a",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, activate",
    }).then((result) => {
        if (result.isConfirmed) {
          // If server paginated, ask server to update and rely on Inertia to refresh props
          if (isServerPaginated) {
            setApiError(null);
            Inertia.patch(`/employees/${employeeId}`, { status: "active" }, {
              onStart: () => setIsProcessingId(employeeId),
              onFinish: () => setIsProcessingId(null),
              onSuccess: () => {
                Swal.fire({ title: "Reactivated", text: `${name} is now active.`, icon: "success", timer: 1400, showConfirmButton: false });
                setIsViewModalOpen(false);
                setSelectedEmployee(null);
              },
              onError: (errors: any) => {
                setApiError(typeof errors === 'string' ? errors : 'Failed to reactivate account.');
                Swal.fire({ title: "Error", text: apiError || "Failed to reactivate account.", icon: "error" });
              }
            });
          } else {
            (async () => {
              try {
                setIsProcessingId(employeeId);
                setApiError(null);
                await new Promise((r) => setTimeout(r, 300));
                setRows((prev) => prev.map((row) => (row.id === employeeId ? { ...row, status: "active", suspensionReason: undefined } : row)));
                Swal.fire({ title: "Reactivated", text: `${name} is now active.`, icon: "success", timer: 1400, showConfirmButton: false });
                setIsViewModalOpen(false);
                setSelectedEmployee(null);
              } catch (e: any) {
                setApiError(e?.message || "Failed to reactivate account.");
                Swal.fire({ title: "Error", text: apiError || "Failed to reactivate account.", icon: "error" });
              } finally {
                setIsProcessingId(null);
              }
            })();
          }
        }
    });
  };

  const confirmAndUpdateStatus = (employee: Employee, nextStatus: EmployeeStatus, message: string) => {
    Swal.fire({
      title: message,
      text: buildName(employee),
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#2563eb",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, continue",
    }).then((result) => {
      if (result.isConfirmed) {
        if (isServerPaginated) {
          setApiError(null);
          Inertia.patch(`/employees/${employee.id}`, { status: nextStatus }, {
            onStart: () => setIsProcessingId(employee.id),
            onFinish: () => setIsProcessingId(null),
            onSuccess: () => {
              Swal.fire({ title: "Updated", text: `${buildName(employee)} is now ${statusLabel[nextStatus]}.`, icon: "success", timer: 1400, showConfirmButton: false });
            },
            onError: (errors: any) => {
              setApiError(typeof errors === 'string' ? errors : 'Failed to update status.');
              Swal.fire({ title: "Error", text: apiError || "Failed to update status.", icon: "error" });
            }
          });
        } else {
          (async () => {
            try {
              setIsProcessingId(employee.id);
              setApiError(null);
              await new Promise((r) => setTimeout(r, 300));
              setRows((prev) => prev.map((row) => (row.id === employee.id ? { ...row, status: nextStatus } : row)));
              Swal.fire({ title: "Updated", text: `${buildName(employee)} is now ${statusLabel[nextStatus]}.`, icon: "success", timer: 1400, showConfirmButton: false });
            } catch (e: any) {
              setApiError(e?.message || "Failed to update status.");
              Swal.fire({ title: "Error", text: apiError || "Failed to update status.", icon: "error" });
            } finally {
              setIsProcessingId(null);
            }
          })();
        }
      }
    });
  };

  const handleDeleteEmployee = (employee: Employee) => {
    Swal.fire({
      title: "Delete Employee?",
      html: `Permanently remove <strong>${buildName(employee)}</strong>?<br/><span class="text-red-600">This action cannot be undone.</span>`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Delete",
    }).then((result) => {
      if (result.isConfirmed) {
        if (isServerPaginated) {
          setApiError(null);
          Inertia.delete(`/employees/${employee.id}`, {
            onStart: () => setIsProcessingId(employee.id),
            onFinish: () => setIsProcessingId(null),
            onSuccess: () => {
              Swal.fire({ title: "Deleted", text: `${buildName(employee)} has been removed.`, icon: "success", timer: 1400, showConfirmButton: false });
            },
            onError: (errors: any) => {
              setApiError(typeof errors === 'string' ? errors : 'Failed to delete employee.');
              Swal.fire({ title: "Error", text: apiError || "Failed to delete employee.", icon: "error" });
            }
          });
        } else {
          (async () => {
            try {
              setIsProcessingId(employee.id);
              setApiError(null);
              await new Promise((r) => setTimeout(r, 300));
              setRows((prev) => prev.filter((row) => row.id !== employee.id));
              Swal.fire({ title: "Deleted", text: `${buildName(employee)} has been removed.`, icon: "success", timer: 1400, showConfirmButton: false });
            } catch (e: any) {
              setApiError(e?.message || "Failed to delete employee.");
              Swal.fire({ title: "Error", text: apiError || "Failed to delete employee.", icon: "error" });
            } finally {
              setIsProcessingId(null);
            }
          })();
        }
      }
    });
  };

  const handleTerminateClick = (employee: Employee) => {
    setEmployeeToTerminate(employee);
    setTerminationReason("");
    setIsTerminateModalOpen(true);
  };

  const handleTerminateConfirm = () => {
    if (!terminationReason || terminationReason === "Select a reason") {
      Swal.fire({
        title: "Reason Required",
        text: "Please select a reason for termination.",
        icon: "warning",
        confirmButtonColor: "#2563eb",
      });
      return;
    }

    if (employeeToTerminate) {
      if (isServerPaginated) {
        setApiError(null);
        Inertia.patch(`/employees/${employeeToTerminate.id}`, { status: "suspended", suspensionReason: terminationReason }, {
          onStart: () => setIsProcessingId(employeeToTerminate.id),
          onFinish: () => setIsProcessingId(null),
          onSuccess: () => {
            setIsTerminateModalOpen(false);
            Swal.fire({ title: "Account Suspended", text: `${buildName(employeeToTerminate)} has been suspended.`, icon: "success", timer: 1400, showConfirmButton: false });
            setEmployeeToTerminate(null);
            setTerminationReason("");
          },
          onError: (errors: any) => {
            setApiError(typeof errors === 'string' ? errors : 'Failed to suspend account.');
            Swal.fire({ title: "Error", text: apiError || "Failed to suspend account.", icon: "error" });
          }
        });
      } else {
        (async () => {
          try {
            setIsProcessingId(employeeToTerminate.id);
            setApiError(null);
            await new Promise((r) => setTimeout(r, 400));
            setRows((prev) => prev.map((row) => (row.id === employeeToTerminate.id ? { ...row, status: "suspended", suspensionReason: terminationReason } : row)));
            setIsTerminateModalOpen(false);
            Swal.fire({ title: "Account Suspended", text: `${buildName(employeeToTerminate)} has been suspended.`, icon: "success", timer: 1400, showConfirmButton: false });
            setEmployeeToTerminate(null);
            setTerminationReason("");
          } catch (e: any) {
            setApiError(e?.message || "Failed to suspend account.");
            Swal.fire({ title: "Error", text: apiError || "Failed to suspend account.", icon: "error" });
          } finally {
            setIsProcessingId(null);
          }
        })();
      }
    }
  };

  const handleAddEmployee = () => {
    setIsAddEmployeeOpen(true);
  };

  const handleSaveNewEmployee = () => {
    (async () => {
      setIsAdding(true);
      setApiError(null);
      try {
        // Validation
        if (!addEmployeeForm.firstName.trim() || !addEmployeeForm.lastName.trim() || !addEmployeeForm.email.trim() || !addEmployeeForm.department.trim() || !addEmployeeForm.position.trim()) {
          Swal.fire({
            title: "Missing Information",
            text: "Please fill in all required fields (First Name, Last Name, Email, Department, Position).",
            icon: "warning",
            confirmButtonColor: "#2563eb",
          });
          return;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(addEmployeeForm.email)) {
          Swal.fire({
            title: "Invalid Email",
            text: "Please enter a valid email address.",
            icon: "warning",
            confirmButtonColor: "#2563eb",
          });
          return;
        }

        if (isServerPaginated) {
          Inertia.post(`/employees`, addEmployeeForm, {
            onStart: () => setIsAdding(true),
            onFinish: () => setIsAdding(false),
            onSuccess: () => {
              Swal.fire({ title: "Success", text: `${addEmployeeForm.firstName} ${addEmployeeForm.lastName} has been added as an employee.`, icon: "success", timer: 1400, showConfirmButton: false });
              setIsAddEmployeeOpen(false);
              setAddEmployeeForm({ firstName: "", lastName: "", email: "", phone: "", department: "", position: "", hiredAt: new Date().toISOString().split("T")[0], location: "" });
            },
            onError: (errors: any) => {
              setApiError(typeof errors === 'string' ? errors : 'Failed to add employee.');
              Swal.fire({ title: "Error", text: apiError || "Failed to add employee.", icon: "error" });
            }
          });
        } else {
          // client-only fallback
          await new Promise((r) => setTimeout(r, 400));

          const newEmployee: Employee = {
            id: Math.max(...rows.map((r) => r.id), 0) + 1,
            firstName: addEmployeeForm.firstName,
            lastName: addEmployeeForm.lastName,
            email: addEmployeeForm.email,
            phone: addEmployeeForm.phone || undefined,
            department: addEmployeeForm.department,
            position: addEmployeeForm.position,
            status: "active",
            hiredAt: addEmployeeForm.hiredAt,
            location: addEmployeeForm.location || undefined,
            createdBy: "Direct Registration",
          };

          setRows((prev) => [...prev, newEmployee]);

          Swal.fire({ title: "Success", text: `${newEmployee.firstName} ${newEmployee.lastName} has been added as an employee.`, icon: "success", timer: 1400, showConfirmButton: false });

          setIsAddEmployeeOpen(false);
          setAddEmployeeForm({ firstName: "", lastName: "", email: "", phone: "", department: "", position: "", hiredAt: new Date().toISOString().split("T")[0], location: "" });
        }
      } catch (e: any) {
        setApiError(e?.message || "Failed to add employee.");
        Swal.fire({ title: "Error", text: apiError || "Failed to add employee.", icon: "error" });
      } finally {
        if (!isServerPaginated) setIsAdding(false);
      }
    })();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Employee Management</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage employee accounts, access, and lifecycle</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleAddEmployee}
              disabled={isAdding}
              className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 ${isAdding ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Employee
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Total Employees"
            value={stats.total}
            change={8}
            changeType="increase"
            icon={UserCircleIcon}
            color="info"
            description="All active and inactive records"
          />
          <MetricCard
            title="Active"
            value={stats.active}
            change={3}
            changeType="increase"
            icon={CheckCircleIcon}
            color="success"
            description="Currently available to work"
          />
          <MetricCard
            title="On Leave"
            value={stats.onLeave}
            change={2}
            changeType="decrease"
            icon={CalendarIcon}
            color="warning"
            description="Temporarily unavailable"
          />
          <MetricCard
            title="Probation"
            value={stats.probation}
            change={1}
            changeType="increase"
            icon={BriefcaseIcon}
            color="error"
            description="New hires under review"
          />
        </div>

        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex-1 w-full sm:w-auto">
                <input
                  type="text"
                  placeholder="Search by name, email, or department..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setFilterStatus("all")}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    filterStatus === "all"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilterStatus("active")}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    filterStatus === "active"
                      ? "bg-green-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                  }`}
                >
                  Active
                </button>
                <button
                  onClick={() => setFilterStatus("on_leave")}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    filterStatus === "on_leave"
                      ? "bg-yellow-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                  }`}
                >
                  On Leave
                </button>
                <button
                  onClick={() => setFilterStatus("probation")}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    filterStatus === "probation"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                  }`}
                >
                  Probation
                </button>
                <button
                  onClick={() => setFilterStatus("inactive")}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    filterStatus === "inactive"
                      ? "bg-gray-800 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                  }`}
                >
                  Inactive
                </button>
                <button
                  onClick={() => setFilterStatus("suspended")}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    filterStatus === "suspended"
                      ? "bg-red-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                  }`}
                >
                  Suspended
                </button>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Department</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Position</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Last Active</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Created By</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Account</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {paginatedEmployees.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
                        <UserCircleIcon className="h-12 w-12 mb-2" />
                        <p className="text-lg font-medium">No employees found</p>
                        <p className="text-sm">Try adjusting your filters or search term</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedEmployees.map((employee) => (
                    <tr key={employee.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                              <span className="text-blue-600 dark:text-blue-300 font-medium text-sm">
                                {buildName(employee)
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")
                                  .toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">{buildName(employee)}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">{employee.location || "-"}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">{employee.email}</div>
                        {employee.phone && <div className="text-xs text-gray-500 dark:text-gray-400">{employee.phone}</div>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">{employee.department}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">{employee.position}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Hired {formatDate(employee.hiredAt)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusBadge(employee.status)}`}>
                          {statusLabel[employee.status]}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(employee.lastActiveAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {employee.createdBy || 'Direct Registration'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {employee.linkedUser ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">Linked</span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300">No Link</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => openViewModal(employee)}
                            className={`text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 ${isProcessingId === employee.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                            title="View Details"
                            disabled={isProcessingId === employee.id}
                          >
                            <InfoIcon className="h-5 w-5" />
                          </button>
                          {employee.status !== "suspended" && (
                            <>
                              <button
                                onClick={() => handleTerminateClick(employee)}
                                className={`inline-flex items-center justify-center w-8 h-8 rounded-md text-orange-600 hover:text-orange-800 dark:text-orange-400 dark:hover:text-orange-300 transition-colors ${isProcessingId === employee.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                                title="Suspend Account"
                                disabled={isProcessingId === employee.id}
                              >
                                <AlertIcon className="h-5 w-5" />
                              </button>
                            </>
                          )}
                          {/* Delete button removed per request */}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalItems > 0 && (
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  Showing <span className="font-medium">{startIndex + 1}</span> to{" "}
                  <span className="font-medium">{Math.min(endIndex, totalItems)}</span> of{" "}
                  <span className="font-medium">{totalItems}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleNavigatePage(Math.max(displayedPage - 1, 1))}
                    disabled={displayedPage === 1}
                    className="p-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    title="Previous page"
                  >
                    <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                    if (
                      page === 1 ||
                      page === totalPages ||
                      (page >= displayedPage - 1 && page <= displayedPage + 1)
                    ) {
                      return (
                        <button
                          key={page}
                          onClick={() => handleNavigatePage(page)}
                          className={`min-w-[40px] h-10 px-3 rounded-lg font-medium transition-colors ${
                            displayedPage === page
                              ? "bg-blue-600 text-white"
                              : "border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                          }`}
                        >
                          {page}
                        </button>
                      );
                    } else if (page === displayedPage - 2 || page === displayedPage + 2) {
                      return (
                        <span key={page} className="px-2 text-gray-500 dark:text-gray-400">
                          ...
                        </span>
                      );
                    }
                    return null;
                  })}

                  <button
                    onClick={() => handleNavigatePage(Math.min(displayedPage + 1, totalPages))}
                    disabled={displayedPage === totalPages}
                    className="p-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    title="Next page"
                  >
                    <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {isViewModalOpen && selectedEmployee && (
          <ModalPortal>
            <div className="fixed inset-0 z-[999999] bg-black/60 backdrop-blur-sm flex items-center justify-center px-4 py-8">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[95vh] overflow-auto">
                <div className="p-8">
                  <h3 className="text-3xl font-semibold text-gray-900 dark:text-white mb-6">Employee Details</h3>
                  <div className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-base text-gray-500 dark:text-gray-400">Name</p>
                      <p className="text-base font-medium text-gray-900 dark:text-white">{buildName(selectedEmployee)}</p>
                    </div>
                    <div>
                      <p className="text-base text-gray-500 dark:text-gray-400">Email</p>
                      <p className="text-base font-medium text-gray-900 dark:text-white">{selectedEmployee.email}</p>
                    </div>
                    <div>
                      <p className="text-base text-gray-500 dark:text-gray-400">Phone</p>
                      <p className="text-base font-medium text-gray-900 dark:text-white">{selectedEmployee.phone || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-base text-gray-500 dark:text-gray-400">Department</p>
                      <p className="text-base font-medium text-gray-900 dark:text-white">{selectedEmployee.department}</p>
                    </div>
                    <div>
                      <p className="text-base text-gray-500 dark:text-gray-400">Position</p>
                      <p className="text-base font-medium text-gray-900 dark:text-white">{selectedEmployee.position}</p>
                    </div>
                    <div>
                      <p className="text-base text-gray-500 dark:text-gray-400">Location</p>
                      <p className="text-base font-medium text-gray-900 dark:text-white">{selectedEmployee.location || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-base text-gray-500 dark:text-gray-400">Status</p>
                      <span className={`inline-flex px-2.5 py-1.5 text-sm font-semibold rounded-full ${statusBadge(selectedEmployee.status)}`}>
                        {statusLabel[selectedEmployee.status]}
                      </span>
                    </div>
                    {selectedEmployee.status === "suspended" && (
                      <div>
                        <p className="text-base text-gray-500 dark:text-gray-400">Suspension Reason</p>
                        <p className="text-base font-medium text-gray-900 dark:text-white">{selectedEmployee.suspensionReason || "No reason provided."}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-base text-gray-500 dark:text-gray-400">Hired</p>
                      <p className="text-base font-medium text-gray-900 dark:text-white">{formatDate(selectedEmployee.hiredAt)}</p>
                    </div>
                    <div>
                      <p className="text-base text-gray-500 dark:text-gray-400">Last Active</p>
                      <p className="text-base font-medium text-gray-900 dark:text-white">{formatDate(selectedEmployee.lastActiveAt)}</p>
                    </div>
                  </div>
                    <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex justify-end gap-2">
                        {selectedEmployee.status === "suspended" && (
                          <Button variant="success" onClick={() => handleActivate(selectedEmployee.id, buildName(selectedEmployee))} className="mr-2" disabled={isProcessingId === selectedEmployee.id}>
                            {isProcessingId === selectedEmployee.id ? 'Processing...' : 'Activate'}
                          </Button>
                        )}
                        <Button variant="secondary" onClick={() => setIsViewModalOpen(false)}>
                          Close
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </ModalPortal>
        )}

        {/* Termination Modal */}
        {isTerminateModalOpen && employeeToTerminate && (
          <ModalPortal>
            <div className="fixed inset-0 z-[999999] bg-black/60 backdrop-blur-sm flex items-center justify-center px-4 py-8">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-xl w-full">
                <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Suspend Account</h3>
                
                <div className="mb-4">
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-1">
                    <span className="font-medium">User:</span> {buildName(employeeToTerminate)}
                  </p>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Reason for Suspension
                  </label>
                  <select
                    value={terminationReason}
                    onChange={(e) => setTerminationReason(e.target.value)}
                    className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">Select a reason</option>
                    <option value="Poor Performance">Poor Performance</option>
                    <option value="Violation of Company Policy">Violation of Company Policy</option>
                    <option value="Insubordination">Insubordination</option>
                    <option value="Attendance Issues">Attendance Issues</option>
                    <option value="Misconduct">Misconduct</option>
                    <option value="End of Contract">End of Contract</option>
                    <option value="Redundancy">Redundancy</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Suspension Message Preview */}
                <div className="mb-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <InfoIcon className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-1">Suspension Message Preview</p>
                      <p className="text-sm text-blue-700 dark:text-blue-400 italic">
                        {terminationReason && terminationReason !== "Select a reason" && terminationReason !== ""
                          ? `Your employment has been terminated due to: ${terminationReason}. Please contact HR for further information.`
                          : "Please select a suspension reason above to preview the message that will be sent to the user."}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Account Suspension Warning */}
                <div className="mb-6 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <AlertIcon className="h-5 w-5 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-orange-900 dark:text-orange-300 mb-1">Account Suspension Warning</p>
                      <p className="text-sm text-orange-700 dark:text-orange-400">
                        This action will suspend the user's account. The user will not be able to access the system. This action can be reversed by reactivating the account.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => {
                      setIsTerminateModalOpen(false);
                      setEmployeeToTerminate(null);
                      setTerminationReason("");
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleTerminateConfirm}
                    disabled={isProcessingId === employeeToTerminate?.id}
                    className={`px-4 py-2 text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 rounded-md transition-colors ${isProcessingId === employeeToTerminate?.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {isProcessingId === employeeToTerminate?.id ? 'Processing...' : 'Suspend Account'}
                  </button>
                </div>
              </div>
            </div>
            </div>
          </ModalPortal>
        )}

        {/* Add Employee Modal */}
        {isAddEmployeeOpen && (
          <ModalPortal>
            <div className="fixed inset-0 z-[999999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl max-w-2xl w-full border border-gray-200 dark:border-gray-800 overflow-hidden">
                {/* Header */}
                <div className="border-b border-gray-200 dark:border-gray-800 px-8 py-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Add New Employee
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                    Fill in the employee details below
                  </p>
                </div>

                {/* Content */}
                <div className="p-8 max-h-[calc(90vh-140px)] overflow-y-auto">
                  <div className="space-y-6">
                    {/* Personal Information Section */}
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wide mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
                        Personal Information
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                            First Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={addEmployeeForm.firstName}
                            onChange={(e) =>
                              setAddEmployeeForm({
                                ...addEmployeeForm,
                                firstName: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-gray-400 focus:border-transparent outline-none transition-all"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                            Last Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={addEmployeeForm.lastName}
                            onChange={(e) =>
                              setAddEmployeeForm({
                                ...addEmployeeForm,
                                lastName: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-gray-400 focus:border-transparent outline-none transition-all"
                          />
                        </div>
                      </div>

                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                          Email <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          value={addEmployeeForm.email}
                          onChange={(e) =>
                            setAddEmployeeForm({
                              ...addEmployeeForm,
                              email: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-gray-400 focus:border-transparent outline-none transition-all"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4 mt-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                            Phone
                          </label>
                          <input
                            type="tel"
                            value={addEmployeeForm.phone}
                            onChange={(e) =>
                              setAddEmployeeForm({
                                ...addEmployeeForm,
                                phone: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-gray-400 focus:border-transparent outline-none transition-all"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                            Location
                          </label>
                          <input
                            type="text"
                            value={addEmployeeForm.location}
                            onChange={(e) =>
                              setAddEmployeeForm({
                                ...addEmployeeForm,
                                location: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-gray-400 focus:border-transparent outline-none transition-all"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Job Information Section */}
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wide mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
                        Job Information
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                            Department <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={addEmployeeForm.department}
                            onChange={(e) =>
                              setAddEmployeeForm({
                                ...addEmployeeForm,
                                department: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-gray-400 focus:border-transparent outline-none transition-all"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                            Position <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={addEmployeeForm.position}
                            onChange={(e) =>
                              setAddEmployeeForm({
                                ...addEmployeeForm,
                                position: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-gray-400 focus:border-transparent outline-none transition-all"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 mt-4">
                          Hired Date
                        </label>
                        <input
                          type="date"
                          value={addEmployeeForm.hiredAt}
                          onChange={(e) =>
                            setAddEmployeeForm({
                              ...addEmployeeForm,
                              hiredAt: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-gray-400 focus:border-transparent outline-none transition-all"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 px-8 py-4 flex gap-3 justify-end">
                  <button
                    onClick={() => setIsAddEmployeeOpen(false)}
                    className="px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-all duration-200 hover:shadow-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveNewEmployee}
                    disabled={isAdding}
                    className={`px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-all duration-200 hover:shadow-md active:shadow-sm ${isAdding ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {isAdding ? 'Processing...' : 'Add Employee'}
                  </button>
                </div>
              </div>
            </div>
          </ModalPortal>
        )}
      </div>
    </div>
  );
};

export default EmployeeManagement;
