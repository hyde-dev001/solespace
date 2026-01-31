<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Finance\Account;

class FinanceAccountSeeder extends Seeder
{
    public function run()
    {
        $accounts = [
            ['code' => '1000', 'name' => 'Cash & Cash Equivalents', 'type' => 'Asset', 'normal_balance' => 'Debit', 'group' => 'Current Assets', 'balance' => 48200, 'active' => true],
            ['code' => '1100', 'name' => 'Accounts Receivable', 'type' => 'Asset', 'normal_balance' => 'Debit', 'group' => 'Current Assets', 'balance' => 18950, 'active' => true],
            ['code' => '1200', 'name' => 'Inventory', 'type' => 'Asset', 'normal_balance' => 'Debit', 'group' => 'Current Assets', 'balance' => 26500, 'active' => true],
            ['code' => '2000', 'name' => 'Accounts Payable', 'type' => 'Liability', 'normal_balance' => 'Credit', 'group' => 'Current Liabilities', 'balance' => -14200, 'active' => true],
            ['code' => '3000', 'name' => 'Common Stock', 'type' => 'Equity', 'normal_balance' => 'Credit', 'group' => 'Equity', 'balance' => -50000, 'active' => true],
            ['code' => '4000', 'name' => 'Sales Revenue', 'type' => 'Revenue', 'normal_balance' => 'Credit', 'group' => 'Revenue', 'balance' => -89200, 'active' => true],
            ['code' => '5000', 'name' => 'Cost of Goods Sold', 'type' => 'Expense', 'normal_balance' => 'Debit', 'group' => 'Direct Costs', 'balance' => 52100, 'active' => true],
            ['code' => '6100', 'name' => 'Salaries & Wages', 'type' => 'Expense', 'normal_balance' => 'Debit', 'group' => 'Operating Expenses', 'balance' => 18350, 'active' => true],
        ];

        foreach ($accounts as $a) {
            Account::updateOrCreate(['code' => $a['code']], $a);
        }
    }
}
