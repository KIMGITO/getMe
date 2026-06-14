<?php

namespace App\Http\Requests;

use App\Models\Rider;
use App\Rules\KenyanPhoneNumber;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class RegisterUserRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $user = Auth::user();
        $canCreateAdmin = $user && $user->role === 'admin';

        return [
            'name' => 'required|string|max:255|regex:/\s/',
            'email' => 'nullable|email|unique:users,email',
            'phone' => ['required','unique:users,phone',new KenyanPhoneNumber('any')],

            'password' => 'required|string|min:8',
            'pin' => 'nullable|string|digits:4',

            'role' => [
                'required',
                Rule::in(array_merge(
                    ['client', 'rider'],
                    $canCreateAdmin ? ['admin'] : []
                )),
            ],
        ];
    }


    public function messages(): array
    {
        return [
            'name.regex' => 'The name must contain at least a first and last name.',
        ];
    }

   
}
