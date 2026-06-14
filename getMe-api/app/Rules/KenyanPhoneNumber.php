<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Translation\PotentiallyTranslatedString;

class KenyanPhoneNumber implements ValidationRule
{
    private ?string $format;
    private ?string $message;
    
    /**
     * Create a new rule instance.
     * 
     * @param string|null $format The format to validate against (any, international, local, with_zero)
     * @param string|null $message Custom error message
     */
    public function __construct(?string $format = 'any', ?string $message = null)
    {
        $this->format = $format;
        $this->message = $message;
    }
    
    /**
     * Run the validation rule.
     *
     * @param  Closure(string, ?string=): PotentiallyTranslatedString  $fail
     */
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        $cleaned = preg_replace('/\D/', '', $value);
        
        if (empty($cleaned)) {
            $fail($this->message ?? 'The :attribute must be a valid Kenyan phone number.');
            return;
        }
        
        $patterns = [
            'international' => '/^2547\d{8}$/',     
            'with_zero' => '/^07\d{8}$/',            
            'without_zero' => '/^7\d{8}$/',
            'with_plus' => '/^\+2547\d{8}$/',
            'with_spaces' => '/^(\+254|0|254)?7\d{3}\s?\d{3}\s?\d{3}$/', 
        ];
        
        $isValid = false;
        
        if ($this->format !== 'any' && isset($patterns[$this->format])) {
            $isValid = preg_match($patterns[$this->format], $value) === 1;
        } else {
            // Check against all valid Kenyan formats
            foreach ($patterns as $pattern) {
                if (preg_match($pattern, $value) === 1 || preg_match($pattern, $cleaned) === 1) {
                    $isValid = true;
                    break;
                }
            }
        }
        
        // Additional check for length (Kenyan numbers should have 9-13 digits after cleaning)
        if ($isValid) {
            $digitLength = strlen($cleaned);
            if ($digitLength < 9 || $digitLength > 13) {
                $isValid = false;
            }
        }
        
        // Fail validation if not valid
        if (!$isValid) {
            $defaultMessage = 'The :attribute must be a valid Kenyan phone number. ';
            // $defaultMessage .= 'Valid formats: 0712345678, 712345678, 254712345678, or +254712345678.';
            
            $fail($this->message ?? $defaultMessage);
        }
    }
}