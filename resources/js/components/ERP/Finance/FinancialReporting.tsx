import React, { useState, useEffect, useRef, useMemo } from "react";
import Chart from "react-apexcharts";
import Swal from "sweetalert2";
import { useFinanceApi } from "../../../hooks/useFinanceApi";

interface ReportData {
  [key: string]: any;
}

interface BalanceSheetData {
  as_of_date: string;
  assets: { accounts: any[]; total: number };
  liabilities: { accounts: any[]; total: number };
  equity: { accounts: any[]; total: number };
  summary: {
    total_assets: number;
    total_liabilities_equity: number;
    balanced: boolean;
  };
}

interface PLData {
  from_date: string;
  to_date: string;
  revenues: { accounts: any[]; total: number };
  expenses: { accounts: any[]; total: number };
  summary: {
    total_revenues: number;
    total_expenses: number;
    net_income: number;
  };
}

interface TrialBalanceData {
  as_of_date: string;
  accounts: any[];
  summary: {
    total_debits: number;
    total_credits: number;
    balanced: boolean;
    difference: number;
  };
}

interface AgingData {
  as_of_date: string;
  buckets: {
    [key: string]: {
      label: string;
      items: any[];
      total: number;
    };
  };
  summary: {
    total_ar?: number;
    total_ap?: number;
  };
}

interface AgingData {
  as_of_date: string;
  buckets: {
    [key: string]: {
      label: string;
      items: any[];
      total: number;
    };
  };
  summary: {
    total_ar?: number;
    total_ap?: number;
  };
}

