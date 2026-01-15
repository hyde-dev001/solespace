<?php

namespace App\Models\ShopOwner;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\ShopOwner as ShopOwnerModel;

class CalendarEvent extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'calendar_events';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'shop_owner_id',
        'title',
        'start_date',
        'end_date',
        'calendar',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the shop owner that owns the event.
     */
    public function shopOwner()
    {
        return $this->belongsTo(ShopOwnerModel::class, 'shop_owner_id');
    }

    /**
     * Check if event is in the past.
     */
    public function isPast()
    {
        return $this->end_date < now();
    }

    /**
     * Check if event is today.
     */
    public function isToday()
    {
        return $this->start_date->isToday();
    }

    /**
     * Check if event is upcoming.
     */
    public function isUpcoming()
    {
        return $this->start_date > now();
    }

    /**
     * Get the duration of the event in days.
     */
    public function getDurationAttribute()
    {
        return $this->start_date->diffInDays($this->end_date) + 1;
    }

    /**
     * Scope a query to only include events for a specific date range.
     */
    public function scopeDateRange($query, $start, $end)
    {
        return $query->where(function($q) use ($start, $end) {
            $q->whereBetween('start_date', [$start, $end])
              ->orWhereBetween('end_date', [$start, $end])
              ->orWhere(function($q) use ($start, $end) {
                  $q->where('start_date', '<=', $start)
                    ->where('end_date', '>=', $end);
              });
        });
    }

    /**
     * Scope a query to only include events for a specific calendar type.
     */
    public function scopeCalendar($query, $type)
    {
        return $query->where('calendar', $type);
    }
}
