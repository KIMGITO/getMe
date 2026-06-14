import React from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { BiLogInCircle, BiUserPlus } from 'react-icons/bi';

interface BaseAuthButtonProps {
  isLoading?: boolean;
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
}

// Loading Spinner Component internal helper
const Loader = () => (
  <svg className="animate-spin h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

/**
 * Login / Sign In Trigger Component
 * Supports functional behavior (for forms) or standard link redirection layout.
 */
export function LoginButton({ isLoading, className = '', onClick, type = 'button', disabled, ...props }: BaseAuthButtonProps) {
  const baseStyle = `
    inline-flex items-center justify-center gap-2 px-5 py-2.5 
    rounded-full text-sm font-bold tracking-wide transition-all duration-200
    border border-outline-variant bg-surface text-on-surface 
    hover:bg-surface-container-high hover:border-outline focus:outline-none 
    focus-visible:ring-4 focus-visible:ring-primary/20 select-none
    disabled:opacity-50 disabled:pointer-events-none
  `;

  // If inside a form or bound to a click handler, render as a button
  if (onClick || type === 'submit') {
    return (
      <button type={type} onClick={onClick} disabled={disabled || isLoading} className={`${baseStyle} ${className}`} {...props}>
        {isLoading ? <Loader /> : <BiLogInCircle className="text-lg" />}
        <span>{isLoading ? 'Processing...' : 'Sign In'}</span>
      </button>
    );
  }

  // Otherwise, fallback directly to an anchor route redirecting to identifier page
  return (
    <Link to={ROUTES.LOGIN_INIT} className={`${baseStyle} ${className}`}>
      <BiLogInCircle className="text-lg" />
      <span>Sign In</span>
    </Link>
  );
}

/**
 * Signup / Get Started Primary Action Button
 */
export function SignupButton({ isLoading, className = '', onClick, type = 'button', disabled, ...props }: BaseAuthButtonProps) {
  const baseStyle = `
    inline-flex items-center justify-center gap-2 px-6 py-2.5 
    rounded-full text-sm font-black tracking-wide text-on-primary bg-primary
    hover:bg-primary/90 hover:shadow-md active:scale-98 transition-all duration-200
    focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/30 select-none
    disabled:opacity-50 disabled:pointer-events-none shadow-sm
  `;

  if (onClick || type === 'submit') {
    return (
      <button type={type} onClick={onClick} disabled={disabled || isLoading} className={`${baseStyle} ${className}`} {...props}>
        {isLoading ? <Loader /> : <BiUserPlus className="text-lg" />}
        <span>{isLoading ? 'Creating Account...' : 'Get Started'}</span>
      </button>
    );
  }

  return (
    <Link to={ROUTES.SIGNUP} className={`${baseStyle} ${className}`}>
      <BiUserPlus className="text-lg" />
      <span>Get Started</span>
    </Link>
  );
}