<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;

class ShoppingListRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return Auth::user()->role == 'client';
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $rules =  [
            'title' => 'nullable|string|max:255',
            'preferred_pickup_start_time' => 'nullable|date|after_or_equal:now',
            'note_for_rider' => 'nullable|string|max:1000',
            'tip_amount' => 'nullable|numeric:min:10',

            // Market Location
            'market_location' => 'required|array',
            'market_location.lat' => 'required|numeric',
            'market_location.lng' => 'required|numeric',
            'market_location.description' => 'nullable|string|max:300',

            
            // Shopping Items (nested array)
            'items' => 'required|array|min:1',
            'items.*.shop' => 'nullable|string|max:255',
            'items.*.product_name' => 'required|string|max:255',
            'items.*.unit' => 'required|string|max:50',
            'items.*.quantity' => 'required|numeric|min:0.01|max:999999.99',
            'items.*.estimated_price_per_unit' => 'required|numeric|min:0|max:99999999.99',
            'items.*.substitute_allowed' => 'boolean',
            'items.*.photo_url' => 'nullable|string|url|max:2048',
            'items.*.notes' => 'nullable|string|max:1000',

        ];

        if ($this->filled('delivery_address_id')) {
            $rules['delivery_address_id'] = 'required|ulid|exists:addresses,id|prohibits:delivery_location';
            $rules['delivery_location'] = 'nullable|array';
        } else {
            $rules['delivery_address_id'] = 'nullable|ulid';
            $rules['delivery_location'] = 'required|array';
            $rules['delivery_location.lat'] = 'required|numeric';
            $rules['delivery_location.lng'] = 'required|numeric';
            $rules['delivery_location.description'] = 'nullable|string|max:300';
        }

        return $rules;
    }

    public function  messages()
    {
        return [
            'delivery_address_id.required_without' => 'Please select a saved address or drop a custom pin location.',
            'delivery_address_id.prohibits' => 'Cannot use a saved address and custom location coordinates simultaneously.',
            'delivery_location.required' => 'A delivery destination is required. Please drop a pin on the map.',
            'delivery_location.lat.required' => 'The map destination pin is missing a valid latitude.',
            'delivery_location.lng.required' => 'The map destination pin is missing a valid longitude.',
        ];
    }
}
