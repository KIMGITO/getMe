<?php

namespace App;

use Illuminate\Support\Str;

trait HasOrderNumber
{
    protected static function bootHasOrderNumber()
    {
        static::creating(function ($model) {
            if (empty($model->order_number)) {
                do {
                    $orderNumber = static::generateOrderNumber();
                } while (
                    $model::where('order_number', $orderNumber)->exists()
                );

                $model->order_number = $orderNumber;
            }
        });
    }

    protected static function generateOrderNumber(): string
    {
        return 'DEL'.
        strtoupper(Str::random(6));
    }
}
