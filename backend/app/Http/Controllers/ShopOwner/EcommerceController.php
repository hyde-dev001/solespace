<?php

namespace App\Http\Controllers\ShopOwner;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\ShopOwner as ShopOwnerModel;
use App\Models\ShopOwner\Order;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class EcommerceController extends Controller
{
    /**
     * Display ecommerce dashboard metrics.
     */
    public function index()
    {
        $shopOwnerId = Auth::id();

        // Get metrics
        $metrics = $this->getMetrics($shopOwnerId);
        $monthlySales = $this->getMonthlySales($shopOwnerId);
        $monthlyTarget = $this->getMonthlyTarget($shopOwnerId);
        $statistics = $this->getStatistics($shopOwnerId);
        $recentOrders = $this->getRecentOrders($shopOwnerId);

        return response()->json([
            'success' => true,
            'data' => [
                'metrics' => $metrics,
                'monthlySales' => $monthlySales,
                'monthlyTarget' => $monthlyTarget,
                'statistics' => $statistics,
                'recentOrders' => $recentOrders,
            ]
        ]);
    }

    /**
     * Get ecommerce metrics.
     */
    private function getMetrics($shopOwnerId)
    {
        $currentMonth = Carbon::now()->month;
        $currentYear = Carbon::now()->year;
        $lastMonth = Carbon::now()->subMonth();

        // Calculate current month metrics
        $currentRevenue = DB::table('orders')
            ->where('shop_owner_id', $shopOwnerId)
            ->whereMonth('created_at', $currentMonth)
            ->whereYear('created_at', $currentYear)
            ->sum('total_amount');

        $currentOrders = DB::table('orders')
            ->where('shop_owner_id', $shopOwnerId)
            ->whereMonth('created_at', $currentMonth)
            ->whereYear('created_at', $currentYear)
            ->count();

        // Calculate last month metrics for comparison
        $lastRevenue = DB::table('orders')
            ->where('shop_owner_id', $shopOwnerId)
            ->whereMonth('created_at', $lastMonth->month)
            ->whereYear('created_at', $lastMonth->year)
            ->sum('total_amount');

        $lastOrders = DB::table('orders')
            ->where('shop_owner_id', $shopOwnerId)
            ->whereMonth('created_at', $lastMonth->month)
            ->whereYear('created_at', $lastMonth->year)
            ->count();

        // Calculate percentage changes
        $revenueChange = $lastRevenue > 0 
            ? (($currentRevenue - $lastRevenue) / $lastRevenue) * 100 
            : 0;

        $ordersChange = $lastOrders > 0 
            ? (($currentOrders - $lastOrders) / $lastOrders) * 100 
            : 0;

        return [
            'totalRevenue' => $currentRevenue,
            'revenueChange' => round($revenueChange, 2),
            'totalOrders' => $currentOrders,
            'ordersChange' => round($ordersChange, 2),
            'averageOrderValue' => $currentOrders > 0 ? $currentRevenue / $currentOrders : 0,
            'totalCustomers' => DB::table('orders')
                ->where('shop_owner_id', $shopOwnerId)
                ->distinct('customer_id')
                ->count('customer_id'),
        ];
    }

    /**
     * Get monthly sales data.
     */
    private function getMonthlySales($shopOwnerId)
    {
        $salesData = DB::table('orders')
            ->select(
                DB::raw('DATE_FORMAT(created_at, "%Y-%m") as month'),
                DB::raw('SUM(total_amount) as total_sales'),
                DB::raw('COUNT(*) as order_count')
            )
            ->where('shop_owner_id', $shopOwnerId)
            ->whereYear('created_at', Carbon::now()->year)
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        return $salesData;
    }

    /**
     * Get monthly target data.
     */
    private function getMonthlyTarget($shopOwnerId)
    {
        $currentMonth = Carbon::now()->month;
        $currentYear = Carbon::now()->year;

        $currentSales = DB::table('orders')
            ->where('shop_owner_id', $shopOwnerId)
            ->whereMonth('created_at', $currentMonth)
            ->whereYear('created_at', $currentYear)
            ->sum('total_amount');

        // Get target from shop_owner settings or default to 100000
        $target = DB::table('shop_owners')
            ->where('id', $shopOwnerId)
            ->value('monthly_target') ?? 100000;

        $percentage = $target > 0 ? ($currentSales / $target) * 100 : 0;

        return [
            'target' => $target,
            'achieved' => $currentSales,
            'percentage' => round($percentage, 2),
        ];
    }

    /**
     * Get statistics data.
     */
    private function getStatistics($shopOwnerId)
    {
        $last6Months = Carbon::now()->subMonths(6);

        $statistics = DB::table('orders')
            ->select(
                DB::raw('DATE_FORMAT(created_at, "%b") as month'),
                DB::raw('SUM(total_amount) as sales'),
                DB::raw('COUNT(*) as orders')
            )
            ->where('shop_owner_id', $shopOwnerId)
            ->where('created_at', '>=', $last6Months)
            ->groupBy('month')
            ->orderBy(DB::raw('MONTH(created_at)'))
            ->get();

        return $statistics;
    }

    /**
     * Get recent orders.
     */
    private function getRecentOrders($shopOwnerId)
    {
        $orders = DB::table('orders')
            ->select('orders.*', 'users.name as customer_name', 'users.email as customer_email')
            ->leftJoin('users', 'orders.customer_id', '=', 'users.id')
            ->where('orders.shop_owner_id', $shopOwnerId)
            ->orderBy('orders.created_at', 'desc')
            ->limit(10)
            ->get();

        return $orders;
    }

    /**
     * Update monthly target.
     */
    public function updateTarget(Request $request)
    {
        $request->validate([
            'target' => 'required|numeric|min:0'
        ]);

        $shopOwner = ShopOwnerModel::findOrFail(Auth::id());
        $shopOwner->monthly_target = $request->target;
        $shopOwner->save();

        return response()->json([
            'success' => true,
            'message' => 'Monthly target updated successfully',
            'target' => $shopOwner->monthly_target
        ]);
    }
}
