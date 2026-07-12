'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  return match ? decodeURIComponent(match[2]) : null;
}

const AUTH_PATHS = ['/login', '/register'];

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    if (!AUTH_PATHS.includes(pathname) && !getCookie('token')) {
      window.location.href = 'http://localhost:3001/login';
    }
  }, [pathname]);

  return <>{children}</>;
}
