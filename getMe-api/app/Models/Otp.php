<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
#[Fillable(['user_id','identifier','code','purpose','is_used','attempts','expires_at'])]

class Otp extends Model
{

}
