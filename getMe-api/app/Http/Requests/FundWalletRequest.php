<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class FundWalletRequest extends FormRequest
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

    /**
     * Normalize Kenyan phone number to 254 format.
     *
     * @param string|null $phone
     * @return string|null
     */
    private function normalizePhoneNumber(?string $phone): ?string
    {
        if (empty($phone)) {
            return null;
        }

        // Remove all non-digit characters
        $phone = preg_replace('/\D/', '', $phone);

        // Handle different phone number formats
        if (strlen($phone) === 12 && substr($phone, 0, 3) === '254') {
            // Already in 254XXXXXXXXX format
            return $phone;
        } 
        
        if (strlen($phone) === 13 && substr($phone, 0, 4) === '2541') {
            // Already in 2541XXXXXXXX format (with 1 after 254)
            return $phone;
        }
        
        if (strlen($phone) === 10 && substr($phone, 0, 1) === '0') {
            // Format: 0712345678
            return '254' . substr($phone, 1);
        }
        
        if (strlen($phone) === 9 && in_array(substr($phone, 0, 1), ['7', '1'])) {
            // Format: 712345678 or 112345678
            return '254' . $phone;
        }
        
        if (strlen($phone) === 12 && substr($phone, 0, 3) === '254') {
            // Format: 254712345678
            return $phone;
        }

        // Return original if no pattern matches (validation will catch invalid formats)
        return $phone;
    }

    /**
     * Get the validated phone number in 254 format for STK push.
     */
    public function getFormattedPhoneNumber(): string
    {
        return $this->validated()['phone_number'];
    }

    /**
     * Configure the validator instance.
     */
    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            // Additional validation for phone number length after formatting
            $phone = $this->phone_number;
            if ($phone && (strlen($phone) !== 12 || !preg_match('/^254[1-9]\d{8}$/', $phone))) {
                $validator->errors()->add(
                    'phone_number',
                    'Invalid phone number format. Please provide a valid Kenyan phone number.'
                );
            }
        });
    }
}