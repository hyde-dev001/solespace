<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

/**
 * ShopOwner Model
 * 
 * Represents a shop owner/business registration in the system.
 * Shop owners can list products and services after admin approval.
 * 
 * Database table: shop_owners
 * 
 * Relationships:
 * - Has many ShopDocument (business permits, IDs, certificates)
 * 
 * Status flow:
 * 1. pending - Initial submission, awaiting admin review
 * 2. approved - Admin approved, shop owner can access system
 * 3. rejected - Admin rejected, may include rejection_reason
 */
class ShopOwner extends Authenticatable
{
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     * 
     * These fields can be set via create() or update() methods
     * 
     * @var array<int, string>
     */
    protected $fillable = [
        'first_name',           // Shop owner's first name
        'last_name',            // Shop owner's last name
        'email',                // Contact email (must be unique)
        'phone',                // Contact phone number
        'password',             // Hashed password for authentication
        'business_name',        // Registered business name
        'business_address',     // Physical business location
        'business_type',        // Type: retail, repair, or both
        'registration_type',    // Individual or company registration
        'operating_hours',      // JSON field storing weekly schedule
        'status',               // pending, approved, or rejected
        'rejection_reason',     // Optional reason if rejected
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     * 
     * Automatically converts operating_hours JSON to array
     * when accessing the property
     * 
     * @var array<string, string>
     */
    protected $casts = [
        'operating_hours' => 'array',  // Auto JSON encode/decode
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
    ];

    /**
     * Get all documents uploaded for this shop owner
     * 
     * Includes business permits, mayor's permit, BIR certificate, valid ID
     * 
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function documents()
    {
        return $this->hasMany(ShopDocument::class);
    }

    /**
     * Scope query to only pending registrations
     * 
     * Usage: ShopOwner::pending()->get()
     * 
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    /**
     * Scope query to only approved shop owners
     * 
     * Usage: ShopOwner::approved()->get()
     * 
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }

    /**
     * Get the full name of the shop owner
     * 
     * @return string
     */
    public function getFullNameAttribute()
    {
        return "{$this->first_name} {$this->last_name}";
    }
}

