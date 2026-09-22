import { statusConfig } from '@/lib/utils';
import type { RefundStatus } from '@/types/api';

interface StatusBadgeProps {
  status: RefundStatus | string;
  size?: 'sm' | 'md';
}

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const config = statusConfig[status] ?? {
    label: status,
    className: 'bg-slate-50 text-slate-700 ring-slate-600/20',
    dot: 'bg-slate-400',
  };

  const sizeClasses = size === 'sm'
    ? 'px-2 py-0.5 text-xs gap-1'
    : 'px-2.5 py-1 text-xs gap-1.5';

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ring-1 ring-inset ${config.className} ${sizeClasses}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${config.dot}`} />
      {config.label}
    </span>
  );
}
