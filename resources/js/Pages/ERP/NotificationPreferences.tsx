import React from 'react';
import { BellIcon, EnvelopeIcon } from '@heroicons/react/24/outline';
import { useNotificationPreferences, useUpdatePreferences, type NotificationPreferences } from '@/hooks/useNotifications';
import AppLayoutERP from '@/layout/AppLayout_ERP';

export default function NotificationPreferencesPage() {
    const { data: preferences, isLoading } = useNotificationPreferences();
    const updatePreferences = useUpdatePreferences();

    const handleToggle = (key: keyof NotificationPreferences) => {
        if (!preferences) return;

        updatePreferences.mutate({
            ...preferences,
            [key]: !preferences[key],
        });
    };

    const notificationTypes = [
        {
            key: 'expense_approval' as const,
            title: 'Expense Approvals',
            description: 'Get notified when expenses require your approval',
            icon: '💰',
        },
        {
            key: 'leave_approval' as const,
            title: 'Leave Requests',
            description: 'Get notified when staff submit leave requests',
            icon: '🏖️',
        },
        {
            key: 'invoice_created' as const,
            title: 'Invoice Generation',
            description: 'Get notified when invoices are auto-generated from jobs',
            icon: '📄',
        },
        {
            key: 'delegation_assigned' as const,
            title: 'Delegation Assignments',
            description: 'Get notified when approval authority is delegated to you',
            icon: '👥',
        },
    ];

    if (isLoading) {
        return (
            <AppLayoutERP>
                <div className="p-8 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600 dark:text-gray-400">Loading preferences...</p>
                </div>
            </AppLayoutERP>
        );
    }

    return (
        <AppLayoutERP>
            <div className="max-w-4xl mx-auto p-6">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Notification Preferences
                    </h1>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">
                        Customize how you receive notifications for different events
                    </p>
                </div>

                <div className="space-y-6">
                    {notificationTypes.map((type) => (
                        <div
                            key={type.key}
                            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
                        >
                            <div className="flex items-start gap-4">
                                <div className="text-4xl">{type.icon}</div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                        {type.title}
                                    </h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                        {type.description}
                                    </p>

                                    <div className="mt-4 space-y-3">
                                        {/* Browser Notification Toggle */}
                                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <BellIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                                                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                                                    In-App Notifications
                                                </span>
                                            </div>
                                            <button
                                                onClick={() => handleToggle(`browser_${type.key}` as keyof NotificationPreferences)}
                                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                                    preferences?.[`browser_${type.key}` as keyof NotificationPreferences]
                                                        ? 'bg-indigo-600'
                                                        : 'bg-gray-300 dark:bg-gray-600'
                                                }`}
                                            >
                                                <span
                                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                                        preferences?.[`browser_${type.key}` as keyof NotificationPreferences]
                                                            ? 'translate-x-6'
                                                            : 'translate-x-1'
                                                    }`}
                                                />
                                            </button>
                                        </div>

                                        {/* Email Notification Toggle */}
                                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <EnvelopeIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                                                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                                                    Email Notifications
                                                </span>
                                            </div>
                                            <button
                                                onClick={() => handleToggle(`email_${type.key}` as keyof NotificationPreferences)}
                                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                                    preferences?.[`email_${type.key}` as keyof NotificationPreferences]
                                                        ? 'bg-indigo-600'
                                                        : 'bg-gray-300 dark:bg-gray-600'
                                                }`}
                                            >
                                                <span
                                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                                        preferences?.[`email_${type.key}` as keyof NotificationPreferences]
                                                            ? 'translate-x-6'
                                                            : 'translate-x-1'
                                                    }`}
                                                />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                        <strong>Note:</strong> Email notifications are sent only for critical actions that require immediate attention.
                        In-app notifications are shown in real-time while you're logged in.
                    </p>
                </div>
            </div>
        </AppLayoutERP>
    );
}
