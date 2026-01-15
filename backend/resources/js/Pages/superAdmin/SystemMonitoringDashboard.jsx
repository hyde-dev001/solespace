import React, { useState, useEffect } from 'react';
import SuperAdminLayout from '../../Layouts/SuperAdminLayout';
import Badge from '../../Components/Badge';

// Icon Components
const GroupIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);

const BoxIconLine = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
  </svg>
);

const TaskIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
  </svg>
);

const ArrowUpIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
  </svg>
);

const ArrowDownIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
  </svg>
);

const MoreDotIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
  </svg>
);

// Table Components
const Table = ({ children, className = "" }) => (
  <table className={`w-full ${className}`}>{children}</table>
);

const TableHeader = ({ children, className = "" }) => (
  <thead className={className}>{children}</thead>
);

const TableBody = ({ children, className = "" }) => (
  <tbody className={className}>{children}</tbody>
);

const TableRow = ({ children, className = "" }) => (
  <tr className={className}>{children}</tr>
);

const TableCell = ({ children, className = "", isHeader = false }) => {
  const Tag = isHeader ? 'th' : 'td';
  return <Tag className={className}>{children}</Tag>;
};

// Professional Metric Card Component
const MetricCard = ({
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

// Best Performing Shops Chart (Simplified without ApexCharts)
const BestPerformingShopsChart = () => {
  const shops = [
    { name: "Elite Shoe Repair", reviews: 512 },
    { name: "Premium Footwear", reviews: 487 },
    { name: "Shoe Masters", reviews: 456 },
    { name: "Quick Fix Shoes", reviews: 423 },
    { name: "Urban Sole", reviews: 398 },
    { name: "Comfort Walk", reviews: 376 },
    { name: "Style & Repair", reviews: 354 },
    { name: "Footwear Experts", reviews: 332 },
    { name: "Shoe Haven", reviews: 298 },
    { name: "Sole Saviors", reviews: 267 },
  ];

  const maxReviews = Math.max(...shops.map(s => s.reviews));

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Best Performing Shops This Month
        </h3>
        <div className="relative inline-block">
          <button className="dropdown-toggle">
            <MoreDotIcon className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 size-6" />
          </button>
        </div>
      </div>

      <div className="space-y-4 pb-6">
        {shops.map((shop, index) => (
          <div key={index} className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-gray-700 dark:text-gray-300">{shop.name}</span>
              <span className="text-gray-600 dark:text-gray-400">{shop.reviews} reviews</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${(shop.reviews / maxReviews) * 100}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Main Dashboard Component
function SystemMonitoringDashboard() {
  const metricsData = [
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
      <div className="space-y-8 p-6 md:p-8">
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
                <button className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200">
                  See all
                </button>
              </div>
            </div>
            <div className="max-w-full overflow-x-auto">
              <Table>
                <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
                  <TableRow>
                    <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">Metric</TableCell>
                    <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">Value</TableCell>
                    <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">Status</TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                  <TableRow>
                    <TableCell className="py-3 text-gray-500 text-sm dark:text-gray-400">Server Uptime</TableCell>
                    <TableCell className="py-3 text-gray-500 text-sm dark:text-gray-400">99.9%</TableCell>
                    <TableCell className="py-3 text-gray-500 text-sm dark:text-gray-400">
                      <Badge size="sm" color="success">Excellent</Badge>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="py-3 text-gray-500 text-sm dark:text-gray-400">Response Time</TableCell>
                    <TableCell className="py-3 text-gray-500 text-sm dark:text-gray-400">120ms</TableCell>
                    <TableCell className="py-3 text-gray-500 text-sm dark:text-gray-400">
                      <Badge size="sm" color="info">Good</Badge>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="py-3 text-gray-500 text-sm dark:text-gray-400">Error Rate</TableCell>
                    <TableCell className="py-3 text-gray-500 text-sm dark:text-gray-400">0.1%</TableCell>
                    <TableCell className="py-3 text-gray-500 text-sm dark:text-gray-400">
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
                <button className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200">
                  See all
                </button>
              </div>
            </div>
            <div className="max-w-full overflow-x-auto">
              <Table>
                <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
                  <TableRow>
                    <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">Activity</TableCell>
                    <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">Time</TableCell>
                    <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">Status</TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                  <TableRow>
                    <TableCell className="py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center dark:bg-blue-900/30">
                          <GroupIcon className="text-blue-600 size-4 dark:text-blue-400" />
                        </div>
                        <span className="text-gray-800 text-sm dark:text-white/90">New shop registered</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-3 text-gray-500 text-sm dark:text-gray-400">2 minutes ago</TableCell>
                    <TableCell className="py-3 text-gray-500 text-sm dark:text-gray-400">
                      <Badge size="sm" color="info">New</Badge>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center dark:bg-green-900/30">
                          <TaskIcon className="text-green-600 size-4 dark:text-green-400" />
                        </div>
                        <span className="text-gray-800 text-sm dark:text-white/90">Order #1234 completed</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-3 text-gray-500 text-sm dark:text-gray-400">5 minutes ago</TableCell>
                    <TableCell className="py-3 text-gray-500 text-sm dark:text-gray-400">
                      <Badge size="sm" color="success">Completed</Badge>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center dark:bg-orange-900/30">
                          <TaskIcon className="text-orange-600 size-4 dark:text-orange-400" />
                        </div>
                        <span className="text-gray-800 text-sm dark:text-white/90">Repair request submitted</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-3 text-gray-500 text-sm dark:text-gray-400">8 minutes ago</TableCell>
                    <TableCell className="py-3 text-gray-500 text-sm dark:text-gray-400">
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
                <button className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200">
                  See all
                </button>
              </div>
            </div>
            <div className="max-w-full overflow-x-auto">
              <Table>
                <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
                  <TableRow>
                    <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">Metric</TableCell>
                    <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">Value</TableCell>
                    <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">Status</TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                  <TableRow>
                    <TableCell className="py-3 text-gray-500 text-sm dark:text-gray-400">Avg. Order Value</TableCell>
                    <TableCell className="py-3 text-gray-500 text-sm dark:text-gray-400">$127.50</TableCell>
                    <TableCell className="py-3 text-gray-500 text-sm dark:text-gray-400">
                      <Badge size="sm" color="success">High</Badge>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="py-3 text-gray-500 text-sm dark:text-gray-400">Conversion Rate</TableCell>
                    <TableCell className="py-3 text-gray-500 text-sm dark:text-gray-400">3.2%</TableCell>
                    <TableCell className="py-3 text-gray-500 text-sm dark:text-gray-400">
                      <Badge size="sm" color="info">Average</Badge>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="py-3 text-gray-500 text-sm dark:text-gray-400">Customer Satisfaction</TableCell>
                    <TableCell className="py-3 text-gray-500 text-sm dark:text-gray-400">4.8/5</TableCell>
                    <TableCell className="py-3 text-gray-500 text-sm dark:text-gray-400">
                      <Badge size="sm" color="success">Excellent</Badge>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </div>
  );
}

SystemMonitoringDashboard.layout = (page) => <SuperAdminLayout auth={page.props.auth}>{page}</SuperAdminLayout>;

export default SystemMonitoringDashboard;
