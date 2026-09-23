import React, { forwardRef } from 'react';
import { LoadingSpinner } from './LoadingState';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', isLoading, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`w-full py-3.5 px-6 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm flex items-center justify-center gap-2 ${className}`}
        {...props}
      >
        {isLoading && <LoadingSpinner size="sm" />}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
