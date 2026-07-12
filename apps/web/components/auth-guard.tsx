'use client';

import { useEffect } from 'react';

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  return match ? decodeURIComponent(match[2]) : null;
}

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (!getCookie('token')) {
      window.location.href = 'http://localhost:3001/login';
    }
  }, []);

  return <>{children}</>;
}
