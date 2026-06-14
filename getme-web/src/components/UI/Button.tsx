import React, { forwardRef } from 'react';

interface ButtonProps extends React.ComponentPropsWithoutRef<'button'> {
  variant?:
    | 'primary'
    | 'secondary'
    | 'outline'
    | 'ghost'
    | 'danger'
    | 'success'
    | 'text';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'sm',
      fullWidth = false,
      className = '',
      isLoading = false,
      disabled = false,
      leftIcon,
      rightIcon,
      type = 'button',
      ...rest
    },
    ref,
  ) => {
    // Size classes
    const sizeClasses = {
      sm: 'px-4 py-2 text-sm',
      md: 'px-8 py-3 text-lg',
      lg: 'px-10 py-4 text-xl',
    };

    // Base classes
    const baseClasses = `
      rounded-full font-semibold transition-all shadow-none 
      inline-flex items-center justify-center gap-2
      focus:outline-none focus:ring-2 focus:ring-offset-2
      focus:ring-[var(--color-getme-primary)]
      dark:focus:ring-[var(--color-accent-dark)]
    `;

    const variants = {
      primary:
        'bg-primary text-on-primary  brightness-80 hover:brightness-100 ',

      secondary:
        'bg-secondary text-on-secondary  brightness-80 hover:brightness-100 ',

      outline:
        'border-2 border-primary text-primary hover:bg-primary hover:text-on-primary',

      ghost:
        'hover:bg-[rgb(var(--md-sys-color-primary)/0.2)]  btn',

      danger: 'bg-red-600 text-white hover:bg-red-700 active:scale-95',

      success: 'bg-green-600 text-white hover:bg-green-700 active:scale-95',

      disabled: 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-70',

      text: 'text-getme-primary)] hover:underline dark:text-accent-dark ',
    };

    const primaryClasses = `${baseClasses} ${variants[variant ?? 'primary']}`;

    // State classes
    const disabledClasses =
      disabled || isLoading
        ? 'opacity-50 cursor-not-allowed hover:scale-100 active:scale-100 pointer-events-none'
        : '';

    const loadingClasses = isLoading ? 'cursor-wait' : '';
    const widthClass = fullWidth ? 'w-full' : '';

    const combinedClassName = `
      ${baseClasses}
      ${sizeClasses[size]}
      ${primaryClasses}
      ${disabledClasses}
      ${loadingClasses}
      ${widthClass}
      ${className}
    `
      .trim()
      .replace(/\s+/g, ' ');

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        className={combinedClassName}
        aria-busy={isLoading}
        {...rest}
      >
        {isLoading && (
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {!isLoading && leftIcon && (
          <span className="inline-flex">{leftIcon}</span>
        )}
        {children}
        {!isLoading && rightIcon && (
          <span className="inline-flex">{rightIcon}</span>
        )}
      </button>
    );
  },
);

Button.displayName = 'Button';

export default Button;
