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

      const response = await fetch(`/api/audit-logs?${params}`);
      const data = await response.json();

      setLogs(data.logs.data);
      setPagination(data.logs);
      setActions(data.actions);
      setObjectTypes(data.object_types);
      setCurrentPage(page);
    } catch (error) {
      console.error("Error fetching logs:", error);
      Swal.fire("Error", "Failed to fetch audit logs", "error");
    } finally {
      setLoading(false);
    }
  };

  // Fetch statistics
  const fetchStats = async () => {
    try {
      const response = await fetch("/api/audit-logs/stats");
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error("Error fetching stats:", error);
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

      window.location.href = `/api/audit-logs/export?${params}`;
    } catch (error) {
      console.error("Error exporting:", error);
      Swal.fire("Error", "Failed to export logs", "error");
    }
  };

  const getActionBadgeColor = (action: string) => {
    const colors: Record<string, string> = {
      CREATE: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      UPDATE: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      DELETE: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      APPROVE: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      REJECT: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
      LOGIN: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
      LOGOUT: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200",
    };
    return colors[action] || "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
  };

  return (
    <AppLayoutERP>
      <Head title="Audit Logs - Solespace ERP" />
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Audit Logs
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Track all system activities and changes
            </p>
          </div>
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition"
          >
            📥 Export CSV
          </button>
        </div>

        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <p className="text-gray-600 dark:text-gray-400 text-sm">Total Logs</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                {stats.total_logs.toLocaleString()}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <p className="text-gray-600 dark:text-gray-400 text-sm">Last 24 Hours</p>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                {stats.logs_last_24h}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <p className="text-gray-600 dark:text-gray-400 text-sm">Distinct Actions</p>
              <p className="text-3xl font-bold text-purple-600 dark:text-purple-400 mt-1">
                {Object.keys(stats.action_counts).length}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <p className="text-gray-600 dark:text-gray-400 text-sm">Object Types</p>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-1">
                {Object.keys(stats.object_type_counts).length}
              </p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Filters
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Search
              </label>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search action or type..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Action Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Action
              </label>
              <select
                value={selectedAction}
                onChange={(e) => setSelectedAction(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Object Type
              </label>
              <select
                value={selectedObjectType}
                onChange={(e) => setSelectedObjectType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* End Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Filter Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={handleFilter}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
            >
              🔍 Apply Filters
            </button>
            <button
              onClick={handleClearFilters}
              className="px-4 py-2 bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-900 dark:text-white rounded-lg font-medium transition"
            >
              ✕ Clear
            </button>
          </div>
        </div>

        {/* Logs Table */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="text-gray-600 dark:text-gray-400 mt-2">Loading logs...</p>
            </div>
          ) : logs.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-600 dark:text-gray-400">No audit logs found</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        Action
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        Object Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        User ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        Timestamp
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        Details
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {logs.map((log) => (
                      <tr
                        key={log.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getActionBadgeColor(
                              log.action
                            )}`}
                          >
                            {log.action}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                          {log.object_type || "—"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                          {log.user_id || "—"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                          {new Date(log.created_at).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <button
                            onClick={() => {
                              Swal.fire({
                                title: "Log Details",
                                html: `
                                  <div class="text-left space-y-3">
                                    <div><strong>ID:</strong> ${log.id}</div>
                                    <div><strong>Action:</strong> ${log.action}</div>
                                    <div><strong>Object Type:</strong> ${log.object_type || "N/A"}</div>
                                    <div><strong>User ID:</strong> ${log.user_id || "N/A"}</div>
                                    <div><strong>Created:</strong> ${new Date(log.created_at).toLocaleString()}</div>
                                    ${log.metadata ? `<div><strong>Metadata:</strong> <pre class="text-xs bg-gray-100 p-2 rounded mt-1">${JSON.stringify(log.metadata, null, 2)}</pre></div>` : ""}
                                  </div>
                                `,
                                confirmButtonText: "Close",
                              });
                            }}
                            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                          >
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
                <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Showing {(currentPage - 1) * pagination.per_page + 1} to{" "}
                    {Math.min(currentPage * pagination.per_page, pagination.total)} of{" "}
                    {pagination.total} logs
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => fetchLogs(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                      ← Previous
                    </button>
                    <span className="px-3 py-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                      Page {currentPage} of {pagination.last_page}
                    </span>
                    <button
                      onClick={() => fetchLogs(currentPage + 1)}
                      disabled={currentPage === pagination.last_page}
                      className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                      Next →
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
