<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            // CSRF token
            'csrf_token' => csrf_token(),
            
            // Share authenticated super admin data
            'auth' => [
                'user' => $request->user('super_admin') ? [
                    'id' => $request->user('super_admin')->id,
                    'first_name' => $request->user('super_admin')->first_name,
                    'last_name' => $request->user('super_admin')->last_name,
                    'name' => $request->user('super_admin')->first_name . ' ' . $request->user('super_admin')->last_name,
                    'email' => $request->user('super_admin')->email,
                    'role' => $request->user('super_admin')->role,
                ] : null,
            ],
        ];
    }
}
