<?php

namespace App\Http\Controllers;

use App\Models\CostCenter;
use App\Models\ExpenseAllocation;
use App\Models\Finance\JournalLine;
use App\Models\Finance\JournalEntry;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CostCenterController extends Controller
{
    /**
     * Display a listing of the cost centers.
     */
    public function index()
    {
        $shopOwnerId = auth()->user()->shop_owner_id;

        $costCenters = CostCenter::where('shop_owner_id', $shopOwnerId)
            ->with('children')
            ->whereNull('parent_id')
            ->orderBy('code')
            ->get();

        return Inertia::render('ERP/Finance/CostCenterAllocation', [
            'costCenters' => $costCenters,
        ]);
    }

    /**
     * Show the form for creating a new cost center.
     */
    public function create()
    {
        $shopOwnerId = auth()->user()->shop_owner_id;

        $parentCostCenters = CostCenter::where('shop_owner_id', $shopOwnerId)
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        return Inertia::render('ERP/Finance/CostCenterForm', [
            'parentCostCenters' => $parentCostCenters,
            'isEdit' => false,
        ]);
    }

    /**
     * Store a newly created cost center.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'code' => 'required|string|max:50|unique:cost_centers,code',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'type' => 'required|in:department,project,location,division',
            'parent_id' => 'nullable|exists:cost_centers,id',
            'is_active' => 'boolean',
            'budget_limit' => 'nullable|numeric|min:0',
            'manager_name' => 'nullable|string|max:255',
            'manager_email' => 'nullable|email',
        ]);

        $shopOwnerId = auth()->user()->shop_owner_id;

        CostCenter::create([
            'shop_owner_id' => $shopOwnerId,
            'code' => $validated['code'],
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'type' => $validated['type'],
            'parent_id' => $validated['parent_id'] ?? null,
            'is_active' => $validated['is_active'] ?? true,
            'budget_limit' => $validated['budget_limit'] ?? null,
            'manager_name' => $validated['manager_name'] ?? null,
            'manager_email' => $validated['manager_email'] ?? null,
        ]);

        return redirect()->route('erp.finance.cost-centers.index')
            ->with('success', 'Cost center created successfully');
    }

    /**
     * Show the form for editing a cost center.
     */
    public function edit(CostCenter $costCenter)
    {
        $this->authorize('update', $costCenter);

        $shopOwnerId = auth()->user()->shop_owner_id;

        $parentCostCenters = CostCenter::where('shop_owner_id', $shopOwnerId)
            ->where('is_active', true)
            ->where('id', '!=', $costCenter->id)
            ->orderBy('name')
            ->get();

        return Inertia::render('ERP/Finance/CostCenterForm', [
            'costCenter' => $costCenter,
            'parentCostCenters' => $parentCostCenters,
            'isEdit' => true,
        ]);
    }

    /**
     * Update the cost center.
     */
    public function update(Request $request, CostCenter $costCenter)
    {
        $this->authorize('update', $costCenter);

        $validated = $request->validate([
            'code' => 'required|string|max:50|unique:cost_centers,code,' . $costCenter->id,
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'type' => 'required|in:department,project,location,division',
            'parent_id' => 'nullable|exists:cost_centers,id',
            'is_active' => 'boolean',
            'budget_limit' => 'nullable|numeric|min:0',
            'manager_name' => 'nullable|string|max:255',
            'manager_email' => 'nullable|email',
        ]);

        $costCenter->update([
            'code' => $validated['code'],
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'type' => $validated['type'],
            'parent_id' => $validated['parent_id'] ?? null,
            'is_active' => $validated['is_active'] ?? true,
            'budget_limit' => $validated['budget_limit'] ?? null,
            'manager_name' => $validated['manager_name'] ?? null,
            'manager_email' => $validated['manager_email'] ?? null,
        ]);

        return redirect()->route('erp.finance.cost-centers.index')
            ->with('success', 'Cost center updated successfully');
    }

    /**
     * Delete a cost center.
     */
    public function destroy(CostCenter $costCenter)
    {
        $this->authorize('delete', $costCenter);

        $name = $costCenter->name;
        $costCenter->delete();

        return redirect()->route('erp.finance.cost-centers.index')
            ->with('success', "Cost center '{$name}' deleted successfully");
    }

    /**
     * Get allocation analytics for a cost center.
     */
    public function analytics(CostCenter $costCenter)
    {
        $this->authorize('view', $costCenter);

        $allocations = $costCenter->allocations()
            ->with('journalLine.journalEntry')
            ->orderBy('allocation_date', 'desc')
            ->paginate(10);

        $totalAllocated = $costCenter->getTotalAllocatedAttribute();
        $budgetRemaining = $costCenter->getBudgetRemainingAttribute();
        $utilization = $costCenter->getBudgetUtilizationAttribute();

        return Inertia::render('ERP/Finance/CostCenterAnalytics', [
            'costCenter' => $costCenter,
            'allocations' => $allocations,
            'analytics' => [
                'totalAllocated' => $totalAllocated,
                'budgetLimit' => $costCenter->budget_limit,
                'budgetRemaining' => $budgetRemaining,
                'utilization' => $utilization,
            ],
        ]);
    }

    /**
     * Allocate an expense to a cost center.
     */
    public function allocateExpense(Request $request, CostCenter $costCenter)
    {
        $this->authorize('update', $costCenter);

        $validated = $request->validate([
            'finance_journal_line_id' => 'required|exists:finance_journal_lines,id',
            'amount' => 'required|numeric|min:0.01',
            'percentage' => 'nullable|numeric|min:0|max:100',
            'notes' => 'nullable|string',
        ]);

        $journalLine = JournalLine::findOrFail($validated['finance_journal_line_id']);

        // Verify the journal line belongs to the same shop owner
        if ($journalLine->journalEntry->shop_owner_id !== auth()->user()->shop_owner_id) {
            return redirect()->back()
                ->with('error', 'Unauthorized');
        }

        ExpenseAllocation::create([
            'shop_owner_id' => auth()->user()->shop_owner_id,
            'cost_center_id' => $costCenter->id,
            'finance_journal_line_id' => $validated['finance_journal_line_id'],
            'amount' => $validated['amount'],
            'percentage' => $validated['percentage'] ?? null,
            'notes' => $validated['notes'] ?? null,
            'allocation_date' => now(),
        ]);

        return redirect()->back()
            ->with('success', 'Expense allocated to cost center successfully');
    }
}
