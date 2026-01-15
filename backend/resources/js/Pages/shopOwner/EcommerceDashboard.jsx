import { Head } from '@inertiajs/react';
import ShopOwnerLayout from '../../Layouts/ShopOwnerLayout';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

// Icons
const GroupIcon = ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
);

const BoxIcon = ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
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

// Sample chart data
const monthlySalesData = [
    { month: 'Jan', sales: 4500 },
    { month: 'Feb', sales: 5200 },
    { month: 'Mar', sales: 4800 },
    { month: 'Apr', sales: 6100 },
    { month: 'May', sales: 7300 },
    { month: 'Jun', sales: 6800 },
];

const monthlyTargetData = [
    { month: 'Jan', target: 5000, actual: 4500 },
    { month: 'Feb', target: 5500, actual: 5200 },
    { month: 'Mar', target: 5200, actual: 4800 },
    { month: 'Apr', target: 6000, actual: 6100 },
    { month: 'May', target: 7000, actual: 7300 },
    { month: 'Jun', target: 7500, actual: 6800 },
];

function EcommerceDashboard() {
    return (
        <>
            <Head title="Ecommerce Dashboard - Shop Owner" />
            
            <div className="space-y-6">
                <div>
                    <h3 className="text-2xl font-bold text-gray-800 dark:text-white">
                        Ecommerce Dashboard
                    </h3>
                    <p className="mt-1 text-gray-500 dark:text-gray-400">
                        Overview of your shop's ecommerce performance
                    </p>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6">
                    {/* Customers Metric */}
                    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
                        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
                            <GroupIcon className="text-gray-800 w-6 h-6 dark:text-white" />
                        </div>
                        <div className="flex items-end justify-between mt-5">
                            <div>
                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                    Customers
                                </span>
                                <h4 className="mt-2 font-bold text-gray-800 text-2xl dark:text-white">
                                    3,782
                                </h4>
                            </div>
                            <div className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                <ArrowUpIcon className="w-3 h-3" />
                                11.01%
                            </div>
                        </div>
                    </div>

                    {/* Orders Metric */}
                    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
                        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
                            <BoxIcon className="text-gray-800 w-6 h-6 dark:text-white" />
                        </div>
                        <div className="flex items-end justify-between mt-5">
                            <div>
                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                    Orders
                                </span>
                                <h4 className="mt-2 font-bold text-gray-800 text-2xl dark:text-white">
                                    5,359
                                </h4>
                            </div>
                            <div className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                                <ArrowDownIcon className="w-3 h-3" />
                                9.05%
                            </div>
                        </div>
                    </div>
                </div>

                {/* Charts Placeholder */}
                <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
                        <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                            Monthly Sales
                        </h4>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={monthlySalesData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
                                    <XAxis dataKey="month" stroke="#9CA3AF" />
                                    <YAxis stroke="#9CA3AF" />
                                    <Tooltip 
                                        contentStyle={{ 
                                            backgroundColor: '#1F2937', 
                                            border: '1px solid #374151',
                                            borderRadius: '0.5rem',
                                            color: '#F9FAFB'
                                        }}
                                    />
                                    <Bar dataKey="sales" fill="#3B82F6" radius={[8, 8, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
                        <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                            Monthly Target
                        </h4>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={monthlyTargetData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
                                    <XAxis dataKey="month" stroke="#9CA3AF" />
                                    <YAxis stroke="#9CA3AF" />
                                    <Tooltip 
                                        contentStyle={{ 
                                            backgroundColor: '#1F2937', 
                                            border: '1px solid #374151',
                                            borderRadius: '0.5rem',
                                            color: '#F9FAFB'
                                        }}
                                    />
                                    <Line type="monotone" dataKey="target" stroke="#10B981" strokeWidth={2} />
                                    <Line type="monotone" dataKey="actual" stroke="#3B82F6" strokeWidth={2} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Recent Orders */}
                <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
                    <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                        Recent Orders
                    </h4>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                            <thead>
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Order ID
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Customer
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Amount
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                                <tr>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                        #12345
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                        John Doe
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap">
                                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                            Completed
                                        </span>
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                        $129.99
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    );
}

EcommerceDashboard.layout = (page) => <ShopOwnerLayout auth={page.props.auth}>{page}</ShopOwnerLayout>;

export default EcommerceDashboard;
