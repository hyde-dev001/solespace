import type { ComponentType } from 'react';
import { Head, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import AppLayoutERP from '../../../layout/AppLayout_ERP';
import { useInvoices, useExpenses } from '../../../hooks/useFinanceQueries';
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";

interface FinanceDashboardStats {
    totalRevenue: number;
    totalExpenses: number;
    pendingInvoices: number;
    netProfit: number;
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

export default function FinanceDashboard() {
    const { auth } = usePage().props as any;
    const { data: invoices = [], isLoading: loadingInvoices } = useInvoices();
    const { data: expenses = [], isLoading: loadingExpenses } = useExpenses();
    const [currentTime, setCurrentTime] = useState<Date>(new Date());
    const [loginTime, setLoginTime] = useState<Date | null>(null);
    const [logoutTime, setLogoutTime] = useState<Date | null>(null);
    const [lunchBreakTime, setLunchBreakTime] = useState<Date | null>(null);
    const [isClockedIn, setIsClockedIn] = useState(false);
    const [showAttendanceModal, setShowAttendanceModal] = useState(false);

    // Update current time every second
    useEffect(() => {
        const updateTime = () => setCurrentTime(new Date());
        updateTime();
        const interval = setInterval(updateTime, 1000);
        return () => clearInterval(interval);
    }, []);

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        });
    };

    const formatTimeShort = (date: Date | null) => {
        if (!date) return '--:--:--';
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    const handleClockIn = () => {
        const now = new Date();
        setLoginTime(now);
        setIsClockedIn(true);
        setLogoutTime(null);
    };

    const handleClockOut = () => {
        const now = new Date();
        setLogoutTime(now);
        setIsClockedIn(false);
    };

    const handleLunchBreak = () => {
        const now = new Date();
        setLunchBreakTime(now);
    };

    // Calculate stats from real data
    const stats: FinanceDashboardStats = {
        totalRevenue: invoices.reduce((sum, inv) => sum + (parseFloat(inv.total?.toString() || '0')), 0),
        totalExpenses: expenses.reduce((sum, exp) => sum + (parseFloat(exp.amount?.toString() || '0')), 0),
        pendingInvoices: invoices.filter((inv) => inv.status === 'draft').length,
        netProfit: 0,
    };
    
    stats.netProfit = stats.totalRevenue - stats.totalExpenses;

    const metrics: MetricCardProps[] = [
        {
            title: 'Total Revenue',
            value: `₱${stats.totalRevenue.toLocaleString()}`,
            change: 15,
            changeType: 'increase',
            icon: DollarIconSvg,
            color: 'success',
            description: 'Total income from all sources',
        },
        {
            title: 'Total Expenses',
            value: `₱${stats.totalExpenses.toLocaleString()}`,
            change: 8,
            changeType: 'increase',
            icon: AlertIconSvg,
            color: 'error',
            description: 'All business expenses',
        },
        {
            title: 'Pending Invoices',
            value: stats.pendingInvoices,
            change: 3,
            changeType: 'decrease',
            icon: TaskIconSvg,
            color: 'warning',
            description: 'Invoices awaiting payment',
        },
        {
            title: 'Net Profit',
            value: `₱${stats.netProfit.toLocaleString()}`,
            change: 12,
            changeType: stats.netProfit >= 0 ? 'increase' : 'decrease',
            icon: DollarIconSvg,
            color: stats.netProfit >= 0 ? 'success' : 'error',
            description: 'Revenue minus expenses',
        },
    ];

    // Chart data
    const revenueChartOptions: ApexOptions = {
        chart: {
            type: 'area',
            toolbar: { show: false },
            zoom: { enabled: false },
        },
        dataLabels: { enabled: false },
        stroke: { curve: 'smooth', width: 2 },
        fill: {
            type: 'gradient',
            gradient: {
                shadeIntensity: 1,
                opacityFrom: 0.4,
                opacityTo: 0.1,
            },
        },
        colors: ['#10b981'],
        xaxis: {
            categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        },
        tooltip: {
            y: {
                formatter: (val) => `₱${val.toLocaleString()}`,
            },
        },
    };

    const revenueChartSeries = [
        {
            name: 'Revenue',
            data: [30000, 40000, 35000, 50000, 49000, 60000],
        },
    ];

    return (
        <AppLayoutERP>
            <Head title="Finance Dashboard - Solespace ERP" />

            <div className="py-8 px-6">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        Finance Dashboard
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Hello, {auth?.user?.name}! Here's your financial overview.
                    </p>
                </div>

                {/* Current Time Clock Section */}
                <div className="mb-8">
                    <div className="relative overflow-hidden rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 shadow-xl">
                        <div className="relative p-8">
                            <div className="text-center">
                                <div className="mb-6 relative">
                                    <button
                                        onClick={() => setShowAttendanceModal(true)}
                                        className="absolute right-0 top-0 px-4 py-2 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-all duration-300 shadow-lg text-sm"
                                    >
                                        View Attendance
                                    </button>
                                    <p className="text-gray-600 dark:text-gray-400 text-sm font-semibold uppercase tracking-widest mb-3">
                                        Current Time
                                    </p>
                                    <div className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white font-mono tracking-tight mb-3">
                                        {formatTime(currentTime)}
                                    </div>
                                    <p className="text-gray-600 dark:text-gray-400 text-base">
                                        {new Date().toLocaleDateString('en-US', { 
                                            weekday: 'long', 
                                            month: 'long', 
                                            day: 'numeric',
                                            year: 'numeric'
                                        })}
                                    </p>
                                </div>

                                <div className="mb-6 flex justify-center">
                                    <div className={`flex items-center gap-2 px-5 py-2 rounded-full transition-all duration-300 ${
                                        isClockedIn 
                                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-300 dark:border-green-700' 
                                            : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-300 dark:border-red-700'
                                    }`}>
                                        <div className={`w-2.5 h-2.5 rounded-full animate-pulse ${
                                            isClockedIn ? 'bg-green-500' : 'bg-red-500'
                                        }`} />
                                        <span className="font-semibold text-sm uppercase tracking-wide">
                                            {isClockedIn ? 'Clocked In' : 'Clocked Out'}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-6">
                                    <button
                                        onClick={handleClockIn}
                                        disabled={isClockedIn}
                                        className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                                            isClockedIn
                                                ? 'bg-gray-200 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed'
                                                : 'bg-green-500 text-white hover:bg-green-600 shadow-lg hover:shadow-xl'
                                        }`}
                                    >
                                        Clock In
                                    </button>

                                    {isClockedIn && !lunchBreakTime && (
                                        <button
                                            onClick={handleLunchBreak}
                                            className="px-6 py-3 rounded-xl font-semibold transition-all duration-300 bg-orange-500 text-white hover:bg-orange-600 shadow-lg hover:shadow-xl"
                                        >
                                            Lunch Break
                                        </button>
                                    )}

                                    <button
                                        onClick={handleClockOut}
                                        disabled={!isClockedIn}
                                        className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                                            !isClockedIn
                                                ? 'bg-gray-200 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed'
                                                : 'bg-red-500 text-white hover:bg-red-600 shadow-lg hover:shadow-xl'
                                        }`}
                                    >
                                        Clock Out
                                    </button>
                                </div>

                                {/* Time Summary */}
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 p-4">
                                        <div className="flex items-center justify-center mb-2">
                                            <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
                                            </svg>
                                        </div>
                                        <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Login Time</p>
                                        <p className="text-sm font-bold text-gray-900 dark:text-white mt-1 font-mono">
                                            {formatTimeShort(loginTime)}
                                        </p>
                                    </div>
                                    <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 p-4">
                                        <div className="flex items-center justify-center mb-2">
                                            <svg className="w-5 h-5 text-orange-600 dark:text-orange-400" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
                                            </svg>
                                        </div>
                                        <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Lunch Break</p>
                                        <p className="text-sm font-bold text-gray-900 dark:text-white mt-1 font-mono">
                                            {formatTimeShort(lunchBreakTime)}
                                        </p>
                                    </div>
                                    <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 p-4">
                                        <div className="flex items-center justify-center mb-2">
                                            <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
                                            </svg>
                                        </div>
                                        <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Logout Time</p>
                                        <p className="text-sm font-bold text-gray-900 dark:text-white mt-1 font-mono">
                                            {formatTimeShort(logoutTime)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Attendance Modal */}
                {showAttendanceModal && (
                    <div
                        className="fixed inset-0 bg-black/80 flex items-center justify-center z-[99999] p-4"
                        style={{ backdropFilter: 'blur(10px)' }}
                    >
                        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-5xl h-[80vh] flex flex-col">
                            {/* Modal Header */}
                            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200 dark:border-slate-700">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Attendance History</h2>
                                <button
                                    onClick={() => setShowAttendanceModal(false)}
                                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1"
                                >
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            {/* Modal Body */}
                            <div className="px-6 py-5 flex-1 overflow-auto">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead className="bg-gray-50 dark:bg-slate-800 sticky top-0">
                                            <tr>
                                                <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-200">Date</th>
                                                <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-200">Time In</th>
                                                <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-200">Lunch Break</th>
                                                <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-200">Time Out</th>
                                                <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-200">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                                            {loginTime || logoutTime ? (
                                                <tr className="hover:bg-gray-50 dark:hover:bg-slate-800/70">
                                                    <td className="px-4 py-3 text-gray-900 dark:text-white">
                                                        {new Date().toLocaleDateString('en-US', { 
                                                            month: 'short', 
                                                            day: 'numeric', 
                                                            year: 'numeric' 
                                                        })}
                                                    </td>
                                                    <td className="px-4 py-3 text-gray-700 dark:text-gray-200 font-mono">
                                                        {loginTime ? formatTime(loginTime) : '--:--:--'}
                                                    </td>
                                                    <td className="px-4 py-3 text-gray-700 dark:text-gray-200 font-mono">
                                                        {lunchBreakTime ? formatTime(lunchBreakTime) : '--:--:--'}
                                                    </td>
                                                    <td className="px-4 py-3 text-gray-700 dark:text-gray-200 font-mono">
                                                        {logoutTime ? formatTime(logoutTime) : '--:--:--'}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                                                            isClockedIn 
                                                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                                                                : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                                                        }`}>
                                                            {isClockedIn ? 'Active' : 'Completed'}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ) : (
                                                <tr>
                                                    <td colSpan={5} className="px-4 py-10 text-center text-gray-500 dark:text-gray-400">
                                                        No attendance records yet
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="px-6 py-4 border-t border-gray-200 dark:border-slate-700 flex justify-end gap-3">
                                <button
                                    onClick={() => {
                                        // Export functionality - can be customized
                                        const data = loginTime || logoutTime ? [{
                                            Date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                                            'Time In': loginTime ? formatTime(loginTime) : '--:--:--',
                                            'Lunch Break': lunchBreakTime ? formatTime(lunchBreakTime) : '--:--:--',
                                            'Time Out': logoutTime ? formatTime(logoutTime) : '--:--:--',
                                            Status: isClockedIn ? 'Active' : 'Completed'
                                        }] : [];
                                        
                                        const csvContent = "data:text/csv;charset=utf-8," 
                                            + Object.keys(data[0] || {}).join(",") + "\n"
                                            + data.map(row => Object.values(row).join(",")).join("\n");
                                        
                                        const encodedUri = encodeURI(csvContent);
                                        const link = document.createElement("a");
                                        link.setAttribute("href", encodedUri);
                                        link.setAttribute("download", `attendance_${new Date().toISOString().split('T')[0]}.csv`);
                                        document.body.appendChild(link);
                                        link.click();
                                        document.body.removeChild(link);
                                    }}
                                    className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-all duration-200 text-sm flex items-center gap-2 active:scale-95"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                    </svg>
                                    Export
                                </button>
                                <button
                                    onClick={() => setShowAttendanceModal(false)}
                                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-gray-900 dark:text-white rounded-lg font-medium transition-all duration-200 text-sm"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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

                {/* Charts Section */}
                <div className="grid grid-cols-1 gap-6">
                    {/* Revenue Trend */}
                    <div className="bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden p-6">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                            Revenue Trend
                        </h3>
                        <Chart
                            options={revenueChartOptions}
                            series={revenueChartSeries}
                            type="area"
                            height={300}
                        />
                    </div>
                </div>
            </div>
        </AppLayoutERP>
    );
}
