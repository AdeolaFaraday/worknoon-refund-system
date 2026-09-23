import React from 'react';
import { Info } from 'lucide-react';

export const FieldError = React.memo(function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
      <Info className="w-3 h-3" />
      {message}
    </p>
  );
});
