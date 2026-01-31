import React from 'react';
import { Head } from '@inertiajs/react';
import AppLayoutERP from '../../../layout/AppLayout_ERP';

interface StaffDashboardProps {
    title: string;
}

const StaffDashboard: React.FC<StaffDashboardProps> = ({ title }) => {
    type Job = { id: number; title: string; customer: string; status: 'Active' | 'Pending' | 'Done' | 'Completed' };
    const sampleJobs: Job[] = [
        { id: 1, title: "Shoe Repair - Sarah's Nike", customer: "Sarah", status: 'Active' },
        { id: 2, title: "Cleaning Service - John's Sneakers", customer: "John", status: 'Completed' },
        { id: 3, title: "Heel Replacement - Mary's Heels", customer: "Mary", status: 'Pending' },
    ];

    const stats = { activeJobs: 5, pendingRepairs: 3, todaysPayments: 1250, totalCustomers: 28 };

    const statusBadge = (s: Job['status']) => {
        const base = 'px-3 py-1 rounded-full text-sm font-medium';
        switch (s) {
            case 'Active':
                return `${base} bg-blue-100 text-blue-800`;
            case 'Pending':
                return `${base} bg-yellow-100 text-yellow-800`;
            case 'Done':
            case 'Completed':
                return `${base} bg-green-100 text-green-800`;
            default:
                return `${base} bg-gray-100 text-gray-800`;
        }
    };

    return (
        <AppLayoutERP>
            
           
        </AppLayoutERP>
    );
};

export default StaffDashboard;
