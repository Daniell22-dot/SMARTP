'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ResetPasswordPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/recover-account');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-black bg-pattern px-4 py-12">
      <p className="text-sm text-[#61646b]">Redirecting to account recovery…</p>
    </div>
  );
}