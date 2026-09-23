import React from 'react';

interface FormStepProps {
  step: number;
  title: string;
  children: React.ReactNode;
}

export const FormStep = React.memo(function FormStep({ step, title, children }: FormStepProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/60 rounded-t-xl">
        <p className="text-sm font-semibold text-slate-700">
          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-indigo-600 text-white text-xs font-bold mr-2">
            {step}
          </span>
          {title}
        </p>
      </div>
      <div className="p-5 space-y-5">{children}</div>
    </div>
  );
});
