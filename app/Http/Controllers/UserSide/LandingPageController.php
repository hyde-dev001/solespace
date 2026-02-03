<?php

namespace App\Http\Controllers\UserSide;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ShopOwner;
use Inertia\Inertia;
use Inertia\Response;

class LandingPageController extends Controller
{
    /**
     * Display the landing page.
     */
    public function index(): Response
    {
        // Get featured products (limit to 3 for landing page)
        $products = Product::where('is_active', true)
            ->with('shopOwner:id,first_name,last_name,business_name')
            ->orderBy('created_at', 'desc')
            ->take(3)
            ->get()
            ->map(function ($product) {
                return [
                    'id' => $product->id,
                    'name' => $product->name,
                    'slug' => $product->slug,
                    'description' => $product->description,
                    'price' => $product->price,
                    'compare_at_price' => $product->compare_at_price,
                    'main_image' => $product->main_image,
                    'stock_quantity' => $product->stock_quantity,
                    'shop_owner' => [
                        'id' => $product->shopOwner->id,
                        'business_name' => $product->shopOwner->business_name,
                    ],
                ];
            });

        return Inertia::render('UserSide/LandingPage', [
            'products' => $products,
        ]);
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
        $product = Product::where('slug', $slug)
            ->where('is_active', true)
            ->with(['shopOwner:id,first_name,last_name,business_name', 'variants'])
            ->firstOrFail();

        // Increment view count
        $product->incrementViews();

        // Parse sizes and colors from JSON
        $sizes = $product->sizes_available ?? [];
        $colors = $product->colors_available ?? [];

        // Get all product images (main + additional)
        $images = [];
        if ($product->main_image) {
            $images[] = $product->main_image;
        }
        if ($product->additional_images && is_array($product->additional_images)) {
            $images = array_merge($images, $product->additional_images);
        }
        
        // Ensure at least one image exists (fallback to main_image)
        if (empty($images) && $product->main_image) {
            $images = [$product->main_image];
        }

        // Prepare shop data
        $shop = [
            'id' => $product->shopOwner->id,
            'name' => $product->shopOwner->business_name,
            'slug' => 'shop-' . $product->shopOwner->id,
            'colors' => $colors,
        ];

        return Inertia::render('UserSide/ProductShow', [
            'product' => [
                'id' => $product->id,
                'name' => $product->name,
                'price' => '₱' . number_format($product->price, 0),
                'compare_at_price' => $product->compare_at_price ? '₱' . number_format($product->compare_at_price, 0) : null,
                'primary' => $product->main_image,
                'images' => $images,
                'sizes' => $sizes,
                'colors' => $colors,
                'colors_available' => $colors,
                'shop' => $shop,
                'description' => $product->description,
                'brand' => $product->brand,
                'category' => $product->category,
                'stock_quantity' => $product->stock_quantity,
                'sku' => $product->sku,
                'weight' => $product->weight,
                'views_count' => $product->views_count,
                'variants' => $product->variants ? $product->variants->map(function($variant) {
                    return [
                        'id' => $variant->id,
                        'size' => $variant->size,
                        'color' => $variant->color,
                        'quantity' => $variant->quantity,
                        'image' => $variant->image,
                        'sku' => $variant->sku,
                    ];
                })->toArray() : [],
                'sales_count' => $product->sales_count,
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

    /**
     * Display shop profile page with products
     */
    public function shopProfile(int $id): Response
    {
        $shopOwner = ShopOwner::where('id', $id)
            ->where('status', 'approved')
            ->firstOrFail();

        // Get all active products from this shop
        $products = Product::where('shop_owner_id', $id)
            ->where('is_active', true)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($product) {
                return [
                    'id' => $product->id,
                    'name' => $product->name,
                    'slug' => $product->slug,
                    'price' => $product->price,
                    'compare_at_price' => $product->compare_at_price,
                    'brand' => $product->brand,
                    'category' => $product->category,
                    'stock_quantity' => $product->stock_quantity,
                    'main_image' => $product->main_image,
                    'description' => $product->description,
                ];
            });

        return Inertia::render('UserSide/ShopProfile', [
            'shop' => [
                'id' => $shopOwner->id,
                'name' => $shopOwner->business_name,
                'description' => 'Premium footwear products and services',
                'address' => $shopOwner->business_address,
                'phone' => $shopOwner->phone,
                'email' => $shopOwner->email,
                'cover_image' => '/images/shop/shop-cover.jpg',
                'profile_icon' => '/images/shop/shop-icon.png',
                'rating' => 4.8,
                'total_reviews' => 0,
                'established_year' => 2024,
            ],
            'products' => $products,
        ]);
    }
}
