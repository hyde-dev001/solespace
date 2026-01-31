<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Budget extends Model
{
    protected $fillable = [
        'shop_owner_id',
        'category',
        'budgeted',
        'spent',
        'trend',
        'description',
    ];

    protected $casts = [
        'budgeted' => 'decimal:2',
        'spent' => 'decimal:2',
    ];

    public function shopOwner()
    {
        return $this->belongsTo(ShopOwner::class);
    }

    public function getVarianceAttribute()
    {
        return $this->budgeted - $this->spent;
    }

    public function getForecastedYearAttribute()
    {
        return $this->budgeted * 12;
    }
}
