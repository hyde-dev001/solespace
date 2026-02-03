import React, { useState, useEffect } from 'react';
import { Head } from "@inertiajs/react";
import AppLayout from "../../layout/AppLayout";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import {
  GroupIcon,
  BoxIconLine,
  TaskIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  MoreDotIcon,
} from "../../icons";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import Badge from "../../components/ui/badge/Badge";

// Types for better TypeScript support
interface MetricData {
  title: string;
  value: number;
  change: number;
  changeType: 'increase' | 'decrease';
  icon: React.ComponentType<{ className?: string }>;
  color: 'success' | 'error' | 'warning' | 'info';
  description: string;
}



// Professional Metric Card Component
const MetricCard: React.FC<MetricData> = ({
  title,
  value,
  change,
  changeType,
  icon: Icon,
  color,
  description
}) => {
  const [animatedValue, setAnimatedValue] = useState(0);

  useEffect(() => {
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

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-500 hover:shadow-xl hover:border-gray-300 hover:-translate-y-1 dark:border-gray-800 dark:bg-white/[0.03] dark:hover:border-gray-700">
      {/* Animated background gradient */}
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
            {animatedValue.toLocaleString()}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
};

// Professional Chart Components
const BestPerformingShopsChart: React.FC = () => {
  const options: ApexOptions = {
    colors: ["#465fff"],
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
        "Elite Shoe Repair",
        "Premium Footwear",
        "Shoe Masters",
        "Quick Fix Shoes",
        "Urban Sole",
        "Comfort Walk",
        "Style & Repair",
        "Footwear Experts",
        "Shoe Haven",
        "Sole Saviors",
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
        formatter: (val: number) => `${val} 5-star reviews`,
      },
    },
  };

  const series = [
    {
      name: "5-Star Reviews",
      data: [512, 487, 456, 423, 398, 376, 354, 332, 298, 267],
    },
  ];

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Best Performing Shops This Month
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

// Main Dashboard Component
export default function SystemMonitoringDashboard() {
  const metricsData: MetricData[] = [
    {
      title: "Total Users",
      value: 15420,
      change: 12.5,
      changeType: 'increase',
      icon: GroupIcon,
      color: 'success',
      description: "Active registered users"
    },
    {
      title: "Active Shops",
      value: 847,
      change: 8.2,
      changeType: 'increase',
      icon: BoxIconLine,
      color: 'success',
      description: "Currently operational shops"
    },
    {
      title: "Pending Registrations",
      value: 23,
      change: -15.3,
      changeType: 'decrease',
      icon: TaskIcon,
      color: 'warning',
      description: "Awaiting approval"
    }
  ];

  return (
    <AppLayout>
      <Head title="System Monitoring Dashboard" />

      <div className="space-y-8">
        {/* Header Section */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              System Monitoring Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Real-time insights into system performance, user activity, and business metrics
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 bg-green-100 rounded-lg dark:bg-green-900/30">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-green-700 dark:text-green-400">All Systems Operational</span>
            </div>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid gap-6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
          {metricsData.map((metric, index) => (
            <MetricCard key={index} {...metric} />
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 gap-8">
          <BestPerformingShopsChart />
        </div>

        {/* Additional Insights Section */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
            <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90">System Health</h4>
              </div>
              <div className="flex items-center gap-3">
                <button className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200">
                  See all
                </button>
              </div>
            </div>
            <div className="max-w-full overflow-x-auto">
              <Table>
                <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
                  <TableRow>
                    <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Metric</TableCell>
                    <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Value</TableCell>
                    <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Status</TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                  <TableRow>
                    <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">Server Uptime</TableCell>
                    <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">99.9%</TableCell>
                    <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                      <Badge size="sm" color="success">Excellent</Badge>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">Response Time</TableCell>
                    <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">120ms</TableCell>
                    <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                      <Badge size="sm" color="info">Good</Badge>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">Error Rate</TableCell>
                    <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">0.1%</TableCell>
                    <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                      <Badge size="sm" color="success">Low</Badge>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
            <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90">Recent Activity</h4>
              </div>
              <div className="flex items-center gap-3">
                <button className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200">
                  See all
                </button>
              </div>
            </div>
            <div className="max-w-full overflow-x-auto">
              <Table>
                <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
                  <TableRow>
                    <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Activity</TableCell>
                    <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Time</TableCell>
                    <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Status</TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                  <TableRow>
                    <TableCell className="py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center dark:bg-blue-900/30">
                          <GroupIcon className="text-blue-600 size-4 dark:text-blue-400" />
                        </div>
                        <span className="text-gray-800 text-theme-sm dark:text-white/90">New shop registered</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">2 minutes ago</TableCell>
                    <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                      <Badge size="sm" color="info">New</Badge>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center dark:bg-green-900/30">
                          <TaskIcon className="text-green-600 size-4 dark:text-green-400" />
                        </div>
                        <span className="text-gray-800 text-theme-sm dark:text-white/90">Order #1234 completed</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">5 minutes ago</TableCell>
                    <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                      <Badge size="sm" color="success">Completed</Badge>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center dark:bg-orange-900/30">
                          <TaskIcon className="text-orange-600 size-4 dark:text-orange-400" />
                        </div>
                        <span className="text-gray-800 text-theme-sm dark:text-white/90">Repair request submitted</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">8 minutes ago</TableCell>
                    <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                      <Badge size="sm" color="warning">Pending</Badge>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
            <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90">Performance Metrics</h4>
              </div>
              <div className="flex items-center gap-3">
                <button className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200">
                  See all
                </button>
              </div>
            </div>
            <div className="max-w-full overflow-x-auto">
              <Table>
                <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
                  <TableRow>
                    <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Metric</TableCell>
                    <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Value</TableCell>
                    <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Status</TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                  <TableRow>
                    <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">Avg. Order Value</TableCell>
                    <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">$127.50</TableCell>
                    <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                      <Badge size="sm" color="success">High</Badge>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">Conversion Rate</TableCell>
                    <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">3.2%</TableCell>
                    <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                      <Badge size="sm" color="info">Average</Badge>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">Customer Satisfaction</TableCell>
                    <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">4.8/5</TableCell>
                    <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                      <Badge size="sm" color="success">Excellent</Badge>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
