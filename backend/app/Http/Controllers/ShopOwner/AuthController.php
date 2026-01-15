<?php

namespace App\Http\Controllers\ShopOwner;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\ShopOwner as ShopOwnerModel;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class AuthController extends Controller
{
    /**
     * Show the shop owner login form.
     */
    public function showLoginForm()
    {
        return view('shop-owner.login');
    }

    /**
     * Handle shop owner login.
     */
    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $shopOwner = ShopOwnerModel::where('email', $request->email)->first();

        if (!$shopOwner || !Hash::check($request->password, $shopOwner->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid credentials'
            ], 401);
        }

        // Check if shop owner is approved
        if ($shopOwner->status !== 'approved') {
            return response()->json([
                'success' => false,
                'message' => 'Your account is pending approval or has been rejected'
            ], 403);
        }

        // Login the shop owner
        Auth::guard('shop_owner')->login($shopOwner, $request->filled('remember'));

        return response()->json([
            'success' => true,
            'message' => 'Login successful',
            'shop_owner' => [
                'id' => $shopOwner->id,
                'name' => $shopOwner->business_name,
                'email' => $shopOwner->email,
            ]
        ]);
    }

    /**
     * Handle shop owner logout.
     */
    public function logout(Request $request)
    {
        Auth::guard('shop_owner')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/shop-owner/login');
    }

    /**
     * Get authenticated shop owner profile.
     */
    public function profile()
    {
        $shopOwner = Auth::guard('shop_owner')->user();

        return response()->json([
            'success' => true,
            'shop_owner' => $shopOwner
        ]);
    }

    /**
     * Update shop owner profile.
     */
    public function updateProfile(Request $request)
    {
        $shopOwner = Auth::guard('shop_owner')->user();

        $validator = Validator::make($request->all(), [
            'shop_name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:shop_owners,email,' . $shopOwner->id,
            'phone' => 'sometimes|string|max:20',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $shopOwner->update($request->only(['shop_name', 'email', 'phone']));

        return response()->json([
            'success' => true,
            'message' => 'Profile updated successfully',
            'shop_owner' => $shopOwner
        ]);
    }

    /**
     * Change shop owner password.
     */
    public function changePassword(Request $request)
    {
        $shopOwner = Auth::guard('shop_owner')->user();

        $validator = Validator::make($request->all(), [
            'current_password' => 'required|string',
            'new_password' => 'required|string|min:8|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        if (!Hash::check($request->current_password, $shopOwner->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Current password is incorrect'
            ], 401);
        }

        $shopOwner->password = Hash::make($request->new_password);
        $shopOwner->save();

        return response()->json([
            'success' => true,
            'message' => 'Password changed successfully'
        ]);
    }
}
