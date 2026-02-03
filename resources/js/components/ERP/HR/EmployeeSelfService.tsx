import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Calendar,
    DollarSign,
    Clock,
    User,
    TrendingUp,
    FileText,
    Shield,
    ChevronRight,
    AlertCircle
} from 'lucide-react';

interface DashboardStats {
    employee: {
        name: string;
        position: string;
        department: string;
    };
    attendance_this_month: number;
    pending_leave_requests: number;
    leave_used_this_year: number;
    latest_payslip: {
        id: number;
        period: string;
        net_salary: number;
    } | null;
}

interface QuickAction {
    title: string;
    description: string;
    icon: React.ElementType;
    route: string;
    color: string;
    badge?: number;
}

export default function EmployeeSelfService() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchDashboard();
    }, []);

    const fetchDashboard = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/hr/self-service/dashboard', {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                credentials: 'include',
            });

            const data = await response.json();

            if (data.success) {
                setStats(data.dashboard);
            } else {
                setError(data.message || 'Failed to load dashboard');
            }
        } catch (err) {
            console.error('Error fetching dashboard:', err);
            setError('An error occurred while loading the dashboard');
        } finally {
            setLoading(false);
        }
    };

    const quickActions: QuickAction[] = [
        {
            title: 'Apply Leave',
            description: 'Request time off',
            icon: Calendar,
            route: '/erp/hr/self-service/leaves',
            color: 'bg-blue-500',
            badge: stats?.pending_leave_requests,
        },
        {
            title: 'View Payslips',
            description: 'Download salary slips',
            icon: DollarSign,
            route: '/erp/hr/self-service/payslips',
            color: 'bg-green-500',
        },
        {
            title: 'My Attendance',
            description: 'Check attendance records',
            icon: Clock,
            route: '/erp/hr/self-service/attendance',
            color: 'bg-purple-500',
        },
        {
            title: 'Update Profile',
            description: 'Edit personal information',
            icon: User,
            route: '/erp/hr/self-service/profile',
            color: 'bg-orange-500',
        },
        {
            title: 'View Performance',
            description: 'Check performance reviews',
            icon: TrendingUp,
            route: '/erp/hr/performance',
            color: 'bg-indigo-500',
        },
        {
            title: 'Change Password',
            description: 'Update account password',
            icon: Shield,
            route: '/erp/hr/self-service/change-password',
            color: 'bg-red-500',
        },
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-red-800">
                    <AlertCircle className="w-5 h-5" />
                    <span>{error}</span>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Welcome Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-6 text-white">
                <h1 className="text-2xl font-bold mb-2">
                    Welcome, {stats?.employee.name}!
                </h1>
                <p className="text-blue-100">
                    {stats?.employee.position} • {stats?.employee.department}
                </p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Attendance This Month</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {stats?.attendance_this_month || 0}
                            </p>
                        </div>
                        <Clock className="w-10 h-10 text-purple-500 opacity-20" />
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Pending Leaves</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {stats?.pending_leave_requests || 0}
                            </p>
                        </div>
                        <Calendar className="w-10 h-10 text-blue-500 opacity-20" />
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Leave Used (YTD)</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {stats?.leave_used_this_year || 0} days
                            </p>
                        </div>
                        <FileText className="w-10 h-10 text-orange-500 opacity-20" />
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Latest Payslip</p>
                            <p className="text-lg font-bold text-gray-900">
                                {stats?.latest_payslip 
                                    ? `$${stats.latest_payslip.net_salary.toLocaleString()}`
                                    : 'N/A'
                                }
                            </p>
                            {stats?.latest_payslip && (
                                <p className="text-xs text-gray-500">
                                    {stats.latest_payslip.period}
                                </p>
                            )}
                        </div>
                        <DollarSign className="w-10 h-10 text-green-500 opacity-20" />
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {quickActions.map((action, index) => (
                        <QuickActionCard
                            key={index}
                            action={action}
                            onClick={() => navigate(action.route)}
                        />
                    ))}
                </div>
            </div>

            {/* Recent Activity Section */}
            <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Need Help?
                </h2>
                <div className="space-y-3">
                    <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                        <div>
                            <p className="text-sm font-medium text-gray-900">
                                Contact HR Department
                            </p>
                            <p className="text-sm text-gray-600">
                                For any assistance with leave, payroll, or other HR matters
                            </p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                        <div>
                            <p className="text-sm font-medium text-gray-900">
                                Update Your Information
                            </p>
                            <p className="text-sm text-gray-600">
                                Keep your contact details and emergency contacts up to date
                            </p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                        <div>
                            <p className="text-sm font-medium text-gray-900">
                                Review Policies
                            </p>
                            <p className="text-sm text-gray-600">
                                Familiarize yourself with company policies and procedures
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

interface QuickActionCardProps {
    action: QuickAction;
    onClick: () => void;
}

function QuickActionCard({ action, onClick }: QuickActionCardProps) {
    const Icon = action.icon;

    return (
        <button
            onClick={onClick}
            className="bg-white rounded-lg shadow border border-gray-200 p-6 hover:shadow-lg transition-all duration-200 hover:scale-105 text-left w-full group"
        >
            <div className="flex items-start justify-between mb-3">
                <div className={`${action.color} p-3 rounded-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                </div>
                {action.badge !== undefined && action.badge > 0 && (
                    <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                        {action.badge}
                    </span>
                )}
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                {action.title}
            </h3>
            <p className="text-sm text-gray-600 mb-3">{action.description}</p>
            <div className="flex items-center text-blue-600 text-sm font-medium">
                <span>Go</span>
                <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
        </button>
    );
}
