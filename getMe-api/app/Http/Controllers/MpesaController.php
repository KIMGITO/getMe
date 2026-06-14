<?php

namespace App\Http\Controllers;

use App\Services\Finance\MpesaService;
use Illuminate\Http\Request;

class MpesaController extends Controller
{
    public function  callBack(Request $request,  MpesaService $mpesa){
        $data = $request->all();
        $mpesa->stkCallback($data);
        return;
    }
}
