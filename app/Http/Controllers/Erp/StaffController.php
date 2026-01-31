<?php

namespace App\Http\Controllers\Erp;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class StaffController extends Controller
{
    /**
     * Display the staff dashboard (accessible by both MANAGER and STAFF)
     */
    public function dashboard()
    {
        return Inertia::render('ERP/STAFF/Dashboard', [
            'title' => 'Staff Dashboard',
        ]);
    }

    /**
     * Display customers page
     */
    public function customers()
    {
        return Inertia::render('ERP/STAFF/Customers', [
            'title' => 'Customers',
        ]);
    }

    /**
     * Display job orders page
     */
    public function jobOrders()
    {
        return Inertia::render('ERP/STAFF/JobOrders', [
            'title' => 'Job Orders',
        ]);
    }

    /**
     * Display payments page
     */
    public function payments()
    {
        return Inertia::render('ERP/STAFF/Payments', [
            'title' => 'Payments',
        ]);
    }

    /**
     * Display repair status page
     */
    public function repairStatus()
    {
        return Inertia::render('ERP/STAFF/RepairStatus', [
            'title' => 'Repair Status',
        ]);
    }
}
