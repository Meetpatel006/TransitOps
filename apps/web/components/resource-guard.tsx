'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { canView, type Resource } from '@/lib/rbac';

export function ResourceGuard({
  resource,
  children,
}: {
  resource: Resource;
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const allowed = canView(user?.role_name, resource);

  useEffect(() => {
    if (!loading && !allowed) {
      router.replace('/dashboard');
    }
  }, [loading, allowed, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!allowed) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-muted-foreground">You don&apos;t have access to this page.</p>
      </div>
    );
  }

  return <>{children}</>;
}
