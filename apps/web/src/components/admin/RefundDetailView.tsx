'use client';

import React from 'react';

import Link from 'next/link';
import { useAdminRefund } from '@/hooks/useRefundQueries';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import { AuditTimeline } from '@/components/admin/AuditTimeline';
import { formatCurrency, formatDate, safeJsonParse } from '@/lib/utils';
import { ArrowLeft, User, Package, ShieldCheck, Bot, CheckCircle2 } from 'lucide-react';

interface RefundDetailViewProps {
  id: string;
}

const Section = React.memo(function Section({ title, Icon, children }: { title: string; Icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="flex items-center gap-2.5 px-5 py-4 border-b border-slate-100 bg-slate-50/60">
        <Icon className="w-4 h-4 text-slate-500" aria-hidden="true" />
        <h2 className="text-sm font-semibold text-slate-700">{title}</h2>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
});

const InfoRow = React.memo(function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-1 py-2.5 border-b border-slate-100 last:border-0">
      <dt className="text-xs font-medium text-slate-500 uppercase tracking-wide sm:w-40 flex-shrink-0">{label}</dt>
      <dd className="text-sm text-slate-900">{children}</dd>
    </div>
  );
});

export function RefundDetailView({ id }: RefundDetailViewProps) {
  const { data: refund, isLoading, isError, refetch } = useAdminRefund(id);

  if (isLoading) return <LoadingState message="Loading refund details..." />;
  if (isError || !refund) return <ErrorState message="Failed to load refund details" onRetry={() => refetch()} />;

  const policyReasons = safeJsonParse<string[]>(refund.policyReasons) ?? [];
  const policyRules = safeJsonParse<string[]>(refund.policyRules) ?? [];

  return (
    <div className="space-y-6">
      {/* Back + header */}
      <div>
        <Link
          href="/admin/refunds"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to requests
        </Link>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-slate-900">
              Refund Request — {refund.order.orderNumber}
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">Submitted {formatDate(refund.createdAt)}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500">Final Decision</span>
            <StatusBadge status={refund.finalDecision ?? refund.status} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer */}
          <Section title="Customer" Icon={User}>
            <dl>
              <InfoRow label="Name">{refund.customer.name}</InfoRow>
              <InfoRow label="Email">{refund.customer.email}</InfoRow>
            </dl>
          </Section>

          {/* Order */}
          <Section title="Order Details" Icon={Package}>
            <dl>
              <InfoRow label="Order Number">
                <span className="font-mono">{refund.order.orderNumber}</span>
              </InfoRow>
              <InfoRow label="Order Date">{formatDate(refund.order.orderDate)}</InfoRow>
              <InfoRow label="Order Status">
                <StatusBadge status={refund.order.status} size="sm" />
              </InfoRow>
              <InfoRow label="Order Total">{formatCurrency(refund.order.totalAmount)}</InfoRow>
              <InfoRow label="Requested Amount">
                <span className="font-semibold">{formatCurrency(refund.requestedAmount)}</span>
              </InfoRow>
            </dl>

            {/* Items */}
            <div className="mt-4">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Items</p>
              <div className="rounded-lg border border-slate-100 overflow-hidden">
                <table className="min-w-full divide-y divide-slate-100">
                  <thead className="bg-slate-50">
                    <tr>
                      {['Product', 'Qty', 'Unit Price', 'Final Sale'].map((h) => (
                        <th key={h} className="px-3 py-2 text-left text-xs font-medium text-slate-500">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {refund.order.orderItems.map((item) => (
                      <tr key={item.id}>
                        <td className="px-3 py-2 text-sm text-slate-800">{item.productName}</td>
                        <td className="px-3 py-2 text-sm text-slate-600">{item.quantity}</td>
                        <td className="px-3 py-2 text-sm text-slate-600">{formatCurrency(item.unitPrice)}</td>
                        <td className="px-3 py-2">
                          {item.isFinalSale ? (
                            <span className="text-xs font-medium text-red-600 bg-red-50 px-2 py-0.5 rounded-full">Yes</span>
                          ) : (
                            <span className="text-xs text-slate-400">No</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Section>

          {/* Request Details */}
          <Section title="Request Details" Icon={Package}>
            <dl>
              <InfoRow label="Reason">
                <span className="capitalize">{refund.reason}</span>
              </InfoRow>
              <InfoRow label="Description">
                <p className="whitespace-pre-wrap text-sm text-slate-700 bg-slate-50 rounded-lg p-3 border border-slate-100">
                  {refund.description}
                </p>
              </InfoRow>
            </dl>
          </Section>
        </div>

        {/* Right column: decisions */}
        <div className="space-y-6">
          {/* Policy Decision */}
          <Section title="Policy Decision" Icon={ShieldCheck}>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500">Decision</span>
                <StatusBadge status={refund.status} />
              </div>

              {policyRules.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-slate-500 mb-1.5">Matched Rules</p>
                  <div className="flex flex-wrap gap-1.5">
                    {policyRules.map((rule) => (
                      <span key={rule} className="text-xs font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                        {rule}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {policyReasons.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-slate-500 mb-1.5">Reasons</p>
                  <ul className="space-y-1">
                    {policyReasons.map((reason, i) => (
                      <li key={i} className="text-xs text-slate-700 flex gap-2">
                        <span className="mt-0.5 text-slate-400">•</span>
                        <span>{reason}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </Section>

          {/* AI Decision Support */}
          <Section title="AI Decision Support" Icon={Bot}>
            {refund.aiClassification ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-500">Classification</span>
                  <StatusBadge status={refund.aiClassification} size="sm" />
                </div>
                {refund.aiReasoning && (
                  <div>
                    <p className="text-xs font-medium text-slate-500 mb-1.5">AI Reasoning</p>
                    <p className="text-xs text-slate-600 bg-violet-50 border border-violet-100 rounded-lg p-3 leading-relaxed">
                      {refund.aiReasoning}
                    </p>
                  </div>
                )}
                <p className="text-xs text-slate-400 italic">
                  AI provides decision support only. The deterministic policy decision is authoritative.
                </p>
              </div>
            ) : (
              <p className="text-sm text-slate-400 italic">AI evaluation was not available for this request.</p>
            )}
          </Section>

          {/* Final Decision */}
          <Section title="Final Decision" Icon={CheckCircle2}>
            <div className="text-center py-2">
              <StatusBadge status={refund.finalDecision ?? refund.status} />
              <p className="text-xs text-slate-400 mt-2">
                The backend enforces the final decision. AI cannot override deterministic policy rules.
              </p>
            </div>
          </Section>
        </div>
      </div>

      {/* Audit Trail */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="flex items-center gap-2.5 px-5 py-4 border-b border-slate-100 bg-slate-50/60">
          <h2 className="text-sm font-semibold text-slate-700">Audit Trail</h2>
        </div>
        <div className="p-5">
          {refund.auditLogs.length > 0 ? (
            <AuditTimeline logs={refund.auditLogs} />
          ) : (
            <p className="text-sm text-slate-400">No audit logs available.</p>
          )}
        </div>
      </div>
    </div>
  );
}
