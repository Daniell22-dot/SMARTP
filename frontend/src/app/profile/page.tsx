'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { useAuth } from '@/context/AuthContext';
import { Mail, Phone, User as UserIcon, Shield } from 'lucide-react';

export default function ProfilePage() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserIcon className="h-5 w-5 text-[#00e599]" />
            Account Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#00e599]/10 text-xl font-semibold text-[#00e599]">
              {user.first_name?.charAt(0)}{user.last_name?.charAt(0)}
            </div>
            <div>
              <h2 className="text-lg font-medium text-white">
                {user.first_name} {user.last_name}
              </h2>
              <p className="text-sm text-[#797d86] capitalize">{user.role}</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-center gap-3 rounded border border-[#18191b] bg-[#0c0d0d] p-4">
              <Mail className="h-5 w-5 text-[#797d86]" />
              <div>
                <p className="text-xs text-[#61646b]">Email</p>
                <p className="text-sm text-white">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded border border-[#18191b] bg-[#0c0d0d] p-4">
              <Phone className="h-5 w-5 text-[#797d86]" />
              <div>
                <p className="text-xs text-[#61646b]">Phone</p>
                <p className="text-sm text-white">{user.phone || '—'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded border border-[#18191b] bg-[#0c0d0d] p-4">
              <Shield className="h-5 w-5 text-[#797d86]" />
              <div>
                <p className="text-xs text-[#61646b]">Account Type</p>
                <p className="text-sm text-white capitalize">{user.role}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}