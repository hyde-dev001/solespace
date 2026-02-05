import type { ComponentType } from 'react';
import { Head, usePage } from '@inertiajs/react';
import { useState } from 'react';
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
    const [clockedIn, setClockedIn] = useState(false);
    const [loginTime, setLoginTime] = useState<string | null>(null);
    const [logoutTime, setLogoutTime] = useState<string | null>(null);
    const [lunchBreakTime, setLunchBreakTime] = useState<string | null>(null);
    const [showAttendanceModal, setShowAttendanceModal] = useState(false);

    const handleClockIn = () => {
        const now = new Date();
        const timeString = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        setLoginTime(timeString);
        setClockedIn(true);
        setLogoutTime(null);
    };

    const handleClockOut = () => {
        const now = new Date();
        const timeString = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        setLogoutTime(timeString);
        setClockedIn(false);
    };

    const handleLunchBreak = () => {
        if (!clockedIn) return;
        const now = new Date();
        const timeString = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        setLunchBreakTime(timeString);
    };

    const computeTotalHours = (start: string | null, end: string | null) => {
        if (!start || !end) return '--';
        const parseTime = (value: string) => {
            const match = value.match(/^(\d{1,2}):(\d{2}):(\d{2})\s?(AM|PM)$/i);
            if (!match) return null;
            const hours = parseInt(match[1], 10);
            const minutes = parseInt(match[2], 10);
            const seconds = parseInt(match[3], 10);
            const period = match[4].toUpperCase();
            const normalizedHours = (hours % 12) + (period === 'PM' ? 12 : 0);
            return normalizedHours * 3600 + minutes * 60 + seconds;
        };

        const startSeconds = parseTime(start);
        const endSeconds = parseTime(end);
        if (startSeconds === null || endSeconds === null) return '--';
        const diffSeconds = Math.max(0, endSeconds - startSeconds);
        const hours = diffSeconds / 3600;
        return `${hours.toFixed(2)} hrs`;
    };

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

                {/* Clock In/Out Section */}
                <div className="bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden mb-8">
                    <div className="p-8">
                        <div className="relative flex items-center justify-center mb-6">
                            <div className="text-center">
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">CURRENT TIME</p>
                                <h2 className="text-5xl font-bold text-gray-900 dark:text-white">
                                    {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
                                </h2>
                                <p className="text-gray-600 dark:text-gray-400 mt-2">
                                    {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                </p>
                            </div>
                            <button
                                onClick={() => setShowAttendanceModal(true)}
                                className="absolute right-0 top-0 px-4 py-2 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-all duration-300 active:scale-95 shadow-lg whitespace-nowrap"
                            >
                                View Attendance
                            </button>
                        </div>

                        {/* Status Badge */}
                        <div className="flex justify-center mb-6">
                            <div className={`px-4 py-2 rounded-full font-semibold text-sm ${
                                clockedIn 
                                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                                    : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                            }`}>
                                {clockedIn ? '✓ CLOCKED IN' : '● CLOCKED OUT'}
                            </div>
                        </div>

                        {/* Clock In/Out Buttons */}
                        <div className="flex flex-wrap gap-4 justify-center mb-8">
                            <button
                                onClick={handleClockIn}
                                disabled={clockedIn}
                                className={`px-8 py-3 rounded-full font-semibold transition-all duration-300 ${
                                    clockedIn
                                        ? 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400 cursor-not-allowed'
                                        : 'bg-green-500 text-white hover:bg-green-600 active:scale-95 shadow-lg'
                                }`}
                            >
                                Clock In
                            </button>
                            {clockedIn && !lunchBreakTime && (
                                <button
                                    onClick={handleLunchBreak}
                                    className="px-8 py-3 rounded-full font-semibold transition-all duration-300 bg-yellow-500 text-white hover:bg-yellow-600 active:scale-95 shadow-lg"
                                >
                                    Lunch Break
                                </button>
                            )}
                            <button
                                onClick={handleClockOut}
                                disabled={!clockedIn}
                                className={`px-8 py-3 rounded-full font-semibold transition-all duration-300 ${
                                    !clockedIn
                                        ? 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400 cursor-not-allowed'
                                        : 'bg-red-500 text-white hover:bg-red-600 active:scale-95 shadow-lg'
                                }`}
                            >
                                Clock Out
                            </button>
                        </div>

                        {/* Time Summary */}
                        <div className="grid grid-cols-3 gap-4">
                            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 text-center">
                                <div className="flex items-center justify-center mb-2">
                                    <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
                                    </svg>
                                </div>
                                <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Login Time</p>
                                <p className="text-sm font-bold text-gray-900 dark:text-white mt-1">{loginTime || '-- : -- : --'}</p>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 text-center">
                                <div className="flex items-center justify-center mb-2">
                                    <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
                                </svg>
                                </div>
                                <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Lunch Break</p>
                                <p className="text-sm font-bold text-gray-900 dark:text-white mt-1">{lunchBreakTime || '-- : -- : --'}</p>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 text-center">
                                <div className="flex items-center justify-center mb-2">
                                    <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
                                    </svg>
                                </div>
                                <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Logout Time</p>
                                <p className="text-sm font-bold text-gray-900 dark:text-white mt-1">{logoutTime || '-- : -- : --'}</p>
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
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            {/* Modal Body */}
                            <div className="px-6 py-5 flex-1 overflow-hidden">
                                <div className="h-full overflow-auto rounded-lg border border-gray-200 dark:border-slate-700">
                                    <table className="w-full text-sm">
                                        <thead className="bg-gray-50 dark:bg-slate-800 sticky top-0">
                                            <tr>
                                                <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-200">Date</th>
                                                <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-200">Time In</th>
                                                <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-200">Time Out</th>
                                                <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-200">Total Hours</th>
                                                <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-200">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                                            {loginTime || logoutTime ? (
                                                <tr className="hover:bg-gray-50 dark:hover:bg-slate-800/70">
                                                    <td className="px-4 py-3 text-gray-900 dark:text-white">
                                                        {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                    </td>
                                                    <td className="px-4 py-3 text-gray-700 dark:text-gray-200">{loginTime || '--'}</td>
                                                    <td className="px-4 py-3 text-gray-700 dark:text-gray-200">{logoutTime || '--'}</td>
                                                    <td className="px-4 py-3 text-gray-700 dark:text-gray-200">
                                                        {computeTotalHours(loginTime, logoutTime)}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                                                            {clockedIn ? 'Active' : 'Completed'}
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
                                        // Export functionality
                                        const data = `Date,Time In,Time Out,Total Hours,Status\n${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })},${loginTime || '--'},${logoutTime || '--'},${computeTotalHours(loginTime, logoutTime)},${clockedIn ? 'Active' : 'Completed'}`;
                                        const blob = new Blob([data], { type: 'text/csv' });
                                        const url = window.URL.createObjectURL(blob);
                                        const a = document.createElement('a');
                                        a.href = url;
                                        a.download = `attendance-${new Date().getTime()}.csv`;
                                        a.click();
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
            </div>
        </AppLayoutERP>
    );
}
