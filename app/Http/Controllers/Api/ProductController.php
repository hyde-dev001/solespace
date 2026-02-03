<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class ProductController extends Controller
{
    /**
     * Get all active products (for customers)
     */
    public function index(Request $request)
    {
        try {
            $query = Product::where('is_active', true)
                ->with('shopOwner:id,first_name,last_name,business_name');

            // Filter by category
            if ($request->has('category') && $request->category) {
                $query->where('category', $request->category);
            }

            // Filter by shop
            if ($request->has('shop_id') && $request->shop_id) {
                $query->where('shop_owner_id', $request->shop_id);
            }

            // Search
            if ($request->has('search') && $request->search) {
                $query->where(function($q) use ($request) {
                    $q->where('name', 'like', '%' . $request->search . '%')
                      ->orWhere('description', 'like', '%' . $request->search . '%')
                      ->orWhere('brand', 'like', '%' . $request->search . '%');
                });
            }

            // Sorting
            $sortBy = $request->get('sort_by', 'created_at');
            $sortOrder = $request->get('sort_order', 'desc');
            
            if ($sortBy === 'price') {
                $query->orderBy('price', $sortOrder);
            } elseif ($sortBy === 'name') {
                $query->orderBy('name', $sortOrder);
            } elseif ($sortBy === 'popular') {
                $query->orderBy('sales_count', 'desc');
            } else {
                $query->orderBy('created_at', $sortOrder);
            }

            $products = $query->paginate(12);

            return response()->json([
                'success' => true,
                'products' => $products,
            ]);

        } catch (\Exception $e) {
            Log::error('Error fetching products', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch products',
            ], 500);
        }
    }

    /**
     * Get single product by slug
     */
    public function show($slug)
    {
        try {
            $product = Product::where('slug', $slug)
                ->where('is_active', true)
                ->with('shopOwner:id,name')
                ->firstOrFail();

            // Increment view count
            $product->incrementViews();

            return response()->json([
                'success' => true,
                'product' => $product,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Product not found',
            ], 404);
        }
    }

    /**
     * Get products for shop owner (their products)
     */
    public function myProducts(Request $request)
    {
        try {
            $user = Auth::guard('shop_owner')->user();
            
            if (!$user) {
                return response()->json(['error' => 'Unauthorized'], 401);
            }

            $query = Product::where('shop_owner_id', $user->id);

            // Include inactive products for shop owner
            if ($request->has('include_inactive') && $request->include_inactive) {
                // Show all products
            } else {
                $query->where('is_active', true);
            }

            $products = $query->orderBy('created_at', 'desc')->get();

            return response()->json([
                'success' => true,
                'products' => $products,
            ]);

        } catch (\Exception $e) {
            Log::error('Error fetching shop owner products', [
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch products',
            ], 500);
        }
    }

    /**
     * Create new product (shop owner only)
     */
    public function store(Request $request)
    {
        try {
            $user = Auth::guard('shop_owner')->user();
            
            if (!$user) {
                return response()->json(['error' => 'Unauthorized'], 401);
            }

            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'description' => 'nullable|string',
                'price' => 'required|numeric|min:0|max:999999.99',
                'compare_at_price' => 'nullable|numeric|min:0|max:999999.99',
                'brand' => 'nullable|string|max:100',
                'category' => 'nullable|string|max:50',
                'stock_quantity' => 'required|integer|min:0',
                'sizes_available' => 'nullable|array',
                'colors_available' => 'nullable|array',
                'sku' => 'nullable|string|max:100',
                'weight' => 'nullable|numeric|min:0',
                'main_image' => 'nullable|string',
                'additional_images' => 'nullable|array',
                'variants' => 'nullable|array',
                'variants.*.size' => 'required|string',
                'variants.*.color' => 'required|string',
                'variants.*.quantity' => 'required|integer|min:0',
                'variants.*.image' => 'nullable|string',
                'variants.*.sku' => 'nullable|string',
            ]);

            $validated['shop_owner_id'] = $user->id;
            $validated['is_active'] = true;

            DB::beginTransaction();
            try {
                $product = Product::create($validated);

                // Create variants if provided
                if (isset($validated['variants']) && is_array($validated['variants'])) {
                    foreach ($validated['variants'] as $variantData) {
                        ProductVariant::create([
                            'product_id' => $product->id,
                            'size' => $variantData['size'],
                            'color' => $variantData['color'],
                            'quantity' => $variantData['quantity'],
                            'image' => $variantData['image'] ?? null,
                            'sku' => $variantData['sku'] ?? null,
                            'is_active' => true,
                        ]);
                    }
                }

                DB::commit();

                Log::info('Product created with variants', [
                    'product_id' => $product->id,
                    'shop_owner_id' => $user->id,
                    'name' => $product->name,
                    'variants_count' => count($validated['variants'] ?? []),
                ]);

                return response()->json([
                    'success' => true,
                    'message' => 'Product created successfully',
                    'product' => $product->load('variants'),
                ], 201);
            } catch (\Exception $e) {
                DB::rollBack();
                throw $e;
            }

        } catch (\Exception $e) {
            Log::error('Error creating product', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to create product',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update product (shop owner only)
     */
    public function update(Request $request, $id)
    {
        try {
            $user = Auth::guard('shop_owner')->user();
            
            if (!$user) {
                return response()->json(['error' => 'Unauthorized'], 401);
            }

            $product = Product::where('id', $id)
                ->where('shop_owner_id', $user->id)
                ->firstOrFail();

            $validated = $request->validate([
                'name' => 'sometimes|string|max:255',
                'description' => 'nullable|string',
                'price' => 'sometimes|numeric|min:0|max:999999.99',
                'compare_at_price' => 'nullable|numeric|min:0|max:999999.99',
                'brand' => 'nullable|string|max:100',
                'category' => 'nullable|string|max:50',
                'stock_quantity' => 'sometimes|integer|min:0',
                'is_active' => 'sometimes|boolean',
                'is_featured' => 'sometimes|boolean',
                'sizes_available' => 'nullable|array',
                'colors_available' => 'nullable|array',
                'sku' => 'nullable|string|max:100',
                'weight' => 'nullable|numeric|min:0',
                'main_image' => 'nullable|string',
                'additional_images' => 'nullable|array',
                'variants' => 'nullable|array',
                'variants.*.size' => 'required|string',
                'variants.*.color' => 'required|string',
                'variants.*.quantity' => 'required|integer|min:0',
                'variants.*.image' => 'nullable|string',
                'variants.*.sku' => 'nullable|string',
            ]);

            DB::beginTransaction();
            try {
                $product->update($validated);

                // Update variants if provided
                if (isset($validated['variants']) && is_array($validated['variants'])) {
                    // Delete old variants
                    $product->variants()->delete();
                    
                    // Create new variants
                    foreach ($validated['variants'] as $variantData) {
                        ProductVariant::create([
                            'product_id' => $product->id,
                            'size' => $variantData['size'],
                            'color' => $variantData['color'],
                            'quantity' => $variantData['quantity'],
                            'image' => $variantData['image'] ?? null,
                            'sku' => $variantData['sku'] ?? null,
                            'is_active' => true,
                        ]);
                    }
                }

                DB::commit();

                Log::info('Product updated with variants', [
                    'product_id' => $product->id,
                    'shop_owner_id' => $user->id,
                ]);

                return response()->json([
                    'success' => true,
                    'message' => 'Product updated successfully',
                    'product' => $product->load('variants'),
                ]);
            } catch (\Exception $e) {
                DB::rollBack();
                throw $e;
            }

        } catch (\Exception $e) {
            Log::error('Error updating product', [
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to update product',
            ], 500);
        }
    }

    /**
     * Delete product (soft delete)
     */
    public function destroy($id)
    {
        try {
            $user = Auth::guard('shop_owner')->user();
            
            if (!$user) {
                return response()->json(['error' => 'Unauthorized'], 401);
            }

            $product = Product::where('id', $id)
                ->where('shop_owner_id', $user->id)
                ->firstOrFail();

            $product->delete();

            Log::info('Product deleted', [
                'product_id' => $product->id,
                'shop_owner_id' => $user->id,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Product deleted successfully',
            ]);

        } catch (\Exception $e) {
            Log::error('Error deleting product', [
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to delete product',
            ], 500);
        }
    }

    /**
     * Upload product image
     */
    public function uploadImage(Request $request)
    {
        try {
            $request->validate([
                'image' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:10240', // 10MB max
            ]);

            if ($request->hasFile('image')) {
                $image = $request->file('image');
                $filename = time() . '_' . uniqid() . '.' . $image->getClientOriginalExtension();
                $path = $image->storeAs('products', $filename, 'public');

                return response()->json([
                    'success' => true,
                    'path' => '/storage/' . $path,
                    'url' => asset('storage/' . $path),
                ]);
            }

            return response()->json([
                'success' => false,
                'message' => 'No image file provided',
            ], 400);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->validator->errors()->first('image'),
            ], 422);
        } catch (\Exception $e) {
            Log::error('Error uploading image', [
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to upload image: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get product variants
     */
    public function getVariants($productId)
    {
        try {
            $product = Product::findOrFail($productId);
            
            // Check if user has access (for shop owner)
            $user = Auth::guard('shop_owner')->user();
            if ($user && $product->shop_owner_id !== $user->id) {
                return response()->json(['error' => 'Unauthorized'], 403);
            }

            $variants = $product->variants()->orderBy('size')->orderBy('color')->get();

            return response()->json([
                'success' => true,
                'variants' => $variants,
            ]);

        } catch (\Exception $e) {
            Log::error('Error fetching variants', [
                'product_id' => $productId,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch variants',
            ], 500);
        }
    }

    /**
     * Get available quantity for a specific variant
     */
    public function getVariantStock(Request $request, $productId)
    {
        try {
            $validated = $request->validate([
                'size' => 'required|string',
                'color' => 'required|string',
            ]);

            $variant = ProductVariant::where('product_id', $productId)
                ->where('size', $validated['size'])
                ->where('color', $validated['color'])
                ->where('is_active', true)
                ->first();

            if (!$variant) {
                return response()->json([
                    'success' => false,
                    'message' => 'Variant not found',
                    'quantity' => 0,
                ], 404);
            }

            return response()->json([
                'success' => true,
                'quantity' => $variant->quantity,
                'in_stock' => $variant->isInStock(),
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to check stock',
            ], 500);
        }
    }
}
