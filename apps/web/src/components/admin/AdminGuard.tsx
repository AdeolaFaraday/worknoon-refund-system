'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { LoadingState } from '@/components/ui/LoadingState';

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    // Basic local storage check
    const auth = localStorage.getItem('worknoon_admin_auth');
    if (auth === 'true') {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
      // Redirect to login page
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [router, pathname]);

  // Show nothing or a loading state while checking
  if (isAuthenticated === null) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingState message="Verifying access..." />
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : null;
}
