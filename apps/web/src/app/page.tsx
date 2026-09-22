import Link from 'next/link';
import { ArrowRight, ShieldCheck, Bot, Users } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Worknoon Refund System',
  description: 'Submit and track refund requests for your Worknoon orders.',
};

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-7 h-7 bg-indigo-600 rounded-lg">
              <ShieldCheck className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-slate-900">Worknoon</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/customer" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">
              Customer Portal
            </Link>
            <Link
              href="/admin"
              className="text-sm font-medium text-white bg-slate-900 px-3.5 py-1.5 rounded-lg hover:bg-slate-700 transition-colors"
            >
              Admin Dashboard
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 py-24 text-center">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 border border-indigo-200 px-4 py-1.5 text-xs font-medium text-indigo-700 mb-6">
            <Bot className="w-3.5 h-3.5" />
            AI-Powered Refund Processing
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 tracking-tight mb-4">
            Worknoon Refund System
          </h1>
          <p className="text-lg text-slate-500 mb-10 max-w-lg mx-auto">
            Deterministic policy engine combined with Gemini AI decision support for fast, fair, and consistent refund decisions.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/customer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors shadow-sm"
            >
              Submit a Refund Request
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/admin"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white text-slate-700 font-semibold rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors shadow-sm"
            >
              <Users className="w-4 h-4" />
              Support Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* Feature grid */}
      <section className="border-t border-slate-200 bg-white px-6 py-16">
        <div className="max-w-4xl mx-auto grid sm:grid-cols-3 gap-8">
          {[
            {
              Icon: ShieldCheck,
              title: 'Deterministic Policy Engine',
              desc: 'Hard rules for final sale, refund windows, and high-value thresholds run first. No AI can override them.',
            },
            {
              Icon: Bot,
              title: 'Gemini AI Decision Support',
              desc: 'Google Gemini provides contextual reasoning and a customer-facing message — with prompt injection protection built in.',
            },
            {
              Icon: Users,
              title: 'Full Audit Trail',
              desc: 'Every decision — policy evaluation, AI classification, and final outcome — is recorded and visible to support staff.',
            },
          ].map(({ Icon, title, desc }) => (
            <div key={title} className="text-center">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-50 mb-4">
                <Icon className="w-5 h-5 text-indigo-600" />
              </div>
              <h3 className="text-sm font-semibold text-slate-900 mb-2">{title}</h3>
              <p className="text-sm text-slate-500">{desc}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
