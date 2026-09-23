import React from 'react';

export const FormLabel = React.memo(function FormLabel({
  htmlFor,
  children,
  className = '',
}: {
  htmlFor?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label
      className={`block text-xs font-medium text-slate-600 mb-1.5 ${className}`}
      htmlFor={htmlFor}
    >
      {children}
    </label>
  );
});
