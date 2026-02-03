import React, { useState, useEffect } from 'react';
import { Bell, Check, Trash2, Filter, Calendar, AlertCircle, CheckCircle, Info, Clock, TrendingUp, XCircle } from 'lucide-react';

interface Notification {
    id: string;
    type: string;
    data: {
        type: string;
        title: string;
        message: string;
        action_url?: string;
        priority?: 'low' | 'medium' | 'high' | 'critical';
        [key: string]: any;
    };
    read_at: string | null;
    created_at: string;
}

interface NotificationStats {
    total: number;
    unread: number;
    read: number;
    by_type: { [key: string]: number };
    by_priority: { [key: string]: number };
}

export default function Notifications() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [stats, setStats] = useState<NotificationStats | null>(null);
    const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedNotifications, setSelectedNotifications] = useState<Set<string>>(new Set());

    // Load notifications
    const loadNotifications = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await fetch(`/api/hr/notifications?filter=${filter}&per_page=50`, {
                credentials: 'include',
                headers: {
                    'Accept': 'application/json',
                }
            });

            if (!response.ok) {
                throw new Error('Failed to load notifications');
            }

            const data = await response.json();
            setNotifications(data.notifications || []);
        } catch (err: any) {
            setError(err.message || 'Failed to load notifications');
        } finally {
            setLoading(false);
        }
    };

    // Load stats
    const loadStats = async () => {
        try {
            const response = await fetch('/api/hr/notifications/stats', {
                credentials: 'include',
                headers: {
                    'Accept': 'application/json',
                }
            });

            if (response.ok) {
                const data = await response.json();
                setStats(data.stats);
            }
        } catch (err) {
            console.error('Failed to load stats:', err);
        }
    };

    // Mark notification as read
    const markAsRead = async (notificationId: string) => {
        try {
            const response = await fetch(`/api/hr/notifications/${notificationId}/mark-as-read`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                }
            });

            if (response.ok) {
                setNotifications(prev => prev.map(n => 
                    n.id === notificationId ? { ...n, read_at: new Date().toISOString() } : n
                ));
                loadStats(); // Refresh stats
            }
        } catch (err) {
            console.error('Failed to mark as read:', err);
        }
    };

    // Mark all as read
    const markAllAsRead = async () => {
        try {
            const response = await fetch('/api/hr/notifications/mark-all-as-read', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                }
            });

            if (response.ok) {
                setNotifications(prev => prev.map(n => ({ ...n, read_at: new Date().toISOString() })));
                loadStats();
            }
        } catch (err) {
            console.error('Failed to mark all as read:', err);
        }
    };

    // Delete notification
    const deleteNotification = async (notificationId: string) => {
        try {
            const response = await fetch(`/api/hr/notifications/${notificationId}`, {
                method: 'DELETE',
                credentials: 'include',
                headers: {
                    'Accept': 'application/json',
                }
            });

            if (response.ok) {
                setNotifications(prev => prev.filter(n => n.id !== notificationId));
                loadStats();
            }
        } catch (err) {
            console.error('Failed to delete notification:', err);
        }
    };

    // Clear all read notifications
    const clearRead = async () => {
        try {
            const response = await fetch('/api/hr/notifications/clear-read', {
                method: 'DELETE',
                credentials: 'include',
                headers: {
                    'Accept': 'application/json',
                }
            });

            if (response.ok) {
                loadNotifications();
                loadStats();
            }
        } catch (err) {
            console.error('Failed to clear read notifications:', err);
        }
    };

    // Handle notification click
    const handleNotificationClick = (notification: Notification) => {
        if (!notification.read_at) {
            markAsRead(notification.id);
        }
        if (notification.data.action_url) {
            window.location.href = notification.data.action_url;
        }
    };

    // Toggle selection
    const toggleSelection = (notificationId: string) => {
        setSelectedNotifications(prev => {
            const newSet = new Set(prev);
            if (newSet.has(notificationId)) {
                newSet.delete(notificationId);
            } else {
                newSet.add(notificationId);
            }
            return newSet;
        });
    };

    // Select all
    const selectAll = () => {
        setSelectedNotifications(new Set(notifications.map(n => n.id)));
    };

    // Deselect all
    const deselectAll = () => {
        setSelectedNotifications(new Set());
    };

    useEffect(() => {
        loadNotifications();
        loadStats();
    }, [filter]);

    // Get icon based on notification type
    const getNotificationIcon = (notification: Notification) => {
        const type = notification.data.type;
        const priority = notification.data.priority;

        if (type.includes('approved')) {
            return <CheckCircle className="w-6 h-6 text-green-500" />;
        } else if (type.includes('rejected')) {
            return <XCircle className="w-6 h-6 text-red-500" />;
        } else if (type.includes('expiring') || priority === 'critical') {
            return <AlertCircle className="w-6 h-6 text-red-500" />;
        } else if (type.includes('due')) {
            return <Clock className="w-6 h-6 text-yellow-500" />;
        } else {
            return <Info className="w-6 h-6 text-blue-500" />;
        }
    };

    // Get priority badge color
    const getPriorityColor = (priority?: string) => {
        switch (priority) {
            case 'critical':
                return 'bg-red-100 text-red-800 border-red-200';
            case 'high':
                return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'medium':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'low':
                return 'bg-gray-100 text-gray-800 border-gray-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    // Format timestamp
    const formatTimestamp = (timestamp: string) => {
        const date = new Date(timestamp);
        return date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    };

    return (
        <div className="container mx-auto px-4 py-6">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                    <Bell className="w-8 h-8 text-blue-600" />
                    Notifications
                </h1>
                <p className="text-gray-600 mt-2">Stay updated with your HR activities</p>
            </div>

            {/* Stats Cards */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                            </div>
                            <Bell className="w-10 h-10 text-blue-500 opacity-20" />
                        </div>
                    </div>
                    
                    <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Unread</p>
                                <p className="text-2xl font-bold text-orange-600">{stats.unread}</p>
                            </div>
                            <AlertCircle className="w-10 h-10 text-orange-500 opacity-20" />
                        </div>
                    </div>
                    
                    <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Read</p>
                                <p className="text-2xl font-bold text-green-600">{stats.read}</p>
                            </div>
                            <CheckCircle className="w-10 h-10 text-green-500 opacity-20" />
                        </div>
                    </div>
                    
                    <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Last 30 Days</p>
                                <p className="text-2xl font-bold text-purple-600">
                                    {Object.values(stats.by_type).reduce((a, b) => a + b, 0)}
                                </p>
                            </div>
                            <TrendingUp className="w-10 h-10 text-purple-500 opacity-20" />
                        </div>
                    </div>
                </div>
            )}

            {/* Filters and Actions */}
            <div className="bg-white rounded-lg shadow border border-gray-200 mb-6">
                <div className="p-4 border-b border-gray-200">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        {/* Filter Tabs */}
                        <div className="flex gap-2">
                            <button
                                onClick={() => setFilter('all')}
                                className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                                    filter === 'all'
                                        ? 'bg-blue-600 text-white font-medium'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                All
                            </button>
                            <button
                                onClick={() => setFilter('unread')}
                                className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                                    filter === 'unread'
                                        ? 'bg-blue-600 text-white font-medium'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                Unread {stats && stats.unread > 0 && `(${stats.unread})`}
                            </button>
                            <button
                                onClick={() => setFilter('read')}
                                className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                                    filter === 'read'
                                        ? 'bg-blue-600 text-white font-medium'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                Read
                            </button>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                            {stats && stats.unread > 0 && (
                                <button
                                    onClick={markAllAsRead}
                                    className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                                >
                                    <Check className="w-4 h-4" />
                                    Mark all read
                                </button>
                            )}
                            {stats && stats.read > 0 && (
                                <button
                                    onClick={clearRead}
                                    className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    Clear read
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Notifications List */}
                <div className="divide-y divide-gray-200">
                    {loading ? (
                        <div className="flex items-center justify-center p-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        </div>
                    ) : error ? (
                        <div className="p-6">
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                <div className="flex items-center gap-2 text-red-800">
                                    <AlertCircle className="w-5 h-5" />
                                    <span>{error}</span>
                                </div>
                            </div>
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-12 text-center">
                            <Bell className="w-16 h-16 text-gray-300 mb-4" />
                            <p className="text-lg text-gray-600 font-medium">No notifications</p>
                            <p className="text-sm text-gray-400 mt-2">You're all caught up!</p>
                        </div>
                    ) : (
                        notifications.map((notification) => (
                            <div
                                key={notification.id}
                                className={`p-6 hover:bg-gray-50 transition-colors cursor-pointer group ${
                                    !notification.read_at ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''
                                }`}
                                onClick={() => handleNotificationClick(notification)}
                            >
                                <div className="flex gap-4">
                                    {/* Icon */}
                                    <div className="flex-shrink-0">
                                        {getNotificationIcon(notification)}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex-1">
                                                <h3 className="text-base font-semibold text-gray-900">
                                                    {notification.data.title}
                                                </h3>
                                                <p className="text-sm text-gray-600 mt-1">
                                                    {notification.data.message}
                                                </p>
                                            </div>
                                            {!notification.read_at && (
                                                <span className="flex-shrink-0 w-3 h-3 bg-blue-600 rounded-full"></span>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-3 mt-3">
                                            <Calendar className="w-4 h-4 text-gray-400" />
                                            <span className="text-sm text-gray-500">
                                                {formatTimestamp(notification.created_at)}
                                            </span>
                                            {notification.data.priority && notification.data.priority !== 'medium' && (
                                                <span className={`text-xs px-2 py-1 rounded-full border font-medium ${getPriorityColor(notification.data.priority)}`}>
                                                    {notification.data.priority.toUpperCase()}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex-shrink-0 flex items-start gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        {!notification.read_at && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    markAsRead(notification.id);
                                                }}
                                                className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                                                title="Mark as read"
                                            >
                                                <Check className="w-5 h-5" />
                                            </button>
                                        )}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                deleteNotification(notification.id);
                                            }}
                                            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                                            title="Delete"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
