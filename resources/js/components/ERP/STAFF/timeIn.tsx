import { Head, usePage } from '@inertiajs/react';
import AppLayoutERP from '../../../layout/AppLayout_ERP';
import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';

const ClockIcon = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const CheckIcon = () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
);

const CalendarIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
);

const TrendingUpIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
);

const CoffeeIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
);

const LeaveIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
);

interface AttendanceRecord {
    date: string;
    clockIn: string;
    clockOut: string;
    totalHours: string;
    status: string;
}

export default function TimeIn() {
    const { auth } = usePage().props as any;
    const [currentTime, setCurrentTime] = useState<Date>(new Date());
    const [loginTime, setLoginTime] = useState<Date | null>(null);
    const [lunchStartTime, setLunchStartTime] = useState<Date | null>(null);
    const [lunchEndTime, setLunchEndTime] = useState<Date | null>(null);
    const [logoutTime, setLogoutTime] = useState<Date | null>(null);
    const [isClockedIn, setIsClockedIn] = useState(false);
    const [isOnLunch, setIsOnLunch] = useState(false);
    const [totalHours, setTotalHours] = useState<string>('0:00:00');
    const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
    const [showLeaveModal, setShowLeaveModal] = useState(false);
    const [leaveMonth, setLeaveMonth] = useState('');
    const [leaveDay, setLeaveDay] = useState('');
    const [leaveReason, setLeaveReason] = useState('');
    const [lastLeaveRequestTime, setLastLeaveRequestTime] = useState<number | null>(null);

    useEffect(() => {
        const savedTime = localStorage.getItem('lastLeaveRequestTime');
        if (savedTime) {
            setLastLeaveRequestTime(parseInt(savedTime));
        }
    }, []);

    const formatTime = (date: Date | null) => {
        if (!date) return '--:--:--';
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    const formatTimeShort = (date: Date | null) => {
        if (!date) return '--:--';
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    useEffect(() => {
        const updateTime = () => setCurrentTime(new Date());
        updateTime();
        const interval = setInterval(updateTime, 1000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (loginTime && !logoutTime) {
            const interval = setInterval(() => {
                calculateTotalHours();
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [loginTime, logoutTime, lunchStartTime, lunchEndTime]);

    const calculateTotalHours = () => {
        if (!loginTime) return;

        const endTime = logoutTime ?? currentTime;
        if (!endTime) return;

        let totalSeconds = Math.floor((endTime.getTime() - loginTime.getTime()) / 1000);

        if (lunchStartTime && lunchEndTime) {
            const lunchSeconds = Math.floor((lunchEndTime.getTime() - lunchStartTime.getTime()) / 1000);
            totalSeconds -= lunchSeconds;
        }

        totalSeconds = Math.max(0, totalSeconds);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = Math.floor(totalSeconds % 60);
        setTotalHours(`${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    };

    const handleClockIn = () => {
        const now = new Date();
        setLoginTime(now);
        setIsClockedIn(true);
        setLogoutTime(null);
    };

    const handleStartLunch = () => {
        const now = new Date();
        setLunchStartTime(now);
        setIsOnLunch(true);
    };

    const handleEndLunch = () => {
        const now = new Date();
        setLunchEndTime(now);
        setIsOnLunch(false);
        setTimeout(() => {
            setLunchStartTime(null);
            setLunchEndTime(null);
        }, 100);
    };

    const handleClockOut = () => {
        if (!loginTime) return;

        const now = new Date();
        
        let totalSeconds = Math.floor((now.getTime() - loginTime.getTime()) / 1000);

        if (lunchStartTime && lunchEndTime) {
            const lunchSeconds = Math.floor((lunchEndTime.getTime() - lunchStartTime.getTime()) / 1000);
            totalSeconds -= lunchSeconds;
        }

        totalSeconds = Math.max(0, totalSeconds);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = Math.floor(totalSeconds % 60);
        const finalTotalHours = `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

        const newRecord: AttendanceRecord = {
            date: now.toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric', 
                year: 'numeric' 
            }),
            clockIn: formatTime(loginTime),
            clockOut: formatTime(now),
            totalHours: finalTotalHours,
            status: 'Completed'
        };

        setAttendanceRecords(prev => [newRecord, ...prev]);

        setLogoutTime(now);
        setIsClockedIn(false);
        setIsOnLunch(false);
        setTotalHours(finalTotalHours);

        setTimeout(() => {
            setLoginTime(null);
            setLunchStartTime(null);
            setLunchEndTime(null);
            setLogoutTime(null);
        }, 1000);
    };

    const handleRequestLeaveClick = () => {
        if (lastLeaveRequestTime) {
            const now = Date.now();
            const timeDiff = now - lastLeaveRequestTime;
            const hoursRemaining = Math.ceil((24 * 60 * 60 * 1000 - timeDiff) / (60 * 60 * 1000));
            
            if (timeDiff < 24 * 60 * 60 * 1000) {
                Swal.fire({
                    icon: 'info',
                    title: 'Request Under Review',
                    html: `<div class="text-center">
                        <p class="mb-3">Your previous leave request is currently being reviewed by the Human Resources department.</p>
                        <p class="text-sm text-gray-600">You can submit another request in approximately <strong>${hoursRemaining} hour(s)</strong>.</p>
                        <p class="text-sm text-gray-500 mt-2">Please check back later or contact HR for updates.</p>
                    </div>`,
                    confirmButtonColor: '#9333ea',
                    confirmButtonText: 'Understood'
                });
                return;
            }
        }
        setShowLeaveModal(true);
    };

    const handleLeaveRequest = () => {
        if (!leaveMonth || !leaveDay || !leaveReason) {
            Swal.fire({
                icon: 'warning',
                title: 'Incomplete Form',
                text: 'Please fill in all fields',
                confirmButtonColor: '#9333ea'
            });
            return;
        }
        
        Swal.fire({
            title: 'Submit Leave Request?',
            html: `<div class="text-left">
                <p><strong>Month:</strong> ${leaveMonth}</p>
                <p><strong>Day:</strong> ${leaveDay}</p>
                <p><strong>Reason:</strong> ${leaveReason}</p>
            </div>`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#9333ea',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Yes, submit it!',
            cancelButtonText: 'Cancel'
        }).then((result) => {
            if (result.isConfirmed) {
                console.log('Leave Request:', { month: leaveMonth, day: leaveDay, reason: leaveReason });
                
                const now = Date.now();
                setLastLeaveRequestTime(now);
                localStorage.setItem('lastLeaveRequestTime', now.toString());
                
                setLeaveMonth('');
                setLeaveDay('');
                setLeaveReason('');
                setShowLeaveModal(false);
                
                Swal.fire({
                    icon: 'success',
                    title: 'Request Submitted!',
                    html: '<p>Your leave request has been submitted successfully and is now under review by the Human Resources department.</p><p class="text-sm text-gray-600 mt-2">You will be notified once your request has been processed.</p>',
                    confirmButtonColor: '#9333ea',
                    timer: 3000
                });
            }
        });
    };

    return (
        <AppLayoutERP>
            <Head title="Attendance - Time In/Out" />
            
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
                {/* Header Section */}
                <div className="mb-12">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                                <ClockIcon />
                            </div>
                            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                                Attendance Tracking
                            </h1>
                        </div>
                        <button
                            onClick={handleRequestLeaveClick}
                            className="rounded-lg border border-blue-600 bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-blue-700 hover:shadow-md flex items-center gap-2"
                        >
                            <LeaveIcon />
                            Request Leave
                        </button>
                    </div>
                    <p className="text-lg text-gray-600 dark:text-gray-400 mt-2">
                        Manage your daily work hours efficiently
                    </p>
                </div>

                {/* Main Clock Section */}
                <div className="mb-12">
                    <div className="relative overflow-hidden rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 p-0 shadow-xl">
                        <div className="relative p-12 md:p-16">
                            <div className="text-center">
                                <div className="mb-8">
                                    <p className="text-gray-600 dark:text-gray-400 text-sm font-semibold uppercase tracking-widest mb-4">
                                        Current Time
                                    </p>
                                    <div className="text-6xl md:text-7xl font-bold text-gray-900 dark:text-white font-mono tracking-tight mb-4">
                                        {formatTime(currentTime)}
                                    </div>
                                    <p className="text-gray-600 dark:text-gray-400 text-lg">
                                        {new Date().toLocaleDateString('en-US', { 
                                            weekday: 'long', 
                                            month: 'long', 
                                            day: 'numeric',
                                            year: 'numeric'
                                        })}
                                    </p>
                                </div>

                                <div className="mb-8 flex justify-center">
                                    <div className={`flex items-center gap-2 px-6 py-3 rounded-full transition-all duration-300 ${
                                        isOnLunch
                                            ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 border border-orange-300 dark:border-orange-700'
                                            : isClockedIn 
                                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-300 dark:border-green-700' 
                                            : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-300 dark:border-red-700'
                                    }`}>
                                        <div className={`w-3 h-3 rounded-full animate-pulse ${
                                            isOnLunch ? 'bg-orange-500' : isClockedIn ? 'bg-green-500' : 'bg-red-500'
                                        }`} />
                                        <span className="font-semibold text-sm uppercase tracking-wide">
                                            {isOnLunch ? 'On Lunch Break' : isClockedIn ? 'Clocked In' : 'Clocked Out'}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                                    <button
                                        onClick={handleClockIn}
                                        disabled={isClockedIn}
                                        className={`px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg ${
                                            isClockedIn
                                                ? 'bg-gray-200 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed'
                                                : 'bg-green-500 text-white hover:bg-green-600 hover:shadow-xl'
                                        }`}
                                    >
                                        <div className="flex items-center justify-center gap-2">
                                            <CheckIcon />
                                            Clock In
                                        </div>
                                    </button>

                                    {isClockedIn && !isOnLunch && (
                                        <button
                                            onClick={handleStartLunch}
                                            className="px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg bg-orange-500 text-white hover:bg-orange-600 hover:shadow-xl"
                                        >
                                            <div className="flex items-center justify-center gap-2">
                                                <CoffeeIcon />
                                                Start Lunch
                                            </div>
                                        </button>
                                    )}

                                    {isOnLunch && (
                                        <button
                                            onClick={handleEndLunch}
                                            className="px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg bg-blue-500 text-white hover:bg-blue-600 hover:shadow-xl"
                                        >
                                            <div className="flex items-center justify-center gap-2">
                                                <CheckIcon />
                                                End Lunch
                                            </div>
                                        </button>
                                    )}

                                    <button
                                        onClick={handleClockOut}
                                        disabled={!isClockedIn || isOnLunch}
                                        className={`px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg ${
                                            !isClockedIn || isOnLunch
                                                ? 'bg-gray-200 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed'
                                                : 'bg-red-500 text-white hover:bg-red-600 hover:shadow-xl'
                                        }`}
                                    >
                                        Clock Out
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Time Tracker Details */}
                <div className="mb-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 p-6 shadow-sm">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                                <CheckIcon />
                            </div>
                            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Login Time</h3>
                        </div>
                        <div className="text-3xl font-bold text-gray-900 dark:text-white font-mono">
                            {formatTime(loginTime)}
                        </div>
                    </div>

                    <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 p-6 shadow-sm">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30">
                                <CoffeeIcon />
                            </div>
                            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Lunch Break</h3>
                        </div>
                        <div className="text-2xl font-bold text-gray-900 dark:text-white font-mono">
                            {lunchStartTime && lunchEndTime 
                                ? `${formatTimeShort(lunchStartTime)} - ${formatTimeShort(lunchEndTime)}`
                                : lunchStartTime 
                                ? `${formatTimeShort(lunchStartTime)} - ...`
                                : '--:-- - --:--'
                            }
                        </div>
                    </div>

                    <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 p-6 shadow-sm">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30">
                                <ClockIcon />
                            </div>
                            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Logout Time</h3>
                        </div>
                        <div className="text-3xl font-bold text-gray-900 dark:text-white font-mono">
                            {formatTime(logoutTime)}
                        </div>
                    </div>

                </div>

                {/* Attendance Records Table */}
                <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 shadow-sm overflow-hidden">
                    <div className="p-8 border-b border-gray-200 dark:border-gray-800">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30">
                                <CalendarIcon />
                            </div>
                            Attendance History
                        </h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 dark:bg-gray-800/50">
                                <tr>
                                    <th className="px-8 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Date</th>
                                    <th className="px-8 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Clock In</th>
                                    <th className="px-8 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Clock Out</th>
                                    <th className="px-8 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Total Hours</th>
                                    <th className="px-8 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {attendanceRecords.length === 0 ? (
                                    <tr className="border-t border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                                        <td colSpan={5} className="px-8 py-12 text-center">
                                            <div className="flex flex-col items-center gap-3">
                                                <div className="p-4 rounded-full bg-gray-100 dark:bg-gray-800">
                                                    <CalendarIcon />
                                                </div>
                                                <p className="text-gray-600 dark:text-gray-400 font-medium">
                                                    No attendance records yet
                                                </p>
                                                <p className="text-sm text-gray-500 dark:text-gray-500">
                                                    Start by clocking in to create your first record
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    attendanceRecords.map((record, index) => (
                                        <tr key={index} className="border-t border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                                            <td className="px-8 py-4 text-gray-900 dark:text-white font-medium">{record.date}</td>
                                            <td className="px-8 py-4 text-gray-900 dark:text-white font-mono">{record.clockIn}</td>
                                            <td className="px-8 py-4 text-gray-900 dark:text-white font-mono">{record.clockOut}</td>
                                            <td className="px-8 py-4 text-gray-900 dark:text-white font-mono">{record.totalHours}</td>
                                            <td className="px-8 py-4">
                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                                    {record.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Leave Request Modal */}
                {showLeaveModal && (
                    <div className="fixed inset-0 z-[999999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl max-w-md w-full p-8 border border-gray-200 dark:border-gray-800">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                                        <LeaveIcon />
                                    </div>
                                    Request Leave
                                </h2>
                                <button
                                    onClick={() => setShowLeaveModal(false)}
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                                >
                                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                        Month
                                    </label>
                                    <select
                                        value={leaveMonth}
                                        onChange={(e) => setLeaveMonth(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                    >
                                        <option value="">Select Month</option>
                                        <option value="January">January</option>
                                        <option value="February">February</option>
                                        <option value="March">March</option>
                                        <option value="April">April</option>
                                        <option value="May">May</option>
                                        <option value="June">June</option>
                                        <option value="July">July</option>
                                        <option value="August">August</option>
                                        <option value="September">September</option>
                                        <option value="October">October</option>
                                        <option value="November">November</option>
                                        <option value="December">December</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                        Day
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="31"
                                        value={leaveDay}
                                        onChange={(e) => setLeaveDay(e.target.value)}
                                        placeholder="Enter day (1-31)"
                                        className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                        Reason
                                    </label>
                                    <textarea
                                        value={leaveReason}
                                        onChange={(e) => setLeaveReason(e.target.value)}
                                        placeholder="Enter reason for leave..."
                                        rows={4}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
                                    />
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button
                                        onClick={() => setShowLeaveModal(false)}
                                        className="flex-1 px-6 py-3 rounded-xl font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleLeaveRequest}
                                        className="flex-1 px-6 py-3 rounded-xl font-semibold text-white bg-blue-500 hover:bg-purple-600 transition-all duration-300 shadow-lg hover:shadow-xl"
                                    >
                                        Submit Request
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AppLayoutERP>
    );
}
