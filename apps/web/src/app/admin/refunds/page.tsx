import type { Metadata } from 'next';
import { PageHeader } from '@/components/ui/PageHeader';
import { RefundRequestList } from '@/components/admin/RefundRequestList';

export const metadata: Metadata = {
  title: 'Refund Requests',
  description: 'Review and manage all customer refund requests.',
};

export default function AdminRefundsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Refund Requests"
        description="All customer refund requests with policy and AI decision details."
      />
      <RefundRequestList />
    </div>
  );
}
