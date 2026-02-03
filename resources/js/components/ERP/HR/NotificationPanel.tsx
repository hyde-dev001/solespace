import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, X, Trash2, Filter, Calendar, AlertCircle, CheckCircle, Info, Clock } from 'lucide-react';

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

interface NotificationPanelProps {
    className?: string;
}

export default function NotificationPanel({ className = '' }: NotificationPanelProps) {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const panelRef = useRef<HTMLDivElement>(null);

    // Load notifications
    const loadNotifications = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await fetch(`/api/hr/notifications?filter=${filter}`, {
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

    // Load unread count
    const loadUnreadCount = async () => {
        try {
            const response = await fetch('/api/hr/notifications/unread-count', {
                credentials: 'include',
                headers: {
                    'Accept': 'application/json',
                }
            });

            if (response.ok) {
                const data = await response.json();
                setUnreadCount(data.unread_count || 0);
            }
        } catch (err) {
            console.error('Failed to load unread count:', err);
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
                setUnreadCount(prev => Math.max(0, prev - 1));
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
                setUnreadCount(0);
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
                loadUnreadCount(); // Refresh count
            }
        } catch (err) {
            console.error('Failed to delete notification:', err);
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

    // Close panel when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    // Load notifications when panel opens or filter changes
    useEffect(() => {
        if (isOpen) {
            loadNotifications();
        }
    }, [isOpen, filter]);

    // Load unread count on mount and every 30 seconds
    useEffect(() => {
        loadUnreadCount();
        const interval = setInterval(loadUnreadCount, 30000);
        return () => clearInterval(interval);
    }, []);

    // Get icon based on notification type
    const getNotificationIcon = (notification: Notification) => {
        const type = notification.data.type;
        const priority = notification.data.priority;

        if (type.includes('approved')) {
            return <CheckCircle className="w-5 h-5 text-green-500" />;
        } else if (type.includes('rejected')) {
            return <X className="w-5 h-5 text-red-500" />;
        } else if (type.includes('expiring') || priority === 'critical') {
            return <AlertCircle className="w-5 h-5 text-red-500" />;
        } else if (type.includes('due')) {
            return <Clock className="w-5 h-5 text-yellow-500" />;
        } else {
            return <Info className="w-5 h-5 text-blue-500" />;
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
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (diffInSeconds < 60) {
            return 'Just now';
        } else if (diffInSeconds < 3600) {
            const minutes = Math.floor(diffInSeconds / 60);
            return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
        } else if (diffInSeconds < 86400) {
            const hours = Math.floor(diffInSeconds / 3600);
            return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        } else if (diffInSeconds < 604800) {
            const days = Math.floor(diffInSeconds / 86400);
            return `${days} day${days > 1 ? 's' : ''} ago`;
        } else {
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        }
    };

    return (
        <div className={`relative ${className}`} ref={panelRef}>
            {/* Bell Icon Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Notifications"
            >
                <Bell className="w-6 h-6" />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Notification Panel */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-[600px] flex flex-col">
                    {/* Header */}
                    <div className="p-4 border-b border-gray-200">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllAsRead}
                                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                                >
                                    Mark all read
                                </button>
                            )}
                        </div>

                        {/* Filter Tabs */}
                        <div className="flex gap-2">
                            <button
                                onClick={() => setFilter('all')}
                                className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                                    filter === 'all'
                                        ? 'bg-blue-100 text-blue-700 font-medium'
                                        : 'text-gray-600 hover:bg-gray-100'
                                }`}
                            >
                                All
                            </button>
                            <button
                                onClick={() => setFilter('unread')}
                                className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                                    filter === 'unread'
                                        ? 'bg-blue-100 text-blue-700 font-medium'
                                        : 'text-gray-600 hover:bg-gray-100'
                                }`}
                            >
                                Unread ({unreadCount})
                            </button>
                            <button
                                onClick={() => setFilter('read')}
                                className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                                    filter === 'read'
                                        ? 'bg-blue-100 text-blue-700 font-medium'
                                        : 'text-gray-600 hover:bg-gray-100'
                                }`}
                            >
                                Read
                            </button>
                        </div>
                    </div>

                    {/* Notifications List */}
                    <div className="flex-1 overflow-y-auto">
                        {loading ? (
                            <div className="flex items-center justify-center p-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            </div>
                        ) : error ? (
                            <div className="p-4">
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                    <div className="flex items-center gap-2 text-red-800">
                                        <AlertCircle className="w-5 h-5" />
                                        <span>{error}</span>
                                    </div>
                                </div>
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="flex flex-col items-center justify-center p-8 text-center">
                                <Bell className="w-12 h-12 text-gray-300 mb-3" />
                                <p className="text-gray-500 font-medium">No notifications</p>
                                <p className="text-sm text-gray-400 mt-1">You're all caught up!</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-200">
                                {notifications.map((notification) => (
                                    <div
                                        key={notification.id}
                                        className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer group ${
                                            !notification.read_at ? 'bg-blue-50' : ''
                                        }`}
                                        onClick={() => handleNotificationClick(notification)}
                                    >
                                        <div className="flex gap-3">
                                            {/* Icon */}
                                            <div className="flex-shrink-0 mt-1">
                                                {getNotificationIcon(notification)}
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2">
                                                    <h4 className="text-sm font-semibold text-gray-900 truncate">
                                                        {notification.data.title}
                                                    </h4>
                                                    {!notification.read_at && (
                                                        <span className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full"></span>
                                                    )}
                                                </div>
                                                
                                                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                                    {notification.data.message}
                                                </p>

                                                <div className="flex items-center gap-2 mt-2">
                                                    <span className="text-xs text-gray-500">
                                                        {formatTimestamp(notification.created_at)}
                                                    </span>
                                                    {notification.data.priority && notification.data.priority !== 'medium' && (
                                                        <span className={`text-xs px-2 py-0.5 rounded-full border ${getPriorityColor(notification.data.priority)}`}>
                                                            {notification.data.priority.toUpperCase()}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Delete Button */}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    deleteNotification(notification.id);
                                                }}
                                                className="flex-shrink-0 opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-600 transition-opacity"
                                                aria-label="Delete notification"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    {notifications.length > 0 && (
                        <div className="p-3 border-t border-gray-200 text-center">
                            <a
                                href="/erp/hr/notifications"
                                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                            >
                                View all notifications
                            </a>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
