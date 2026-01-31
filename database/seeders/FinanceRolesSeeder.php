<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Employee;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class FinanceRolesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $shopOwnerId = 1; // Default shop owner

        DB::transaction(function () use ($shopOwnerId) {
            // 1. Finance Staff (Can create transactions, cannot approve)
            $financeStaffUser = User::firstOrCreate(
                ['email' => 'finance.staff@test.com'],
                [
                    'name' => 'Jane Staff',
                    'password' => Hash::make('password'),
                    'role' => 'FINANCE_STAFF',
                    'shop_owner_id' => $shopOwnerId,
                    'approval_limit' => 0,
                    'status' => 'active',
                    'force_password_change' => false,
                ]
            );

            // Create corresponding Employee record
            Employee::firstOrCreate(
                ['email' => 'finance.staff@test.com'],
                [
                    'shop_owner_id' => $shopOwnerId,
                    'name' => 'Jane Staff',
                    'phone' => '',
                    'position' => 'Finance Staff',
                    'department' => 'Finance',
                    'salary' => 0,
                    'hire_date' => now()->toDateString(),
                    'status' => 'active',
                ]
            );

            // 2. Finance Manager (Unlimited approval authority)
            $financeManagerUser = User::firstOrCreate(
                ['email' => 'finance.manager@test.com'],
                [
                    'name' => 'John Manager',
                    'password' => Hash::make('password'),
                    'role' => 'FINANCE_MANAGER',
                    'shop_owner_id' => $shopOwnerId,
                    'approval_limit' => null, // Unlimited
                    'status' => 'active',
                    'force_password_change' => false,
                ]
            );

            // Create corresponding Employee record
            Employee::firstOrCreate(
                ['email' => 'finance.manager@test.com'],
                [
                    'shop_owner_id' => $shopOwnerId,
                    'name' => 'John Manager',
                    'phone' => '',
                    'position' => 'Finance Manager',
                    'department' => 'Finance',
                    'salary' => 0,
                    'hire_date' => now()->toDateString(),
                    'status' => 'active',
                ]
            );
        });

        $this->command->info('Finance roles created successfully!');
        $this->command->info('Test Accounts:');
        $this->command->info('  Finance Staff: finance.staff@test.com / password');
        $this->command->info('  Finance Manager: finance.manager@test.com / password (Unlimited approval authority)');
    }
}
