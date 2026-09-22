import type { Metadata } from 'next';
import { RefundDetailView } from '@/components/admin/RefundDetailView';

export const metadata: Metadata = {
  title: 'Refund Detail',
  description: 'Full details for a refund request including policy decision, AI reasoning, and audit trail.',
};

export default async function AdminRefundDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <RefundDetailView id={id} />;
}
