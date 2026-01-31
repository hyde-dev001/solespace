<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Employee Model
 * 
 * Represents employees within a shop owner's business.
 * Each employee is linked to a specific shop via shop_owner_id
 */
class Employee extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'shop_owner_id',
        'name',
        'email',
        'password',
        'phone',
        'position',
        'department',
        'branch',
        'functional_role',
        'salary',
        'hire_date',
        'status',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'hire_date' => 'date',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the shop owner this employee belongs to
     */
    public function shopOwner(): BelongsTo
    {
        return $this->belongsTo(ShopOwner::class);
    }

    /**
     * Get the user account associated with this employee
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'email', 'email');
    }

    /**
     * Scope to get employees by shop
     */
    public function scopeByShop($query, $shopOwnerId)
    {
        return $query->where('shop_owner_id', $shopOwnerId);
    }

    /**
     * Verify this employee belongs to a specific shop
     */
    public function belongsToShop($shopOwnerId): bool
    {
        return $this->shop_owner_id === $shopOwnerId;
    }
}
