<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['user_id','id_number','id_front_path','id_back_path','sacco_name','sacco_membership_number','vehicle_type','vehicle_plate_number','vehicle_model','is_active','is_suspended','is_blacklisted','suspension_reason','is_verified'])]

class Rider extends Model
{

    use HasUlids;
    protected $table = 'rider_profiles';    

    public  $casts = [
        'id_number' => 'encrypted',
        'is_verified' => 'boolean',
        'is_suspended' => 'boolean',
        'is_blacklisted' => 'boolean',
    ];


    public function user(){
        return $this->belongsTo(User::class);
    }
}
