<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, HasApiTokens, Notifiable, LogsActivity;
    
    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'first_name',
        'last_name',
        'name',
        'email',
        'phone',
        'age',
        'address',
        'valid_id_path',
        'password',
        'status',
        'last_login_at',
        'last_login_ip',
        'shop_owner_id',
        'role',
        'approval_limit',
        'force_password_change',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast to native types.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'last_login_at' => 'datetime',
        'password' => 'hashed',
        'force_password_change' => 'boolean',
    ];

    /**
     * Get the shop owner that this user belongs to
     */
    public function shopOwner(): BelongsTo
    {
        return $this->belongsTo(ShopOwner::class);
    }

    /**
     * Get the related employee record by email (if any)
     */
    public function employee()
    {
        return $this->hasOne(Employee::class, 'email', 'email');
    }

    /**
     * Check if user has a specific role
     */
    public function hasRole($role): bool
    {
        return $this->role === $role;
    }

    /**
     * Check if user has any of the given roles
     */
    public function hasAnyRole($roles): bool
    {
        return in_array($this->role, (array) $roles);
    }

    /**
     * Get available ERP module roles for the user's shop
     */
    public function getAvailableModuleRoles(): array
    {
        return ['HR', 'FINANCE', 'STAFF', 'MANAGER'];
    }
    
    /**
     * Activity Log Configuration
     */
    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['name', 'email', 'role', 'status', 'approval_limit'])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs()
            ->setDescriptionForEvent(fn(string $eventName) => "Employee {$eventName}");
    }
}
