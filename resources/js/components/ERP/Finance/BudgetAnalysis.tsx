import React, { useMemo, useState } from "react";
import Swal from "sweetalert2";
import { useFinanceApi } from "../../../hooks/useFinanceApi";

// Inline styles for progress bar width (can't use Tailwind for dynamic values)
const progressBarStyle = (percentage: number): React.CSSProperties => ({
  width: `${Math.min(percentage, 100)}%`,
});

interface BudgetItem {
  id: string;
  category: string;
  budgeted: number;
  spent: number;
  variance: number;
  forecastedYear: number;
  trend: "up" | "down" | "stable";
}

type MetricCardProps = {
  title: string;
  value: number | string;
  change?: number;
  changeType?: "increase" | "decrease";
  description?: string;
  color?: "success" | "error" | "warning" | "info";
  icon: React.FC<{ className?: string }>;
};

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

const WalletIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2h14a2 2 0 002-2v-5z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12h.01" />
  </svg>
);

const TrendingUpIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 17l6-6 4 4 7-7" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 7h7v7" />
  </svg>
);

const ChartBarIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const AlertIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4v2m0-10h.01M12 5a7 7 0 110 14 7 7 0 010-14z" />
  </svg>
);

const CheckIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const PlusIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

const EditIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

const TrashIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const DotsIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zm0 6a.75.75 0 110-1.5.75.75 0 010 1.5zm0 6a.75.75 0 110-1.5.75.75 0 010 1.5z" />
  </svg>
);

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
              {changeType === "increase" ? <ArrowUpIcon className="size-3" /> : <ArrowDownIcon className="size-3" />}
              {Math.abs(change)}%
            </div>
          )}
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <h3 className="text-3xl font-bold text-gray-900 dark:text-white transition-colors duration-300">
            {typeof value === "number" ? "₱" + value.toLocaleString() : value}
          </h3>
          {description && <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>}
        </div>
      </div>
    </div>
  );
};

const normalizeBudget = (budget: any) => ({
  ...budget,
  budgeted: Number(budget.budgeted) || 0,
  spent: Number(budget.spent) || 0,
  variance: Number(budget.variance) || 0,
  forecastedYear: Number(budget.forecastedYear) || 0,
});

