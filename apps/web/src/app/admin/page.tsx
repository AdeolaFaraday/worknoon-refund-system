import type { Metadata } from 'next';
import { PageHeader } from '@/components/ui/PageHeader';
import { AdminDashboardContent } from '@/components/admin/AdminDashboardContent';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Support team overview of refund request activity.',
};

export default function AdminDashboardPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Dashboard"
        description="Overview of refund request activity."
        action={
          <Link
            href="/admin/refunds"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            View All Requests
          </Link>
        }
      />
      <AdminDashboardContent />
    </div>
  );
}
