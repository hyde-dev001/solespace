<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\ShopOwner;
use Illuminate\Database\Seeder;

/**
 * RoleSeeder
 * 
 * Creates default ERP module roles (HR, FINANCE, MANAGER, STAFF)
 * for each registered shop owner
 */
class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Define default roles and their permissions
        $defaultRoles = [
            'HR' => [
                'view_hr_dashboard',
                'manage_employees',
                'view_employees',
                'manage_payroll',
                'view_payroll',
                'manage_attendance',
                'view_attendance',
                'manage_leave_requests',
            ],
            'FINANCE' => [
                'view_finance_dashboard',
                'manage_invoices',
                'view_invoices',
                'manage_expenses',
                'view_expenses',
                'manage_accounts',
                'view_accounts',
                'generate_financial_reports',
            ],
            'CRM' => [
                'view_crm_dashboard',
                'manage_customers',
                'view_customers',
                'manage_leads',
                'view_leads',
                'manage_opportunities',
                'view_opportunities',
                'manage_sales_pipeline',
            ],
            'MANAGER' => [
                'view_dashboard',
                'view_employees',
                'view_payroll',
                'view_expenses',
                'view_orders',
                'manage_orders',
            ],
            'STAFF' => [
                'view_dashboard',
                'view_profile',
                'view_attendance',
            ],
        ];

        // Create roles for each approved shop owner
        $shopOwners = ShopOwner::where('status', 'approved')->get();

        foreach ($shopOwners as $shopOwner) {
            foreach ($defaultRoles as $roleName => $permissions) {
                // Check if role already exists for this shop
                $existingRole = Role::where('shop_owner_id', $shopOwner->id)
                    ->where('name', $roleName)
                    ->first();

                if (!$existingRole) {
                    Role::create([
                        'shop_owner_id' => $shopOwner->id,
                        'name' => $roleName,
                        'description' => $this->getRoleDescription($roleName),
                        'permissions' => $permissions,
                    ]);
                }
            }
        }
    }

    /**
     * Get description for each role
     */
    private function getRoleDescription($roleName): string
    {
        $descriptions = [
            'HR' => 'Human Resources module - manage employees, payroll, attendance, and leave requests',
            'FINANCE' => 'Finance module - manage invoices, expenses, accounts, and generate financial reports',
            'CRM' => 'Customer Relationship Management module - manage customers, leads, opportunities, and sales pipeline',
            'MANAGER' => 'Manager role - view dashboard and manage orders',
            'STAFF' => 'Staff role - basic access to dashboard and personal profile',
        ];

        return $descriptions[$roleName] ?? '';
    }
}
