<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use App\Models\Rider;
use Illuminate\Contracts\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

#[Fillable(['name', 'email', 'password', 'role', 'phone', 'pin'])]
#[Hidden(['password', 'pin', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, HasUlids, Notifiable;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'phone_verified_at' => 'datetime',
            'password' => 'hashed',
            'pin' => 'hashed',

        ];
    }

    public function rider(): HasOne
    {
        return $this->hasOne(Rider::class);
    }

    public function client(): HasOne
    {
        return $this->hasOne(Client::class);
    }

    public function location(): HasOne{
        return  $this->hasOne(RiderLocation::class, 'rider_id');
    }

    public function scopeAssignableRiders(Builder $query): Builder
    {
        return $query->whereHas('rider', function ($q) {
            $q->assignable();
        });
    }
}