// Balance Sheet Component
const BalanceSheetReport: React.FC<{ 
  data: BalanceSheetData; 
  formatCurrency: (v: number) => string; 
  onAccountClick?: (accountId: number) => void;
}> = ({ data, formatCurrency, onAccountClick }) => {
  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-2xl border border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-900/20 p-6">
          <p className="text-sm text-green-600 dark:text-green-400">Total Assets</p>
          <p className="text-2xl font-bold text-green-900 dark:text-green-200 mt-2">{formatCurrency(data.summary.total_assets)}</p>
        </div>
        <div className="rounded-2xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-900/20 p-6">
          <p className="text-sm text-red-600 dark:text-red-400">Total Liabilities</p>
          <p className="text-2xl font-bold text-red-900 dark:text-red-200 mt-2">{formatCurrency(data.summary.total_liabilities_equity - (data.summary.total_assets - data.summary.total_liabilities_equity))}</p>
        </div>
        <div className="rounded-2xl border border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-900/20 p-6">
          <p className="text-sm text-blue-600 dark:text-blue-400">Balanced</p>
          <p className={`text-2xl font-bold mt-2 ${data.summary.balanced ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
            {data.summary.balanced ? "✓ Yes" : "✗ No"}
          </p>
        </div>
      </div>

      {/* Detailed Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Section title="Assets" accounts={data.assets.accounts} total={data.assets.total} formatCurrency={formatCurrency} onAccountClick={onAccountClick} />
        <Section title="Liabilities" accounts={data.liabilities.accounts} total={data.liabilities.total} formatCurrency={formatCurrency} onAccountClick={onAccountClick} />
        <Section title="Equity" accounts={data.equity.accounts} total={data.equity.total} formatCurrency={formatCurrency} onAccountClick={onAccountClick} />
      </div>
    </div>
  );
};

// P&L Report Component
const PLReport: React.FC<{ 
  data: PLData; 
  formatCurrency: (v: number) => string; 
  onAccountClick?: (accountId: number) => void;
}> = ({ data, formatCurrency, onAccountClick }) => {
  const isProfit = data.summary.net_income >= 0;

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-2xl border border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-900/20 p-6">
          <p className="text-sm text-green-600 dark:text-green-400">Total Revenues</p>
          <p className="text-2xl font-bold text-green-900 dark:text-green-200 mt-2">{formatCurrency(data.summary.total_revenues)}</p>
        </div>
        <div className="rounded-2xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-900/20 p-6">
          <p className="text-sm text-red-600 dark:text-red-400">Total Expenses</p>
          <p className="text-2xl font-bold text-red-900 dark:text-red-200 mt-2">{formatCurrency(data.summary.total_expenses)}</p>
        </div>
        <div className={`rounded-2xl border-2 p-6 ${isProfit ? "border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-900/20" : "border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-900/20"}`}>
          <p className={`text-sm ${isProfit ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>Net Income</p>
          <p className={`text-2xl font-bold mt-2 ${isProfit ? "text-green-900 dark:text-green-200" : "text-red-900 dark:text-red-200"}`}>
            {formatCurrency(data.summary.net_income)}
          </p>
        </div>
      </div>

      {/* Detailed Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Section title="Revenues" accounts={data.revenues.accounts} total={data.revenues.total} formatCurrency={formatCurrency} onAccountClick={onAccountClick} />
        <Section title="Expenses" accounts={data.expenses.accounts} total={data.expenses.total} formatCurrency={formatCurrency} onAccountClick={onAccountClick} />
      </div>
    </div>
  );
};

// Trial Balance Report Component
const TrialBalanceReport: React.FC<{ data: TrialBalanceData; formatCurrency: (v: number) => string }> = ({ data, formatCurrency }) => {
  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-2xl border border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-900/20 p-6">
          <p className="text-sm text-blue-600 dark:text-blue-400">Total Debits</p>
          <p className="text-2xl font-bold text-blue-900 dark:text-blue-200 mt-2">{formatCurrency(data.summary.total_debits)}</p>
        </div>
        <div className="rounded-2xl border border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-900/20 p-6">
          <p className="text-sm text-blue-600 dark:text-blue-400">Total Credits</p>
          <p className="text-2xl font-bold text-blue-900 dark:text-blue-200 mt-2">{formatCurrency(data.summary.total_credits)}</p>
        </div>
        <div className={`rounded-2xl border-2 p-6 ${data.summary.balanced ? "border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-900/20" : "border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-900/20"}`}>
          <p className={`text-sm ${data.summary.balanced ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>Status</p>
          <p className={`text-2xl font-bold mt-2 ${data.summary.balanced ? "text-green-900 dark:text-green-200" : "text-red-900 dark:text-red-200"}`}>
            {data.summary.balanced ? "✓ Balanced" : `✗ Difference: ${formatCurrency(data.summary.difference)}`}
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800">
              <th className="text-left py-3 px-6 text-xs font-semibold text-gray-600 dark:text-gray-400">Account Code</th>
              <th className="text-left py-3 px-6 text-xs font-semibold text-gray-600 dark:text-gray-400">Account Name</th>
              <th className="text-right py-3 px-6 text-xs font-semibold text-gray-600 dark:text-gray-400">Debit</th>
              <th className="text-right py-3 px-6 text-xs font-semibold text-gray-600 dark:text-gray-400">Credit</th>
            </tr>
          </thead>
          <tbody>
            {data.accounts.map((account) => (
              <tr key={account.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800">
                <td className="py-3 px-6 text-sm font-medium text-gray-900 dark:text-white">{account.code}</td>
                <td className="py-3 px-6 text-sm text-gray-700 dark:text-gray-300">{account.name}</td>
                <td className="py-3 px-6 text-right text-sm font-semibold text-gray-900 dark:text-white">{formatCurrency(account.debit)}</td>
                <td className="py-3 px-6 text-right text-sm font-semibold text-gray-900 dark:text-white">{formatCurrency(account.credit)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Aging Report Component
const AgingReport: React.FC<{ data: AgingData; type: "AR" | "AP"; formatCurrency: (v: number) => string }> = ({ data, type, formatCurrency }) => {
  const bucketOrder = ["current", "thirty_days", "sixty_days", "ninety_days", "over_120"];

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="rounded-2xl border border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-900/20 p-6">
        <p className="text-sm text-blue-600 dark:text-blue-400">Total {type}</p>
        <p className="text-3xl font-bold text-blue-900 dark:text-blue-200 mt-2">
          {formatCurrency(data.summary[type === "AR" ? "total_ar" : "total_ap"] || 0)}
        </p>
      </div>

      {/* Aging Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {bucketOrder.map((bucketKey) => {
          const bucket = data.buckets[bucketKey];
          const colors = ["bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-900", "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-900", "bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-900", "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-900", "bg-red-100 dark:bg-red-900/40 border-red-300 dark:border-red-800"];
          const colorIdx = bucketOrder.indexOf(bucketKey);

          return (
            <div key={bucketKey} className={`rounded-lg border ${colors[colorIdx]} p-4`}>
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">{bucket.label}</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{formatCurrency(bucket.total)}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{bucket.items.length} items</p>
            </div>
          );
        })}
      </div>

      {/* Detail Table */}
      {Object.entries(data.buckets).map(([bucketKey, bucket]) => (
        <div key={bucketKey} className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm overflow-hidden">
          <div className="px-6 py-3 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800">
            <h3 className="font-semibold text-gray-900 dark:text-white">{bucket.label}</h3>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800">
                <th className="text-left py-3 px-6 text-xs font-semibold text-gray-600 dark:text-gray-400">Date</th>
                <th className="text-left py-3 px-6 text-xs font-semibold text-gray-600 dark:text-gray-400">Reference</th>
                <th className="text-right py-3 px-6 text-xs font-semibold text-gray-600 dark:text-gray-400">Amount</th>
              </tr>
            </thead>
            <tbody>
              {bucket.items.map((item, idx) => (
                <tr key={idx} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="py-3 px-6 text-sm text-gray-700 dark:text-gray-300">{item.date}</td>
                  <td className="py-3 px-6 text-sm font-medium text-gray-900 dark:text-white">{item.reference}</td>
                  <td className="py-3 px-6 text-right text-sm font-semibold text-gray-900 dark:text-white">{formatCurrency(item.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {bucket.items.length === 0 && (
            <div className="py-8 text-center text-gray-500 dark:text-gray-400">No items in this bucket</div>
          )}
        </div>
      ))}
    </div>
  );
};

// Generic Section Component for Account Lists
const Section: React.FC<{ 
  title: string; 
  accounts: any[]; 
  total: number; 
  formatCurrency: (v: number) => string; 
  onAccountClick?: (accountId: number) => void;
}> = ({ title, accounts, total, formatCurrency, onAccountClick }) => {
  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{title}</h3>
      <div className="space-y-2">
        {accounts.map((account) => (
          <div 
            key={account.id} 
            className={`flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-800 ${onAccountClick ? "cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 px-2 -mx-2 rounded transition-colors" : ""}`}
            onClick={() => onAccountClick && onAccountClick(account.id)}
            title={onAccountClick ? "Click to view ledger details" : ""}
          >
            <span className="text-sm text-gray-700 dark:text-gray-300">{account.code} - {account.name}</span>
            <span className="font-semibold text-gray-900 dark:text-white">{formatCurrency(account.balance)}</span>
          </div>
        ))}
        <div className="flex justify-between items-center py-2 border-t-2 border-gray-400 dark:border-gray-600 font-bold mt-2">
          <span className="text-gray-900 dark:text-white">Total {title}</span>
          <span className="text-gray-900 dark:text-white">{formatCurrency(total)}</span>
        </div>
      </div>
    </div>
  );
};

// Note: removed earlier default export to avoid duplicate default exports.
// The main `FinancialReporting` component is exported at the end of this file.
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

const DocumentReportIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const CheckCircleIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const ClockIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const XCircleIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
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

const ArrowDownTrayIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
  </svg>
);

const TrashIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3M4 7h16" />
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

const PlusIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

const MoreDotIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" clipRule="evenodd" d="M10.2441 6C10.2441 5.0335 11.0276 4.25 11.9941 4.25H12.0041C12.9706 4.25 13.7541 5.0335 13.7541 6C13.7541 6.9665 12.9706 7.75 12.0041 7.75H11.9941C11.0276 7.75 10.2441 6.9665 10.2441 6ZM10.2441 18C10.2441 17.0335 11.0276 16.25 11.9941 16.25H12.0041C12.9706 16.25 13.7541 17.0335 13.7541 18C13.7541 18.9665 12.9706 19.75 12.0041 19.75H11.9941C11.0276 19.75 10.2441 18.9665 10.2441 18ZM11.9941 10.25C11.0276 10.25 10.2441 11.0335 10.2441 12C10.2441 12.9665 11.0276 13.75 11.9941 13.75H12.0041C12.9706 13.75 13.7541 12.9665 13.7541 12C13.7541 11.0335 12.9706 10.25 12.0041 10.25H11.9941Z" fill="currentColor" />
  </svg>
);

// MetricCard removed per user request

type ReportTab = "all" | "Income Statement" | "Balance Sheet" | "Cash Flow";

// Monthly Revenue Chart Component (same design as Best Performing Shops)
const MonthlyRevenueChart: React.FC = () => {
  const options: ApexOptions = {
    colors: ["#3170c4"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "bar",
      height: 350,
      toolbar: {
        show: false,
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "39%",
        borderRadius: 5,
        borderRadiusApplication: "end",
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      width: 4,
      colors: ["transparent"],
    },
    xaxis: {
      categories: [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ],
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    legend: {
      show: true,
      position: "top",
      horizontalAlign: "left",
      fontFamily: "Outfit",
    },
    yaxis: {
      title: {
        text: undefined,
      },
    },
    grid: {
      yaxis: {
        lines: {
          show: true,
        },
      },
    },
    fill: {
      opacity: 1,
    },
    tooltip: {
      x: {
        show: false,
      },
      y: {
        formatter: (val: number) => `₱${val.toLocaleString()}`,
      },
    },
  };

  const series = [
    {
      name: "Monthly Revenue",
      data: [45000, 52000, 48000, 61000, 58000, 63000, 70000, 68000, 72000, 75000, 80000, 85000],
    },
  ];

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Monthly Revenue Overview
        </h3>
        <div className="relative inline-block">
          <button className="dropdown-toggle">
            <MoreDotIcon className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 size-6" />
          </button>
        </div>
      </div>

      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <div className="-ml-5 min-w-[650px] xl:min-w-full pl-2">
          <Chart options={options} series={series} type="bar" height={350} />
        </div>
      </div>
    </div>
  );
};

const FinancialReportingLegacy: React.FC = () => {
  const api = useFinanceApi();
  type ReportType = "balance-sheet" | "pl" | "trial-balance" | "ar-aging" | "ap-aging";
  
  const [activeReport, setActiveReport] = useState<ReportType>("balance-sheet");
  const [balanceSheetData, setBalanceSheetData] = useState<BalanceSheetData | null>(null);
  const [plData, setPlData] = useState<PLData | null>(null);
  const [trialBalanceData, setTrialBalanceData] = useState<TrialBalanceData | null>(null);
  const [arAgingData, setArAgingData] = useState<AgingData | null>(null);
  const [apAgingData, setApAgingData] = useState<AgingData | null>(null);
  const [loading, setLoading] = useState(false);
  const [asOfDate, setAsOfDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [fromDate, setFromDate] = useState<string>(new Date(new Date().getFullYear(), 0, 1).toISOString().split("T")[0]);
  const [toDate, setToDate] = useState<string>(new Date().toISOString().split("T")[0]);

  const fetchBalanceSheet = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/api/finance/reports/balance-sheet?as_of_date=${asOfDate}`);
      if (response.ok) {
        setBalanceSheetData(response.data);
      } else {
        Swal.fire("Error", response.error || "Failed to load Balance Sheet", "error");
      }
    } catch (err) {
      Swal.fire("Error", "Failed to fetch Balance Sheet", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchPL = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/api/finance/reports/profit-loss?from_date=${fromDate}&to_date=${toDate}`);
      if (response.ok) {
        setPlData(response.data);
      } else {
        Swal.fire("Error", response.error || "Failed to load P&L Statement", "error");
      }
    } catch (err) {
      Swal.fire("Error", "Failed to fetch P&L Statement", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchTrialBalance = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/api/finance/reports/trial-balance?as_of_date=${asOfDate}`);
      if (response.ok) {
        setTrialBalanceData(response.data);
      } else {
        Swal.fire("Error", response.error || "Failed to load Trial Balance", "error");
      }
    } catch (err) {
      Swal.fire("Error", "Failed to fetch Trial Balance", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchARaging = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/api/finance/reports/ar-aging?as_of_date=${asOfDate}`, { skipAuth: true });
      if (response.ok) {
        setArAgingData(response.data);
      } else {
        Swal.fire("Error", response.error || "Failed to load AR Aging", "error");
      }
    } catch (err) {
      Swal.fire("Error", "Failed to fetch AR Aging", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchAPaging = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/api/finance/reports/ap-aging?as_of_date=${asOfDate}`, { skipAuth: true });
      if (response.ok) {
        setApAgingData(response.data);
      } else {
        Swal.fire("Error", response.error || "Failed to load AP Aging", "error");
      }
    } catch (err) {
      Swal.fire("Error", "Failed to fetch AP Aging", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeReport === "balance-sheet") fetchBalanceSheet();
    else if (activeReport === "pl") fetchPL();
    else if (activeReport === "trial-balance") fetchTrialBalance();
    else if (activeReport === "ar-aging") fetchARaging();
    else if (activeReport === "ap-aging") fetchAPaging();
  }, [activeReport, asOfDate, fromDate, toDate]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Financial Reports</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Real-time financial statements and analysis
            </p>
          </div>
        </div>

        {/* Report Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {[
            { id: "balance-sheet", label: "Balance Sheet" },
            { id: "pl", label: "P&L Statement" },
            { id: "trial-balance", label: "Trial Balance" },
            { id: "ar-aging", label: "AR Aging" },
            { id: "ap-aging", label: "AP Aging" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveReport(tab.id as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                activeReport === tab.id
                  ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Date Filter */}
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-end">
            {(activeReport === "balance-sheet" || activeReport === "trial-balance" || activeReport === "ar-aging" || activeReport === "ap-aging") && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">As of Date</label>
                  <input
                    type="date"
                    value={asOfDate}
                    onChange={(e) => setAsOfDate(e.target.value)}
                    className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
              </>
            )}
            {(activeReport === "pl") && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">From Date</label>
                  <input
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">To Date</label>
                  <input
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
              </>
            )}
            <button
              onClick={() => {
                if (activeReport === "balance-sheet") fetchBalanceSheet();
                else if (activeReport === "pl") fetchPL();
                else if (activeReport === "trial-balance") fetchTrialBalance();
                else if (activeReport === "ar-aging") fetchARaging();
                else if (activeReport === "ap-aging") fetchAPaging();
              }}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? "Loading..." : "Generate"}
            </button>
          </div>
        </div>

        {/* Loading Indicator */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <div className="relative w-12 h-12">
              <div className="absolute inset-0 rounded-full border-4 border-gray-300 dark:border-gray-600"></div>
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500 border-r-blue-500 animate-spin"></div>
            </div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Generating financial report...</p>
          </div>
        )}

        {/* Balance Sheet Report */}
        {!loading && activeReport === "balance-sheet" && balanceSheetData && (
          <BalanceSheetReport data={balanceSheetData} formatCurrency={formatCurrency} />
        )}

        {/* P&L Report */}
        {!loading && activeReport === "pl" && plData && (
          <PLReport data={plData} formatCurrency={formatCurrency} />
        )}

        {/* Trial Balance Report */}
        {!loading && activeReport === "trial-balance" && trialBalanceData && (
          <TrialBalanceReport data={trialBalanceData} formatCurrency={formatCurrency} />
        )}

        {/* AR Aging Report */}
        {!loading && activeReport === "ar-aging" && arAgingData && (
          <AgingReport data={arAgingData} type="AR" formatCurrency={formatCurrency} />
        )}

        {/* AP Aging Report */}
        {!loading && activeReport === "ap-aging" && apAgingData && (
          <AgingReport data={apAgingData} type="AP" formatCurrency={formatCurrency} />
        )}
      </div>


    </>
  );
};

export default FinancialReportingLegacy;
