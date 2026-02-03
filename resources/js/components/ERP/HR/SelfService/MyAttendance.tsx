import React, { useState, useEffect } from 'react';
import { Clock, Calendar, TrendingUp, AlertCircle } from 'lucide-react';

interface AttendanceRecord {
    id: number;
    date: string;
    check_in: string;
    check_out: string | null;
    working_hours: number;
    overtime_hours: number;
    status: string;
    notes: string | null;
}

interface AttendanceSummary {
    total_days: number;
    total_hours: number;
    total_overtime: number;
    average_hours: number;
}

export default function MyAttendance() {
    const [loading, setLoading] = useState(true);
    const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
    const [summary, setSummary] = useState<AttendanceSummary | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [startDate, setStartDate] = useState(
        new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]
    );
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

    useEffect(() => {
        fetchAttendance();
    }, [startDate, endDate]);

    const fetchAttendance = async () => {
        try {
            setLoading(true);
            const url = `/api/hr/self-service/attendance?start_date=${startDate}&end_date=${endDate}`;
            
            const response = await fetch(url, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                credentials: 'include',
            });

            const data = await response.json();

            if (data.success) {
                setAttendance(data.attendance);
                setSummary(data.summary);
            } else {
                setError(data.message || 'Failed to load attendance');
            }
        } catch (err) {
            console.error('Error fetching attendance:', err);
            setError('An error occurred while loading attendance records');
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (time: string | null) => {
        if (!time) return 'N/A';
        return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const formatHours = (hours: number) => {
        return `${hours.toFixed(2)}h`;
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
            <div>
                <h1 className="text-2xl font-bold text-gray-900">My Attendance</h1>
                <p className="text-gray-600 mt-1">Track your attendance records and working hours</p>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-red-800">
                        <AlertCircle className="w-5 h-5" />
                        <span>{error}</span>
                    </div>
                </div>
            )}

            {/* Date Filter */}
            <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-gray-400" />
                        <label className="text-sm font-medium text-gray-700">From:</label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <label className="text-sm font-medium text-gray-700">To:</label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                </div>
            </div>

            {/* Summary Cards */}
            {summary && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Days Worked</p>
                                <p className="text-2xl font-bold text-gray-900">{summary.total_days}</p>
                            </div>
                            <Calendar className="w-10 h-10 text-blue-500 opacity-20" />
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total Hours</p>
                                <p className="text-2xl font-bold text-gray-900">{formatHours(summary.total_hours)}</p>
                            </div>
                            <Clock className="w-10 h-10 text-green-500 opacity-20" />
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Overtime</p>
                                <p className="text-2xl font-bold text-gray-900">{formatHours(summary.total_overtime)}</p>
                            </div>
                            <TrendingUp className="w-10 h-10 text-orange-500 opacity-20" />
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Avg Hours/Day</p>
                                <p className="text-2xl font-bold text-gray-900">{formatHours(summary.average_hours)}</p>
                            </div>
                            <Clock className="w-10 h-10 text-purple-500 opacity-20" />
                        </div>
                    </div>
                </div>
            )}

            {/* Attendance Records */}
            {attendance.length === 0 ? (
                <div className="bg-gray-50 rounded-lg p-12 text-center">
                    <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Attendance Records</h3>
                    <p className="text-gray-600">No attendance records found for the selected period.</p>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Date
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Check In
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Check Out
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Working Hours
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Overtime
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Notes
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {attendance.map((record) => (
                                    <tr key={record.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">
                                                {formatDate(record.date)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <Clock className="w-4 h-4 text-green-500" />
                                                <span className="text-sm text-gray-900">
                                                    {formatTime(record.check_in)}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <Clock className="w-4 h-4 text-red-500" />
                                                <span className="text-sm text-gray-900">
                                                    {formatTime(record.check_out)}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm font-medium text-gray-900">
                                                {formatHours(record.working_hours)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`text-sm font-medium ${
                                                record.overtime_hours > 0 ? 'text-orange-600' : 'text-gray-400'
                                            }`}>
                                                {formatHours(record.overtime_hours)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                record.status === 'present'
                                                    ? 'bg-green-100 text-green-800'
                                                    : record.status === 'late'
                                                    ? 'bg-yellow-100 text-yellow-800'
                                                    : 'bg-gray-100 text-gray-800'
                                            }`}>
                                                {record.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-gray-600">
                                                {record.notes || '-'}
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
