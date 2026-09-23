'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import { Table, type Column } from '@/components/ui/Table';
import { formatCurrency, formatDateShort } from '@/lib/utils';
import { Search, FileText, ChevronRight } from 'lucide-react';
import type { RefundRequestListItem } from '@/types/api';
import { useRefundList } from './hooks/useRefundList';

const STATUS_FILTERS = ['ALL', 'APPROVED', 'DENIED', 'ESCALATED', 'PENDING'] as const;

export function RefundRequestList() {
  const router = useRouter();
  const {
    data,
    total,
    page,
    totalPages,
    statusFilter,
    search,
    isLoading,
    isError,
    handleNextPage,
    handlePrevPage,
    handleStatusChange,
    handleSearchChange,
    refetch,
  } = useRefundList();

  const columns: Column<RefundRequestListItem>[] = [
    {
      key: 'customer',
      header: 'Customer',
      cell: (refund) => (
        <div>
          <p className="text-sm font-medium text-slate-900">{refund.customer.name}</p>
          <p className="text-xs text-slate-400">{refund.customer.email}</p>
        </div>
      ),
    },
    {
      key: 'order',
      header: 'Order',
      cell: (refund) => <p className="text-sm font-mono text-slate-700">{refund.order.orderNumber}</p>,
    },
    {
      key: 'amount',
      header: 'Amount',
      cell: (refund) => <p className="text-sm font-medium text-slate-900">{formatCurrency(refund.requestedAmount)}</p>,
    },
    {
      key: 'reason',
      header: 'Reason',
      cell: (refund) => <p className="text-sm text-slate-600 max-w-[180px] truncate capitalize">{refund.reason}</p>,
    },
    {
      key: 'status',
      header: 'Status',
      cell: (refund) => <StatusBadge status={refund.status} />,
    },
    {
      key: 'date',
      header: 'Date',
      cell: (refund) => <p className="text-xs text-slate-500 whitespace-nowrap">{formatDateShort(refund.createdAt)}</p>,
    },
    {
      key: 'action',
      header: '',
      align: 'right',
      cell: (refund) => (
        <Link
          href={`/admin/refunds/${refund.id}`}
          onClick={(e) => e.stopPropagation()}
          className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
          aria-label={`View refund from ${refund.customer.name}`}
        >
          View
          <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      ),
    },
  ];

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
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white placeholder:text-slate-400"
          />
        </div>
        <div className="flex gap-1 flex-wrap">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              onClick={() => handleStatusChange(s)}
              className={`px-3 py-2 text-xs font-medium rounded-lg transition-colors ${statusFilter === s
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
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden relative min-h-[400px]">
        {isLoading && (
          <div className="absolute inset-0 z-10 bg-white/50 flex items-center justify-center backdrop-blur-[1px]">
            <LoadingState message="Loading..." />
          </div>
        )}
        <Table
          data={data}
          columns={columns}
          page={page}
          totalPages={totalPages}
          onNextPage={handleNextPage}
          onPrevPage={handlePrevPage}
          keyExtractor={(item) => item.id}
          onRowClick={(item) => router.push(`/admin/refunds/${item.id}`)}
          emptyState={
            <div className="py-12">
              <EmptyState
                Icon={FileText}
                title="No refund requests found"
                description={search || statusFilter !== 'ALL' ? 'Try adjusting your filters.' : 'No refund requests have been submitted yet.'}
              />
            </div>
          }
        />
      </div>
    </div>
  );
}
