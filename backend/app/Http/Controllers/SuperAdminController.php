<?php

namespace App\Http\Controllers;

use App\Models\ShopOwner;
use App\Models\ShopDocument;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

/**
 * SuperAdminController
 * 
 * Handles all super admin operations including:
 * - Shop owner registration approvals/rejections
 * - User account management and flagging
 * - Document verification
 * - System notifications and communications
 * - Data reports and analytics
 */
class SuperAdminController extends Controller
{
    /**
     * Display pending shop owner registrations for review
     * 
     * Returns all pending shop owners with their documents and operating hours
     * for the super admin to approve or reject
     * 
     * @return \Inertia\Response
     */
    public function showShopRegistrations()
    {
        // <!-- Fetch all shop owners with their documents for display -->
        // <!-- Uses eager loading to reduce database queries -->
        $allRegistrations = ShopOwner::with('documents')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($shopOwner) {
                // <!-- Transform data for frontend consumption -->
                // <!-- Match frontend component prop names (snake_case) -->
                // Transform operating_hours to array format expected by frontend
                $operatingHours = [];
                if ($shopOwner->operating_hours) {
                    $hours = is_string($shopOwner->operating_hours) 
                        ? json_decode($shopOwner->operating_hours, true) 
                        : $shopOwner->operating_hours;
                    
                    if (is_array($hours)) {
                        // Check if it's already in array format [{"day": "Monday", ...}]
                        $firstKey = array_key_first($hours);
                        if (is_numeric($firstKey) && isset($hours[0]['day'])) {
                            // Already in correct format
                            $operatingHours = $hours;
                        } else {
                            // Convert from object format {"Monday": {...}} to array format
                            foreach ($hours as $day => $times) {
                                $operatingHours[] = [
                                    'day' => $day,
                                    'open' => $times['open'] ?? 'Closed',
                                    'close' => $times['close'] ?? 'Closed',
                                ];
                            }
                        }
                    }
                }

                return [
                    'id' => $shopOwner->id,
                    'first_name' => $shopOwner->first_name,
                    'last_name' => $shopOwner->last_name,
                    'email' => $shopOwner->email,
                    'contact_number' => $shopOwner->contact_number,
                    'business_name' => $shopOwner->business_name,
                    'business_address' => $shopOwner->business_address,
                    'business_type' => $shopOwner->business_type,
                    'operating_hours' => $operatingHours,
                    'status' => $shopOwner->status,
                    'created_at' => $shopOwner->created_at->format('Y-m-d H:i:s'),
                    // <!-- Map documents with file paths accessible from frontend -->
                    'documents' => $shopOwner->documents->map(function ($doc) {
                        return [
                            'id' => $doc->id,
                            'document_type' => $doc->document_type,
                            'file_path' => $doc->file_path,
                            'file_name' => basename($doc->file_path),
                            'status' => $doc->status,
                        ];
                    }),
                ];
            });

        // <!-- Calculate statistics for dashboard display -->
        $stats = [
            'pendingCount' => ShopOwner::where('status', 'pending')->count(),
            'approvedToday' => ShopOwner::where('status', 'approved')
                ->whereDate('updated_at', today())
                ->count(),
            'totalCount' => ShopOwner::count(),
        ];

