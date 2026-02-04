import React, { useState, useEffect } from "react";
import { Head } from "@inertiajs/react";
import AppLayoutERP from "../../../layout/AppLayout_ERP";
import Swal from "sweetalert2";

interface AuditLog {
  id: number;
  action: string;
  object_type: string | null;
  user_id: number | null;
  shop_owner_id: number | null;
  created_at: string;
  metadata?: Record<string, any>;
  data?: Record<string, any>;
}

interface PaginationData {
  data: AuditLog[];
  total: number;
  per_page: number;
  current_page: number;
  last_page: number;
}

interface Stats {
  action_counts: Record<string, number>;
  object_type_counts: Record<string, number>;
  total_logs: number;
  logs_last_24h: number;
}

// Icons
const DocumentTextIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const CalendarIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const ClockIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const CubeIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.325 15.581l-8.325 4.662a2 2 0 01-1.998 0L2.678 15.581m17.647-10.162L12 3.757m8.325 1.662l-8.325-4.662a2 2 0 00-1.998 0L2.678 5.243" />
  </svg>
);

const ArrowDownTrayIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
  </svg>
);

const EyeIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const MagnifyingGlassIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const FunnelIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
  </svg>
);

const ChevronLeftIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
);

const ChevronRightIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

export default function ERPAuditLogs() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [pagination, setPagination] = useState<PaginationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  
  // Filter states
  const [search, setSearch] = useState("");
  const [selectedAction, setSelectedAction] = useState("");
  const [selectedObjectType, setSelectedObjectType] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [actions, setActions] = useState<string[]>([]);
  const [objectTypes, setObjectTypes] = useState<string[]>([]);

  // Fetch audit logs
  const fetchLogs = async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        per_page: "50",
      });

      if (search) params.append("search", search);
      if (selectedAction) params.append("action", selectedAction);
      if (selectedObjectType) params.append("object_type", selectedObjectType);
      if (startDate) params.append("start_date", startDate);
      if (endDate) params.append("end_date", endDate);

      const response = await fetch(`/api/finance/audit-logs?${params}`, {
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
        }
      });
      
      if (!response.ok) {
        if (response.status === 403) {
          throw new Error("You don't have permission to access audit logs");
        }
        throw new Error(`Failed to fetch logs: ${response.statusText}`);
      }
      
      const data = await response.json();

      if (data && data.logs && data.logs.data) {
        setLogs(data.logs.data);
        setPagination(data.logs);
        setActions(data.actions || []);
        setObjectTypes(data.object_types || []);
        setCurrentPage(page);
      } else {
        setLogs([]);
        setPagination(null);
        setActions([]);
        setObjectTypes([]);
      }
    } catch (error) {
      console.error("Error fetching logs:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch audit logs";
      Swal.fire("Error", errorMessage, "error");
      setLogs([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  };

  // Fetch statistics
  const fetchStats = async () => {
    try {
      const response = await fetch("/api/finance/audit-logs/statistics", {
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
        }
      });
      
      if (!response.ok) {
        if (response.status === 403) {
          console.warn("No permission to access audit log stats");
          setStats(null);
          return;
        }
        throw new Error(`Failed to fetch stats: ${response.statusText}`);
      }
      
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error("Error fetching stats:", error);
      setStats(null);
    }
  };

  useEffect(() => {
    fetchLogs(1);
    fetchStats();
  }, []);

  const handleFilter = () => {
    setCurrentPage(1);
    fetchLogs(1);
  };

  const handleClearFilters = () => {
    setSearch("");
    setSelectedAction("");
    setSelectedObjectType("");
    setStartDate("");
    setEndDate("");
    setCurrentPage(1);
    fetchLogs(1);
  };

  const handleExport = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedAction) params.append("action", selectedAction);
      if (selectedObjectType) params.append("object_type", selectedObjectType);
      if (startDate) params.append("start_date", startDate);
      if (endDate) params.append("end_date", endDate);

      window.location.href = `/api/finance/audit-logs/export?${params}`;
    } catch (error) {
      console.error("Error exporting:", error);
      Swal.fire("Error", "Failed to export logs", "error");
    }
  };

  const getActionBadgeColor = (action: string) => {
    const colors: Record<string, string> = {
      CREATE: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300 border border-green-300 dark:border-green-700/50",
      UPDATE: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border border-blue-300 dark:border-blue-700/50",
      DELETE: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 border border-red-300 dark:border-red-700/50",
      APPROVE: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 border border-purple-300 dark:border-purple-700/50",
      REJECT: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300 border border-orange-300 dark:border-orange-700/50",
      LOGIN: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-700/50",
      LOGOUT: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600",
    };
    return colors[action] || "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600";
  };

  return (
    <AppLayoutERP>
      <Head title="Audit Logs - Solespace ERP" />
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              Audit Logs
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Monitor all system activities, changes, and user actions in real-time
            </p>
          </div>
          <button
            onClick={handleExport}
            title="Export audit logs as CSV"
            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 whitespace-nowrap"
          >
            <ArrowDownTrayIcon className="size-5" />
            Export CSV
          </button>
        </div>

        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Logs Card */}
            <div className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-500 hover:shadow-xl hover:border-gray-300 hover:-translate-y-1 dark:border-gray-800 dark:bg-white/3 dark:hover:border-gray-700">
              <div className="absolute inset-0 bg-linear-to-br from-gray-500 to-gray-600 opacity-0 transition-opacity duration-500 group-hover:opacity-5" />
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center justify-center w-14 h-14 bg-linear-to-br from-gray-500 to-gray-600 rounded-2xl shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:rotate-6">
                    <DocumentTextIcon className="text-white size-7 drop-shadow-sm" />
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Logs</p>
                  <h3 className="text-3xl font-bold text-gray-900 dark:text-white transition-colors duration-300">
                    {stats?.total_logs?.toLocaleString() || '0'}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">All recorded activities</p>
                </div>
              </div>
            </div>

            {/* Last 24 Hours Card */}
            <div className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-500 hover:shadow-xl hover:border-gray-300 hover:-translate-y-1 dark:border-gray-800 dark:bg-white/3 dark:hover:border-gray-700">
              <div className="absolute inset-0 bg-linear-to-br from-blue-500 to-indigo-600 opacity-0 transition-opacity duration-500 group-hover:opacity-5" />
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center justify-center w-14 h-14 bg-linear-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:rotate-6">
                    <ClockIcon className="text-white size-7 drop-shadow-sm" />
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Last 24 Hours</p>
                  <h3 className="text-3xl font-bold text-blue-600 dark:text-blue-400 transition-colors duration-300">
                    {stats?.logs_last_24h || 0}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Recent activities</p>
                </div>
              </div>
            </div>

            {/* Distinct Actions Card */}
            <div className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-500 hover:shadow-xl hover:border-gray-300 hover:-translate-y-1 dark:border-gray-800 dark:bg-white/3 dark:hover:border-gray-700">
              <div className="absolute inset-0 bg-linear-to-br from-purple-500 to-pink-600 opacity-0 transition-opacity duration-500 group-hover:opacity-5" />
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center justify-center w-14 h-14 bg-linear-to-br from-purple-500 to-pink-600 rounded-2xl shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:rotate-6">
                    <FunnelIcon className="text-white size-7 drop-shadow-sm" />
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Distinct Actions</p>
                  <h3 className="text-3xl font-bold text-purple-600 dark:text-purple-400 transition-colors duration-300">
                    {stats?.action_counts ? Object.keys(stats.action_counts).length : 0}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Action types</p>
                </div>
              </div>
            </div>

            {/* Object Types Card */}
            <div className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-500 hover:shadow-xl hover:border-gray-300 hover:-translate-y-1 dark:border-gray-800 dark:bg-white/3 dark:hover:border-gray-700">
              <div className="absolute inset-0 bg-linear-to-br from-emerald-500 to-teal-600 opacity-0 transition-opacity duration-500 group-hover:opacity-5" />
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center justify-center w-14 h-14 bg-linear-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:rotate-6">
                    <CubeIcon className="text-white size-7 drop-shadow-sm" />
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Object Types</p>
                  <h3 className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 transition-colors duration-300">
                    {stats?.object_type_counts ? Object.keys(stats.object_type_counts).length : 0}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Entity types</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-8 shadow-sm">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              Advanced Filters
            </h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            {/* Search */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                Search
              </label>
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-3.5 size-5 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search action..."
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>
            </div>

            {/* Action Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                Action Type
              </label>
              <select
                value={selectedAction}
                onChange={(e) => setSelectedAction(e.target.value)}
                title="Filter by action type"
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              >
                <option value="">All Actions</option>
                {actions.map((action) => (
                  <option key={action} value={action}>
                    {action}
                  </option>
                ))}
              </select>
            </div>

            {/* Object Type Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                Object Type
              </label>
              <select
                value={selectedObjectType}
                onChange={(e) => setSelectedObjectType(e.target.value)}
                title="Filter by object type"
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              >
                <option value="">All Types</option>
                {objectTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* Start Date */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                title="Start date"
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>

            {/* End Date */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                title="End date"
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>
          </div>

          {/* Filter Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleFilter}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-semibold transition-all duration-300 flex items-center gap-2"
            >
              <MagnifyingGlassIcon className="size-5" />
              Apply Filters
            </button>
            <button
              onClick={handleClearFilters}
              className="px-6 py-2.5 bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-900 dark:text-white rounded-xl font-semibold transition-all duration-300"
            >
              Clear All
            </button>
          </div>
        </div>

        {/* Logs Table */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="flex flex-col items-center justify-center gap-4">
                <div className="relative w-12 h-12">
                  <div className="absolute inset-0 rounded-full border-4 border-gray-300 dark:border-gray-600"></div>
                  <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500 border-r-blue-500 animate-spin"></div>
                </div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Loading audit logs...</p>
              </div>
            </div>
          ) : logs.length === 0 ? (
            <div className="p-12 text-center">
              <div className="flex flex-col items-center justify-center gap-4">
                <DocumentTextIcon className="size-16 text-gray-300 dark:text-gray-600" />
                <div>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">No audit logs found</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Try adjusting your filters or date range</p>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-linear-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 border-b border-gray-200 dark:border-gray-700">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        Action
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        Object Type
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        User ID
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        Timestamp
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        Details
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {logs.map((log) => (
                      <tr
                        key={log.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-200"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 ${getActionBadgeColor(
                              log.action
                            )}`}
                          >
                            {log.action}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                            {log.object_type || "—"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                          #{log.user_id || "—"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                          {new Date(log.created_at).toLocaleString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                          })}
                        </td>
                        <td className="px-6 py-4 text-sm text-right">
                          <button
                            onClick={() => {
                              Swal.fire({
                                title: "Audit Log Details",
                                html: `
                                  <div class="text-left space-y-3 max-h-96 overflow-y-auto">
                                    <div class="bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
                                      <p class="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Log ID</p>
                                      <p class="text-sm font-semibold text-gray-900 dark:text-white">#${log.id}</p>
                                    </div>
                                    <div class="bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
                                      <p class="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Action</p>
                                      <p class="text-sm font-semibold text-gray-900 dark:text-white">${log.action}</p>
                                    </div>
                                    <div class="bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
                                      <p class="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Object Type</p>
                                      <p class="text-sm font-semibold text-gray-900 dark:text-white">${log.object_type || "N/A"}</p>
                                    </div>
                                    <div class="bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
                                      <p class="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">User ID</p>
                                      <p class="text-sm font-semibold text-gray-900 dark:text-white">#${log.user_id || "N/A"}</p>
                                    </div>
                                    <div class="bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
                                      <p class="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Created At</p>
                                      <p class="text-sm font-semibold text-gray-900 dark:text-white">${new Date(log.created_at).toLocaleString()}</p>
                                    </div>
                                    ${log.metadata ? `<div class="bg-gray-50 dark:bg-gray-900 rounded-lg p-3"><p class="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Metadata</p><pre class="text-xs bg-white dark:bg-gray-800 p-2 rounded text-gray-900 dark:text-white overflow-x-auto">${JSON.stringify(log.metadata, null, 2)}</pre></div>` : ""}
                                  </div>
                                `,
                                confirmButtonColor: "#3b82f6",
                                confirmButtonText: "Close",
                                width: 600,
                              });
                            }}
                            className="group relative inline-flex items-center gap-1.5 px-3 py-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-semibold rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200"
                          >
                            <EyeIcon className="size-4" />
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination && pagination.last_page > 1 && (
                <div className="px-6 py-5 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-50 dark:bg-gray-800/50">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Showing <span className="font-bold text-gray-900 dark:text-white">{(currentPage - 1) * pagination.per_page + 1}</span> to{" "}
                    <span className="font-bold text-gray-900 dark:text-white">
                      {Math.min(currentPage * pagination.per_page, pagination.total)}
                    </span>{" "}
                    of <span className="font-bold text-gray-900 dark:text-white">{pagination.total}</span> logs
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => fetchLogs(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2"
                    >
                      <ChevronLeftIcon className="size-4" />
                      Previous
                    </button>
                    <div className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl">
                      <span className="text-sm font-bold text-gray-900 dark:text-white">
                        Page {currentPage} of {pagination.last_page}
                      </span>
                    </div>
                    <button
                      onClick={() => fetchLogs(currentPage + 1)}
                      disabled={currentPage === pagination.last_page}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2"
                    >
                      Next
                      <ChevronRightIcon className="size-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </AppLayoutERP>
  );
}
