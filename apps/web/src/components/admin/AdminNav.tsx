'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, FileText, Users, Zap, LogOut } from 'lucide-react';

const navItems = [
  { href: '/admin', label: 'Dashboard', Icon: LayoutDashboard, exact: true },
  { href: '/admin/refunds', label: 'Refund Requests', Icon: FileText, exact: false },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <aside className="flex flex-col w-64 min-h-screen bg-slate-900 text-white flex-shrink-0">
      <div className="flex items-center gap-2.5 px-6 py-5 border-b border-slate-700/50">
        <div className="flex items-center justify-center w-8 h-8 bg-indigo-600 rounded-lg">
          <Zap className="w-4 h-4 text-white" />
        </div>
        <div>
          <p className="text-sm font-semibold">Worknoon</p>
          <p className="text-xs text-slate-400">Support Dashboard</p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1" aria-label="Admin navigation">
        {navItems.map(({ href, label, Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="px-6 py-4 border-t border-slate-700/50 space-y-4">
        <Link
          href="/customer"
          className="flex items-center gap-2 text-xs text-slate-500 hover:text-slate-300 transition-colors"
        >
          <Users className="w-3.5 h-3.5" />
          Switch to Customer Portal
        </Link>
        <button
          onClick={() => {
            localStorage.removeItem('worknoon_admin_auth');
            window.location.href = '/login';
          }}
          className="flex items-center gap-2 text-xs text-slate-500 hover:text-red-400 transition-colors w-full text-left"
        >
          <LogOut className="w-3.5 h-3.5" />
          Logout
        </button>
      </div>
    </aside>
  );
}
