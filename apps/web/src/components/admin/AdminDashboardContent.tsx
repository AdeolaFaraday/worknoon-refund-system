'use client';

import { useAdminRefunds, useAdminRefundStats } from '@/hooks/useRefundQueries';
import { DataCard } from '@/components/ui/DataCard';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import Link from 'next/link';

export function AdminDashboardContent() {
  const { data: stats, isLoading: statsLoading, isError: statsError, refetch: refetchStats } = useAdminRefundStats();
  // Fetch first page, limited to 5 for recent activity
  const { data: recentRes, isLoading: recentLoading, isError: recentError, refetch: refetchRecent } = useAdminRefunds(1, 5);

  const isLoading = statsLoading || recentLoading;
  const isError = statsError || recentError;

  const handleRetry = () => {
    refetchStats();
    refetchRecent();
  };

  if (isLoading) return <LoadingState message="Loading dashboard data…" />;
  if (isError) return <ErrorState message="Failed to load dashboard data" onRetry={handleRetry} />;
  if (!stats || !recentRes) return null;

  return (
    <>
      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <DataCard label="Total Requests" value={stats.total} sub="All time" />
        <DataCard label="Approved" value={stats.APPROVED} sub="Automatically approved" className="border-emerald-200" />
        <DataCard label="Denied" value={stats.DENIED} sub="Policy blocked" className="border-red-200" />
        <DataCard label="Escalated" value={stats.ESCALATED} sub="Requires review" className="border-amber-200" />
      </div>

      {/* Recent activity */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-700">Recent Requests</h2>
          <Link href="/admin/refunds" className="text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors">
            See all →
          </Link>
        </div>
        <div className="divide-y divide-slate-50">
          {recentRes.data.map((refund) => (
            <Link
              key={refund.id}
              href={`/admin/refunds/${refund.id}`}
              className="flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors group"
            >
              <div>
                <p className="text-sm font-medium text-slate-900">{refund.customer.name}</p>
                <p className="text-xs text-slate-400 mt-0.5">{refund.order.orderNumber} · {refund.reason}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-slate-700">
                  ${parseFloat(refund.requestedAmount).toFixed(2)}
                </span>
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${
                  refund.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20' :
                  refund.status === 'DENIED' ? 'bg-red-50 text-red-700 ring-red-600/20' :
                  refund.status === 'ESCALATED' ? 'bg-amber-50 text-amber-700 ring-amber-600/20' :
                  'bg-slate-50 text-slate-700 ring-slate-600/20'
                }`}>
                  {refund.status}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
