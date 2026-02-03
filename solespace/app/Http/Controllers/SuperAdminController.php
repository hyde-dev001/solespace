<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use App\Models\SuperAdmin;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;

class SuperAdminController extends Controller
{
    /**
     * Show create admin form
     */
    public function showCreateAdmin(): Response
    {
        return Inertia::render('superAdmin/CreateAdmin');
    }
    /**
     * Show admin management page
     */
    public function showAdminManagement(): Response
    {
        // Get current authenticated admin ID
        $currentAdminId = auth('super_admin')->id();
        
        // Fetch all super admins except the currently logged in one
        $admins = SuperAdmin::where('id', '!=', $currentAdminId)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($admin) {
                return [
                    'id' => $admin->id,
                    'firstName' => $admin->first_name,
                    'lastName' => $admin->last_name,
                    'email' => $admin->email,
                    'status' => $admin->status,
                    'createdAt' => $admin->created_at->format('Y-m-d H:i:s'),
                    'lastLogin' => $admin->last_login ? $admin->last_login->format('Y-m-d H:i:s') : null,
                ];
            });

        // Calculate statistics
        $stats = [
            'total' => $admins->count(),
            'active' => $admins->where('status', 'active')->count(),
            'suspended' => $admins->where('status', 'suspended')->count(),
            'inactive' => $admins->where('status', 'inactive')->count(),
        ];

        return Inertia::render('superAdmin/AdminManagement', [
            'admins' => $admins,
            'stats' => $stats
        ]);
    }

    /**
     * Show shop registrations page
     */
    public function showShopRegistrations(): Response
    {
        return Inertia::render('superAdmin/ShopRegistrations', [
            'registrations' => []
        ]);
    }

    /**
     * Show registered shops page
     */
    public function showRegisteredShops(): Response
    {
        return Inertia::render('superAdmin/RegisteredShops', [
            'shops' => [],
            'stats' => [
                'total' => 0,
                'active' => 0,
                'suspended' => 0
            ]
        ]);
    }

    /**
     * Show data reports dashboard (placeholder values for now)
     */
    public function showDataReports(): Response
    {
        return Inertia::render('superAdmin/DataReportAccess', [
            'stats' => [
                'totalUsers' => 0,
                'totalShopOwners' => 0,
                'pendingApprovals' => 0,
                'approvedShopOwners' => 0,
                'rejectedShopOwners' => 0,
                'recentRegistrations' => 0,
                'recentApprovals' => 0,
                'totalDocuments' => 0,
                'pendingDocuments' => 0,
                'approvedDocuments' => 0,
                'monthlyGrowth' => [
                    'current' => 0,
                    'previous' => 0,
                    'percentage' => 0,
                ],
            ],
        ]);
    }

    /**
     * Show user management page (placeholder values for now)
     */
    public function showUserManagement(): Response
    {
        return Inertia::render('superAdmin/SuperAdminUserManagement', [
            'users' => [],
            'stats' => [
                'total' => 0,
                'active' => 0,
                'suspended' => 0,
                'thisMonth' => 0,
            ],
        ]);
    }

    /**
     * Admin action stubs
     */
    public function suspendUser($id)
    {
        return redirect()->back()->with('success', 'User suspension request received.');
    }

    public function activateUser($id)
    {
        return redirect()->back()->with('success', 'User activation request received.');
    }

    public function deleteUser($id)
    {
        return redirect()->back()->with('success', 'User deletion request received.');
    }

    public function suspendAdmin($id)
    {
        return redirect()->back()->with('success', 'Admin suspension request received.');
    }

    public function activateAdmin($id)
    {
        return redirect()->back()->with('success', 'Admin activation request received.');
    }

    public function deleteAdmin($id)
    {
        return redirect()->back()->with('success', 'Admin deletion request received.');
    }

    public function suspendShop($id)
    {
        return redirect()->back()->with('success', 'Shop suspension request received.');
    }

    public function activateShop($id)
    {
        return redirect()->back()->with('success', 'Shop activation request received.');
    }

    public function deleteShop($id)
    {
        return redirect()->back()->with('success', 'Shop deletion request received.');
    }

    /**
     * Show flagged accounts page
     */
    public function showFlaggedAccounts(): Response
    {
        return Inertia::render('superAdmin/FlaggedAccounts');
    }

    /**
     * Approve shop owner registration
     */
    public function approveShopOwner(Request $request, $id)
    {
        // TODO: Implement approval logic
        return back()->with('success', 'Shop owner approved successfully');
    }

    /**
     * Reject shop owner registration
     */
    public function rejectShopOwner(Request $request, $id)
    {
        $request->validate([
            'reason' => 'required|string'
        ]);

        // TODO: Implement rejection logic
        return back()->with('success', 'Shop owner rejected successfully');
    }

    /**
     * Create a new admin
     */
    public function createAdmin(Request $request)
    {
        $validated = $request->validate([
            'first_name' => 'required|string|min:2|max:255',
            'last_name' => 'required|string|min:2|max:255',
            'email' => 'required|email|unique:super_admins,email',
            'phone' => 'required|string|min:10|max:20',
            'password' => ['required', 'string', Password::min(8)->mixedCase()->numbers(), 'confirmed'],
            'role' => 'required|string|in:admin,super_admin',
        ], [
            'email.unique' => 'This email address is already registered.',
            'password.min' => 'Password must be at least 8 characters.',
        ]);

        try {
            // Create the admin account
            $admin = SuperAdmin::create([
                'first_name' => $validated['first_name'],
                'last_name' => $validated['last_name'],
                'email' => $validated['email'],
                'phone' => $validated['phone'],
                'password' => Hash::make($validated['password']),
                'role' => $validated['role'],
                'status' => 'active',
            ]);

            return redirect()->route('admin.admin-management')
                ->with('success', 'Admin account created successfully');
        } catch (\Exception $e) {
            return back()
                ->withInput($request->except('password', 'password_confirmation'))
                ->withErrors(['error' => 'Failed to create admin account. Please try again.']);
        }
    }
}
