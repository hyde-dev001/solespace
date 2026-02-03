<?php

namespace App\Http\Controllers\UserSide;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class CheckoutController extends Controller
{
    /**
     * Create order from cart items
     */
    public function createOrder(Request $request)
    {
        try {
            $validated = $request->validate([
                'items' => 'required|array|min:1',
                'items.*.id' => 'required',
                'items.*.pid' => 'required|integer',
                'items.*.qty' => 'required|integer|min:1',
                'items.*.name' => 'required|string',
                'items.*.price' => 'required|numeric|min:0',
                'items.*.size' => 'nullable|string',
                'items.*.color' => 'nullable|string',
                'items.*.image' => 'nullable|string',
                'items.*.options' => 'nullable',
                'total_amount' => 'required|numeric|min:0',
                'customer_name' => 'required|string|max:255',
                'customer_email' => 'required|email|max:255',
                'customer_phone' => 'nullable|string|max:20',
                'shipping_address' => 'required|string|max:500',
                'payment_method' => 'nullable|string|max:50',
            ]);

            // Get authenticated user
            $user = Auth::guard('user')->user();
            $customerId = $user ? $user->id : null;

            // Group items by shop owner (products from same shop go to same order)
            $itemsByShop = [];
            foreach ($validated['items'] as $item) {
                $product = Product::find($item['pid']);
                if (!$product) {
                    return response()->json([
                        'success' => false,
                        'message' => "Product not found: {$item['name']}",
                    ], 404);
                }

                // Extract variant details from cart item
                $options = isset($item['options']) ? (is_string($item['options']) ? json_decode($item['options'], true) : $item['options']) : [];
                $itemSize = $item['size'] ?? null;
                // Try to get color from direct field first, then from options
                $itemColor = $item['color'] ?? $options['color'] ?? null;
                
                // LOG: Check what we're extracting with FULL item dump
                Log::info('Checkout - Extracting variant details for stock check', [
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'FULL_ITEM_DATA' => $item, // Log entire item to see everything
                    'item_array_keys' => array_keys($item),
                    'has_color_field' => isset($item['color']),
                    'color_value' => $item['color'] ?? 'NOT SET',
                    'has_options' => isset($item['options']),
                    'options' => $options,
                    'extracted_size' => $itemSize,
                    'extracted_color' => $itemColor,
                ]);

                // Check variant-specific stock availability
                if ($itemSize && $itemColor) {
                    $variant = ProductVariant::where('product_id', $product->id)
                        ->where('size', $itemSize)
                        ->where('color', $itemColor)
                        ->first();

                    if (!$variant) {
                        return response()->json([
                            'success' => false,
                            'message' => "Variant not found for {$product->name} (Size {$itemSize}, Color {$itemColor})",
                        ], 404);
                    }

                    if ($variant->quantity < $item['qty']) {
                        return response()->json([
                            'success' => false,
                            'message' => "Insufficient stock for {$product->name} (Size {$itemSize}, Color {$itemColor}). Available: {$variant->quantity}",
                        ], 400);
                    }
                } else {
                    // Fallback to product-level stock check if no variant specified
                    if ($product->stock_quantity < $item['qty']) {
                        return response()->json([
                            'success' => false,
                            'message' => "Insufficient stock for {$product->name}. Available: {$product->stock_quantity}",
                        ], 400);
                    }
                }

                $shopOwnerId = $product->shop_owner_id;
                if (!isset($itemsByShop[$shopOwnerId])) {
                    $itemsByShop[$shopOwnerId] = [];
                }
                $itemsByShop[$shopOwnerId][] = [
                    'item' => $item,
                    'product' => $product,
                ];
            }

            $createdOrders = [];

            DB::beginTransaction();

            try {
                // Create separate order for each shop owner
                foreach ($itemsByShop as $shopOwnerId => $shopItems) {
                    $orderTotal = 0;

                    // Create the order
                    $order = Order::create([
                        'shop_owner_id' => $shopOwnerId,
                        'customer_id' => $customerId,
                        'order_number' => Order::generateOrderNumber(),
                        'total_amount' => 0, // Will update after items
                        'status' => 'pending',
                        'customer_name' => $validated['customer_name'],
                        'customer_email' => $validated['customer_email'],
                        'customer_phone' => $validated['customer_phone'] ?? null,
                        'shipping_address' => $validated['shipping_address'],
                        'payment_method' => $validated['payment_method'] ?? 'paymongo',
                        'payment_status' => 'pending',
                    ]);

                    // Create order items and reduce stock
                    foreach ($shopItems as $shopItem) {
                        $item = $shopItem['item'];
                        $product = $shopItem['product'];

                        $subtotal = $item['price'] * $item['qty'];
                        $orderTotal += $subtotal;

                        // Extract options for color and image
                        $options = isset($item['options']) ? (is_string($item['options']) ? json_decode($item['options'], true) : $item['options']) : [];
                        $itemSize = $item['size'] ?? null;
                        // Try to get color from direct field first, then from options
                        $itemColor = $item['color'] ?? $options['color'] ?? null;
                        $itemImage = $options['image'] ?? $item['image'] ?? $product->main_image;

                        Log::info('Processing order item', [
                            'product_id' => $product->id,
                            'product_name' => $product->name,
                            'item_data' => $item,
                            'extracted_size' => $itemSize,
                            'extracted_color' => $itemColor,
                            'has_options' => isset($item['options']),
                            'options' => $options,
                        ]);

                        // LOG: What we're saving to order_items
                        Log::info('Checkout - Creating order_item', [
                            'order_id' => $order->id,
                            'product_id' => $product->id,
                            'size_to_save' => $itemSize,
                            'color_to_save' => $itemColor,
                            'image_to_save' => $itemImage,
                        ]);

                        OrderItem::create([
                            'order_id' => $order->id,
                            'product_id' => $product->id,
                            'product_name' => $product->name,
                            'product_slug' => $product->slug,
                            'price' => $item['price'],
                            'quantity' => $item['qty'],
                            'subtotal' => $subtotal,
                            'size' => $itemSize,
                            'color' => $itemColor,
                            'product_image' => $itemImage,
                        ]);

                        // Reduce variant-specific stock quantity
                        if ($itemSize && $itemColor) {
                            Log::info('Checkout - Looking for variant to decrement', [
                                'product_id' => $product->id,
                                'size' => $itemSize,
                                'color' => $itemColor,
                                'qty_to_reduce' => $item['qty']
                            ]);
                            
                            $variant = ProductVariant::where('product_id', $product->id)
                                ->where('size', $itemSize)
                                ->where('color', $itemColor)
                                ->first();

                            if ($variant) {
                                Log::info('Checkout - Variant FOUND, decrementing now', [
                                    'variant_id' => $variant->id,
                                    'before_quantity' => $variant->quantity,
                                    'reducing_by' => $item['qty']
                                ]);
                                
                                $variant->decrement('quantity', $item['qty']);
                                
                                // Refresh to get updated value
                                $variant->refresh();
                                
                                Log::info('Variant stock decremented', [
                                    'product_id' => $product->id,
                                    'variant_id' => $variant->id,
                                    'size' => $itemSize,
                                    'color' => $itemColor,
                                    'quantity_reduced' => $item['qty'],
                                    'remaining' => $variant->quantity,
                                ]);
                            } else {
                                Log::warning('Variant NOT FOUND for stock deduction', [
                                    'product_id' => $product->id,
                                    'size' => $itemSize,
                                    'color' => $itemColor,
                                    'searched_product_id' => $product->id,
                                ]);
                            }
                        } else {
                            Log::warning('Missing size or color for variant stock deduction', [
                                'product_id' => $product->id,
                                'product_name' => $product->name,
                                'size' => $itemSize,
                                'color' => $itemColor,
                                'has_size' => !empty($itemSize),
                                'has_color' => !empty($itemColor),
                            ]);
                        }

                        // Also reduce total product stock quantity
                        $product->decrement('stock_quantity', $item['qty']);
                    }

                    // Update order total
                    $order->update(['total_amount' => $orderTotal]);

                    $createdOrders[] = [
                        'id' => $order->id,
                        'order_number' => $order->order_number,
                        'total' => $orderTotal,
                        'items_count' => count($shopItems),
                    ];

                    Log::info('Order created', [
                        'order_id' => $order->id,
                        'order_number' => $order->order_number,
                        'shop_owner_id' => $shopOwnerId,
                        'customer_id' => $customerId,
                        'total' => $orderTotal,
                    ]);
                }

                DB::commit();

                // Clear user's cart after successful order
                if ($customerId) {
                    \App\Models\CartItem::where('user_id', $customerId)->delete();
                    Log::info('Cart cleared after order', ['user_id' => $customerId]);
                }

                return response()->json([
                    'success' => true,
                    'message' => 'Order(s) created successfully',
                    'orders' => $createdOrders,
                ]);

            } catch (\Exception $e) {
                DB::rollBack();
                throw $e;
            }

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);

        } catch (\Exception $e) {
            Log::error('Order creation failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to create order: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get customer orders
     */
    public function myOrders()
    {
        try {
            $user = Auth::guard('user')->user();

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized',
                ], 401);
            }

            $orders = Order::where('customer_id', $user->id)
                ->with(['items.product', 'shopOwner'])
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(function ($order) {
                    return [
                        'id' => $order->id,
                        'order_number' => $order->order_number,
                        'status' => $order->status,
                        'total_amount' => $order->total_amount,
                        'created_at' => $order->created_at->format('Y-m-d H:i:s'),
                        'shop_name' => $order->shopOwner->business_name ?? 'Unknown Shop',
                        'items_count' => $order->items->count(),
                        'items' => $order->items->map(function ($item) {
                            return [
                                'id' => $item->id,
                                'product_name' => $item->product_name,
                                'product_slug' => $item->product_slug,
                                'product_image' => $item->product_image,
                                'price' => $item->price,
                                'quantity' => $item->quantity,
                                'subtotal' => $item->subtotal,
                                'size' => $item->size,
                            ];
                        }),
                    ];
                });

            return response()->json([
                'success' => true,
                'orders' => $orders,
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to fetch orders', [
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch orders',
            ], 500);
        }
    }
}
