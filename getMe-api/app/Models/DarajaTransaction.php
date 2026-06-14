<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['transaction_type','merchant_request_id','checkout_request_id','result_code','result_desc','amount','phone_number','account_reference','transaction_desc','mpesa_receipt_number','raw_request','raw_response'])]
class DarajaTransaction extends Model
{
    use HasUlids;
}
