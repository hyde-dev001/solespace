import React, { useState, useEffect } from "react";
import { Head } from "@inertiajs/react";
import AppLayoutShopOwner from "../../layout/AppLayout_shopOwner";
import Swal from "sweetalert2";

interface ActivityLog {
  id: number;
  log_name: string | null;
  description: string;
  subject_type: string | null;
  subject_id: number | null;
  causer_type: string | null;
  causer_id: number | null;
  event: string;
  properties: Record<string, any>;
  created_at: string;
  updated_at: string;
}

interface PaginationData {
  data: ActivityLog[];
  total: number;
  per_page: number;
  current_page: number;
  last_page: number;
}

interface Stats {
  total_logs: number;
  logs_last_24h: number;
  event_counts: Record<string, number>;
  subject_type_counts: Record<string, number>;
}

// Icons
const DocumentTextIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const ShieldCheckIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

const ClockIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
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

const EyeIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const BuildingStorefrontIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);

export default function ShopOwnerAuditLogs() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [pagination, setPagination] = useState<PaginationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  
  // Filters
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [eventFilter, setEventFilter] = useState("");
  const [subjectTypeFilter, setSubjectTypeFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchLogs(currentPage);
  }, [currentPage, dateFrom, dateTo, eventFilter, subjectTypeFilter]);

  const fetchLogs = async (page: number) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      if (dateFrom) params.append('date_from', dateFrom);
      if (dateTo) params.append('date_to', dateTo);
      if (eventFilter) params.append('event', eventFilter);
      if (subjectTypeFilter) params.append('subject_type', subjectTypeFilter);

      const response = await fetch(`/api/activity-logs?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch logs');
      
      const data = await response.json();
      setLogs(data.logs.data);
      setPagination(data.logs);
      setStats(data.stats);
    } catch (error) {
      console.error('Error fetching logs:', error);
      Swal.fire({
        title: 'Error',
        text: 'Failed to load activity logs',
        icon: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setDateFrom("");
    setDateTo("");
    setEventFilter("");
    setSubjectTypeFilter("");
  };

  const viewLogDetails = (log: ActivityLog) => {
    const properties = log.properties;
    const attributesHtml = properties.attributes ? 
      `<pre class="text-left text-sm bg-gray-100 p-3 rounded mt-2 overflow-auto max-h-60">${JSON.stringify(properties.attributes, null, 2)}</pre>` : '';
    const oldHtml = properties.old ? 
      `<pre class="text-left text-sm bg-gray-100 p-3 rounded mt-2 overflow-auto max-h-60">${JSON.stringify(properties.old, null, 2)}</pre>` : '';

    Swal.fire({
      title: `${log.description}`,
      html: `
        <div class="text-left">
          <p class="mb-2"><strong>Event:</strong> ${log.event}</p>
          <p class="mb-2"><strong>Date:</strong> ${new Date(log.created_at).toLocaleString()}</p>
          <p class="mb-2"><strong>Subject:</strong> ${log.subject_type || 'N/A'} (ID: ${log.subject_id || 'N/A'})</p>
          ${properties.old ? '<p class="mb-2"><strong>Previous Values:</strong></p>' + oldHtml : ''}
          ${properties.attributes ? '<p class="mb-2"><strong>New Values:</strong></p>' + attributesHtml : ''}
        </div>
      `,
      width: 800,
      confirmButtonText: 'Close',
      confirmButtonColor: '#3b82f6',
    });
  };

  const getEventBadgeColor = (event: string) => {
    switch (event) {
      case 'created': return 'bg-green-100 text-green-800';
      case 'updated': return 'bg-blue-100 text-blue-800';
      case 'deleted': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatSubjectType = (type: string | null) => {
    if (!type) return 'N/A';
    const parts = type.split('\\');
    return parts[parts.length - 1];
  };

  return (
    <AppLayoutShopOwner>
      <Head title="Activity Audit Logs" />

      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <ShieldCheckIcon className="w-10 h-10 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-800">Activity Audit Logs</h1>
          </div>
          <p className="text-gray-600 mt-2">
            Complete audit trail of all activities in your business
          </p>
          <p className="text-sm text-gray-500 mt-1">
            📊 Track products, expenses, employees, orders, and all business operations
          </p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-lg shadow-lg text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Total Logs</p>
                  <p className="text-3xl font-bold">{stats.total_logs.toLocaleString()}</p>
                </div>
                <DocumentTextIcon className="w-12 h-12 text-blue-200" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-lg shadow-lg text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Last 24 Hours</p>
                  <p className="text-3xl font-bold">{stats.logs_last_24h}</p>
                </div>
                <ClockIcon className="w-12 h-12 text-green-200" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-6 rounded-lg shadow-lg text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-100 text-sm font-medium">Created</p>
                  <p className="text-3xl font-bold">{stats.event_counts.created || 0}</p>
                </div>
                <div className="w-12 h-12 bg-emerald-400 rounded-full flex items-center justify-center">
                  <span className="text-white text-2xl font-bold">+</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-sky-500 to-sky-600 p-6 rounded-lg shadow-lg text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sky-100 text-sm font-medium">Updated</p>
                  <p className="text-3xl font-bold">{stats.event_counts.updated || 0}</p>
                </div>
                <div className="w-12 h-12 bg-sky-400 rounded-full flex items-center justify-center">
                  <span className="text-white text-2xl font-bold">↻</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 text-gray-700 font-semibold mb-4 hover:text-blue-600 transition"
          >
            <FunnelIcon className="w-5 h-5" />
            {showFilters ? 'Hide' : 'Show'} Filters
          </button>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date From</label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date To</label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Event</label>
                <select
                  value={eventFilter}
                  onChange={(e) => setEventFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Events</option>
                  <option value="created">Created</option>
                  <option value="updated">Updated</option>
                  <option value="deleted">Deleted</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Activity Type</label>
                <select
                  value={subjectTypeFilter}
                  onChange={(e) => setSubjectTypeFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Types</option>
                  <option value="Product">Products</option>
                  <option value="Expense">Expenses</option>
                  <option value="User">Employees</option>
                  <option value="Order">Orders</option>
                  <option value="Invoice">Invoices</option>
                  <option value="Customer">Customers</option>
                  <option value="Payroll">Payroll</option>
                  <option value="Leave">Leave Requests</option>
                </select>
              </div>

              <div className="md:col-span-4">
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Logs Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <DocumentTextIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <p className="text-lg">No activity logs found</p>
              <p className="text-sm text-gray-400 mt-2">Activities will appear here as changes are made</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {logs.map((log) => (
                      <tr key={log.id} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getEventBadgeColor(log.event)}`}>
                            {log.event}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-900 font-medium">{log.description}</p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <p className="text-sm text-gray-900">{formatSubjectType(log.subject_type)}</p>
                          <p className="text-xs text-gray-500">ID: {log.subject_id || 'N/A'}</p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <p className="text-sm text-gray-900">{new Date(log.created_at).toLocaleDateString()}</p>
                          <p className="text-xs text-gray-500">{new Date(log.created_at).toLocaleTimeString()}</p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => viewLogDetails(log)}
                            className="text-blue-600 hover:text-blue-800 flex items-center gap-1 transition"
                          >
                            <EyeIcon className="w-4 h-4" />
                            <span className="text-sm font-medium">View</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination && pagination.last_page > 1 && (
                <div className="flex justify-between items-center px-6 py-4 border-t bg-gray-50">
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-semibold">{((pagination.current_page - 1) * pagination.per_page) + 1}</span> to{' '}
                    <span className="font-semibold">{Math.min(pagination.current_page * pagination.per_page, pagination.total)}</span> of{' '}
                    <span className="font-semibold">{pagination.total}</span> results
                  </p>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white transition"
                    >
                      <ChevronLeftIcon className="w-5 h-5" />
                    </button>

                    {[...Array(pagination.last_page)].map((_, idx) => {
                      const pageNum = idx + 1;
                      if (
                        pageNum === 1 ||
                        pageNum === pagination.last_page ||
                        (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                      ) {
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`px-3 py-1 border rounded-lg transition ${
                              currentPage === pageNum
                                ? 'bg-blue-500 text-white border-blue-500'
                                : 'hover:bg-white'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      } else if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                        return <span key={pageNum} className="px-2">...</span>;
                      }
                      return null;
                    })}

                    <button
                      onClick={() => setCurrentPage(prev => Math.min(pagination.last_page, prev + 1))}
                      disabled={currentPage === pagination.last_page}
                      className="px-3 py-1 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white transition"
                    >
                      <ChevronRightIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </AppLayoutShopOwner>
  );
}
