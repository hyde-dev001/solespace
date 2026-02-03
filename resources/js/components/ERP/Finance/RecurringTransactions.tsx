import React, { useState } from 'react';
import AppLayoutERP from '../../../layout/AppLayout_ERP';
import { Link, usePage, useForm, Head } from '@inertiajs/react';
import Swal from 'sweetalert2';

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

const RecurringTransactionsIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

const CheckCircleIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const CreditCardIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
  </svg>
);

const TrendingDownIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
  </svg>
);

const RefreshIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
    <path d="M4 12a8 8 0 018-8V0c-4.418 0-8 3.582-8 8s3.582 8 8 8v-4c-2.209 0-4-1.791-4-4zm15.293-4.707a1 1 0 00-1.414 1.414L17.586 10H15a1 1 0 000 2h4a1 1 0 001-1V7a1 1 0 10-2 0v1.293l-1.293-1.293z"/>
  </svg>
);

const PlayIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
    <path d="M8 5v14l11-7z"/>
  </svg>
);

const HistoryIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
  </svg>
);

const ChevronDownIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M6 9l6 6 6-6"/>
  </svg>
);

const PlusIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
  </svg>
);

const TrashIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
    <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-9l-1 1H5v2h14V4z"/>
  </svg>
);

const EditIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z" />
    <path d="M20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
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
            {typeof value === "number" ? value.toLocaleString() : value}
          </h3>
          {description && <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>}
        </div>
      </div>
    </div>
  );
};

