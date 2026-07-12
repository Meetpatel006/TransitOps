'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';

const AUTH_PATHS = ['/login', '/register'];

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { loading } = useAuth();

  useEffect(() => {
    if (!loading && !AUTH_PATHS.includes(pathname)) {
      const token = document.cookie.match(new RegExp(`(^| )token=([^;]+)`));
      if (!token) {
        window.location.href = 'http://localhost:3001/login';
      }
    }
  }, [pathname, loading]);

  if (loading) {
    return <div className="flex items-center justify-center h-screen"><p className="text-muted-foreground">Loading...</p></div>;
  }

  return <>{children}</>;
}
