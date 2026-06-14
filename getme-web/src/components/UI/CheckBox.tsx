import React, { useId } from 'react';
import { BiCheck } from 'react-icons/bi';

export type CheckboxSize = 'sm' | 'md' | 'lg';
export type CheckboxVariant = 'primary' | 'success' | 'error';

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  description?: string;
  size?: CheckboxSize;
  variant?: CheckboxVariant;
}

 function Checkbox({
  label,
  description,
  size = 'md',
  variant = 'primary',
  className = '',
  checked,
  disabled,
  ...props
}: CheckboxProps) {
  const generatedId = useId();
  const id = props.id || generatedId;

  // Size Multipliers for Box, Icons, and Text Scaling
  const sizeClasses = {
    sm: {
      box: 'h-4 w-4 rounded',
      icon: 'text-xs',
      label: 'text-xs',
      desc: 'text-[10px]',
      gap: 'gap-2',
    },
    md: {
      box: 'h-5 w-5 rounded-md',
      icon: 'text-base',
      label: 'text-sm',
      desc: 'text-xs',
      gap: 'gap-3',
    },
    lg: {
      box: 'h-6 w-6 rounded-lg',
      icon: 'text-lg',
      label: 'text-base',
      desc: 'text-sm',
      gap: 'gap-3.5',
    },
  };

  // Explicit dynamic theme tokens mappings matching your setup
  const variantClasses = {
    primary: 'checked:bg-primary checked:border-primary focus-visible:ring-primary/30',
    success: 'checked:bg-green-600 checked:border-green-600 focus-visible:ring-green-600/30',
    error: 'checked:bg-error checked:border-error focus-visible:ring-error/30',
  };

  return (
    <div className={`flex items-center ${sizeClasses[size].gap} ${disabled ? 'opacity-50 pointer-events-none' : ''} ${className}`}>
      <div className="relative flex items-center p-0.5 rounded-full mt-0.5">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          disabled={disabled}
          className={`
            peer cursor-pointer appearance-none border border-outline bg-surface transition-all duration-200
            focus:outline-none focus-visible:ring-4
            ${sizeClasses[size].box}
            ${variantClasses[variant]}
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
        <label htmlFor={id} className="flex flex-col cursor-pointer select-none">
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
  );
}

export default Checkbox;