export default function RecurringTransactions({ auth, recurringTransactions }) {
  const { data, setData, post, delete: destroy, processing } = useForm({});
  const [expandedId, setExpandedId] = useState(null);

  const handleDelete = async (id, name) => {
    const result = await Swal.fire({
      title: 'Delete Recurring Transaction?',
      text: `Are you sure you want to delete "${name}"? This action cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete it',
    });

    if (result.isConfirmed) {
      destroy(route('erp.finance.recurring-transactions.destroy', id), {
        onSuccess: () => {
          Swal.fire({
            title: 'Deleted!',
            text: `"${name}" has been deleted successfully.`,
            icon: 'success',
            timer: 2000,
          });
        },
      });
    }
  };

  const handleToggleActive = async (id, isActive, name) => {
    const result = await Swal.fire({
      title: isActive ? 'Deactivate?' : 'Activate?',
      text: `Are you sure you want to ${isActive ? 'deactivate' : 'activate'} "${name}"?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3b82f6',
      cancelButtonColor: '#6b7280',
      confirmButtonText: isActive ? 'Yes, deactivate' : 'Yes, activate',
    });

    if (result.isConfirmed) {
      post(route('erp.finance.recurring-transactions.toggle-active', id), {
        onSuccess: () => {
          Swal.fire({
            title: 'Success!',
            text: `"${name}" has been ${isActive ? 'deactivated' : 'activated'}.`,
            icon: 'success',
            timer: 2000,
          });
        },
      });
    }
  };

  const handleExecuteNow = async (id, name) => {
    const result = await Swal.fire({
      title: 'Execute Now?',
      text: `Execute "${name}" immediately? A journal entry will be created.`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, execute',
    });

    if (result.isConfirmed) {
      post(route('erp.finance.recurring-transactions.execute-now', id), {
        onSuccess: () => {
          Swal.fire({
            title: 'Executed!',
            text: `"${name}" has been executed successfully.`,
            icon: 'success',
            timer: 2000,
          });
        },
      });
    }
  };

  const formatFrequency = (frequency) => {
    return frequency.charAt(0).toUpperCase() + frequency.slice(1);
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <AppLayoutERP>
      <Head title="Recurring Transactions - Solespace ERP" />
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Recurring Transactions</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">Automate monthly, quarterly, and annual journal entries</p>
            </div>
            <Link
              href={route('erp.finance.recurring-transactions.create')}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl shadow-md hover:bg-blue-700 transition-colors"
            >
              <PlusIcon className="w-4 h-4" />
              New Recurring Transaction
            </Link>
          </div>

          {/* Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <MetricCard
              title="Total Recurring"
              value={recurringTransactions.data.length}
              icon={RecurringTransactionsIcon}
              color="info"
              description="Total recurring transactions configured"
            />
            <MetricCard
              title="Active Transactions"
              value={recurringTransactions.data.filter((t) => t.is_active).length}
              icon={CheckCircleIcon}
              color="success"
              description="Currently active and processing"
            />
            <MetricCard
              title="Monthly Debits"
              value={formatAmount(
                recurringTransactions.data
                  .filter((t) => t.frequency === 'monthly')
                  .reduce((sum, t) => sum + parseFloat(t.total_debit), 0)
              )}
              icon={CreditCardIcon}
              color="warning"
              description="Total monthly debit entries"
            />
            <MetricCard
              title="Monthly Credits"
              value={formatAmount(
                recurringTransactions.data
                  .filter((t) => t.frequency === 'monthly')
                  .reduce((sum, t) => sum + parseFloat(t.total_credit), 0)
              )}
              icon={TrendingDownIcon}
              color="error"
              description="Total monthly credit entries"
            />
          </div>

          {/* Recurring Transactions List */}
          <div className="bg-white rounded-lg shadow">
            {recurringTransactions.data.length === 0 ? (
              <div className="p-8 text-center">
                <RecurringTransactionsIcon />
                <p className="text-gray-600 mt-2">No recurring transactions yet</p>
                <Link
                  href={route('erp.finance.recurring-transactions.create')}
                  className="text-blue-600 hover:text-blue-700 mt-2 inline-block"
                >
                  Create the first one →
                </Link>
              </div>
            ) : (
              <div className="divide-y">
                {recurringTransactions.data.map((transaction) => (
                  <div key={transaction.id} className="p-4 hover:bg-gray-50 transition">
                    {/* Header Row */}
                    <div
                      className="flex items-center justify-between cursor-pointer"
                      onClick={() =>
                        setExpandedId(expandedId === transaction.id ? null : transaction.id)
                      }
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <button className="text-gray-400 hover:text-gray-600">
                            <ChevronDownIcon
                              className={`w-5 h-5 transition-transform ${
                                expandedId === transaction.id ? 'rotate-180' : ''
                              }`}
                            />
                          </button>
                          <div>
                            <h3 className="font-semibold text-gray-900">{transaction.name}</h3>
                            <p className="text-sm text-gray-500">{transaction.description}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-6 mr-4">
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Frequency</p>
                          <p className="font-semibold text-gray-900">
                            {formatFrequency(transaction.frequency)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Amount</p>
                          <p className="font-semibold text-gray-900">
                            {formatAmount(
                              parseFloat(transaction.total_debit) ||
                                parseFloat(transaction.total_credit)
                            )}
                          </p>
                        </div>
                        <div className="text-center">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              transaction.is_active
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {transaction.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {expandedId === transaction.id && (
                      <div className="mt-4 pl-8 border-t pt-4">
                        {/* Lines */}
                        <div className="mb-4">
                          <h4 className="font-semibold text-gray-900 mb-2">Journal Lines</h4>
                          <div className="bg-gray-50 rounded p-3 space-y-2">
                            {transaction.lines.map((line) => (
                              <div key={line.id} className="flex justify-between text-sm">
                                <span className="text-gray-700">
                                  {line.account?.account_code} - {line.account?.account_name}
                                </span>
                                <div className="space-x-4">
                                  {line.debit > 0 && (
                                    <span className="text-gray-900">
                                      Dr: {formatAmount(line.debit)}
                                    </span>
                                  )}
                                  {line.credit > 0 && (
                                    <span className="text-gray-900">
                                      Cr: {formatAmount(line.credit)}
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Dates */}
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-gray-600">Start Date</p>
                            <p className="font-semibold text-gray-900">
                              {new Date(transaction.start_date).toLocaleDateString()}
                            </p>
                          </div>
                          {transaction.end_date && (
                            <div>
                              <p className="text-sm text-gray-600">End Date</p>
                              <p className="font-semibold text-gray-900">
                                {new Date(transaction.end_date).toLocaleDateString()}
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                          <Link
                            href={route('erp.finance.recurring-transactions.edit', transaction.id)}
                            className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition text-sm"
                          >
                            <EditIcon className="w-4 h-4" />
                            Edit
                          </Link>
                          <button
                            onClick={() =>
                              handleToggleActive(
                                transaction.id,
                                transaction.is_active,
                                transaction.name
                              )
                            }
                            disabled={processing}
                            className="flex items-center gap-2 px-3 py-2 bg-yellow-50 text-yellow-600 rounded hover:bg-yellow-100 transition text-sm disabled:opacity-50"
                          >
                            <RefreshIcon />
                            {transaction.is_active ? 'Deactivate' : 'Activate'}
                          </button>
                          <button
                            onClick={() => handleExecuteNow(transaction.id, transaction.name)}
                            disabled={!transaction.is_active || processing}
                            className="flex items-center gap-2 px-3 py-2 bg-green-50 text-green-600 rounded hover:bg-green-100 transition text-sm disabled:opacity-50"
                          >
                            <PlayIcon className="w-4 h-4" />
                            Execute Now
                          </button>
                          <Link
                            href={route(
                              'erp.finance.recurring-transactions.execution-history',
                              transaction.id
                            )}
                            className="flex items-center gap-2 px-3 py-2 bg-purple-50 text-purple-600 rounded hover:bg-purple-100 transition text-sm"
                          >
                            <HistoryIcon className="w-4 h-4" />
                            History
                          </Link>
                          <button
                            onClick={() => handleDelete(transaction.id, transaction.name)}
                            disabled={processing}
                            className="flex items-center gap-2 px-3 py-2 bg-red-50 text-red-600 rounded hover:bg-red-100 transition text-sm disabled:opacity-50 ml-auto"
                          >
                            <TrashIcon className="w-4 h-4" />
                            Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pagination */}
          {recurringTransactions.links && recurringTransactions.links.length > 3 && (
            <div className="mt-6 flex justify-center gap-2">
              {recurringTransactions.links.map((link, index) => (
                <Link
                  key={index}
                  href={link.url}
                  dangerouslySetInnerHTML={{ __html: link.label }}
                  className={`px-4 py-2 rounded transition ${
                    link.active
                      ? 'bg-blue-600 text-white'
                      : link.url
                        ? 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayoutERP>
  );
}
