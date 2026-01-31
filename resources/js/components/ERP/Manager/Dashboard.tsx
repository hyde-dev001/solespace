import type { ComponentType } from 'react';
import { Head, usePage } from '@inertiajs/react';
import AppLayoutERP from '../../../layout/AppLayout_ERP';
import React, { useState, useEffect } from 'react';
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";

interface ManagerDashboardStats {
    totalSales: number;
    totalRepairs: number;
    pendingJobOrders: number;
}

type MetricColor = 'success' | 'error' | 'warning' | 'info';
type ChangeType = 'increase' | 'decrease';

// Icon Components
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

const DollarIconSvg = ({ className }: { className?: string }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
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

const MoreDotIcon = ({ className = "" }) => (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fillRule="evenodd" clipRule="evenodd" d="M10.2441 6C10.2441 5.0335 11.0276 4.25 11.9941 4.25H12.0041C12.9706 4.25 13.7541 5.0335 13.7541 6C13.7541 6.9665 12.9706 7.75 12.0041 7.75H11.9941C11.0276 7.75 10.2441 6.9665 10.2441 6ZM10.2441 18C10.2441 17.0335 11.0276 16.25 11.9941 16.25H12.0041C12.9706 16.25 13.7541 17.0335 13.7541 18C13.7541 18.9665 12.9706 19.75 12.0041 19.75H11.9941C11.0276 19.75 10.2441 18.9665 10.2441 18ZM11.9941 10.25C11.0276 10.25 10.2441 11.0335 10.2441 12C10.2441 12.9665 11.0276 13.75 11.9941 13.75H12.0041C12.9706 13.75 13.7541 12.9665 13.7541 12C13.7541 11.0335 12.9706 10.25 12.0041 10.25H11.9941Z" fill="currentColor" />
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
    const [animatedValue, setAnimatedValue] = useState(0);

    useEffect(() => {
        if (typeof value === 'number') {
            const duration = 2000;
            const steps = 60;
            const increment = value / steps;
            let current = 0;

            const timer = setInterval(() => {
                current += increment;
                if (current >= value) {
                    setAnimatedValue(value);
                    clearInterval(timer);
                } else {
                    setAnimatedValue(Math.floor(current));
                }
            }, duration / steps);

            return () => clearInterval(timer);
        }
    }, [value]);

    const getColorClasses = () => {
        switch (color) {
            case 'success': return 'from-green-500 to-emerald-600';
            case 'error': return 'from-red-500 to-rose-600';
            case 'warning': return 'from-yellow-500 to-orange-600';
            case 'info': return 'from-blue-500 to-indigo-600';
            default: return 'from-gray-500 to-gray-600';
        }
    };

    const displayValue = typeof value === 'number' ? animatedValue.toLocaleString() : value;

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

// Daily/Monthly Performance Chart Component
const PerformanceChart: React.FC = () => {
    const [chartView, setChartView] = useState<'daily' | 'monthly'>('daily');

    const dailyOptions: ApexOptions = {
        colors: ["#3170c4", "#f59e0b"],
        chart: {
            fontFamily: "Outfit, sans-serif",
            type: "bar",
            height: 350,
            toolbar: {
                show: false,
            },
            sparkline: {
                enabled: false,
            },
        },
        plotOptions: {
            bar: {
                columnWidth: "50%",
                borderRadiusApplication: "end",
                borderRadius: 6,
            },
        },
        states: {
            hover: {
                filter: {
                    type: "darken",
                    value: 0.15,
                },
            },
            active: {
                filter: {
                    type: "darken",
                    value: 0.15,
                },
            },
        },
        xaxis: {
            axisBorder: {
                show: false,
            },
            axisTicks: {
                show: false,
            },
            labels: {
                style: {
                    colors: "#6B7280",
                    fontSize: "13px",
                    fontWeight: 500,
                },
            },
            categories: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        },
        yaxis: {
            labels: {
                style: {
                    colors: "#6B7280",
                    fontSize: "13px",
                    fontWeight: 500,
                },
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
        legend: {
            show: true,
            position: "top",
            fontSize: 13,
        },
        tooltip: {
            x: {
                show: true,
            },
            y: {
                formatter: (val: number) => `$${val}k`,
            },
        },
    };

    const monthlOptions: ApexOptions = {
        colors: ["#3170c4", "#f59e0b"],
        chart: {
            fontFamily: "Outfit, sans-serif",
            type: "bar",
            height: 350,
            toolbar: {
                show: false,
            },
            sparkline: {
                enabled: false,
            },
        },
        plotOptions: {
            bar: {
                columnWidth: "50%",
                borderRadiusApplication: "end",
                borderRadius: 6,
            },
        },
        states: {
            hover: {
                filter: {
                    type: "darken",
                    value: 0.15,
                },
            },
            active: {
                filter: {
                    type: "darken",
                    value: 0.15,
                },
            },
        },
        xaxis: {
            axisBorder: {
                show: false,
            },
            axisTicks: {
                show: false,
            },
            labels: {
                style: {
                    colors: "#6B7280",
                    fontSize: "13px",
                    fontWeight: 500,
                },
            },
            categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
        },
        yaxis: {
            labels: {
                style: {
                    colors: "#6B7280",
                    fontSize: "13px",
                    fontWeight: 500,
                },
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
        legend: {
            show: true,
            position: "top",
            fontSize: 13,
        },
        tooltip: {
            x: {
                show: true,
            },
            y: {
                formatter: (val: number) => `$${val}k`,
            },
        },
    };

    const dailySeries = [
        {
            name: "Sales",
            data: [12, 18, 15, 22, 28, 25, 30],
        },
        {
            name: "Repairs",
            data: [8, 12, 10, 14, 16, 14, 18],
        },
    ];

    const monthlySeries = [
        {
            name: "Sales",
            data: [65, 72, 78, 85, 92, 88, 95, 102, 98, 108, 115, 120],
        },
        {
            name: "Repairs",
            data: [45, 52, 48, 58, 65, 62, 70, 78, 75, 85, 92, 100],
        },
    ];

    return (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                        Daily / Monthly Performance
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Sales and repairs performance overview
                    </p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setChartView('daily')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                            chartView === 'daily'
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                        }`}
                    >
                        Daily
                    </button>
                    <button
                        onClick={() => setChartView('monthly')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                            chartView === 'monthly'
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                        }`}
                    >
                        Monthly
                    </button>
                </div>
            </div>

            <div className="max-w-full overflow-x-auto custom-scrollbar">
                <div className="-ml-5 min-w-[650px] xl:min-w-full pl-2">
                    {chartView === 'daily' ? (
                        <Chart options={dailyOptions} series={dailySeries} type="bar" height={350} />
                    ) : (
                        <Chart options={monthlOptions} series={monthlySeries} type="bar" height={350} />
                    )}
                </div>
            </div>
        </div>
    );
};

export default function ManagerDashboard() {
    const { auth } = usePage().props as any;

    const stats: ManagerDashboardStats = {
        totalSales: 45280,
        totalRepairs: 1250,
        pendingJobOrders: 42,
    };

    const metrics: MetricCardProps[] = [
        {
            title: 'Total Sales',
            value: stats.totalSales,
            change: 12,
            changeType: 'increase',
            icon: DollarIconSvg,
            color: 'success',
            description: 'Total sales revenue',
        },
        {
            title: 'Total Repairs',
            value: stats.totalRepairs,
            change: 8,
            changeType: 'increase',
            icon: TaskIconSvg,
            color: 'info',
            description: 'Completed repair jobs',
        },
        {
            title: 'Pending Job Orders',
            value: stats.pendingJobOrders,
            change: 5,
            changeType: 'decrease',
            icon: AlertIconSvg,
            color: 'warning',
            description: 'Jobs awaiting action',
        },
    ];

    return (
        <AppLayoutERP>
            <Head title="Manager Dashboard - Solespace ERP" />

            <div className="py-8 px-6">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        Manager Dashboard
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Hello, {auth?.user?.name}! Here's your management overview.
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

                {/* Performance Chart */}
                <div className="mb-8">
                    <PerformanceChart />
                </div>

                {/* Summary Section */}
                <div className="bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Key Metrics Summary</h2>
                    </div>
                    <div className="p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Avg Daily Sales</span>
                            <span className="text-lg font-bold text-gray-900 dark:text-white">$2,480</span>
                        </div>
                        <div className="h-px bg-gray-200 dark:bg-gray-700" />
                        <div className="flex items-center justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Avg Daily Repairs</span>
                            <span className="text-lg font-bold text-gray-900 dark:text-white">54</span>
                        </div>
                        <div className="h-px bg-gray-200 dark:bg-gray-700" />
                        <div className="flex items-center justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Completion Rate</span>
                            <span className="text-lg font-bold text-green-600">94.2%</span>
                        </div>
                        <div className="h-px bg-gray-200 dark:bg-gray-700" />
                        <div className="flex items-center justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Customer Satisfaction</span>
                            <span className="text-lg font-bold text-green-600">4.8/5</span>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayoutERP>
    );
}
