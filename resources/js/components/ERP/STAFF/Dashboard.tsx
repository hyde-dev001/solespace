import type { ComponentType } from 'react';
import { Head, usePage } from '@inertiajs/react';
import AppLayoutERP from '../../../layout/AppLayout_ERP';

interface StaffDashboardStats {
    activeJobs: number;
    pendingRepairs: number;
    todayPayments: string;
    totalCustomers: number;
}

type MetricColor = 'success' | 'error' | 'warning' | 'info';
type ChangeType = 'increase' | 'decrease';

const ArrowUpIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
    </svg>
);

const ArrowDownIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
    </svg>
);

const TaskIconSvg = ({ className }: { className?: string }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
    </svg>
);

const AlertIconSvg = ({ className }: { className?: string }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
    </svg>
);

const DollarIconSvg = ({ className }: { className?: string }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
    </svg>
);

const UserIconSvg = ({ className }: { className?: string }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
    </svg>
);

interface MetricCardProps {
    title: string;
    value: number | string;
    change: number;
    changeType: ChangeType;
    icon: ComponentType<{ className?: string }>;
    color: MetricColor;
    description: string;
}

const MetricCard = ({
    title,
    value,
    change,
    changeType,
    icon: Icon,
    color,
    description,
}: MetricCardProps) => {
    const getColorClasses = () => {
        switch (color) {
            case 'success': return 'from-green-500 to-emerald-600';
            case 'error': return 'from-red-500 to-rose-600';
            case 'warning': return 'from-yellow-500 to-orange-600';
            case 'info': return 'from-blue-500 to-indigo-600';
            default: return 'from-gray-500 to-gray-600';
        }
    };

    const displayValue = typeof value === 'number' ? value.toLocaleString() : value;

    return (
        <div className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-500 hover:shadow-xl hover:border-gray-300 hover:-translate-y-1 dark:border-gray-800 dark:bg-white/[0.03] dark:hover:border-gray-700">
            <div className={`absolute inset-0 bg-gradient-to-br ${getColorClasses()} opacity-0 transition-opacity duration-500 group-hover:opacity-5`} />

            <div className="relative">
                <div className="flex items-center justify-between mb-4">
                    <div className={`flex items-center justify-center w-14 h-14 bg-gradient-to-br ${getColorClasses()} rounded-2xl shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:rotate-6`}>
                        <Icon className="text-white size-7 drop-shadow-sm" />
                    </div>

                    <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold transition-all duration-300 ${
                        changeType === 'increase'
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                        {changeType === 'increase' ? <ArrowUpIcon className="size-3" /> : <ArrowDownIcon className="size-3" />}
                        {Math.abs(change)}%
                    </div>
                </div>

                <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        {title}
                    </p>
                    <h3 className="text-3xl font-bold text-gray-900 dark:text-white transition-colors duration-300">
                        {displayValue}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        {description}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default function StaffDashboard() {
    const { auth } = usePage().props as any;

    const stats: StaffDashboardStats = {
        activeJobs: 5,
        pendingRepairs: 3,
        todayPayments: '$1,250',
        totalCustomers: 28,
    };

    const metrics: MetricCardProps[] = [
        {
            title: 'Active Jobs',
            value: stats.activeJobs,
            change: 8,
            changeType: 'increase',
            icon: TaskIconSvg,
            color: 'info',
            description: 'Jobs currently in progress',
        },
        {
            title: 'Pending Repairs',
            value: stats.pendingRepairs,
            change: 3,
            changeType: 'decrease',
            icon: AlertIconSvg,
            color: 'warning',
            description: 'Repairs awaiting completion',
        },
        {
            title: 'Total Customers',
            value: stats.totalCustomers,
            change: 6,
            changeType: 'increase',
            icon: UserIconSvg,
            color: 'info',
            description: 'Customers served overall',
        },
    ];

    return (
        <AppLayoutERP>
            <Head title="Staff Dashboard - Solespace ERP" />

            <div className="py-8 px-6">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        Staff Dashboard
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Hello, {auth?.user?.name}! Here's your daily overview.
                    </p>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {metrics.map((metric) => (
                        <MetricCard
                            key={metric.title}
                            title={metric.title}
                            value={metric.value}
                            change={metric.change}
                            changeType={metric.changeType}
                            icon={metric.icon}
                            color={metric.color}
                            description={metric.description}
                        />
                    ))}
                </div>

                {/* Recent Jobs */}
                <div className="bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Recent Jobs</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-800">
                                <tr>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Job Details</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Customer</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Service Type</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                <tr className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center space-x-3">
                                            <div className="flex-shrink-0">
                                                <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                                                    <TaskIconSvg className="w-6 h-6 text-blue-600 dark:text-blue-300" />
                                                </div>
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900 dark:text-white">Shoe Repair</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">In Progress</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm text-gray-900 dark:text-white font-medium">Sarah Johnson</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Nike Shoes</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">Repair & Restoration</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">Active</span>
                                    </td>
                                </tr>
                                <tr className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center space-x-3">
                                            <div className="flex-shrink-0">
                                                <div className="h-10 w-10 rounded-lg bg-green-100 dark:bg-green-900 flex items-center justify-center">
                                                    <TaskIconSvg className="w-6 h-6 text-green-600 dark:text-green-300" />
                                                </div>
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900 dark:text-white">Cleaning Service</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">Completed</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm text-gray-900 dark:text-white font-medium">John Smith</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Sneakers</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">Cleaning & Care</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">Done</span>
                                    </td>
                                </tr>
                                <tr className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center space-x-3">
                                            <div className="flex-shrink-0">
                                                <div className="h-10 w-10 rounded-lg bg-yellow-100 dark:bg-yellow-900 flex items-center justify-center">
                                                    <AlertIconSvg className="w-6 h-6 text-yellow-600 dark:text-yellow-300" />
                                                </div>
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900 dark:text-white">Heel Replacement</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">Pending</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm text-gray-900 dark:text-white font-medium">Mary Davis</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Heels</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">Replacement Parts</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400">Pending</span>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AppLayoutERP>
    );
}
