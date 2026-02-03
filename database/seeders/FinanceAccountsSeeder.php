<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class FinanceAccountsSeeder extends Seeder
{
    public function run()
    {
        $shopId = 1; // Default shop_id
        
        $accounts = [
            // ASSET ACCOUNTS (1000-1999)
            [
                'code' => '1000',
                'name' => 'Cash',
                'type' => 'Asset',
                'normal_balance' => 'Debit',
                'group' => 'Current Assets',
                'balance' => 50000.00,
                'active' => true,
                'shop_id' => $shopId,
            ],
            [
                'code' => '1100',
                'name' => 'Petty Cash',
                'type' => 'Asset',
                'normal_balance' => 'Debit',
                'group' => 'Current Assets',
                'balance' => 5000.00,
                'active' => true,
                'shop_id' => $shopId,
            ],
            [
                'code' => '1200',
                'name' => 'Bank - Current Account',
                'type' => 'Asset',
                'normal_balance' => 'Debit',
                'group' => 'Current Assets',
                'balance' => 250000.00,
                'active' => true,
                'shop_id' => $shopId,
            ],
            [
                'code' => '1300',
                'name' => 'Accounts Receivable',
                'type' => 'Asset',
                'normal_balance' => 'Debit',
                'group' => 'Current Assets',
                'balance' => 75000.00,
                'active' => true,
                'shop_id' => $shopId,
            ],
            [
                'code' => '1400',
                'name' => 'Inventory',
                'type' => 'Asset',
                'normal_balance' => 'Debit',
                'group' => 'Current Assets',
                'balance' => 150000.00,
                'active' => true,
                'shop_id' => $shopId,
            ],
            [
                'code' => '1500',
                'name' => 'Prepaid Expenses',
                'type' => 'Asset',
                'normal_balance' => 'Debit',
                'group' => 'Current Assets',
                'balance' => 10000.00,
                'active' => true,
                'shop_id' => $shopId,
            ],
            [
                'code' => '1800',
                'name' => 'Equipment',
                'type' => 'Asset',
                'normal_balance' => 'Debit',
                'group' => 'Fixed Assets',
                'balance' => 500000.00,
                'active' => true,
                'shop_id' => $shopId,
            ],
            
            // LIABILITY ACCOUNTS (2000-2999)
            [
                'code' => '2000',
                'name' => 'Accounts Payable',
                'type' => 'Liability',
                'normal_balance' => 'Credit',
                'group' => 'Current Liabilities',
                'balance' => 45000.00,
                'active' => true,
                'shop_id' => $shopId,
            ],
            [
                'code' => '2100',
                'name' => 'Accrued Expenses',
                'type' => 'Liability',
                'normal_balance' => 'Credit',
                'group' => 'Current Liabilities',
                'balance' => 15000.00,
                'active' => true,
                'shop_id' => $shopId,
            ],
            [
                'code' => '2200',
                'name' => 'VAT Payable',
                'type' => 'Liability',
                'normal_balance' => 'Credit',
                'group' => 'Current Liabilities',
                'balance' => 12000.00,
                'active' => true,
                'shop_id' => $shopId,
            ],
            [
                'code' => '2300',
                'name' => 'Loans Payable',
                'type' => 'Liability',
                'normal_balance' => 'Credit',
                'group' => 'Long-term Liabilities',
                'balance' => 200000.00,
                'active' => true,
                'shop_id' => $shopId,
            ],
            
            // EQUITY ACCOUNTS (3000-3999)
            [
                'code' => '3000',
                'name' => 'Owner\'s Capital',
                'type' => 'Equity',
                'normal_balance' => 'Credit',
                'group' => 'Equity',
                'balance' => 500000.00,
                'active' => true,
                'shop_id' => $shopId,
            ],
            [
                'code' => '3100',
                'name' => 'Retained Earnings',
                'type' => 'Equity',
                'normal_balance' => 'Credit',
                'group' => 'Equity',
                'balance' => 150000.00,
                'active' => true,
                'shop_id' => $shopId,
            ],
            [
                'code' => '3200',
                'name' => 'Owner\'s Drawings',
                'type' => 'Equity',
                'normal_balance' => 'Debit',
                'group' => 'Equity',
                'balance' => 0.00,
                'active' => true,
                'shop_id' => $shopId,
            ],
            
            // REVENUE ACCOUNTS (4000-4999)
            [
                'code' => '4000',
                'name' => 'Sales Revenue',
                'type' => 'Revenue',
                'normal_balance' => 'Credit',
                'group' => 'Revenue',
                'balance' => 0.00,
                'active' => true,
                'shop_id' => $shopId,
            ],
            [
                'code' => '4100',
                'name' => 'Service Revenue',
                'type' => 'Revenue',
                'normal_balance' => 'Credit',
                'group' => 'Revenue',
                'balance' => 0.00,
                'active' => true,
                'shop_id' => $shopId,
            ],
            [
                'code' => '4200',
                'name' => 'Discount Revenue',
                'type' => 'Revenue',
                'normal_balance' => 'Credit',
                'group' => 'Revenue',
                'balance' => 0.00,
                'active' => true,
                'shop_id' => $shopId,
            ],
            [
                'code' => '4900',
                'name' => 'Other Income',
                'type' => 'Revenue',
                'normal_balance' => 'Credit',
                'group' => 'Revenue',
                'balance' => 0.00,
                'active' => true,
                'shop_id' => $shopId,
            ],
            
            // EXPENSE ACCOUNTS (5000-5999)
            [
                'code' => '5000',
                'name' => 'Cost of Goods Sold',
                'type' => 'Expense',
                'normal_balance' => 'Debit',
                'group' => 'Cost of Sales',
                'balance' => 0.00,
                'active' => true,
                'shop_id' => $shopId,
            ],
            [
                'code' => '5100',
                'name' => 'Salaries Expense',
                'type' => 'Expense',
                'normal_balance' => 'Debit',
                'group' => 'Operating Expenses',
                'balance' => 0.00,
                'active' => true,
                'shop_id' => $shopId,
            ],
            [
                'code' => '5200',
                'name' => 'Rent Expense',
                'type' => 'Expense',
                'normal_balance' => 'Debit',
                'group' => 'Operating Expenses',
                'balance' => 0.00,
                'active' => true,
                'shop_id' => $shopId,
            ],
            [
                'code' => '5300',
                'name' => 'Utilities Expense',
                'type' => 'Expense',
                'normal_balance' => 'Debit',
                'group' => 'Operating Expenses',
                'balance' => 0.00,
                'active' => true,
                'shop_id' => $shopId,
            ],
            [
                'code' => '5400',
                'name' => 'Office Supplies Expense',
                'type' => 'Expense',
                'normal_balance' => 'Debit',
                'group' => 'Operating Expenses',
                'balance' => 0.00,
                'active' => true,
                'shop_id' => $shopId,
            ],
            [
                'code' => '5500',
                'name' => 'Marketing & Advertising',
                'type' => 'Expense',
                'normal_balance' => 'Debit',
                'group' => 'Operating Expenses',
                'balance' => 0.00,
                'active' => true,
                'shop_id' => $shopId,
            ],
            [
                'code' => '5600',
                'name' => 'Depreciation Expense',
                'type' => 'Expense',
                'normal_balance' => 'Debit',
                'group' => 'Operating Expenses',
                'balance' => 0.00,
                'active' => true,
                'shop_id' => $shopId,
            ],
            [
                'code' => '5700',
                'name' => 'Interest Expense',
                'type' => 'Expense',
                'normal_balance' => 'Debit',
                'group' => 'Financial Expenses',
                'balance' => 0.00,
                'active' => true,
                'shop_id' => $shopId,
            ],
            [
                'code' => '5800',
                'name' => 'Bank Charges',
                'type' => 'Expense',
                'normal_balance' => 'Debit',
                'group' => 'Financial Expenses',
                'balance' => 0.00,
                'active' => true,
                'shop_id' => $shopId,
            ],
            [
                'code' => '5900',
                'name' => 'Miscellaneous Expense',
                'type' => 'Expense',
                'normal_balance' => 'Debit',
                'group' => 'Operating Expenses',
                'balance' => 0.00,
                'active' => true,
                'shop_id' => $shopId,
            ],
        ];

        foreach ($accounts as $account) {
            // Check if account exists first
            $exists = DB::table('finance_accounts')
                ->where('code', $account['code'])
                ->where('shop_id', $shopId)
                ->exists();
                
            if (!$exists) {
                DB::table('finance_accounts')->insert(
                    array_merge($account, [
                        'created_at' => now(),
                        'updated_at' => now(),
                    ])
                );
            }
        }

        $this->command->info('Finance accounts seeded successfully!');
    }
}
