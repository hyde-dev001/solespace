<?php

namespace App\Http\Controllers\Api\Finance;

use App\Http\Controllers\Controller;
use App\Models\Finance\Account;
use App\Models\Finance\JournalEntry;
use App\Models\Finance\JournalLine;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReportController extends Controller
{
    /**
     * Get Balance Sheet for a specific date
     * Assets = Liabilities + Equity
     */
    public function balanceSheet(Request $request)
    {
        $request->validate([
            'as_of_date' => 'nullable|date',
        ]);

        $asOfDate = $request->input('as_of_date', now()->format('Y-m-d'));

        // Get all accounts with their balances as of the date
        $shopOwnerId = auth()->user()->shop_owner_id ?? auth()->user()->id;
        $accounts = Account::with('parent')
            ->where(function($query) use ($shopOwnerId) {
                $query->where('shop_owner_id', $shopOwnerId)
                      ->orWhereNull('shop_owner_id');
            })
            ->get()
            ->map(function ($account) use ($asOfDate) {
                $balance = $this->getAccountBalance($account->id, $asOfDate);
                $account->balance = $balance;
                return $account;
            });

        // Group by account type
        $assets = $accounts->filter(fn($a) => $a->type === 'Asset')->values();
        $liabilities = $accounts->filter(fn($a) => $a->type === 'Liability')->values();
        $equity = $accounts->filter(fn($a) => $a->type === 'Equity')->values();

        $totalAssets = $assets->sum('balance');
        $totalLiabilities = $liabilities->sum('balance');
        $totalEquity = $equity->sum('balance');

        return response()->json([
            'as_of_date' => $asOfDate,
            'assets' => [
                'accounts' => $assets,
                'total' => $totalAssets,
            ],
            'liabilities' => [
                'accounts' => $liabilities,
                'total' => $totalLiabilities,
            ],
            'equity' => [
                'accounts' => $equity,
                'total' => $totalEquity,
            ],
            'summary' => [
                'total_assets' => $totalAssets,
                'total_liabilities_equity' => $totalLiabilities + $totalEquity,
                'balanced' => abs($totalAssets - ($totalLiabilities + $totalEquity)) < 0.01,
            ],
        ]);
    }

    /**
     * Get Profit & Loss Statement for a date range
     * Net Income = Revenues - Expenses
     */
    public function profitLoss(Request $request)
    {
        $request->validate([
            'from_date' => 'nullable|date',
            'to_date' => 'nullable|date',
        ]);

        $fromDate = $request->input('from_date', now()->startOfYear()->format('Y-m-d'));
        $toDate = $request->input('to_date', now()->format('Y-m-d'));

        // Get all accounts
        $shopOwnerId = auth()->user()->shop_owner_id ?? auth()->user()->id;
        $accounts = Account::where(function($query) use ($shopOwnerId) {
                $query->where('shop_owner_id', $shopOwnerId)
                      ->orWhereNull('shop_owner_id');
            })
            ->get()
            ->map(function ($account) use ($fromDate, $toDate) {
                $balance = $this->getAccountBalanceForPeriod($account->id, $fromDate, $toDate);
                $account->balance = $balance;
                return $account;
            });

        // Separate by type
        $revenues = $accounts->filter(fn($a) => $a->type === 'Revenue')->values();
        $expenses = $accounts->filter(fn($a) => $a->type === 'Expense')->values();

        $totalRevenues = $revenues->sum('balance');
        $totalExpenses = $expenses->sum('balance');
        $netIncome = $totalRevenues - $totalExpenses;

        return response()->json([
            'from_date' => $fromDate,
            'to_date' => $toDate,
            'revenues' => [
                'accounts' => $revenues,
                'total' => $totalRevenues,
            ],
            'expenses' => [
                'accounts' => $expenses,
                'total' => $totalExpenses,
            ],
            'summary' => [
                'total_revenues' => $totalRevenues,
                'total_expenses' => $totalExpenses,
                'net_income' => $netIncome,
            ],
        ]);
    }

    /**
     * Get Trial Balance
     * Verify debits = credits
     */
    public function trialBalance(Request $request)
    {
        $request->validate([
            'as_of_date' => 'nullable|date',
        ]);

        $asOfDate = $request->input('as_of_date', now()->format('Y-m-d'));

        $shopOwnerId = auth()->user()->shop_owner_id ?? auth()->user()->id;
        $accounts = Account::where(function($query) use ($shopOwnerId) {
                $query->where('shop_owner_id', $shopOwnerId)
                      ->orWhereNull('shop_owner_id');
            })
            ->get()
            ->map(function ($account) use ($asOfDate) {
                $balance = $this->getAccountBalance($account->id, $asOfDate);
                $account->debit = $balance > 0 ? $balance : 0;
                $account->credit = $balance < 0 ? abs($balance) : 0;
                return $account;
            })
            ->filter(fn($a) => $a->debit != 0 || $a->credit != 0)
            ->values();

        $totalDebits = $accounts->sum('debit');
        $totalCredits = $accounts->sum('credit');
        $balanced = abs($totalDebits - $totalCredits) < 0.01;

        return response()->json([
            'as_of_date' => $asOfDate,
            'accounts' => $accounts,
            'summary' => [
                'total_debits' => $totalDebits,
                'total_credits' => $totalCredits,
                'balanced' => $balanced,
                'difference' => abs($totalDebits - $totalCredits),
            ],
        ]);
    }

    /**
     * Get Accounts Receivable Aging
     */
    public function arAging(Request $request)
    {
        $request->validate([
            'as_of_date' => 'nullable|date',
        ]);

        $asOfDate = $request->input('as_of_date', now()->format('Y-m-d'));
        $shopOwnerId = auth()->user()->shop_owner_id ?? auth()->user()->id;

        // Get all AR/Asset accounts (receivables)
        $arAccounts = Account::where('type', 'Asset')
            ->where(function($query) use ($shopOwnerId) {
                $query->where('shop_owner_id', $shopOwnerId)
                      ->orWhereNull('shop_owner_id');
            })
            ->pluck('id');

        if ($arAccounts->isEmpty()) {
            return response()->json([
                'as_of_date' => $asOfDate,
                'buckets' => [
                    'current' => ['label' => 'Current (0-30 days)', 'items' => [], 'total' => 0],
                    'thirty_days' => ['label' => '31-60 days', 'items' => [], 'total' => 0],
                    'sixty_days' => ['label' => '61-90 days', 'items' => [], 'total' => 0],
                    'ninety_days' => ['label' => '91-120 days', 'items' => [], 'total' => 0],
                    'over_120' => ['label' => 'Over 120 days', 'items' => [], 'total' => 0],
                ],
                'summary' => ['total_ar' => 0],
            ]);
        }

        // Get journal lines for all AR accounts
        $lines = JournalLine::join('finance_journal_entries', 'finance_journal_lines.journal_entry_id', '=', 'finance_journal_entries.id')
            ->whereIn('finance_journal_lines.account_id', $arAccounts)
            ->where('finance_journal_entries.status', 'posted')
            ->where('finance_journal_entries.date', '<=', $asOfDate)
            ->orderBy('finance_journal_entries.date', 'desc')
            ->get(['finance_journal_lines.*', 'finance_journal_entries.date as entry_date', 'finance_journal_entries.reference']);

        // Bucket by days outstanding
        $now = \Carbon\Carbon::parse($asOfDate);
        $current = [];
        $thirtyDays = [];
        $sixtyDays = [];
        $ninetyDays = [];
        $over120 = [];

        foreach ($lines as $line) {
            $daysOld = $now->diffInDays(\Carbon\Carbon::parse($line->entry_date));
            $amount = $line->debit - $line->credit; // For AR, debit is positive

            if ($amount <= 0) continue; // Skip zero or credit balances

            $item = ['date' => $line->entry_date, 'reference' => $line->reference, 'amount' => $amount];

            if ($daysOld <= 30) {
                $current[] = $item;
            } elseif ($daysOld <= 60) {
                $thirtyDays[] = $item;
            } elseif ($daysOld <= 90) {
                $sixtyDays[] = $item;
            } elseif ($daysOld <= 120) {
                $ninetyDays[] = $item;
            } else {
                $over120[] = $item;
            }
        }

        return response()->json([
            'as_of_date' => $asOfDate,
            'buckets' => [
                'current' => [
                    'label' => 'Current (0-30 days)',
                    'items' => $current,
                    'total' => collect($current)->sum('amount'),
                ],
                'thirty_days' => [
                    'label' => '31-60 days',
                    'items' => $thirtyDays,
                    'total' => collect($thirtyDays)->sum('amount'),
                ],
                'sixty_days' => [
                    'label' => '61-90 days',
                    'items' => $sixtyDays,
                    'total' => collect($sixtyDays)->sum('amount'),
                ],
                'ninety_days' => [
                    'label' => '91-120 days',
                    'items' => $ninetyDays,
                    'total' => collect($ninetyDays)->sum('amount'),
                ],
                'over_120' => [
                    'label' => 'Over 120 days',
                    'items' => $over120,
                    'total' => collect($over120)->sum('amount'),
                ],
            ],
            'summary' => [
                'total_ar' => collect($current)->sum('amount') + collect($thirtyDays)->sum('amount') + collect($sixtyDays)->sum('amount') + collect($ninetyDays)->sum('amount') + collect($over120)->sum('amount'),
            ],
        ]);
    }

    /**
     * Get Accounts Payable Aging
     */
    public function apAging(Request $request)
    {
        $request->validate([
            'as_of_date' => 'nullable|date',
        ]);

        $asOfDate = $request->input('as_of_date', now()->format('Y-m-d'));
        $shopOwnerId = auth()->user()->shop_owner_id ?? auth()->user()->id;

        // Get all AP/Liability accounts (payables)
        $apAccounts = Account::where('type', 'Liability')
            ->where(function($query) use ($shopOwnerId) {
                $query->where('shop_owner_id', $shopOwnerId)
                      ->orWhereNull('shop_owner_id');
            })
            ->pluck('id');

        if ($apAccounts->isEmpty()) {
            return response()->json([
                'as_of_date' => $asOfDate,
                'buckets' => [
                    'current' => ['label' => 'Current (0-30 days)', 'items' => [], 'total' => 0],
                    'thirty_days' => ['label' => '31-60 days', 'items' => [], 'total' => 0],
                    'sixty_days' => ['label' => '61-90 days', 'items' => [], 'total' => 0],
                    'ninety_days' => ['label' => '91-120 days', 'items' => [], 'total' => 0],
                    'over_120' => ['label' => 'Over 120 days', 'items' => [], 'total' => 0],
                ],
                'summary' => ['total_ap' => 0],
            ]);
        }

        // Get journal lines for all AP accounts
        $lines = JournalLine::join('finance_journal_entries', 'finance_journal_lines.journal_entry_id', '=', 'finance_journal_entries.id')
            ->whereIn('finance_journal_lines.account_id', $apAccounts)
            ->where('finance_journal_entries.status', 'posted')
            ->where('finance_journal_entries.date', '<=', $asOfDate)
            ->orderBy('finance_journal_entries.date', 'desc')
            ->get(['finance_journal_lines.*', 'finance_journal_entries.date as entry_date', 'finance_journal_entries.reference']);

        // Bucket by days outstanding
        $now = \Carbon\Carbon::parse($asOfDate);
        $current = [];
        $thirtyDays = [];
        $sixtyDays = [];
        $ninetyDays = [];
        $over120 = [];

        foreach ($lines as $line) {
            $daysOld = $now->diffInDays(\Carbon\Carbon::parse($line->entry_date));
            $amount = $line->credit - $line->debit; // For AP, credit is positive

            if ($amount <= 0) continue; // Skip zero or debit balances

            $item = ['date' => $line->entry_date, 'reference' => $line->reference, 'amount' => $amount];

            if ($daysOld <= 30) {
                $current[] = $item;
            } elseif ($daysOld <= 60) {
                $thirtyDays[] = $item;
            } elseif ($daysOld <= 90) {
                $sixtyDays[] = $item;
            } elseif ($daysOld <= 120) {
                $ninetyDays[] = $item;
            } else {
                $over120[] = $item;
            }
        }

        return response()->json([
            'as_of_date' => $asOfDate,
            'buckets' => [
                'current' => [
                    'label' => 'Current (0-30 days)',
                    'items' => $current,
                    'total' => collect($current)->sum('amount'),
                ],
                'thirty_days' => [
                    'label' => '31-60 days',
                    'items' => $thirtyDays,
                    'total' => collect($thirtyDays)->sum('amount'),
                ],
                'sixty_days' => [
                    'label' => '61-90 days',
                    'items' => $sixtyDays,
                    'total' => collect($sixtyDays)->sum('amount'),
                ],
                'ninety_days' => [
                    'label' => '91-120 days',
                    'items' => $ninetyDays,
                    'total' => collect($ninetyDays)->sum('amount'),
                ],
                'over_120' => [
                    'label' => 'Over 120 days',
                    'items' => $over120,
                    'total' => collect($over120)->sum('amount'),
                ],
            ],
            'summary' => [
                'total_ap' => collect($current)->sum('amount') + collect($thirtyDays)->sum('amount') + collect($sixtyDays)->sum('amount') + collect($ninetyDays)->sum('amount') + collect($over120)->sum('amount'),
            ],
        ]);
    }

    /**
     * Helper: Get account balance as of a specific date
     * For Assets/Expenses: Balance = Debits - Credits
     * For Liabilities/Equity/Revenue: Balance = Credits - Debits
     */
    private function getAccountBalance($accountId, $asOfDate)
    {
        // Get the account's current balance from the database
        $account = Account::find($accountId);
        if (!$account) {
            return 0;
        }

        // Get journal entries that affect this balance
        $lines = JournalLine::join('finance_journal_entries', 'finance_journal_lines.journal_entry_id', '=', 'finance_journal_entries.id')
            ->where('finance_journal_lines.account_id', $accountId)
            ->where('finance_journal_entries.status', 'posted')
            ->where('finance_journal_entries.date', '<=', $asOfDate)
            ->get(['finance_journal_lines.debit', 'finance_journal_lines.credit']);

        $debits = $lines->sum('debit');
        $credits = $lines->sum('credit');

        // Different account types have different balance formulas
        if (in_array($account->type, ['Liability', 'Equity', 'Revenue'])) {
            // For these types: Credits are increases, Debits are decreases
            $calculatedBalance = $credits - $debits;
        } else {
            // For Assets and Expenses: Debits are increases, Credits are decreases
            $calculatedBalance = $debits - $credits;
        }

        return $calculatedBalance;
    }

    /**
     * Helper: Get account balance for a period
     * For Assets/Expenses: Balance = Debits - Credits
     * For Liabilities/Equity/Revenue: Balance = Credits - Debits
     */
    private function getAccountBalanceForPeriod($accountId, $fromDate, $toDate)
    {
        // For P&L (Revenue/Expense), we only want activity during the period
        $lines = JournalLine::join('finance_journal_entries', 'finance_journal_lines.journal_entry_id', '=', 'finance_journal_entries.id')
            ->where('finance_journal_lines.account_id', $accountId)
            ->where('finance_journal_entries.status', 'posted')
            ->whereBetween('finance_journal_entries.date', [$fromDate, $toDate])
            ->get(['finance_journal_lines.debit', 'finance_journal_lines.credit']);

        $debits = $lines->sum('debit');
        $credits = $lines->sum('credit');

        // Get account type for correct balance calculation
        $account = Account::find($accountId);
        if (!$account) {
            return 0;
        }

        // Different account types have different balance formulas
        if (in_array($account->type, ['Liability', 'Equity', 'Revenue'])) {
            // For these types: Credits are increases, Debits are decreases
            $calculatedBalance = $credits - $debits;
        } else {
            // For Assets and Expenses: Debits are increases, Credits are decreases
            $calculatedBalance = $debits - $credits;
        }

        return $calculatedBalance;
    }
}
