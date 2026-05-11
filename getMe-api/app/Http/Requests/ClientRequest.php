<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;

class ClientRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return Auth::user()->role == 'client' || Auth::user()->role = 'admin';
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $client = $this->route('client');
        return [
            'profile_photo' => ['nullable','image','max:5042'],
            'language' => ['required','string','max:255'],
            'emergency_contact_name' => ['required','string','max:255'],
            'emergency_contact_phone' => ['required','string','max:255'],
        ];
    }
}
