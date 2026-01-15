<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     */
    public function version(Request $request): string|null
    {
        return parent::version($request);
    }

    /**
     * Defines the props that are shared by default.
     */
    public function share(Request $request): array
    {
        return array_merge(parent::share($request), [
            // <!-- CSRF token automatically available to all Inertia components -->
            'csrf_token' => csrf_token(),
            
            // <!-- Share authenticated super admin user data -->
            'auth' => [
                'user' => $request->user('super_admin') ? [
                    'id' => $request->user('super_admin')->id,
                    'name' => $request->user('super_admin')->name,
                    'email' => $request->user('super_admin')->email,
                ] : null,
                
                // <!-- Share authenticated shop owner data -->
                'shop_owner' => $request->user('shop_owner') ? [
                    'id' => $request->user('shop_owner')->id,
                    'first_name' => $request->user('shop_owner')->first_name,
                    'last_name' => $request->user('shop_owner')->last_name,
                    'business_name' => $request->user('shop_owner')->business_name,
                    'email' => $request->user('shop_owner')->email,
                ] : null,
            ],
        ]);
    }
}
