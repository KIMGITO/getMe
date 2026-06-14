import React, { forwardRef, useState } from 'react';
import { IconType } from 'react-icons';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  optional?: boolean;
  Icon?: IconType;
  iconPosition?: 'left' | 'right';
  variant?: 'default' | 'filled' | 'outline' | 'flushed';
  Size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  clearable?: boolean;
  showPasswordToggle?: boolean;
  counter?: boolean;
  maxLength?: number;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      Icon,
      iconPosition = 'left',
      variant = 'default',
      Size = 'md',
      fullWidth = true,
      className = '',
      id,
      disabled,
      required,
      optional,
      clearable = false,
      showPasswordToggle = false,
      counter = false,
      maxLength,
      type = 'text',
      value,
      defaultValue,
      onChange,
      ...props
    },
    ref,
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const [inputValue, setInputValue] = useState(value || defaultValue || '');

    // Determine if it's a password field with toggle
    const isPasswordType = type === 'password';
    const inputType = isPasswordType && showPassword ? 'text' : type;

    // Generate unique ID if not provided
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

    // size classes
    const sizeClasses = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-5 py-3 text-lg',
    };

    // Padding classes for Icons based on size
    const getIconPadding = () => {
      const IconPadding = {
        sm: { left: 'pl-8', right: 'pr-8' },
        md: { left: 'pl-10', right: 'pr-10' },
        lg: { left: 'pl-12', right: 'pr-12' },
      };
      return IconPadding[Size];
    };

    // Variant classes
   const getVariantClasses = () => {
      switch (variant) {
        case 'default':
          return 'border border-outline bg-surface-container-lowest text-on-surface rounded-2xl px-4 py-3 transition-all';
        case 'filled':
          return 'border-b border-outline-variant bg-surface-container-low hover:bg-surface-container-high focus:bg-surface-container-highest text-on-surface rounded-t-xl rounded-b-none px-4 py-3 transition-all';
        case 'outline':
          return 'border-2 border-outline-variant bg-transparent text-on-surface rounded-2xl px-4 py-3 transition-all';
        case 'flushed':
          return 'border-b-2 border-outline-variant bg-transparent text-on-surface rounded-none px-0 py-2 transition-all';
        default:
          return 'border border-outline bg-surface-container-lowest text-on-surface rounded-2xl px-4 py-3 transition-all';
      }
    };

    // State classes
    const getStateClasses = () => {
      if (error) {
        return 'border-error focus:border-error focus:ring-error text-error placeholder:text-error/60';
      }
      
      switch (variant) {
        case 'flushed':
          return 'focus:border-b-primary focus:ring-0 outline-none placeholder:text-on-surface-variant/50';
        case 'filled':
          return 'focus:border-b-primary focus:ring-0 outline-none placeholder:text-on-surface-variant/50';
        case 'outline':
        case 'default':
        default:
          return 'focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none placeholder:text-on-surface-variant/50';
      }
    };

    const disabledClasses = disabled
      ? 'opacity-50 cursor-not-allowed bg-gray-100 dark:bg-gray-800'
      : '';

    const widthClass = fullWidth ? 'w-full' : '';

    // Handle clear input
    const handleClear = () => {
      setInputValue('');
      if (onChange) {
        const event = {
          target: { value: '' },
        } as React.ChangeEvent<HTMLInputElement>;
        onChange(event);
      }
    };

    // Handle value change
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setInputValue(e.target.value);
      if (onChange) {
        onChange(e);
      }
    };

    // Calculate input padding based on Icons
    const getInputPadding = () => {
      let padding = '';

      // Left padding for left Icon
      if (Icon && iconPosition === 'left') {
        padding += ` ${getIconPadding().left}`;
      }

      // Right padding for right Icon, clearable, or password toggle
      if (
        (Icon && iconPosition === 'right') ||
        clearable ||
        (isPasswordType && showPasswordToggle)
      ) {
        padding += ` ${getIconPadding().right}`;
      }

      return padding;
    };

    // Base input classes
    const getInputClasses = () => {
      let classes = `
        transition-all duration-200
         placeholder-gray-500
        focus:outline-none
        disabled:cursor-not-allowed
        ${variant === 'flushed' ? 'placeholder:text-[rgb(var(--md-sys-color-primary)/0.4)] font-semibold text-md ' : 'border'}
        w-full
        ${sizeClasses[Size]}
        ${getVariantClasses()}
        ${getStateClasses()}
        ${disabledClasses}
        ${widthClass}
        ${getInputPadding()}
      `;

      return classes;
    };

    const combinedClassName = `${getInputClasses()} ${className}`
      .trim()
      .replace(/\s+/g, ' ');

    return (
      <div className={`${fullWidth ? 'w-full' : ''}`}>
        {label && (
          <label htmlFor={inputId} className={`
            block text-sm font-medium
            ${variant === 'flushed' ? '' : 'mb-1'} 
          `}>
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
            {optional && <span className="text-gray-500 ml-1"> (optional)</span>}
          </label>
        )}

        <div className="relative w-full ">
          {/* Left Icon - Fixed positioning */}
          {Icon && iconPosition === 'left' && (
            <div className="absolute left-0 top-0 bottom-0.5 flex items-center justify-center pl-3 pointer-events-none z-10">
              <span className="  flex items-center justify-center">
                <Icon className='text-2xl'/>
              </span>
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            type={inputType}
            disabled={disabled}
            required={required}
            maxLength={maxLength}
            value={value !== undefined ? value : inputValue}
            defaultValue={defaultValue}
            onChange={handleChange}
            aria-invalid={!!error}
            aria-describedby={
              error
                ? `${inputId}-error`
                : helperText
                  ? `${inputId}-helper`
                  : undefined
            }
            className={combinedClassName}
            {...props}
          />

          {/* Right side icons/buttons */}
          <div className="absolute right-0 top-0 bottom-0 flex items-center justify-center pr-3 gap-1 z-10">
            {clearable && inputValue && (
              <button
                type="button"
                onClick={handleClear}
                className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 flex items-center justify-center"
                aria-label="Clear input"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}

            {isPasswordType && showPasswordToggle && (
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 flex items-center justify-center"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                ) : (
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                    />
                  </svg>
                )}
              </button>
            )}

            {Icon &&
              iconPosition === 'right' &&
              !clearable &&
              !(isPasswordType && showPasswordToggle) && (
                <span className="text-gray-400 dark:text-gray-500 flex items-center justify-center">
                  <Icon className="text-2xl" />
                </span>
              )}
          </div>
        </div>

        {/* Helper text or error message */}
        {error && (
          <p
            id={`${inputId}-error`}
            className="mt-1 text-sm text-red-500 dark:text-red-400"
          >
            {error}
          </p>
        )}

        {helperText && !error && (
          <p
            id={`${inputId}-helper`}
            className="mt-1 text-sm text-gray-500 dark:text-gray-400"
          >
            {helperText}
          </p>
        )}

        {/* Character counter */}
        {counter && maxLength && (
          <div className="mt-1 text-right">
            <span
              className={`text-xs ${(inputValue as string).length > maxLength ? 'text-red-500' : 'text-gray-400'}`}
            >
              {(inputValue as string).length}/{maxLength}
            </span>
          </div>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';

export default Input;