        // <!-- Return Inertia response to render React component with data -->
        return Inertia::render('superAdmin/ShopRegistrations', [
            'registrations' => $allRegistrations,
            'stats' => $stats,
        ]);
    }

    /**
     * Approve a shop owner registration
     * 
     * Updates shop owner and all associated documents to approved status
     * This allows the shop owner to access their account and post listings
     * 
     * @param int $id - Shop owner ID to approve
     * @return \Illuminate\Http\RedirectResponse
     */
    public function approveShopOwner($id)
    {
        try {
            // <!-- Use database transaction to ensure data consistency -->
            // <!-- If any operation fails, all changes are rolled back -->
            DB::beginTransaction();

            // <!-- Find shop owner or throw 404 if not found -->
            $shopOwner = ShopOwner::findOrFail($id);

            // <!-- Update shop owner status to approved -->
            $shopOwner->update(['status' => 'approved']);

            // <!-- Update all associated documents to approved status -->
            $shopOwner->documents()->update(['status' => 'approved']);

            // <!-- Commit transaction to save all changes -->
            DB::commit();

            // <!-- Log approval action for audit trail -->
            \Log::info('Shop owner approved', [
                'admin_id' => auth()->id() ?? 'system',
                'shop_owner_id' => $id,
                'email' => $shopOwner->email,
            ]);

            // <!-- Redirect back with success message -->
            return redirect()->back()->with('success', 'Shop owner registration approved successfully!');

        } catch (\Exception $e) {
            // <!-- Rollback transaction on error -->
            DB::rollBack();

            // <!-- Log error for debugging -->
            \Log::error('Shop owner approval failed', [
                'shop_owner_id' => $id,
                'error' => $e->getMessage(),
            ]);

            // <!-- Return error message to user -->
            return redirect()->back()->withErrors(['error' => 'Failed to approve registration: ' . $e->getMessage()]);
        }
    }

    /**
     * Reject a shop owner registration
     * 
     * Updates shop owner and documents to rejected status
     * Optionally accepts a rejection reason for record keeping
     * 
     * @param \Illuminate\Http\Request $request
     * @param int $id - Shop owner ID to reject
     * @return \Illuminate\Http\RedirectResponse
     */
    public function rejectShopOwner(Request $request, $id)
    {
        // <!-- Validate rejection reason if provided -->
        $validated = $request->validate([
            'reason' => 'nullable|string|max:500',
        ]);

        try {
            // <!-- Use database transaction -->
            DB::beginTransaction();

            // <!-- Find shop owner -->
            $shopOwner = ShopOwner::findOrFail($id);

            // <!-- Update status to rejected with optional reason -->
            $shopOwner->update([
                'status' => 'rejected',
                // <!-- Store rejection reason if provided -->
                'rejection_reason' => $validated['reason'] ?? null,
            ]);

            // <!-- Update all documents to rejected status -->
            $shopOwner->documents()->update(['status' => 'rejected']);

            // <!-- Commit changes -->
            DB::commit();

            // <!-- Log rejection for audit -->
            \Log::info('Shop owner rejected', [
                'admin_id' => auth()->id() ?? 'system',
                'shop_owner_id' => $id,
                'email' => $shopOwner->email,
                'reason' => $validated['reason'] ?? 'No reason provided',
            ]);

            return redirect()->back()->with('success', 'Shop owner registration rejected.');

        } catch (\Exception $e) {
            DB::rollBack();

            \Log::error('Shop owner rejection failed', [
                'shop_owner_id' => $id,
                'error' => $e->getMessage(),
            ]);

            return redirect()->back()->withErrors(['error' => 'Failed to reject registration: ' . $e->getMessage()]);
        }
    }

    /**
     * Display flagged user accounts
     * 
     * Shows all user accounts that have been flagged for suspicious activity
     * including failed login attempts, fraudulent reports, etc.
     * 
     * @return \Inertia\Response
     */
    public function showFlaggedAccounts()
    {
        // <!-- Fetch users with flags from database -->
        // <!-- This would query a user_flags or similar table -->
        // TODO: Implement user flagging system once users table is created
        
        // For now, return empty array since users table doesn't exist yet
        $flaggedAccounts = collect([]);

        return Inertia::render('superAdmin/FlaggedAccounts', [
            'flaggedAccounts' => $flaggedAccounts,
        ]);
    }

    /**
     * Display data reports and analytics dashboard
     * 
     * Provides comprehensive statistics about:
     * - Total users, shop owners, products
     * - Registration trends
     * - Revenue analytics
     * - System health metrics
     * 
     * @return \Inertia\Response
     */
    public function showDataReports()
    {
        // <!-- Gather system statistics -->
        $stats = [
            // <!-- Total counts -->
            // TODO: Implement users table and uncomment this line
            'totalUsers' => 0, // User::count() - Table doesn't exist yet
            'totalShopOwners' => ShopOwner::count(),
            'pendingApprovals' => ShopOwner::where('status', 'pending')->count(),
            'approvedShopOwners' => ShopOwner::where('status', 'approved')->count(),
            'rejectedShopOwners' => ShopOwner::where('status', 'rejected')->count(),

            // <!-- Recent activity (last 7 days) -->
            'recentRegistrations' => ShopOwner::where('created_at', '>=', now()->subDays(7))->count(),
            'recentApprovals' => ShopOwner::where('status', 'approved')
                ->where('updated_at', '>=', now()->subDays(7))
                ->count(),

            // <!-- Document verification stats -->
            'totalDocuments' => ShopDocument::count(),
            'pendingDocuments' => ShopDocument::where('status', 'pending')->count(),
            'approvedDocuments' => ShopDocument::where('status', 'approved')->count(),

            // <!-- Growth trends -->
            'monthlyGrowth' => $this->calculateMonthlyGrowth(),
        ];

        return Inertia::render('superAdmin/DataReportAccess', [
            'stats' => $stats,
        ]);
    }

    /**
     * Display user management interface
     * 
     * Shows only regular users (not admins)
     * with options to edit, suspend, or delete accounts
     * 
     * @return \Inertia\Response
     */
    public function showUserManagement()
    {
        // Fetch only regular users (not admins)
        $users = User::orderBy('created_at', 'desc')
            ->get()
            ->unique('email')
            ->map(function ($user) {
                return [
                    'id' => $user->id,
                    'first_name' => $user->first_name,
                    'last_name' => $user->last_name,
                    'name' => $user->first_name . ' ' . $user->last_name,
                    'email' => $user->email,
                    'phone' => $user->phone,
                    'address' => $user->address,
                    'age' => $user->age,
                    'valid_id_path' => $user->valid_id_path ? asset('storage/' . $user->valid_id_path) : null,
                    'status' => $user->status ?? 'active',
                    'role' => 'User',
                    'user_type' => 'user',
                    'last_login_at' => $user->last_login_at ? $user->last_login_at->format('Y-m-d H:i:s') : null,
                    'created_at' => $user->created_at->format('Y-m-d H:i:s'),
                ];
            });

        // Calculate statistics for users only
        $stats = [
            'total' => $users->count(),
            'active' => $users->where('status', 'active')->count(),
            'suspended' => $users->where('status', 'suspended')->count(),
            'thisMonth' => User::whereMonth('created_at', now()->month)
                ->whereYear('created_at', now()->year)
                ->count(),
        ];

        return Inertia::render('superAdmin/SuperAdminUserManagement', [
            'users' => $users->values(),
            'stats' => $stats,
        ]);
    }

    /**
     * Display admin management interface
     * 
     * Shows only administrator accounts (not regular users)
     * with options to manage, suspend, or delete admin accounts
     * 
     * @return \Inertia\Response
     */
    public function showAdminManagement()
    {
        // Get currently logged-in admin ID
        $currentAdminId = auth()->guard('super_admin')->id();
        
        // Fetch all admins except the currently logged-in admin
        $admins = \App\Models\SuperAdmin::where('id', '!=', $currentAdminId)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($admin) {
                return [
                    'id' => $admin->id,
                    'first_name' => $admin->first_name,
                    'last_name' => $admin->last_name,
                    'name' => $admin->first_name . ' ' . $admin->last_name,
                    'email' => $admin->email,
                    'phone' => $admin->phone,
                    'address' => null,
                    'status' => $admin->status ?? 'active',
                    'role' => ucfirst($admin->role ?? 'admin'),
                    'user_type' => 'admin',
                    'last_login_at' => $admin->last_login_at ? $admin->last_login_at->format('Y-m-d H:i:s') : null,
                    'created_at' => $admin->created_at->format('Y-m-d H:i:s'),
                ];
            });

        // Calculate statistics for admins only
        $stats = [
            'total' => $admins->count(),
            'active' => $admins->where('status', 'active')->count(),
            'suspended' => $admins->where('status', 'suspended')->count(),
            'inactive' => $admins->where('status', 'inactive')->count(),
        ];

        return Inertia::render('superAdmin/AdminManagement', [
            'admins' => $admins->values(),
            'stats' => $stats,
        ]);
    }

    /**
     * Calculate monthly growth statistics
     * 
     * Compares current month registrations to previous month
     * Returns percentage growth/decline
     * 
     * @return array
     */
    private function calculateMonthlyGrowth()
    {
        // <!-- Get current month count -->
        $currentMonth = ShopOwner::whereYear('created_at', now()->year)
            ->whereMonth('created_at', now()->month)
            ->count();

        // <!-- Get previous month count -->
        $previousMonth = ShopOwner::whereYear('created_at', now()->subMonth()->year)
            ->whereMonth('created_at', now()->subMonth()->month)
            ->count();

        // <!-- Calculate percentage change -->
        $growth = $previousMonth > 0
            ? (($currentMonth - $previousMonth) / $previousMonth) * 100
            : 0;

        return [
            'current' => $currentMonth,
            'previous' => $previousMonth,
            'percentage' => round($growth, 2),
        ];
    }

    /**
     * Create a new admin user
     */
    public function createAdmin(Request $request)
    {
        // Validate the request
        $validated = $request->validate([
            'first_name' => 'required|string|min:2|max:255',
            'last_name' => 'required|string|min:2|max:255',
            'email' => 'required|email|unique:super_admins,email',
            'phone' => 'required|string|min:10|max:15',
            'password' => 'required|string|min:8|confirmed|regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/',
            'role' => 'required|in:admin,super_admin',
        ], [
            'email.unique' => 'This email is already registered',
            'password.regex' => 'Password must contain uppercase, lowercase, and number',
        ]);

        try {
            // Create the admin user
            $admin = \App\Models\SuperAdmin::create([
                'first_name' => $validated['first_name'],
                'last_name' => $validated['last_name'],
                'email' => $validated['email'],
                'phone' => $validated['phone'],
                'password' => \Hash::make($validated['password']),
                'role' => $validated['role'],
                'status' => 'active',
            ]);

            return back()->with('success', 'Admin account created successfully');
        } catch (\Exception $e) {
            \Log::error('Error creating admin: ' . $e->getMessage());
            return back()->withErrors(['message' => 'Failed to create admin account'])->withInput();
        }
    }

    /**
     * Display all registered shops
     * 
     * Shows all approved and active shop owners for management
     * 
     * @return \Inertia\Response
     */
    public function showRegisteredShops()
    {
        // Fetch all approved shops with their documents
        $shops = ShopOwner::with('documents')
            ->whereIn('status', ['approved', 'suspended'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($shop) {
                return [
                    'id' => $shop->id,
                    'business_name' => $shop->business_name,
                    'business_type' => $shop->business_type,
                    'business_address' => $shop->business_address,
                    'first_name' => $shop->first_name,
                    'last_name' => $shop->last_name,
                    'email' => $shop->email,
                    'contact_number' => $shop->contact_number,
                    'status' => $shop->status,
                    'created_at' => $shop->created_at,
                    'updated_at' => $shop->updated_at,
                ];
            });

        // Calculate statistics
        $stats = [
            'total' => $shops->count(),
            'active' => $shops->where('status', 'approved')->count(),
            'suspended' => $shops->where('status', 'suspended')->count(),
            'thisMonth' => ShopOwner::whereIn('status', ['approved', 'suspended'])
                ->whereMonth('created_at', now()->month)
                ->whereYear('created_at', now()->year)
                ->count(),
        ];

        return Inertia::render('superAdmin/RegisteredShops', [
            'shops' => $shops,
            'stats' => $stats,
        ]);
    }

    /**
     * Suspend a shop
     * 
     * @param int $id
     * @return \Illuminate\Http\RedirectResponse
     */
    public function suspendShop($id)
    {
        try {
            $shop = ShopOwner::findOrFail($id);
            $shop->update(['status' => 'suspended']);

            return back()->with('success', 'Shop suspended successfully');
        } catch (\Exception $e) {
            \Log::error('Error suspending shop: ' . $e->getMessage());
            return back()->withErrors(['message' => 'Failed to suspend shop']);
        }
    }

    /**
     * Activate a shop
     * 
     * @param int $id
     * @return \Illuminate\Http\RedirectResponse
     */
    public function activateShop($id)
    {
        try {
            $shop = ShopOwner::findOrFail($id);
            $shop->update(['status' => 'approved']);

            return back()->with('success', 'Shop activated successfully');
        } catch (\Exception $e) {
            \Log::error('Error activating shop: ' . $e->getMessage());
            return back()->withErrors(['message' => 'Failed to activate shop']);
        }
    }

    /**
     * Delete a shop
     * 
     * @param int $id
     * @return \Illuminate\Http\RedirectResponse
     */
    public function deleteShop($id)
    {
        try {
            $shop = ShopOwner::findOrFail($id);
            
            // Delete associated documents from storage
            foreach ($shop->documents as $document) {
                if (Storage::disk('public')->exists($document->file_path)) {
                    Storage::disk('public')->delete($document->file_path);
                }
            }
            
            // Delete the shop (documents will be cascade deleted)
            $shop->delete();

            return redirect()->route('admin.registered-shops')->with('success', 'Shop deleted successfully');
        } catch (\Exception $e) {
            \Log::error('Error deleting shop: ' . $e->getMessage());
            return back()->withErrors(['message' => 'Failed to delete shop']);
        }
    }

    /**
     * Suspend a user
     * 
     * @param int $id
     * @return \Illuminate\Http\RedirectResponse
     */
    public function suspendUser($id)
    {
        try {
            $user = User::findOrFail($id);
            $user->update(['status' => 'suspended']);

            return back()->with('success', 'User suspended successfully');
        } catch (\Exception $e) {
            \Log::error('Error suspending user: ' . $e->getMessage());
            return back()->withErrors(['message' => 'Failed to suspend user']);
        }
    }

    /**
     * Activate a user
     * 
     * @param int $id
     * @return \Illuminate\Http\RedirectResponse
     */
    public function activateUser($id)
    {
        try {
            $user = User::findOrFail($id);
            $user->update(['status' => 'active']);

            return back()->with('success', 'User activated successfully');
        } catch (\Exception $e) {
            \Log::error('Error activating user: ' . $e->getMessage());
            return back()->withErrors(['message' => 'Failed to activate user']);
        }
    }

    /**
     * Delete a user
     * 
     * Prevents deletion of admin accounts for security
     * 
     * @param int $id
     * @return \Illuminate\Http\RedirectResponse
     */
    public function deleteUser($id)
    {
        try {
            // Check if user is an admin in super_admins table
            $isAdmin = \App\Models\SuperAdmin::where('id', $id)->exists();
            
            if ($isAdmin) {
                return back()->withErrors(['message' => 'Admin accounts cannot be deleted']);
            }

            $user = User::findOrFail($id);
            $user->delete();

            return back()->with('success', 'User deleted successfully');
        } catch (\Exception $e) {
            \Log::error('Error deleting user: ' . $e->getMessage());
            return back()->withErrors(['message' => 'Failed to delete user']);
        }
    }

    /**
     * Suspend an admin
     * 
     * @param int $id
     * @return \Illuminate\Http\RedirectResponse
     */
    public function suspendAdmin($id)
    {
        try {
            $admin = \App\Models\SuperAdmin::findOrFail($id);
            $admin->update(['status' => 'suspended']);

            return back()->with('success', 'Admin suspended successfully');
        } catch (\Exception $e) {
            \Log::error('Error suspending admin: ' . $e->getMessage());
            return back()->withErrors(['message' => 'Failed to suspend admin']);
        }
    }

    /**
     * Activate an admin
     * 
     * @param int $id
     * @return \Illuminate\Http\RedirectResponse
     */
    public function activateAdmin($id)
    {
        try {
            $admin = \App\Models\SuperAdmin::findOrFail($id);
            $admin->update(['status' => 'active']);

            return back()->with('success', 'Admin activated successfully');
        } catch (\Exception $e) {
            \Log::error('Error activating admin: ' . $e->getMessage());
            return back()->withErrors(['message' => 'Failed to activate admin']);
        }
    }

    /**
     * Delete an admin
     * 
     * @param int $id
     * @return \Illuminate\Http\RedirectResponse
     */
    public function deleteAdmin($id)
    {
        try {
            $admin = \App\Models\SuperAdmin::findOrFail($id);
            
            // Prevent deleting the currently logged-in admin
            if ($admin->id === auth()->guard('super_admin')->id()) {
                return back()->withErrors(['message' => 'You cannot delete your own account']);
            }

            $admin->delete();

            return back()->with('success', 'Admin deleted successfully');
        } catch (\Exception $e) {
            \Log::error('Error deleting admin: ' . $e->getMessage());
            return back()->withErrors(['message' => 'Failed to delete admin']);
        }
    }
}
