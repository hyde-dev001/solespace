// Converted from TSX to JSX for Inertia
import React, { useState } from 'react';
import Swal from 'sweetalert2';
import SuperAdminLayout from '../../Layouts/SuperAdminLayout';

// Icon Components
const DownloadIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
  </svg>
);

const FileIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
  </svg>
);

const UserIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const CalenderIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const GridIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
  </svg>
);

const ChatIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>
);

// MetricCard component
const MetricCard = ({ title, value, icon: Icon, color, description }) => {
  const getColorClasses = () => {
    switch (color) {
      case 'success': return 'from-green-500 to-emerald-600';
      case 'error': return 'from-red-500 to-rose-600';
      case 'warning': return 'from-yellow-500 to-orange-600';
      case 'info': return 'from-blue-500 to-indigo-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-500 hover:shadow-xl hover:border-gray-300 hover:-translate-y-1 dark:border-gray-800 dark:bg-white/3 dark:hover:border-gray-700">
      <div className={`absolute inset-0 bg-linear-to-br ${getColorClasses()} opacity-0 transition-opacity duration-500 group-hover:opacity-5`} />

      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <div className={`flex items-center justify-center w-14 h-14 bg-linear-to-br ${getColorClasses()} rounded-2xl shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:rotate-6`}>
            <Icon className="text-white size-7 drop-shadow-sm" />
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <h3 className="text-3xl font-bold text-gray-900 dark:text-white transition-colors duration-300">{typeof value === 'number' ? value.toLocaleString() : value}</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
        </div>
      </div>
    </div>
  );
};

// ExportCard component
const ExportCard = ({ exportOption, onExport }) => {
  const getColorClasses = () => {
    switch (exportOption.dataType) {
      case 'users': return 'from-blue-500 to-indigo-600';
      case 'shops': return 'from-purple-500 to-pink-600';
      case 'analytics': return 'from-green-500 to-teal-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const Icon = exportOption.icon;

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-500 hover:shadow-xl hover:border-gray-300 hover:-translate-y-1 dark:border-gray-800 dark:bg-white/3 dark:hover:border-gray-700">
      <div className={`absolute inset-0 bg-linear-to-br ${getColorClasses()} opacity-0 transition-opacity duration-500 group-hover:opacity-5`} />

      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <div className={`flex items-center justify-center w-14 h-14 bg-linear-to-br ${getColorClasses()} rounded-2xl shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:rotate-6`}>
            <Icon className="text-white size-7 drop-shadow-sm" />
          </div>
          <button
            onClick={() => onExport(exportOption.dataType)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            title={`Export ${exportOption.title}`}
          >
            <DownloadIcon className="size-4" />
            Export
          </button>
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">{exportOption.title}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">{exportOption.description}</p>
        </div>
      </div>
    </div>
  );
};

// ReportGeneration component
const ReportGeneration = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateReport = () => {
    if (!selectedMonth && selectedPeriod === 'monthly') {
      Swal.fire({ title: 'Select Month', text: 'Please select a month for the monthly report.', icon: 'warning', confirmButtonColor: '#2563EB' });
      return;
    }

    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      Swal.fire({ title: 'Report Generated!', text: `${selectedPeriod.charAt(0).toUpperCase() + selectedPeriod.slice(1)} report has been generated successfully.`, icon: 'success', confirmButtonColor: '#10B981' });
    }, 3000);
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-white/3">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center justify-center w-10 h-10 bg-indigo-100 rounded-xl dark:bg-indigo-900/30">
          <FileIcon className="text-indigo-600 size-5 dark:text-indigo-400" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Generate Reports</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Create monthly, quarterly, or annual reports on platform activity</p>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Report Period</label>
          <select value={selectedPeriod} onChange={(e) => setSelectedPeriod(e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:border-gray-700 dark:bg-gray-800 dark:text-white" title="Report Period">
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
            <option value="annual">Annual</option>
          </select>
        </div>

        {selectedPeriod === 'monthly' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Select Month</label>
            <input type="month" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:border-gray-700 dark:bg-gray-800 dark:text-white" title="Select Month" />
          </div>
        )}

        <button onClick={handleGenerateReport} disabled={isGenerating} className="w-full bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
          {isGenerating ? (
            <>
              <GridIcon className="size-4 animate-spin" />
              Generating Report...
            </>
          ) : (
            <>
              <FileIcon className="size-4" />
              Generate {selectedPeriod.charAt(0).toUpperCase() + selectedPeriod.slice(1)} Report
            </>
          )}
        </button>
      </div>
    </div>
  );
};

// RecentReports component
const RecentReports = () => {
  const [reports] = useState([
    { id: '1', title: 'Monthly Activity Report - January 2024', period: 'monthly', generatedAt: '2024-01-31T10:00:00Z', status: 'completed' },
    { id: '2', title: 'Quarterly Summary - Q4 2023', period: 'quarterly', generatedAt: '2024-01-15T14:30:00Z', status: 'completed' },
    { id: '3', title: 'Annual Report 2023', period: 'annual', generatedAt: '2024-01-01T09:00:00Z', status: 'processing' },
    { id: '4', title: 'Annual Report 2023', period: 'annual', generatedAt: '2024-01-01T09:00:00Z', status: 'processing' },
    { id: '5', title: 'Annual Report 2023', period: 'annual', generatedAt: '2024-01-01T09:00:00Z', status: 'processing' },
  ]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'processing': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'failed': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
    }
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-white/3">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center justify-center w-10 h-10 bg-teal-100 rounded-xl dark:bg-teal-900/30">
          <CalenderIcon className="text-teal-600 size-5 dark:text-teal-400" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Recent Reports</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">View and download previously generated reports</p>
        </div>
      </div>

      <div className="space-y-4 max-h-96 overflow-y-auto">
        {reports.map((report) => (
          <div key={report.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg dark:border-gray-700">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-xl dark:bg-gray-800">
                <FileIcon className="text-gray-600 size-5 dark:text-gray-400" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white">{report.title}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Generated: {new Date(report.generatedAt).toLocaleDateString()}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(report.status)}`}>{report.status.charAt(0).toUpperCase() + report.status.slice(1)}</span>
              {report.status === 'completed' && (
                <button onClick={() => {
                  Swal.fire({ title: 'Download Report?', text: 'Are you sure you want to download this report?', icon: 'question', showCancelButton: true, confirmButtonColor: '#10B981', cancelButtonColor: '#6B7280', confirmButtonText: 'Yes, download!', cancelButtonText: 'Cancel' }).then((result) => {
                    if (result.isConfirmed) {
                      Swal.fire({ title: 'Download Started!', text: 'Your report download has begun.', icon: 'success', confirmButtonColor: '#10B981' });
                    }
                  });
                }} className="p-2 text-gray-400 hover:text-green-600 transition-colors duration-200" title="Download report" aria-label="Download report">
                  <DownloadIcon className="size-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Main Dashboard component
export default function DataReportAccess() {
  const exportOptions = [
    { id: 'users', title: 'User Lists', description: 'Export complete user data including profiles, activity, and registration details', icon: UserIcon, dataType: 'users' },
    { id: 'shops', title: 'Shop Data', description: 'Export shop owner information, product listings, and sales data', icon: GridIcon, dataType: 'shops' },
    { id: 'analytics', title: 'Analytics Data', description: 'Export platform analytics including user engagement, traffic, and performance metrics', icon: FileIcon, dataType: 'analytics' },
  ];

  const handleExport = (dataType) => {
    Swal.fire({ title: 'Export Data?', text: `Are you sure you want to export ${dataType} data? This may take a few moments.`, icon: 'question', showCancelButton: true, confirmButtonColor: '#2563EB', cancelButtonColor: '#6B7280', confirmButtonText: 'Yes, export!', cancelButtonText: 'Cancel' }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({ title: 'Export Started!', text: `Your ${dataType} data export has begun. You'll receive a notification when it's ready.`, icon: 'success', confirmButtonColor: '#10B981' });
      }
    });
  };

  return (
      <div className="space-y-8 p-6 md:p-8">
        {/* Header Section */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Data & Report Access</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Export user lists, shop data, and analytics. Generate monthly reports on platform activity.</p>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard title="Total Exports" value={156} icon={DownloadIcon} color="info" description="This month" />
          <MetricCard title="Reports Generated" value={23} icon={FileIcon} color="success" description="This quarter" />
          <MetricCard title="Data Points" value="2.4M" icon={ChatIcon} color="warning" description="Available for export" />
          <MetricCard title="Storage Used" value="45%" icon={GridIcon} color="error" description="Of allocated space" />
        </div>

        {/* Export Options */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">{exportOptions.map((option) => (<ExportCard key={option.id} exportOption={option} onExport={handleExport} />))}</div>

        {/* Report Generation and Recent Reports */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <ReportGeneration />
          <RecentReports />
        </div>

      </div>
  );
}

DataReportAccess.layout = (page) => (
  <SuperAdminLayout auth={page.props.auth}>
    {page}
  </SuperAdminLayout>
);
