<?php

namespace App\Http\Controllers;

use App\Models\RecurringTransaction;
use App\Models\RecurringTransactionLine;
use App\Models\RecurringTransactionExecution;
use App\Models\Finance\Account;
use App\Models\ShopOwner;
use Illuminate\Http\Request;
use Inertia\Inertia;

class RecurringTransactionController extends Controller
{
    /**
     * Display a listing of the recurring transactions.
     */
    public function index()
    {
        $shopOwnerId = auth()->user()->shop_owner_id;

        $recurringTransactions = RecurringTransaction::where('shop_owner_id', $shopOwnerId)
            ->with('lines.account')
            ->orderBy('name')
            ->paginate(15);

        return Inertia::render('ERP/Finance/RecurringTransactions', [
            'recurringTransactions' => $recurringTransactions,
        ]);
    }

    /**
     * Show the form for creating a new recurring transaction.
     */
    public function create()
    {
        // Get all active accounts regardless of shop_id (since they may be globally shared)
        $accounts = Account::whereIn('type', ['asset', 'liability', 'equity', 'revenue', 'expense'])
            ->where('active', true)
            ->orderBy('code')
            ->get();

        return Inertia::render('ERP/Finance/RecurringTransactionForm', [
            'accounts' => $accounts,
            'isEdit' => false,
        ]);
    }

    /**
     * Store a newly created recurring transaction.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'frequency' => 'required|in:daily,weekly,monthly,quarterly,annually',
            'day_of_month' => 'nullable|integer|min:1|max:28',
            'month' => 'nullable|string',
            'start_date' => 'required|date',
            'end_date' => 'nullable|date|after:start_date',
            'is_active' => 'boolean',
            'lines' => 'required|array|min:1',
            'lines.*.chart_of_account_id' => 'required|exists:finance_accounts,id',
            'lines.*.debit' => 'numeric|min:0',
            'lines.*.credit' => 'numeric|min:0',
            'lines.*.description' => 'nullable|string',
            'lines.*.cost_center' => 'nullable|string',
        ]);

        $shopOwnerId = auth()->user()->shop_owner_id;

        $recurring = RecurringTransaction::create([
            'shop_owner_id' => $shopOwnerId,
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'frequency' => $validated['frequency'],
            'day_of_month' => $validated['day_of_month'] ?? null,
            'month' => $validated['month'] ?? null,
            'start_date' => $validated['start_date'],
            'end_date' => $validated['end_date'] ?? null,
            'is_active' => $validated['is_active'] ?? true,
        ]);

        $totalDebit = 0;
        $totalCredit = 0;

        foreach ($validated['lines'] as $index => $line) {
            RecurringTransactionLine::create([
                'recurring_transaction_id' => $recurring->id,
                'chart_of_account_id' => $line['chart_of_account_id'],
                'debit' => $line['debit'] ?? 0,
                'credit' => $line['credit'] ?? 0,
                'description' => $line['description'] ?? null,
                'cost_center' => $line['cost_center'] ?? null,
                'line_number' => $index + 1,
            ]);

            $totalDebit += (float)($line['debit'] ?? 0);
            $totalCredit += (float)($line['credit'] ?? 0);
        }

        $recurring->update([
            'total_debit' => $totalDebit,
            'total_credit' => $totalCredit,
        ]);

        return redirect()->route('erp.finance.recurring-transactions.index')
            ->with('success', 'Recurring transaction created successfully');
    }

    /**
     * Show the form for editing a recurring transaction.
     */
    public function edit(RecurringTransaction $recurringTransaction)
    {
        $this->authorize('update', $recurringTransaction);

        // Get all active accounts regardless of shop_id (since they may be globally shared)
        $accounts = Account::whereIn('type', ['asset', 'liability', 'equity', 'revenue', 'expense'])
            ->where('active', true)
            ->orderBy('code')
            ->get();

        $recurringTransaction->load('lines.account');

        return Inertia::render('ERP/Finance/RecurringTransactionForm', [
            'recurringTransaction' => $recurringTransaction,
            'accounts' => $accounts,
            'isEdit' => true,
        ]);
    }

