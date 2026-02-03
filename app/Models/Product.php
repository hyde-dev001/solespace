<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Product extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'shop_owner_id',
        'name',
        'slug',
        'description',
        'price',
        'compare_at_price',
        'brand',
        'category',
        'stock_quantity',
        'is_active',
        'is_featured',
        'main_image',
        'additional_images',
        'sizes_available',
        'colors_available',
        'sku',
        'weight',
        'views_count',
        'sales_count',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'compare_at_price' => 'decimal:2',
        'weight' => 'decimal:2',
        'stock_quantity' => 'integer',
        'is_active' => 'boolean',
        'is_featured' => 'boolean',
        'views_count' => 'integer',
        'sales_count' => 'integer',
        'additional_images' => 'array',
        'sizes_available' => 'array',
        'colors_available' => 'array',
    ];

    /**
     * Automatically generate slug from name
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($product) {
            if (empty($product->slug)) {
                $product->slug = Str::slug($product->name . '-' . Str::random(6));
            }
        });
    }

    /**
     * Relationship: Product belongs to a shop owner
     */
    public function shopOwner()
    {
        return $this->belongsTo(ShopOwner::class, 'shop_owner_id');
    }

    /**
     * Relationship: Product has many variants
     */
    public function variants()
    {
        return $this->hasMany(ProductVariant::class);
    }

    /**
     * Get total available stock across all variants
     */
    public function getTotalStockAttribute(): int
    {
        return $this->variants()->sum('quantity');
    }

    /**
     * Check if product is in stock
     */
    public function isInStock(): bool
    {
        return $this->stock_quantity > 0;
    }

    /**
     * Check if product is on sale
     */
    public function isOnSale(): bool
    {
        return $this->compare_at_price && $this->compare_at_price > $this->price;
    }

    /**
     * Get discount percentage
     */
    public function getDiscountPercentage(): ?int
    {
        if (!$this->isOnSale()) {
            return null;
        }

        return (int) round((($this->compare_at_price - $this->price) / $this->compare_at_price) * 100);
    }

    /**
     * Increment view count
     */
    public function incrementViews()
    {
        $this->increment('views_count');
    }

    /**
     * Increment sales count and decrease stock
     */
    public function recordSale(int $quantity = 1)
    {
        $this->increment('sales_count', $quantity);
        $this->decrement('stock_quantity', $quantity);
    }
}
