<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;

class WithdrawRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return Auth::check() && Auth::user()->role === 'client';
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
         return [
            'phone_number' => ['required', 'string', 'regex:/^254[1-9]\d{8}$/'],
            'amount' => 'required|numeric|min:1|max:150000'
        ];
    }

    /**
     * Get custom error messages for validation failures.
     */
    public function messages(): array
    {
        return [
            'phone_number.required' => 'Phone number is required.',
            'phone_number.regex' => 'Please enter a valid Kenyan phone number (e.g., 0712345678, 254712345678, or +254712345678).',
            'amount.required' => 'Amount is required.',
            'amount.numeric' => 'Amount must be a number.',
            'amount.min' => 'Amount must be at least KES 1.',
            'amount.max' => 'Amount cannot exceed KES 150,000 per transaction.'
        ];
    }

    /**
     * Prepare the data for validation.
     */
    public function prepareForValidation(): void
    {
        $phone = $this->normalizePhoneNumber($this->phone_number);
        
        $this->merge([
            'phone_number' => $phone,
        ]);
    }
}
