'use client';

import { PortalLayout } from '@/components/layout/PortalLayout';
import { landlordNavItems } from '@/config/navigation';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function LandlordLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && (!user || !['landlord', 'admin'].includes(user.role))) {
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

  if (!user || !['landlord', 'admin'].includes(user.role)) {
    return null;
  }

  return (
    <PortalLayout navItems={landlordNavItems} title="Landlord Dashboard">
      {children}
    </PortalLayout>
  );
}