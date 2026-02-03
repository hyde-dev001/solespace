<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CostCenter extends Model
{
    use HasFactory;

    protected $fillable = [
        'shop_owner_id',
        'code',
        'name',
        'description',
        'type',
        'parent_id',
        'is_active',
        'budget_limit',
        'manager_name',
        'manager_email',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'budget_limit' => 'decimal:2',
    ];

    /**
     * Get the shop owner that owns this cost center.
     */
    public function shopOwner(): BelongsTo
    {
        return $this->belongsTo(ShopOwner::class);
    }

    /**
     * Get the parent cost center (for hierarchical structure).
     */
    public function parent(): BelongsTo
    {
        return $this->belongsTo(CostCenter::class, 'parent_id');
    }

    /**
     * Get the child cost centers.
     */
    public function children(): HasMany
    {
        return $this->hasMany(CostCenter::class, 'parent_id');
    }

    /**
     * Get the expense allocations for this cost center.
     */
    public function allocations(): HasMany
    {
        return $this->hasMany(ExpenseAllocation::class);
    }

    /**
     * Get total allocated expenses.
     */
    public function getTotalAllocatedAttribute(): float
    {
        return $this->allocations()->sum('amount');
    }

    /**
     * Get budget remaining.
     */
    public function getBudgetRemainingAttribute(): ?float
    {
        if (!$this->budget_limit) {
            return null;
        }

        return $this->budget_limit - $this->getTotalAllocatedAttribute();
    }

    /**
     * Get budget utilization percentage.
     */
    public function getBudgetUtilizationAttribute(): ?float
    {
        if (!$this->budget_limit) {
            return null;
        }

        return ($this->getTotalAllocatedAttribute() / $this->budget_limit) * 100;
    }
}
