<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;

class RiderRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return Auth::user()->role =='rider';
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $rider = Auth::user();
        return [
            // Identity
            'id_number' => ['required', 'string', 'min:7', 'max:12', Rule::unique('rider_profiles', 'id_number')->ignore($rider->id, 'user_id')],
            'id_front' => ['nullable', 'image', 'mimes:jpg,png,jpeg', 'max:2048'],
            'id_back' => ['nullable', 'image', 'mimes:jpg,png,jpeg', 'max:2048'],

            // Sacco
            'sacco_name' => ['required', 'string', 'max:255'],
            'sacco_membership_number' => ['required', 'string', 'max:255'],

            // Vehicle
            'vehicle_type' => ['required', 'in:bike,motorcycle,car,van,truck'],
            'vehicle_plate_number' => ['required', 'string', 'max:20', Rule::unique('rider_profiles','vehicle_plate_number')->ignore($rider->id, 'user_id')],
            'vehicle_model' => ['required', 'string', 'max:255'],

            // 'license_number' => ['required', 'string', 'unique:rider_profiles'],
        ];
    }
}
