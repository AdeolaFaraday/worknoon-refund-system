import React, { forwardRef } from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', error, type = 'text', ...props }, ref) => {
    return (
      <input
        type={type}
        className={`w-full px-3.5 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white disabled:bg-slate-50 disabled:text-slate-400 placeholder:text-slate-400 transition-shadow ${
          error ? 'border-red-500' : 'border-slate-200'
        } ${className}`}
        ref={ref}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';
