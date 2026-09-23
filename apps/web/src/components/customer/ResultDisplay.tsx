import React from 'react';
import { CreateRefundResponse } from '@/types/api';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';

export const ResultDisplay = React.memo(function ResultDisplay({ result }: { result: CreateRefundResponse }) {
  const icons: Partial<Record<string, React.ReactNode>> = {
    APPROVED: <CheckCircle2 className="w-10 h-10 text-emerald-500" />,
    DENIED: <XCircle className="w-10 h-10 text-red-500" />,
    ESCALATED: <AlertTriangle className="w-10 h-10 text-amber-500" />,
  };

  const bgColors: Partial<Record<string, string>> = {
    APPROVED: 'from-emerald-50 to-white border-emerald-200',
    DENIED: 'from-red-50 to-white border-red-200',
    ESCALATED: 'from-amber-50 to-white border-amber-200',
  };

  return (
    <div className={`rounded-2xl border bg-gradient-to-b p-8 ${bgColors[result.finalDecision] ?? 'from-slate-50 to-white border-slate-200'}`}>
      <div className="flex flex-col items-center text-center gap-4 mb-8">
        {icons[result.finalDecision] ?? null}
        <div>
          <StatusBadge status={result.finalDecision} />
          <h2 className="mt-3 text-xl font-semibold text-slate-900">
            {result.finalDecision === 'APPROVED' && 'Refund Approved'}
            {result.finalDecision === 'DENIED' && 'Refund Not Approved'}
            {result.finalDecision === 'ESCALATED' && 'Under Review'}
          </h2>
        </div>
      </div>

      <div className="rounded-xl bg-white border border-slate-200 p-5 shadow-sm mb-6">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Message</p>
        <p className="text-sm text-slate-700 leading-relaxed">{result.customerResponse}</p>
      </div>

      {result.policyReasons.length > 0 && (
        <div className="rounded-xl bg-white border border-slate-200 p-5 shadow-sm mb-4">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Details</p>
          <ul className="space-y-2">
            {result.policyReasons.map((reason, i) => (
              <li key={i} className="flex gap-2 text-sm text-slate-700">
                <span className="mt-0.5 text-slate-400 flex-shrink-0">•</span>
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="text-xs text-slate-400 text-center">
        Reference: <span className="font-mono">{result.id}</span>
      </p>
    </div>
  );
});
