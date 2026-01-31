<?php

namespace App\Http\Controllers\Api\Finance;

use App\Models\Budget;
use App\Models\Finance\Expense;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class BudgetController extends \Illuminate\Routing\Controller
{
    public function index(Request $request)
    {
        // Get user from the 'user' guard (web session authenticated users)
        $user = Auth::guard('user')->user();
        
        if (!$user) {
            return response()->json(['error' => 'Unauthenticated'], 401);
        }
        
        $shopOwnerId = $user->shop_owner_id;
        
        // If still no shop owner ID, return empty list instead of error
        if (!$shopOwnerId) {
            return response()->json(['data' => []]);
        }
        
        $budgets = Budget::where('shop_owner_id', $shopOwnerId)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($budget) {
                return [
                    'id' => (string)$budget->id,
                    'category' => $budget->category,
                    'budgeted' => (float)$budget->budgeted,
                    'spent' => (float)$budget->spent,
                    'variance' => (float)($budget->budgeted - $budget->spent),
                    'forecastedYear' => (float)($budget->budgeted * 12),
                    'trend' => $budget->trend,
                    'description' => $budget->description,
                ];
            });

        return response()->json(['data' => $budgets]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'category' => 'required|string|max:255',
            'budgeted' => 'required|numeric|min:0.01',
            'spent' => 'nullable|numeric|min:0',
            'trend' => 'nullable|in:up,down,stable',
            'description' => 'nullable|string',
        ]);

        $user = Auth::guard('user')->user();
        
        if (!$user || !$user->shop_owner_id) {
            return response()->json(['error' => 'No shop owner associated with this user'], 400);
        }

        $budget = Budget::create([
            'shop_owner_id' => $user->shop_owner_id,
            'category' => $validated['category'],
            'budgeted' => $validated['budgeted'],
            'spent' => $validated['spent'] ?? 0,
            'trend' => $validated['trend'] ?? 'stable',
            'description' => $validated['description'] ?? null,
        ]);

        return response()->json([
            'data' => [
                'id' => (string)$budget->id,
                'category' => $budget->category,
                'budgeted' => (float)$budget->budgeted,
                'spent' => (float)$budget->spent,
                'variance' => (float)($budget->budgeted - $budget->spent),
                'forecastedYear' => (float)($budget->budgeted * 12),
                'trend' => $budget->trend,
                'description' => $budget->description,
            ]
        ], 201);
    }

    public function update(Budget $budget, Request $request)
    {
        $user = Auth::guard('user')->user();
        
        if (!$user || $budget->shop_owner_id != $user->shop_owner_id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'category' => 'sometimes|string|max:255',
            'budgeted' => 'sometimes|numeric|min:0.01',
            'spent' => 'sometimes|numeric|min:0',
            'trend' => 'sometimes|in:up,down,stable',
            'description' => 'nullable|string',
        ]);

        $budget->update($validated);

        return response()->json([
            'data' => [
                'id' => (string)$budget->id,
                'category' => $budget->category,
                'budgeted' => (float)$budget->budgeted,
                'spent' => (float)$budget->spent,
                'variance' => (float)($budget->budgeted - $budget->spent),
                'forecastedYear' => (float)($budget->budgeted * 12),
                'trend' => $budget->trend,
                'description' => $budget->description,
            ]
        ]);
    }

    public function destroy(Budget $budget, Request $request)
    {
        $user = Auth::guard('user')->user();
        
        if (!$user || $budget->shop_owner_id != $user->shop_owner_id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $budget->delete();

        return response()->json(['message' => 'Budget deleted successfully']);
    }

    /**
     * Get variance report for all budgets
     * Shows actual vs budgeted amounts with variance analysis
     */
    public function variance(Request $request)
    {
        $user = Auth::guard('user')->user();
        
        if (!$user || !$user->shop_owner_id) {
            return response()->json(['error' => 'Unauthenticated'], 401);
        }

        $shopOwnerId = $user->shop_owner_id;
        
        // Get date range from request, default to current month
        $startDate = $request->input('start_date', now()->startOfMonth()->toDateString());
        $endDate = $request->input('end_date', now()->endOfMonth()->toDateString());

        $budgets = Budget::where('shop_owner_id', $shopOwnerId)
            ->orderBy('category')
            ->get()
            ->map(function ($budget) use ($startDate, $endDate) {
                // Calculate actual spending from expenses for this category
                $actualSpent = Expense::where('category', $budget->category)
                    ->where('status', 'approved')
                    ->whereBetween('date', [$startDate, $endDate])
                    ->sum('amount');

                $variance = $budget->budgeted - $actualSpent;
                $variancePercent = $budget->budgeted > 0 
                    ? (($variance / $budget->budgeted) * 100) 
                    : 0;

                return [
                    'id' => (string)$budget->id,
                    'category' => $budget->category,
                    'budgeted' => (float)$budget->budgeted,
                    'actual' => (float)$actualSpent,
                    'variance' => (float)$variance,
                    'variance_percent' => round($variancePercent, 2),
                    'status' => $variance >= 0 ? 'under_budget' : 'over_budget',
                    'utilization_percent' => $budget->budgeted > 0 
                        ? round(($actualSpent / $budget->budgeted) * 100, 2) 
                        : 0,
                ];
            });

        $summary = [
            'total_budgeted' => (float)$budgets->sum('budgeted'),
            'total_actual' => (float)$budgets->sum('actual'),
            'total_variance' => (float)$budgets->sum('variance'),
            'period' => [
                'start' => $startDate,
                'end' => $endDate,
            ],
        ];

        return response()->json([
            'data' => $budgets,
            'summary' => $summary,
        ]);
    }

    /**
     * Update budget spent amount from actual expenses
     * This syncs the budget with real expense data
     */
    public function syncActuals(Request $request, Budget $budget)
    {
        $user = Auth::guard('user')->user();
        
        if (!$user || $budget->shop_owner_id != $user->shop_owner_id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        // Get date range, default to current month
        $startDate = $request->input('start_date', now()->startOfMonth()->toDateString());
        $endDate = $request->input('end_date', now()->endOfMonth()->toDateString());

        // Calculate actual spending from approved expenses
        $actualSpent = Expense::where('category', $budget->category)
            ->where('status', 'approved')
            ->whereBetween('date', [$startDate, $endDate])
            ->sum('amount');

        $budget->update(['spent' => $actualSpent]);

        return response()->json([
            'data' => [
                'id' => (string)$budget->id,
                'category' => $budget->category,
                'budgeted' => (float)$budget->budgeted,
                'spent' => (float)$budget->spent,
                'variance' => (float)($budget->budgeted - $budget->spent),
                'forecastedYear' => (float)($budget->budgeted * 12),
                'trend' => $budget->trend,
                'description' => $budget->description,
            ]
        ]);
    }

    /**
     * Get budget utilization summary
     */
    public function utilization(Request $request)
    {
        $user = Auth::guard('user')->user();
        
        if (!$user || !$user->shop_owner_id) {
            return response()->json(['error' => 'Unauthenticated'], 401);
        }

        $shopOwnerId = $user->shop_owner_id;
        $budgets = Budget::where('shop_owner_id', $shopOwnerId)->get();

        $totalBudgeted = $budgets->sum('budgeted');
        $totalSpent = $budgets->sum('spent');
        $totalVariance = $totalBudgeted - $totalSpent;

        $utilizationRate = $totalBudgeted > 0 
            ? round(($totalSpent / $totalBudgeted) * 100, 2) 
            : 0;

        // Categorize budgets - handle zero budget case
        $onTrack = $budgets->filter(function($b) {
            if ($b->budgeted == 0) return false;
            return ($b->spent / $b->budgeted * 100) < 80;
        })->count();
        
        $atRisk = $budgets->filter(function($b) {
            if ($b->budgeted == 0) return false;
            $pct = $b->spent / $b->budgeted * 100;
            return $pct >= 80 && $pct < 100;
        })->count();
        
        $overBudget = $budgets->filter(function($b) {
            if ($b->budgeted == 0) return false;
            return ($b->spent / $b->budgeted * 100) >= 100;
        })->count();

        return response()->json([
            'data' => [
                'total_budgeted' => (float)$totalBudgeted,
                'total_spent' => (float)$totalSpent,
                'total_variance' => (float)$totalVariance,
                'utilization_rate' => $utilizationRate,
                'categories' => [
                    'on_track' => $onTrack,
                    'at_risk' => $atRisk,
                    'over_budget' => $overBudget,
                ],
                'forecast_year_end' => (float)($totalSpent * 12), // Simplified forecast
            ]
        ]);
    }
}
