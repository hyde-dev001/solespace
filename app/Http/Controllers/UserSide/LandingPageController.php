<?php

namespace App\Http\Controllers\UserSide;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class LandingPageController extends Controller
{
    /**
     * Display the landing page.
     */
    public function index(): Response
    {
        return Inertia::render('UserSide/LandingPage');
    }

    /**
     * Display the products page.
     */
    public function products(): Response
    {
        return Inertia::render('UserSide/Products');
    }

    /**
     * Display a single product page.
     */
    public function productShow(string $slug): Response
    {
        // Simple mapping for demo — replace with real DB lookup later
        $images = [];
        for ($i = 1; $i <= 8; $i++) {
            $images[] = '/images/product/product-' . str_pad($i, 2, '0', STR_PAD_LEFT) . '.jpg';
        }

        // shops sample data
        $shops = [
            ['id' => 1, 'name' => 'SoleHouse', 'slug' => 'solehouse', 'colors' => ['#000000', '#ffffff', '#b91c1c']],
            ['id' => 2, 'name' => 'KickStop', 'slug' => 'kickstop', 'colors' => ['#0ea5e9', '#111827']],
            ['id' => 3, 'name' => 'StreetRun', 'slug' => 'streetrun', 'colors' => []],
            ['id' => 4, 'name' => 'UrbanStep', 'slug' => 'urbanstep', 'colors' => ['#ef4444']],
        ];

        // determine product index from slug; default to 1
        $prodIndex = 1;
        if (preg_match('/product-(\d{2})/', $slug, $m)) {
            $idx = (int)$m[1];
            if ($idx >= 1 && $idx <= 8) {
                $prodIndex = $idx;
            }
        }

        $primary = '/images/product/product-' . str_pad($prodIndex, 2, '0', STR_PAD_LEFT) . '.jpg';

        // pick shop by product index
        $shop = $shops[($prodIndex - 1) % count($shops)];

        return Inertia::render('UserSide/ProductShow', [
            'product' => [
                'name' => "Zip Motion Hoodie - Red",
                'price' => '₱3,800',
                'primary' => $primary,
                'images' => $images,
                'sizes' => ['S', 'M', 'L', 'XL', 'XXL'],
                'colors' => $shop['colors'],
                'shop' => $shop,
                'description' => "Fuel the momentum. The Zip Motion Hoodie in Red is built for movement and everyday performance.",
            ],
        ]);
    }

    /**
     * Display the repair services page.
     */
    public function repair(): Response
    {
        return Inertia::render('UserSide/Repair');
    }

    /**
     * Display the services page.
     */
    public function services(): Response
    {
        return Inertia::render('UserSide/Services');
    }

    /**
     * Display the contact page.
     */
    public function contact(): Response
    {
        return Inertia::render('UserSide/Contact');
    }

    /**
     * Display the register page.
     */
    public function register(): Response
    {
        return Inertia::render('UserSide/Register');
    }

    /**
     * Display the login page.
     */
    public function login(): Response
    {
        return Inertia::render('UserSide/Login');
    }

    /**
     * Display the shop owner registration page.
     */
    public function shopOwnerRegister(): Response
    {
        return Inertia::render('UserSide/ShopOwnerRegistration');
    }
}