const BudgetAnalysis: React.FC = () => {
  const api = useFinanceApi();
  const [budgets, setBudgets] = useState<BudgetItem[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  React.useEffect(() => {
    (async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const response = await api.get('/api/finance/budgets');
        
        if (!response.ok) {
          setLoadError('Unable to load budgets - you may not have permission. Please ensure you have Finance permissions.');
          setBudgets([]);
          setIsLoading(false);
          return;
        }
        
        const data = response.data?.data ?? response.data;
        setBudgets(Array.isArray(data) ? data.map(normalizeBudget) : []);
      } catch (err) {
        setLoadError('Failed to load budgets. Please try again.');
        setBudgets([]);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [activeItem, setActiveItem] = useState<BudgetItem | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [addForm, setAddForm] = useState({
    category: "",
    budgeted: 0,
    spent: 0,
  });

  const [editForm, setEditForm] = useState({
    category: "",
    budgeted: 0,
    spent: 0,
  });

  const getVarianceColor = (variance: number) => {
    if (variance > 0) return "text-green-600 dark:text-green-400";
    if (variance < 0) return "text-red-600 dark:text-red-400";
    return "text-gray-600 dark:text-gray-400";
  };

  const getProgressColor = (spent: number, budgeted: number) => {
    const percentage = (spent / budgeted) * 100;
    if (percentage >= 100) return "bg-red-500";
    if (percentage >= 80) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getStatusBadge = (spent: number, budgeted: number) => {
    const percentage = (spent / budgeted) * 100;
    if (percentage >= 100) return { text: "Over Budget", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" };
    if (percentage >= 80) return { text: "At Risk", color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" };
    return { text: "On Track", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" };
  };

  const totalBudgeted = budgets.reduce((sum, b) => sum + b.budgeted, 0);
  const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);
  const totalVariance = totalBudgeted - totalSpent;
  const budgetUtilization = totalBudgeted > 0 ? ((totalSpent / totalBudgeted) * 100).toFixed(1) : "0";

  const filteredBudgets = useMemo(() => {
    return budgets.filter((budget) =>
      budget.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [budgets, searchTerm]);

  // Pagination logic
  const totalPages = Math.ceil(filteredBudgets.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedBudgets = filteredBudgets.slice(startIndex, endIndex);

  // Reset to page 1 when search changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handleAdd = async () => {
    if (!addForm.category.trim() || addForm.budgeted <= 0) {
      Swal.fire("Error", "Please fill all fields correctly", "error");
      return;
    }

    try {
      const response = await api.post('/api/finance/budgets', {
        category: addForm.category,
        budgeted: addForm.budgeted,
        spent: addForm.spent || 0,
        trend: 'stable',
      });

      if (!response.ok) {
        if (response.status === 401) {
          Swal.fire("Error", "You are not authorized to perform this action.", "error");
        } else {
          throw new Error(response.error || `Failed to add budget`);
        }
        return;
      }

      const newBudget = normalizeBudget(response.data?.data ?? response.data);
      
      setBudgets([...budgets, newBudget]);
      setAddForm({ category: "", budgeted: 0, spent: 0 });
      setIsAddOpen(false);
      Swal.fire("Success", "Budget added successfully", "success");
    } catch (err) {
      Swal.fire("Error", "Failed to add budget. Please try again.", "error");
    }
  };

  const handleEdit = async () => {
    if (!activeItem) return;
    if (!editForm.category.trim() || editForm.budgeted <= 0) {
      Swal.fire("Error", "Please fill all fields correctly", "error");
      return;
    }

    try {
      const response = await api.patch(`/api/finance/budgets/${activeItem.id}`, {
        category: editForm.category,
        budgeted: editForm.budgeted,
        spent: editForm.spent,
      });

      if (!response.ok) {
        throw new Error(response.error || `Failed to update budget`);
      }

      const updatedBudget = normalizeBudget(response.data?.data ?? response.data);

      setBudgets(
        budgets.map((b) =>
          b.id === activeItem.id ? updatedBudget : b
        )
      );
      setIsEditOpen(false);
      setActiveItem(null);
      Swal.fire("Success", "Budget updated successfully", "success");
    } catch (err) {
      Swal.fire("Error", "Failed to update budget. Please try again.", "error");
    }
  };

  const handleDelete = (id: string) => {
    Swal.fire({
      title: "Delete Budget",
      text: "Are you sure you want to delete this budget?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Delete",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await api.delete(`/api/finance/budgets/${id}`);

          if (!response.ok) {
            throw new Error(response.error || `Failed to delete budget`);
          }

          setBudgets(budgets.filter((b) => b.id !== id));
          Swal.fire("Deleted", "Budget deleted successfully", "success");
        } catch (err) {
          Swal.fire("Error", "Failed to delete budget. Please try again.", "error");
        }
      }
    });
  };

  const openEdit = (budget: BudgetItem) => {
    setActiveItem(budget);
    setEditForm({
      category: budget.category,
      budgeted: budget.budgeted,
      spent: budget.spent,
    });
    setIsEditOpen(true);
  };

  return (
    <div className="w-full">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Budget Analysis</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Monitor and manage your budget vs actual spending</p>
      </div>

      {isLoading && (
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-blue-700 dark:text-blue-300">Loading budget data...</p>
        </div>
      )}

      {loadError && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-700 dark:text-red-300">{loadError}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Refresh Page
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          title="Total Budget"
          value={`₦${totalBudgeted.toLocaleString()}`}
          icon={WalletIcon}
          color="info"
          description="Budget for all categories"
        />
        <MetricCard
          title="Total Spent"
          value={`₦${totalSpent.toLocaleString()}`}
          icon={ChartBarIcon}
          color="warning"
          description="Spent across all categories"
        />
        <MetricCard
          title="Remaining Balance"
          value={`₦${totalVariance.toLocaleString()}`}
          icon={TrendingUpIcon}
          color={totalVariance >= 0 ? "success" : "error"}
          description="Funds available"
        />
        <MetricCard
          title="Budget Used"
          value={`${budgetUtilization}%`}
          icon={WalletIcon}
          color="info"
          description="Percentage of budget used"
        />
      </div>

      <div className="bg-white dark:bg-white/[0.03] rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Budget Categories</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Manage and monitor all budget categories</p>
          </div>
          <button
            onClick={() => {
              setAddForm({ category: "", budgeted: 0, spent: 0 });
              setIsAddOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors"
            aria-label="Add new budget category"
            tabIndex={0}
          >
            <PlusIcon className="w-5 h-5" />
            Add Budget
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Category</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Budgeted</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Spent</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Remaining</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Usage</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Status</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedBudgets.length > 0 ? (
                paginatedBudgets.map((budget) => {
                  const percentage = (budget.spent / budget.budgeted) * 100;
                  const status = getStatusBadge(budget.spent, budget.budgeted);
                  return (
                    <tr key={budget.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-white/[0.05] transition-colors">
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">{budget.category}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Forecast: ₱{budget.forecastedYear.toLocaleString()}/yr</p>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-gray-900 dark:text-white font-medium">₱{budget.budgeted.toLocaleString()}</td>
                      <td className="py-4 px-4 text-gray-900 dark:text-white font-medium">₱{budget.spent.toLocaleString()}</td>
                      <td className="py-4 px-4">
                        <span className={`font-semibold ${getVarianceColor(budget.variance)}`}>
                          ₱{Math.abs(budget.variance).toLocaleString()}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-2 rounded-full transition-all ${getProgressColor(budget.spent, budget.budgeted)}`}
                            style={progressBarStyle(percentage)}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{percentage.toFixed(1)}%</p>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${status.color}`}>{status.text}</span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEdit(budget)}
                            className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg transition-colors"
                            title="Edit"
                            aria-label={`Edit budget category ${budget.category}`}
                            tabIndex={0}
                          >
                            <EditIcon className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(budget.id)}
                            className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg transition-colors"
                            title="Delete"
                            aria-label={`Delete budget category ${budget.category}`}
                            tabIndex={0}
                          >
                            <TrashIcon className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-gray-500 dark:text-gray-400">
                    No budgets found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredBudgets.length > 0 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-800">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Showing <span className="font-medium">{startIndex + 1}</span> to{" "}
              <span className="font-medium">{Math.min(endIndex, filteredBudgets.length)}</span> of{" "}
              <span className="font-medium">{filteredBudgets.length}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600"
              >
                Previous
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((page) => {
                    if (totalPages <= 7) return true;
                    if (page === 1 || page === totalPages) return true;
                    if (page >= currentPage - 1 && page <= currentPage + 1) return true;
                    return false;
                  })
                  .map((page, idx, arr) => (
                    <React.Fragment key={page}>
                      {idx > 0 && arr[idx - 1] !== page - 1 && (
                        <span className="px-2 text-gray-500">...</span>
                      )}
                      <button
                        onClick={() => setCurrentPage(page)}
                        className={`min-w-[40px] px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          currentPage === page
                            ? "bg-blue-600 text-white"
                            : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600"
                        }`}
                      >
                        {page}
                      </button>
                    </React.Fragment>
                  ))}
              </div>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 pointer-events-auto">
          <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Add New Budget</h2>
            <div className="space-y-4 mb-6">
              <div>
                <label htmlFor="add-category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category Name</label>
                <input
                  id="add-category"
                  type="text"
                  value={addForm.category}
                  onChange={(e) => setAddForm({ ...addForm, category: e.target.value })}
                  placeholder="e.g., Software Licenses"
                  className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label htmlFor="add-budgeted" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Budgeted Amount</label>
                <input
                  id="add-budgeted"
                  type="number"
                  value={addForm.budgeted}
                  onChange={(e) => setAddForm({ ...addForm, budgeted: parseFloat(e.target.value) || 0 })}
                  placeholder="0"
                  className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label htmlFor="add-spent" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Amount Spent (Optional)</label>
                <input
                  id="add-spent"
                  type="number"
                  value={addForm.spent}
                  onChange={(e) => setAddForm({ ...addForm, spent: parseFloat(e.target.value) || 0 })}
                  placeholder="0"
                  className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setIsAddOpen(false)}
                className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                aria-label="Cancel add budget"
                tabIndex={0}
              >
                Cancel
              </button>
              <button
                onClick={handleAdd}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                aria-label="Confirm add budget"
                tabIndex={0}
              >
                Add Budget
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditOpen && activeItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 pointer-events-auto">
          <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Edit Budget</h2>
            <div className="space-y-4 mb-6">
              <div>
                <label htmlFor="edit-category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category Name</label>
                <input
                  id="edit-category"
                  type="text"
                  value={editForm.category}
                  onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label htmlFor="edit-budgeted" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Budgeted Amount</label>
                <input
                  id="edit-budgeted"
                  type="number"
                  value={editForm.budgeted}
                  onChange={(e) => setEditForm({ ...editForm, budgeted: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label htmlFor="edit-spent" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Amount Spent</label>
                <input
                  id="edit-spent"
                  type="number"
                  value={editForm.spent}
                  onChange={(e) => setEditForm({ ...editForm, spent: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setIsEditOpen(false);
                  setActiveItem(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleEdit}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                Update Budget
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BudgetAnalysis;
