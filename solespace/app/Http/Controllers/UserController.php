<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

/**
 * UserController
 * 
 * Handles user registration, authentication, and profile management
 * for regular customers on the platform
 */
class UserController extends Controller
{
    /**
     * Register a new user account
     * 
     * Users are automatically activated upon registration
     * No admin approval required for user accounts
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse|\Illuminate\Http\RedirectResponse
     */
    public function register(Request $request)
    {
        try {
            // Validate registration data
            $validated = $request->validate([
                'first_name' => 'required|string|max:255|min:2',
                'last_name' => 'required|string|max:255|min:2',
                'email' => 'required|string|email|max:255|unique:users,email',
                'phone' => 'required|string|max:15|min:10',
                'age' => 'required|integer|min:18|max:120',
                'password' => [
                    'required',
                    'string',
                    'min:8',
                    'confirmed',
                    'regex:/[a-z]/',      // must contain at least one lowercase letter
                    'regex:/[A-Z]/',      // must contain at least one uppercase letter
                    'regex:/[0-9]/',      // must contain at least one digit
                ],
                'address' => 'required|string|max:500',
                'valid_id' => 'required|file|mimes:jpg,jpeg,png,pdf|max:5120', // 5MB max
            ], [
                'first_name.required' => 'First name is required',
                'first_name.min' => 'First name must be at least 2 characters',
                'last_name.required' => 'Last name is required',
                'last_name.min' => 'Last name must be at least 2 characters',
                'email.required' => 'Email is required',
                'email.email' => 'Please provide a valid email address',
                'email.unique' => 'This email is already registered',
                'phone.required' => 'Phone number is required',
                'phone.min' => 'Phone number must be at least 10 digits',
                'age.required' => 'Age is required',
                'age.min' => 'You must be at least 18 years old to register',
                'password.required' => 'Password is required',
                'password.min' => 'Password must be at least 8 characters',
                'password.confirmed' => 'Passwords do not match',
                'password.regex' => 'Password must contain uppercase, lowercase, and numbers',
                'address.required' => 'Address is required',
                'valid_id.required' => 'Valid ID is required',
                'valid_id.mimes' => 'Valid ID must be a JPG, PNG, or PDF file',
                'valid_id.max' => 'File size must not exceed 5MB',
            ]);

            // Handle valid ID upload
            $validIdPath = null;
            if ($request->hasFile('valid_id')) {
                $file = $request->file('valid_id');
                $fileName = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
                $validIdPath = $file->storeAs('valid_ids', $fileName, 'public');
            }

            // Create the user with active status
            $user = User::create([
                'first_name' => $validated['first_name'],
                'last_name' => $validated['last_name'],
                'name' => $validated['first_name'] . ' ' . $validated['last_name'],
                'email' => $validated['email'],
                'phone' => $validated['phone'],
                'age' => $validated['age'],
                'password' => Hash::make($validated['password']),
                'address' => $validated['address'],
                'status' => 'active',
                'valid_id_path' => $validIdPath,
            ]);

            \Log::info('User registered successfully', ['user_id' => $user->id, 'email' => $user->email]);

            // Return success response
            if ($request->expectsJson()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Registration successful! You can now login.',
                    'user' => [
                        'id' => $user->id,
                        'name' => $user->name,
                        'email' => $user->email,
                    ],
                ], 201);
            }

            return back()->with('success', 'Registration successful! You can now login.');

        } catch (ValidationException $e) {
            \Log::warning('User registration validation failed', ['errors' => $e->errors()]);
            
            if ($request->expectsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $e->errors(),
                ], 422);
            }

            throw $e;
            
        } catch (\Exception $e) {
            \Log::error('Error registering user', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            if ($request->expectsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Registration failed. Please try again.',
                ], 500);
            }

            return back()->withErrors(['message' => 'Registration failed. Please try again.'])->withInput();
        }
    }

    /**
     * Login a user
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse|\Illuminate\Http\RedirectResponse
     */
    public function login(Request $request)
    {
        try {
            $credentials = $request->validate([
                'email' => 'required|email',
                'password' => 'required',
            ]);

            // Find user by email
            $user = User::where('email', $credentials['email'])->first();

            // Check if user exists
            if (!$user) {
                throw ValidationException::withMessages([
                    'email' => ['Invalid email or password.'],
                ]);
            }

            // Check if user account is active
            if ($user->status !== 'active') {
                throw ValidationException::withMessages([
                    'email' => ['Your account has been suspended. Please contact support.'],
                ]);
            }

            // Verify password
            if (!Hash::check($credentials['password'], $user->password)) {
                throw ValidationException::withMessages([
                    'email' => ['Invalid email or password.'],
                ]);
            }

            // Login the user
            Auth::login($user, $request->filled('remember'));

            // Regenerate session
            $request->session()->regenerate();

            // Update last login information
            $user->update([
                'last_login_at' => now(),
                'last_login_ip' => $request->ip(),
            ]);

            \Log::info('User logged in successfully', ['user_id' => $user->id]);

            // Return success response
            if ($request->expectsJson()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Login successful!',
                    'user' => [
                        'id' => $user->id,
                        'name' => $user->name,
                        'email' => $user->email,
                    ],
                ]);
            }

            return redirect()->intended('/')->with('success', 'Welcome back!');

        } catch (ValidationException $e) {
            if ($request->expectsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Login failed',
                    'errors' => $e->errors(),
                ], 422);
            }

            throw $e;
        } catch (\Exception $e) {
            \Log::error('Error logging in user', ['error' => $e->getMessage()]);

            if ($request->expectsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Login failed. Please try again.',
                ], 500);
            }

            return back()->withErrors(['email' => 'Login failed. Please try again.']);
        }
    }

    /**
     * Logout a user
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse|\Illuminate\Http\RedirectResponse
     */
    public function logout(Request $request)
    {
        $userId = Auth::id();

        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        \Log::info('User logged out', ['user_id' => $userId]);

        if ($request->expectsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'Logged out successfully',
            ]);
        }

        return redirect('/')->with('success', 'You have been logged out.');
    }

    /**
     * Get current authenticated user
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function me(Request $request)
    {
        $user = Auth::user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Not authenticated',
            ], 401);
        }

        return response()->json([
            'success' => true,
            'user' => [
                'id' => $user->id,
                'first_name' => $user->first_name,
                'last_name' => $user->last_name,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'age' => $user->age,
                'address' => $user->address,
                'status' => $user->status,
            ],
        ]);
    }
}
