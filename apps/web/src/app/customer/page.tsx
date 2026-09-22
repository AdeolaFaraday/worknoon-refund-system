import type { Metadata } from 'next';
import { RefundRequestForm } from '@/components/customer/RefundRequestForm';
import { ShieldCheck, Bot, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Submit a Refund Request',
  description: 'Submit a refund request for your Worknoon order.',
};

export default function CustomerPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      {/* Top nav */}
      <header className="border-b border-slate-200 bg-white px-6 py-4 sticky top-0 z-10">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
            <span className="text-sm font-semibold text-slate-900">Worknoon</span>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-xl mx-auto px-4 py-10">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Request a Refund</h1>
          <p className="mt-2 text-sm text-slate-500 max-w-sm mx-auto">
            Tell us about your issue and our system will evaluate your request instantly.
          </p>
          <div className="inline-flex items-center gap-1.5 mt-3 text-xs text-indigo-600 bg-indigo-50 border border-indigo-200 rounded-full px-3 py-1">
            <Bot className="w-3.5 h-3.5" />
            Powered by AI + deterministic policy
          </div>
        </div>

        <RefundRequestForm />
      </div>
    </main>
  );
}
