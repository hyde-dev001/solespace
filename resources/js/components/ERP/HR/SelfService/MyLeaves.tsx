import React, { useState, useEffect } from 'react';
import { Calendar, PlusCircle, AlertCircle, CheckCircle, XCircle, Clock } from 'lucide-react';

interface LeaveRequest {
    id: number;
    leave_type: string;
    start_date: string;
    end_date: string;
    days: number;
    reason: string;
    status: string;
    rejection_reason: string | null;
    applied_at: string;
}

interface LeaveBalance {
    year: number;
    total: number;
    used: number;
    remaining: number;
    pending: number;
}

export default function MyLeaves() {
    const [loading, setLoading] = useState(true);
    const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
    const [leaveBalance, setLeaveBalance] = useState<LeaveBalance | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [showApplyForm, setShowApplyForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        leave_type: 'annual',
        start_date: '',
        end_date: '',
        reason: '',
    });

    useEffect(() => {
        fetchLeaveRequests();
        fetchLeaveBalance();
    }, []);

    const fetchLeaveRequests = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/hr/self-service/leave-requests', {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                credentials: 'include',
            });

            const data = await response.json();

            if (data.success) {
                setLeaveRequests(data.leave_requests);
            } else {
                setError(data.message || 'Failed to load leave requests');
            }
        } catch (err) {
            console.error('Error fetching leave requests:', err);
            setError('An error occurred while loading leave requests');
        } finally {
            setLoading(false);
        }
    };

    const fetchLeaveBalance = async () => {
        try {
            const response = await fetch('/api/hr/self-service/leave-balance', {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                credentials: 'include',
            });

            const data = await response.json();

            if (data.success) {
                setLeaveBalance(data.leave_balance);
            }
        } catch (err) {
            console.error('Error fetching leave balance:', err);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);
        setSuccess(null);

        try {
            const response = await fetch('/api/hr/self-service/apply-leave', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (data.success) {
                setSuccess('Leave request submitted successfully!');
                setShowApplyForm(false);
                setFormData({
                    leave_type: 'annual',
                    start_date: '',
                    end_date: '',
                    reason: '',
                });
                fetchLeaveRequests();
                fetchLeaveBalance();
                setTimeout(() => setSuccess(null), 3000);
            } else {
                setError(data.message || 'Failed to submit leave request');
            }
        } catch (err) {
            console.error('Error submitting leave request:', err);
            setError('An error occurred while submitting your leave request');
        } finally {
            setSubmitting(false);
        }
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'approved':
                return <CheckCircle className="w-5 h-5 text-green-500" />;
            case 'rejected':
                return <XCircle className="w-5 h-5 text-red-500" />;
            case 'pending':
                return <Clock className="w-5 h-5 text-yellow-500" />;
            default:
                return null;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'approved':
                return 'bg-green-100 text-green-800';
            case 'rejected':
                return 'bg-red-100 text-red-800';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">My Leaves</h1>
                    <p className="text-gray-600 mt-1">Apply for and manage your leave requests</p>
                </div>
                <button
                    onClick={() => setShowApplyForm(!showApplyForm)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <PlusCircle className="w-5 h-5" />
                    Apply Leave
                </button>
            </div>

            {/* Success/Error Messages */}
            {success && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-green-800">
                        <CheckCircle className="w-5 h-5" />
                        <span>{success}</span>
                    </div>
                </div>
            )}

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-red-800">
                        <AlertCircle className="w-5 h-5" />
                        <span>{error}</span>
                    </div>
                </div>
            )}

            {/* Leave Balance */}
            {leaveBalance && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
                        <p className="text-sm text-gray-600 mb-1">Total Leave</p>
                        <p className="text-2xl font-bold text-gray-900">{leaveBalance.total} days</p>
                    </div>
                    <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
                        <p className="text-sm text-gray-600 mb-1">Used</p>
                        <p className="text-2xl font-bold text-red-600">{leaveBalance.used} days</p>
                    </div>
                    <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
                        <p className="text-sm text-gray-600 mb-1">Remaining</p>
                        <p className="text-2xl font-bold text-green-600">{leaveBalance.remaining} days</p>
                    </div>
                    <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
                        <p className="text-sm text-gray-600 mb-1">Pending</p>
                        <p className="text-2xl font-bold text-yellow-600">{leaveBalance.pending} days</p>
                    </div>
                </div>
            )}

            {/* Apply Leave Form */}
            {showApplyForm && (
                <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Apply for Leave</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Leave Type
                                </label>
                                <select
                                    value={formData.leave_type}
                                    onChange={(e) => setFormData({ ...formData, leave_type: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                >
                                    <option value="annual">Annual Leave</option>
                                    <option value="sick">Sick Leave</option>
                                    <option value="casual">Casual Leave</option>
                                    <option value="maternity">Maternity Leave</option>
                                    <option value="paternity">Paternity Leave</option>
                                    <option value="unpaid">Unpaid Leave</option>
                                </select>
                            </div>
                            <div></div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Start Date
                                </label>
                                <input
                                    type="date"
                                    value={formData.start_date}
                                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                                    min={new Date().toISOString().split('T')[0]}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    End Date
                                </label>
                                <input
                                    type="date"
                                    value={formData.end_date}
                                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                                    min={formData.start_date || new Date().toISOString().split('T')[0]}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Reason
                            </label>
                            <textarea
                                value={formData.reason}
                                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                                rows={3}
                                maxLength={500}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Please provide a reason for your leave request..."
                                required
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                {formData.reason.length}/500 characters
                            </p>
                        </div>
                        <div className="flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setShowApplyForm(false)}
                                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                            >
                                {submitting ? 'Submitting...' : 'Submit Request'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Leave Requests List */}
            {leaveRequests.length === 0 ? (
                <div className="bg-gray-50 rounded-lg p-12 text-center">
                    <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Leave Requests</h3>
                    <p className="text-gray-600">You haven't submitted any leave requests yet.</p>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Leave Type
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Dates
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Days
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Reason
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Applied
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {leaveRequests.map((leave) => (
                                    <tr key={leave.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm font-medium text-gray-900 capitalize">
                                                {leave.leave_type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {formatDate(leave.start_date)} - {formatDate(leave.end_date)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm font-semibold text-blue-600">
                                                {leave.days} {leave.days === 1 ? 'day' : 'days'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-600 max-w-xs truncate">
                                                {leave.reason}
                                            </div>
                                            {leave.rejection_reason && (
                                                <div className="text-xs text-red-600 mt-1">
                                                    Rejection: {leave.rejection_reason}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                {getStatusIcon(leave.status)}
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(leave.status)}`}>
                                                    {leave.status}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm text-gray-600">
                                                {formatDate(leave.applied_at)}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
