<?php

namespace App\Http\Controllers\Erp;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ManagerController extends Controller
{
    /**
     * Display the manager dashboard
     */
    public function dashboard()
    {
        return Inertia::render('ERP/Manager/Dashboard', [
            'title' => 'Manager Dashboard',
        ]);
    }

    /**
     * Display user management page
     */
    public function userManagement()
    {
        return Inertia::render('ERP/Manager/UserManagement', [
            'title' => 'User Management',
        ]);
    }

    /**
     * Display reports page
     */
    public function reports()
    {
        return Inertia::render('ERP/Manager/Reports', [
            'title' => 'Reports',
        ]);
    }

    /**
     * Display approvals page
     */
    public function approvals()
    {
        return Inertia::render('ERP/Manager/Approvals', [
            'title' => 'Approvals',
        ]);
    }

    /**
     * Display inventory overview
     */
    public function inventoryOverview()
    {
        return Inertia::render('ERP/Manager/InventoryOverview', [
            'title' => 'Inventory Overview',
        ]);
    }

    /**
     * Display pricing and services
     */
    public function pricingAndServices()
    {
        return Inertia::render('ERP/Manager/PricingAndServices', [
            'title' => 'Pricing & Services',
        ]);
    }

    /**
     * Display audit logs
     */
    public function auditLogs()
    {
        return Inertia::render('ERP/Manager/AuditLogs', [
            'title' => 'Audit Logs',
        ]);
    }
}
