'use client';

import { formatDate, formatCurrency } from '@/lib/utils';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { AuditLog } from '@/types/api';
import { Bot, ShieldCheck, User, Clock, Zap } from 'lucide-react';

interface AuditTimelineProps {
  logs: AuditLog[];
}

const actorConfig = {
  SYSTEM: { Icon: ShieldCheck, color: 'text-indigo-600', bg: 'bg-indigo-100' },
  CUSTOMER: { Icon: User, color: 'text-slate-600', bg: 'bg-slate-100' },
  ADMIN: { Icon: User, color: 'text-amber-600', bg: 'bg-amber-100' },
  AI: { Icon: Bot, color: 'text-violet-600', bg: 'bg-violet-100' },
};

const eventLabels: Record<string, string> = {
  REFUND_REQUEST_CREATED: 'Refund request submitted',
  POLICY_EVALUATED: 'Deterministic policy evaluated',
  AI_EVALUATED: 'AI decision support evaluated',
  REFUND_DECIDED: 'Final decision recorded',
};

export function AuditTimeline({ logs }: AuditTimelineProps) {
  return (
    <div className="flow-root">
      <ul role="list" className="-mb-8">
        {logs.map((log, idx) => {
          const { Icon, color, bg } = actorConfig[log.actor] ?? actorConfig.SYSTEM;
          const isLast = idx === logs.length - 1;

          return (
            <li key={log.id}>
              <div className="relative pb-8">
                {!isLast && (
                  <span
                    className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-slate-200"
                    aria-hidden="true"
                  />
                )}
                <div className="relative flex items-start gap-4">
                  <span className={`flex h-8 w-8 items-center justify-center rounded-full ring-8 ring-white flex-shrink-0 ${bg}`}>
                    <Icon className={`h-4 w-4 ${color}`} aria-hidden="true" />
                  </span>
                  <div className="min-w-0 flex-1 pt-0.5">
                    <div className="flex items-center justify-between gap-4">
                      <p className="text-sm font-medium text-slate-900">
                        {eventLabels[log.event] ?? log.event}
                      </p>
                      <time className="flex items-center gap-1 text-xs text-slate-400 flex-shrink-0">
                        <Clock className="h-3 w-3" />
                        {formatDate(log.createdAt)}
                      </time>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">Actor: {log.actor}</p>

                    {log.metadata && Object.keys(log.metadata).length > 0 && (
                      <div className="mt-2 rounded-lg bg-slate-50 border border-slate-100 p-3">
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(log.metadata).map(([key, val]) => (
                            <div key={key} className="min-w-0">
                              <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                                {key}:{' '}
                              </span>
                              {Array.isArray(val) ? (
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {(val as string[]).map((v) => (
                                    <StatusBadge key={v} status={v} size="sm" />
                                  ))}
                                </div>
                              ) : (
                                <span className="text-xs text-slate-700">
                                  {typeof val === 'string' ? val : JSON.stringify(val)}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
