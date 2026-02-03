import React, { useState } from 'react';
import AppLayoutERP from '../../../layout/AppLayout_ERP';
import { Link, usePage, useForm, Head } from '@inertiajs/react';
import Swal from 'sweetalert2';

type MetricCardProps = {
  title: string;
  value: number | string;
  change?: number;
  changeType?: 'increase' | 'decrease';
  description?: string;
  color?: 'success' | 'error' | 'warning' | 'info';
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

const CostCenterIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"/>
  </svg>
);

const AnalyticsIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M3 13h2v8H3zm4-8h2v16H7zm4-2h2v18h-2zm4-2h2v20h-2z"/>
  </svg>
);

const BudgetIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
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
  color = 'info',
  description,
}) => {
  const getColorClasses = () => {
    switch (color) {
      case 'success':
        return 'from-green-500 to-emerald-600';
      case 'error':
        return 'from-red-500 to-rose-600';
      case 'warning':
        return 'from-yellow-500 to-orange-600';
      case 'info':
      default:
        return 'from-blue-500 to-indigo-600';
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
                changeType === 'increase'
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                  : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
              }`}
            >
              {changeType === 'increase' ? <ArrowUpIcon className="size-3" /> : <ArrowDownIcon className="size-3" />}
              {Math.abs(change)}%
            </div>
          )}
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <h3 className="text-3xl font-bold text-gray-900 dark:text-white transition-colors duration-300">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </h3>
          {description && <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>}
        </div>
      </div>
    </div>
  );
};

export default function CostCenterAllocation({ auth, costCenters }) {
  const { post, delete: destroy, processing } = useForm({});
  const [expandedId, setExpandedId] = useState(null);

  const handleDelete = async (id, name) => {
    const result = await Swal.fire({
      title: 'Delete Cost Center?',
      text: `Are you sure you want to delete "${name}"? This action cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete it',
    });

    if (result.isConfirmed) {
      destroy(route('erp.finance.cost-centers.destroy', id), {
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

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount || 0);
  };

  const getBudgetColor = (utilization) => {
    if (!utilization) return 'bg-gray-200';
    if (utilization < 50) return 'bg-green-500';
    if (utilization < 80) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const renderCostCenter = (center, level = 0) => {
    return (
      <div key={center.id}>
        <div className="p-4 hover:bg-gray-50 transition border-b">
          <div
            className="flex items-center justify-between cursor-pointer"
            onClick={() =>
              setExpandedId(expandedId === center.id ? null : center.id)
            }
          >
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <button className="text-gray-400 hover:text-gray-600">
                  <ChevronDownIcon
                    className={`w-5 h-5 transition-transform ${
                      expandedId === center.id ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                <div style={{ marginLeft: `${level * 20}px` }}>
                  <h3 className="font-semibold text-gray-900">{center.name}</h3>
                  <p className="text-sm text-gray-500">{center.code}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-6 mr-4">
              <div className="text-right">
                <p className="text-sm text-gray-600">Type</p>
                <p className="font-semibold text-gray-900 capitalize">{center.type}</p>
              </div>

              {center.budget_limit && (
                <div className="text-right">
                  <p className="text-sm text-gray-600">Budget</p>
                  <p className="font-semibold text-gray-900">{formatAmount(center.budget_limit)}</p>
                </div>
              )}

              <div className="text-center">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    center.is_active
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {center.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>

          {/* Expanded Details */}
          {expandedId === center.id && (
            <div className="mt-4 pl-8 border-t pt-4">
              {/* Description */}
              {center.description && (
                <div className="mb-4">
                  <p className="text-sm text-gray-600">Description</p>
                  <p className="text-gray-900">{center.description}</p>
                </div>
              )}

              {/* Manager Info */}
              {center.manager_name && (
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600">Manager</p>
                    <p className="text-gray-900">{center.manager_name}</p>
                  </div>
                  {center.manager_email && (
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="text-gray-900">{center.manager_email}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Budget Utilization */}
              {center.budget_limit && (
                <div className="mb-4 bg-gray-50 p-3 rounded">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-sm font-semibold text-gray-700">Budget Utilization</p>
                    <p className="text-sm font-bold text-gray-900">
                      {(((center.total_allocated || 0) / center.budget_limit) * 100).toFixed(1)}%
                    </p>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${getBudgetColor(
                        ((center.total_allocated || 0) / center.budget_limit) * 100
                      )}`}
                      style={{
                        width: `${Math.min(((center.total_allocated || 0) / center.budget_limit) * 100, 100)}%`,
                      }}
                    />
                  </div>
                  <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <p className="text-gray-600">Allocated</p>
                      <p className="font-semibold">{formatAmount(center.total_allocated || 0)}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Remaining</p>
                      <p className="font-semibold">
                        {formatAmount((center.budget_limit || 0) - (center.total_allocated || 0))}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Total Budget</p>
                      <p className="font-semibold">{formatAmount(center.budget_limit)}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                <Link
                  href={route('erp.finance.cost-centers.edit', center.id)}
                  className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition text-sm"
                >
                  <EditIcon className="w-4 h-4" />
                  Edit
                </Link>
                <Link
                  href={route('erp.finance.cost-centers.analytics', center.id)}
                  className="flex items-center gap-2 px-3 py-2 bg-purple-50 text-purple-600 rounded hover:bg-purple-100 transition text-sm"
                >
                  <AnalyticsIcon />
                  Analytics
                </Link>
                <button
                  onClick={() => handleDelete(center.id, center.name)}
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

        {/* Render child cost centers */}
        {center.children && center.children.length > 0 && (
          <div>
            {center.children.map((child) => renderCostCenter(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <AppLayoutERP>
      <Head title="Cost Center Allocation - Solespace ERP" />
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <div className="flex items-center gap-3">
                <div className="text-blue-600">
                  <CostCenterIcon />
                </div>
                <h1 className="text-3xl font-bold text-gray-900">Cost Center Allocation</h1>
              </div>
              <p className="text-gray-600 mt-2">Track and allocate expenses to cost centers</p>
            </div>
            <Link
              href={route('erp.finance.cost-centers.create')}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <PlusIcon className="w-4 h-4" />
              New Cost Center
            </Link>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <MetricCard
              title="Total Cost Centers"
              value={costCenters.length}
              icon={CostCenterIcon}
              color="info"
              description="All active and inactive centers"
            />
            <MetricCard
              title="Total Budget"
              value={formatAmount(
                costCenters.reduce((sum, cc) => sum + (parseFloat(cc.budget_limit) || 0), 0)
              )}
              icon={BudgetIcon}
              color="warning"
              description="Combined budget limits"
            />
            <MetricCard
              title="Total Allocated"
              value={formatAmount(
                costCenters.reduce((sum, cc) => sum + (cc.total_allocated || 0), 0)
              )}
              icon={AnalyticsIcon}
              color="success"
              description="Allocated expenses across centers"
            />
          </div>

          {/* Cost Centers List */}
          <div className="bg-white rounded-lg shadow">
            {costCenters.length === 0 ? (
              <div className="p-8 text-center">
                <CostCenterIcon />
                <p className="text-gray-600 mt-2">No cost centers yet</p>
                <Link
                  href={route('erp.finance.cost-centers.create')}
                  className="text-blue-600 hover:text-blue-700 mt-2 inline-block"
                >
                  Create the first one →
                </Link>
              </div>
            ) : (
              <div className="divide-y">
                {costCenters.map((center) => renderCostCenter(center))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayoutERP>
  );
}
