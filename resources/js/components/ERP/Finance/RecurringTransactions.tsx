import React, { useState } from 'react';
import AppLayoutERP from '../../../layout/AppLayout_ERP';
import { Link, usePage, useForm, Head } from '@inertiajs/react';
import Swal from 'sweetalert2';

const RecurringTransactionsIcon = () => (
  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
    <path d="M4 12a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 11-2 0v-6a1 1 0 01-1-1zm6 0a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 11-2 0v-6a1 1 0 01-1-1zm6 0a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 11-2 0v-6a1 1 0 01-1-1z"/>
    <path d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 11-2 0V5H5v1a1 1 0 11-2 0V4z"/>
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
              <div className="flex items-center gap-3">
                <div className="text-blue-600">
                  <RecurringTransactionsIcon />
                </div>
                <h1 className="text-3xl font-bold text-gray-900">Recurring Transactions</h1>
              </div>
              <p className="text-gray-600 mt-2">Automate monthly, quarterly, and annual journal entries</p>
            </div>
            <Link
              href={route('erp.finance.recurring-transactions.create')}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <PlusIcon className="w-4 h-4" />
              New Recurring Transaction
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-gray-600 text-sm">Total Recurring</p>
              <p className="text-2xl font-bold text-gray-900">
                {recurringTransactions.data.length}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-gray-600 text-sm">Active</p>
              <p className="text-2xl font-bold text-green-600">
                {recurringTransactions.data.filter((t) => t.is_active).length}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-gray-600 text-sm">Monthly Debits</p>
              <p className="text-lg font-bold text-gray-900">
                {formatAmount(
                  recurringTransactions.data
                    .filter((t) => t.frequency === 'monthly')
                    .reduce((sum, t) => sum + parseFloat(t.total_debit), 0)
                )}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-gray-600 text-sm">Monthly Credits</p>
              <p className="text-lg font-bold text-gray-900">
                {formatAmount(
                  recurringTransactions.data
                    .filter((t) => t.frequency === 'monthly')
                    .reduce((sum, t) => sum + parseFloat(t.total_credit), 0)
                )}
              </p>
            </div>
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
