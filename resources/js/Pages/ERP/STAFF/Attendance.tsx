import { Head } from '@inertiajs/react';
import AppLayoutERP from '../../../layout/AppLayout_ERP';
import TimeIn from '../../../components/ERP/STAFF/timeIn';

export default function Attendance() {
    return (
        <AppLayoutERP>
            <Head title="Attendance - Solespace ERP" />

            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
                <div className="max-w-full">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Attendance</h1>
                        <p className="text-gray-600 dark:text-gray-400">Clock in/out and view your attendance history.</p>
                    </div>

                    <div className="bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm p-6">
                        {/* Render the TimeIn component (user's existing implementation) */}
                        <TimeIn />
                    </div>
                </div>
            </div>
        </AppLayoutERP>
    );
}
