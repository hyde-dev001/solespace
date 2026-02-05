<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RolesAndPermissionsSeeder extends Seeder
{
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        $this->command->info('Creating simplified permissions for user guard...');

        // ===== ALL PERMISSIONS (to be assigned selectively to Staff based on position) =====
        
        $allPermissions = [
            // Finance
            'view-expenses', 'create-expenses', 'edit-expenses', 'delete-expenses', 'approve-expenses',
            'view-invoices', 'create-invoices', 'edit-invoices', 'delete-invoices', 'send-invoices',
            'view-finance-reports', 'export-finance-reports', 'view-finance-audit-logs',
            
            // HR
            'view-employees', 'create-employees', 'edit-employees', 'delete-employees', 'approve-employee-changes',
            'view-attendance', 'create-attendance', 'edit-attendance', 'approve-timeoff',
            'view-payroll', 'process-payroll', 'approve-payroll', 'generate-payslip',
            'view-hr-reports', 'export-hr-reports', 'view-hr-audit-logs',
            
            // CRM
            'view-customers', 'create-customers', 'edit-customers', 'delete-customers',
            'view-leads', 'create-leads', 'edit-leads', 'convert-leads', 'assign-leads',
            'view-opportunities', 'create-opportunities', 'edit-opportunities', 'close-opportunities',
            'view-crm-reports', 'export-crm-reports', 'view-crm-audit-logs',
            
            // Management
            'view-all-users', 'create-users', 'edit-users', 'delete-users', 'assign-roles',
            'view-products', 'create-products', 'edit-products', 'delete-products', 'manage-inventory',
            'view-pricing', 'edit-pricing', 'manage-service-pricing',
            'view-all-audit-logs', 'view-system-reports', 'manage-shop-settings',
            
            // Job Orders
            'view-job-orders', 'create-job-orders', 'edit-job-orders', 'complete-job-orders',
            
            // General
            'view-dashboard',
        ];

        foreach ($allPermissions as $permission) {
            Permission::firstOrCreate(
                ['name' => $permission, 'guard_name' => 'user']
            );
        }

        $this->command->info('Created ' . count($allPermissions) . ' permissions.');

        // ===== CREATE SIMPLIFIED ROLES =====

        $this->command->info('Creating Manager and Staff roles...');

        // Manager Role - Full Access
        $manager = Role::firstOrCreate(['name' => 'Manager', 'guard_name' => 'user']);
        $manager->syncPermissions(Permission::where('guard_name', 'user')->pluck('name'));
        $this->command->info('✓ Manager role created with ALL ' . $manager->permissions->count() . ' permissions');

        // Staff Role - Basic Access (permissions assigned per position)
        $staff = Role::firstOrCreate(['name' => 'Staff', 'guard_name' => 'user']);
        $staff->syncPermissions([
            'view-dashboard',
            'view-job-orders',
        ]);
        $this->command->info('✓ Staff role created with basic permissions (configure more via position)');

        // ===== SHOP OWNER GUARD =====
        
        $this->command->info('Creating Shop Owner role...');
        
        // Shop Owner gets all permissions for their guard
        $shopOwnerRole = Role::firstOrCreate(['name' => 'Shop Owner', 'guard_name' => 'shop_owner']);
        // Shop owners have full access to their shop - permissions checked at controller level
        $this->command->info('✓ Shop Owner role created (full access)');

        // ===== SUPER ADMIN GUARD =====
        
        $this->command->info('Creating Super Admin role...');
        
        $superAdminRole = Role::firstOrCreate(['name' => 'Super Admin', 'guard_name' => 'super_admin']);
        // Super admins have full system access
        $this->command->info('✓ Super Admin role created (full system access)');

        $this->command->info('');
        $this->command->info('========================================');
        $this->command->info('✅ SIMPLIFIED ROLE SYSTEM CREATED!');
        $this->command->info('========================================');
        $this->command->info('Total Roles: ' . Role::count());
        $this->command->info('Total Permissions: ' . Permission::count());
        $this->command->info('');
        $this->command->info('User Guard Roles:');
        $this->command->info('  - Manager (ALL ' . $manager->permissions->count() . ' permissions)');
        $this->command->info('  - Staff (' . $staff->permissions->count() . ' base permissions + configurable via positions)');
        $this->command->info('');
        $this->command->info('Shop Owner Guard Roles:');
        $this->command->info('  - Shop Owner (full access)');
        $this->command->info('');
        $this->command->info('Super Admin Guard Roles:');
        $this->command->info('  - Super Admin (full system access)');
        $this->command->info('========================================');
    }
}
