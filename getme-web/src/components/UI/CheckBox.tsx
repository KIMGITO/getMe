import React, { useId } from 'react';
import { BiCheck } from 'react-icons/bi';

export type CheckboxSize = 'sm' | 'md' | 'lg';
export type CheckboxVariant = 'primary' | 'success' | 'error';

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  description?: string;
  size?: CheckboxSize;
  variant?: CheckboxVariant;
  error?: string | string[]; // Added supporting layout error parameter node
}

function Checkbox({
  label,
  description,
  size = 'md',
  variant = 'primary',
  className = '',
  checked,
  disabled,
  error, // Destructured validation field target
  ...props
}: CheckboxProps) {
  const generatedId = useId();
  const id = props.id || generatedId;

  // Normalize error properties to always map cleanly over a structural array
  const errorMessages = Array.isArray(error) ? error : error ? [error] : [];
  const hasError = errorMessages.length > 0;

  // Size Multipliers for Box, Icons, Text Scaling, and error layout indentation alignment
  const sizeClasses = {
    sm: {
      box: 'h-4 w-4 rounded',
      icon: 'text-xs',
      label: 'text-xs',
      desc: 'text-[10px]',
      gap: 'gap-2',
      error: 'text-[10px] ml-6 mt-0.5',
    },
    md: {
      box: 'h-5 w-5 rounded-md',
      icon: 'text-base',
      label: 'text-sm',
      desc: 'text-xs',
      gap: 'gap-3',
      error: 'text-xs ml-8 mt-1',
    },
    lg: {
      box: 'h-6 w-6 rounded-lg',
      icon: 'text-lg',
      label: 'text-base',
      desc: 'text-sm',
      gap: 'gap-3.5',
      error: 'text-sm ml-9 mt-1',
    },
  };

  // Explicit dynamic theme tokens mappings matching your setup
  const variantClasses = {
    primary: 'checked:bg-primary checked:border-primary focus-visible:ring-primary/30',
    success: 'checked:bg-green-600 checked:border-green-600 focus-visible:ring-green-600/30',
    error: 'checked:bg-error checked:border-error focus-visible:ring-error/30',
  };

  return (
    <div className={`flex flex-col group ${disabled ? 'opacity-50 pointer-events-none' : ''} ${className}`}>
      {/* Input Action row Container Node */}
      <div className={`flex items-start ${sizeClasses[size].gap}`}>
        <div className="relative flex items-center p-0.5 rounded-full mt-0.5 shrink-0">
          <input
            id={id}
            type="checkbox"
            checked={checked}
            disabled={disabled}
            className={`
              peer cursor-pointer appearance-none border transition-all duration-200
              focus:outline-none focus-visible:ring-4
              ${sizeClasses[size].box}
              ${variantClasses[variant]}
              ${hasError ? 'border-error bg-error-container/10 focus-visible:ring-error/30' : 'border-outline bg-surface'}
            `}
            {...props}
          />
          {/* Checked Mark Icon */}
          <span className="absolute text-white opacity-0 scale-75 peer-checked:opacity-100 peer-checked:scale-100 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-all duration-200">
            <BiCheck className={`font-bold ${sizeClasses[size].icon}`} />
          </span>
        </div>

        {/* Label Blocks */}
        {(label || description) && (
          <label htmlFor={id} className="flex flex-col cursor-pointer select-none pt-0.5">
            {label && (
              <span className={`font-semibold text-on-surface ${sizeClasses[size].label}`}>
                {label}
              </span>
            )}
            {description && (
              <span className={`text-on-surface-variant font-medium ${sizeClasses[size].desc}`}>
                {description}
              </span>
            )}
          </label>
        )}
      </div>

      {hasError &&
        errorMessages.map((message, index) => (
          <p
            key={index}
            className={`text-error font-semibold animate-fadeIn ${sizeClasses[size].error}`}
          >
            {message}
          </p>
        ))}
    </div>
  );
}

export default Checkbox;