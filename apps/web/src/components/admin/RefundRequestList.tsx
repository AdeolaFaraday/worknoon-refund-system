'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useAdminRefunds } from '@/hooks/useRefundQueries';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { LoadingState, SkeletonRow } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatCurrency, formatDateShort } from '@/lib/utils';
import { Search, FileText, ChevronRight } from 'lucide-react';
import type { RefundStatus } from '@/types/api';

const STATUS_FILTERS = ['ALL', 'APPROVED', 'DENIED', 'ESCALATED', 'PENDING'] as const;

export function RefundRequestList() {
  const { data, isLoading, isError, refetch } = useAdminRefunds();
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [search, setSearch] = useState('');

  const filtered = (data ?? []).filter((r) => {
    if (statusFilter !== 'ALL' && r.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        r.customer.name.toLowerCase().includes(q) ||
        r.order.orderNumber.toLowerCase().includes(q) ||
        r.reason.toLowerCase().includes(q)
      );
    }
    return true;
  });

  if (isLoading) return <LoadingState message="Loading refund requests..." />;
  if (isError) return <ErrorState message="Failed to load refund requests" onRetry={() => refetch()} />;

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            id="refund-search"
            type="text"
            placeholder="Search by customer, order number or reason…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white placeholder:text-slate-400"
          />
        </div>
        <div className="flex gap-1 flex-wrap">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                statusFilter === s
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {s === 'ALL' ? 'All' : s.charAt(0) + s.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <EmptyState
            Icon={FileText}
            title="No refund requests found"
            description={search || statusFilter !== 'ALL' ? 'Try adjusting your filters.' : 'No refund requests have been submitted yet.'}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200" role="table">
              <thead className="bg-slate-50">
                <tr>
                  {['Customer', 'Order', 'Amount', 'Reason', 'Status', 'Date', ''].map((h) => (
                    <th
                      key={h}
                      scope="col"
                      className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((refund) => (
                  <tr
                    key={refund.id}
                    className="hover:bg-slate-50/70 transition-colors group"
                  >
                    <td className="px-4 py-4">
                      <div>
                        <p className="text-sm font-medium text-slate-900">{refund.customer.name}</p>
                        <p className="text-xs text-slate-400">{refund.customer.email}</p>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm font-mono text-slate-700">{refund.order.orderNumber}</p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm font-medium text-slate-900">{formatCurrency(refund.requestedAmount)}</p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm text-slate-600 max-w-[180px] truncate capitalize">{refund.reason}</p>
                    </td>
                    <td className="px-4 py-4">
                      <StatusBadge status={refund.status} />
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-xs text-slate-500 whitespace-nowrap">{formatDateShort(refund.createdAt)}</p>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <Link
                        href={`/admin/refunds/${refund.id}`}
                        className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
                        aria-label={`View refund from ${refund.customer.name}`}
                      >
                        View
                        <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p className="text-xs text-slate-400 text-right">
        {filtered.length} of {data?.length ?? 0} requests
      </p>
    </div>
  );
}
