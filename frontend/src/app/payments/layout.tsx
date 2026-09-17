'use client';

import { PortalLayout } from '@/components/layout/PortalLayout';
import { tenantNavItems } from '@/config/navigation';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function TenantLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'tenant')) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent" />
      </div>
    );
  }

  if (!user || user.role !== 'tenant') {
    return null;
  }

  return (
    <PortalLayout navItems={tenantNavItems} title="Payments">
      {children}
    </PortalLayout>
  );
}