    /**
     * Update the recurring transaction.
     */
    public function update(Request $request, RecurringTransaction $recurringTransaction)
    {
        $this->authorize('update', $recurringTransaction);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'frequency' => 'required|in:daily,weekly,monthly,quarterly,annually',
            'day_of_month' => 'nullable|integer|min:1|max:28',
            'month' => 'nullable|string',
            'start_date' => 'required|date',
            'end_date' => 'nullable|date|after:start_date',
            'is_active' => 'boolean',
            'lines' => 'required|array|min:1',
            'lines.*.chart_of_account_id' => 'required|exists:finance_accounts,id',
            'lines.*.debit' => 'numeric|min:0',
            'lines.*.credit' => 'numeric|min:0',
            'lines.*.description' => 'nullable|string',
            'lines.*.cost_center' => 'nullable|string',
        ]);

        $recurringTransaction->update([
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'frequency' => $validated['frequency'],
            'day_of_month' => $validated['day_of_month'] ?? null,
            'month' => $validated['month'] ?? null,
            'start_date' => $validated['start_date'],
            'end_date' => $validated['end_date'] ?? null,
            'is_active' => $validated['is_active'] ?? true,
        ]);

        // Delete old lines and create new ones
        $recurringTransaction->lines()->delete();

        $totalDebit = 0;
        $totalCredit = 0;

        foreach ($validated['lines'] as $index => $line) {
            RecurringTransactionLine::create([
                'recurring_transaction_id' => $recurringTransaction->id,
                'chart_of_account_id' => $line['chart_of_account_id'],
                'debit' => $line['debit'] ?? 0,
                'credit' => $line['credit'] ?? 0,
                'description' => $line['description'] ?? null,
                'cost_center' => $line['cost_center'] ?? null,
                'line_number' => $index + 1,
            ]);

            $totalDebit += (float)($line['debit'] ?? 0);
            $totalCredit += (float)($line['credit'] ?? 0);
        }

        $recurringTransaction->update([
            'total_debit' => $totalDebit,
            'total_credit' => $totalCredit,
        ]);

        return redirect()->route('erp.finance.recurring-transactions.index')
            ->with('success', 'Recurring transaction updated successfully');
    }

    /**
     * Delete a recurring transaction.
     */
    public function destroy(RecurringTransaction $recurringTransaction)
    {
        $this->authorize('delete', $recurringTransaction);

        $name = $recurringTransaction->name;
        $recurringTransaction->delete();

        return redirect()->route('erp.finance.recurring-transactions.index')
            ->with('success', "Recurring transaction '{$name}' deleted successfully");
    }

    /**
     * Toggle the active status of a recurring transaction.
     */
    public function toggleActive(RecurringTransaction $recurringTransaction)
    {
        $this->authorize('update', $recurringTransaction);

        $recurringTransaction->update([
            'is_active' => !$recurringTransaction->is_active,
        ]);

        $status = $recurringTransaction->is_active ? 'activated' : 'deactivated';

        return redirect()->back()
            ->with('success', "Recurring transaction {$status} successfully");
    }

    /**
     * Get the execution history for a recurring transaction.
     */
    public function executionHistory(RecurringTransaction $recurringTransaction)
    {
        $this->authorize('view', $recurringTransaction);

        $executions = $recurringTransaction->executions()
            ->with('journalHeader')
            ->orderBy('execution_date', 'desc')
            ->paginate(10);

        return Inertia::render('ERP/Finance/RecurringTransactionHistory', [
            'recurringTransaction' => $recurringTransaction,
            'executions' => $executions,
        ]);
    }

    /**
     * Execute a recurring transaction immediately.
     */
    public function executeNow(RecurringTransaction $recurringTransaction)
    {
        $this->authorize('update', $recurringTransaction);

        try {
            $journalHeader = $recurringTransaction->execute(auth()->user()->name);

            return redirect()->back()
                ->with('success', "Recurring transaction executed. Journal entry: {$journalHeader->reference_number}");
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Failed to execute recurring transaction: ' . $e->getMessage());
        }
    }
}
