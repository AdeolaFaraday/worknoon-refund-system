import { type LucideIcon, Inbox } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description?: string;
  Icon?: LucideIcon;
  action?: React.ReactNode;
}

export function EmptyState({ title, description, Icon = Inbox, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4">
      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-slate-100">
        <Icon className="w-6 h-6 text-slate-400" aria-hidden="true" />
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-slate-900">{title}</p>
        {description && <p className="text-sm text-slate-500 mt-1 max-w-sm">{description}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
