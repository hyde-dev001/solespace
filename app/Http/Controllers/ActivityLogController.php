<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Spatie\Activitylog\Models\Activity;
use Illuminate\Support\Facades\Auth;

class ActivityLogController extends Controller
{
    /**
     * Get activity logs filtered by role
     * 
     * Roles and their visibility:
     * - Manager: See everything in their shop
     * - HR: Employee, payroll, leave, training, attendance, performance changes
     * - Finance: Expenses, invoices, payments, approvals
     * - CRM: Customers, leads, orders, inquiries
     * - Shop Owner: See everything (they own the business)
     */
    public function index(Request $request)
    {
        // Check if authenticated via either guard
        $user = Auth::guard('user')->user();
        $shopOwner = Auth::guard('shop_owner')->user();
        
        // If not authenticated with either guard, return unauthorized
        if (!$user && !$shopOwner) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }
        
        // Shop Owner sees everything
        if ($shopOwner) {
            return $this->getShopOwnerLogs($shopOwner->id, $request);
        }
        
        // User role-based filtering
        if ($user) {
            $role = $user->role;
            
            switch ($role) {
                case 'MANAGER':
                    return $this->getManagerLogs($user, $request);
                    
                case 'HR':
                    return $this->getHRLogs($user, $request);
                    
                case 'FINANCE_MANAGER':
                case 'FINANCE_STAFF':
                    return $this->getFinanceLogs($user, $request);
                    
                case 'CRM':
                    return $this->getCRMLogs($user, $request);
                    
                default:
                    return response()->json([
                        'message' => 'Your role does not have audit log access'
                    ], 403);
            }
        }
        
        return response()->json(['message' => 'Unauthorized'], 401);
    }
    
    /**
     * Shop Owner sees EVERYTHING
     */
    private function getShopOwnerLogs($shopOwnerId, Request $request)
    {
        $query = Activity::query()
            ->where(function($q) use ($shopOwnerId) {
                // Activities performed by shop owner
                $q->where('causer_type', 'App\\Models\\ShopOwner')
                  ->where('causer_id', $shopOwnerId);
                // OR activities on models belonging to this shop owner
                $q->orWhereHas('subject', function($subQuery) use ($shopOwnerId) {
                    // Check if subject has shop_owner_id
                    $subQuery->where('shop_owner_id', $shopOwnerId);
                });
            })
            ->with('causer', 'subject')
            ->orderBy('created_at', 'desc');
        
        return $this->applyFiltersAndPaginate($query, $request);
    }
    
    /**
     * Manager sees everything in their shop (oversight & compliance)
     */
    private function getManagerLogs($user, Request $request)
    {
        $shopOwnerId = $user->shop_owner_id;
        
        $query = Activity::query()
            ->where(function($q) use ($shopOwnerId) {
                // All activities related to this shop
                $q->whereHas('subject', function($subQuery) use ($shopOwnerId) {
                    $subQuery->where('shop_owner_id', $shopOwnerId);
                });
                // OR activities performed by users in this shop
                $q->orWhereHas('causer', function($causerQuery) use ($shopOwnerId) {
                    $causerQuery->where('shop_owner_id', $shopOwnerId);
                });
            })
            ->with('causer', 'subject')
            ->orderBy('created_at', 'desc');
        
        return $this->applyFiltersAndPaginate($query, $request);
    }
    
    /**
     * HR sees: Employee, Payroll, Leave, Training, Attendance, Performance changes
     */
    private function getHRLogs($user, Request $request)
    {
        $shopOwnerId = $user->shop_owner_id;
        
        $query = Activity::query()
            ->whereIn('subject_type', [
                'App\\Models\\User',
                'App\\Models\\HR\\Payroll',
                'App\\Models\\HR\\Leave',
                'App\\Models\\HR\\Training',
                'App\\Models\\HR\\Attendance',
                'App\\Models\\HR\\Performance',
                'App\\Models\\HR\\Employee',
                'App\\Models\\HR\\Department',
            ])
            ->whereHas('subject', function($subQuery) use ($shopOwnerId) {
                $subQuery->where('shop_owner_id', $shopOwnerId);
            })
            ->with('causer', 'subject')
            ->orderBy('created_at', 'desc');
        
        return $this->applyFiltersAndPaginate($query, $request);
    }
    
    /**
     * Finance sees: Expenses, Invoices, Payments, Approvals
     */
    private function getFinanceLogs($user, Request $request)
    {
        $shopOwnerId = $user->shop_owner_id;
        
        $query = Activity::query()
            ->whereIn('subject_type', [
                'App\\Models\\Finance\\Expense',
                'App\\Models\\Finance\\Invoice',
                'App\\Models\\Finance\\Payment',
                'App\\Models\\Finance\\Revenue',
                'App\\Models\\Finance\\BankAccount',
            ])
            ->whereHas('subject', function($subQuery) use ($shopOwnerId) {
                $subQuery->where('shop_owner_id', $shopOwnerId);
            })
            ->with('causer', 'subject')
            ->orderBy('created_at', 'desc');
        
        return $this->applyFiltersAndPaginate($query, $request);
    }
    
    /**
     * CRM sees: Customers, Leads, Orders, Inquiries
     */
    private function getCRMLogs($user, Request $request)
    {
        $shopOwnerId = $user->shop_owner_id;
        
        $query = Activity::query()
            ->whereIn('subject_type', [
                'App\\Models\\Customer',
                'App\\Models\\CRM\\Lead',
                'App\\Models\\Order',
                'App\\Models\\CRM\\Inquiry',
                'App\\Models\\CRM\\Interaction',
            ])
            ->whereHas('subject', function($subQuery) use ($shopOwnerId) {
                $subQuery->where('shop_owner_id', $shopOwnerId);
            })
            ->with('causer', 'subject')
            ->orderBy('created_at', 'desc');
        
        return $this->applyFiltersAndPaginate($query, $request);
    }
    
    /**
     * Apply filters and return paginated results with stats
     */
    private function applyFiltersAndPaginate($query, Request $request)
    {
        // Date range filter
        if ($request->has('date_from')) {
            $query->where('created_at', '>=', $request->date_from);
        }
        
        if ($request->has('date_to')) {
            $query->where('created_at', '<=', $request->date_to . ' 23:59:59');
        }
        
        // Event filter (created, updated, deleted)
        if ($request->has('event')) {
            $query->where('event', $request->event);
        }
        
        // Subject type filter
        if ($request->has('subject_type')) {
            $query->where('subject_type', 'like', '%' . $request->subject_type . '%');
        }
        
        // Causer filter
        if ($request->has('causer_id')) {
            $query->where('causer_id', $request->causer_id);
        }
        
        // Get total before pagination for stats
        $total = $query->count();
        
        // Get stats
        $stats = [
            'total_logs' => $total,
            'logs_last_24h' => (clone $query)->where('created_at', '>=', now()->subDay())->count(),
            'event_counts' => (clone $query)->selectRaw('event, COUNT(*) as count')
                ->groupBy('event')
                ->pluck('count', 'event')
                ->toArray(),
            'subject_type_counts' => (clone $query)->selectRaw('subject_type, COUNT(*) as count')
                ->groupBy('subject_type')
                ->pluck('count', 'subject_type')
                ->toArray(),
        ];
        
        // Paginate
        $logs = $query->paginate($request->get('per_page', 20));
        
        return response()->json([
            'logs' => $logs,
            'stats' => $stats,
        ]);
    }
}
