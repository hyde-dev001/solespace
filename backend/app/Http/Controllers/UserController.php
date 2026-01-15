<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;

/**
 * UserController
 * 
 * Handles user registration and authentication
 */
class UserController extends Controller
{
    /**
     * Register a new user
     * 
     * Users are automatically activated upon registration
     * No approval process required
     * 
     * @param Request $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function register(Request $request)
    {
        // Validate registration data
        $validated = $request->validate([
            'name' => 'required|string|max:255|min:3',
            'email' => 'required|string|email|max:255|unique:users,email',
            'phone' => 'required|string|max:15|min:10',
            'age' => 'required|integer|min:18|max:120',
            'password' => [
                'required',
                'string',
                'min:6',
                'confirmed',
            ],
            'address' => 'required|string|max:500',
            'valid_id' => 'required|file|mimes:jpg,jpeg,png,pdf|max:5120', // 5MB max
        ], [
            'name.required' => 'Name is required',
            'name.min' => 'Name must be at least 3 characters',
            'email.required' => 'Email is required',
            'email.email' => 'Please provide a valid email address',
            'email.unique' => 'This email is already registered',
            'phone.required' => 'Phone number is required',
            'phone.min' => 'Phone number must be at least 10 digits',
            'phone.max' => 'Phone number must not exceed 15 digits',
            'age.required' => 'Age is required',
            'age.min' => 'You must be at least 18 years old to register',
            'age.max' => 'Please enter a valid age',
            'password.required' => 'Password is required',
            'password.min' => 'Password must be at least 6 characters',
            'password.confirmed' => 'Passwords do not match',
            'address.required' => 'Address is required',
            'valid_id.required' => 'Valid ID is required',
            'valid_id.file' => 'Please upload a valid file',
            'valid_id.mimes' => 'Valid ID must be a JPG, PNG, or PDF file',
            'valid_id.max' => 'File size must not exceed 5MB',
        ]);

        try {
            // Split name into first and last name
            $nameParts = explode(' ', trim($validated['name']), 2);
            $firstName = $nameParts[0];
            $lastName = isset($nameParts[1]) ? $nameParts[1] : '';

            // Handle valid ID upload
            $validIdPath = null;
            if ($request->hasFile('valid_id')) {
                $file = $request->file('valid_id');
                $fileName = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
                $validIdPath = $file->storeAs('valid_ids', $fileName, 'public');
            }

            // Create the user with active status by default
            $user = User::create([
                'first_name' => $firstName,
                'last_name' => $lastName,
                'email' => $validated['email'],
                'phone' => $validated['phone'],
                'age' => $validated['age'],
                'password' => Hash::make($validated['password']),
                'address' => $validated['address'],
                'status' => 'active',
                'valid_id_path' => $validIdPath,
            ]);

            // Log the user in automatically
            auth()->login($user);

            return redirect('/')->with('success', 'Registration successful! Welcome to SoleSpace.');
        } catch (\Exception $e) {
            \Log::error('Error registering user: ' . $e->getMessage());
            return back()->withErrors(['message' => 'Registration failed. Please try again.'])->withInput();
        }
    }

    /**
     * Login a user
     * 
     * @param Request $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        if (auth()->attempt($credentials, $request->filled('remember'))) {
            $request->session()->regenerate();

            // Update last login information
            auth()->user()->update([
                'last_login_at' => now(),
                'last_login_ip' => $request->ip(),
            ]);

            return redirect()->intended(route('home'))->with('success', 'Welcome back!');
        }

        return back()->withErrors([
            'email' => 'The provided credentials do not match our records.',
        ])->withInput($request->only('email'));
    }

    /**
     * Logout a user
     * 
     * @param Request $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function logout(Request $request)
    {
        auth()->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('home')->with('success', 'You have been logged out.');
    }
}
