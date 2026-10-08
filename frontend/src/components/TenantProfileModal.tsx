'use client';

import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Mail, Phone, Building2, DoorOpen, CreditCard, CalendarClock, AlertTriangle, User as UserIcon } from 'lucide-react';

export interface TenantProfile {
  id: number;
  name: string;
  email: string;
  phone: string;
  property_name: string;
  unit_number: string;
  monthly_rent: number;
  status: string;
  last_payment_date: string | null;
  arrears: number;
}

export function TenantProfileModal({
  tenant,
  onClose,
}: {
  tenant: TenantProfile | null;
  onClose: () => void;
}) {
  const statusVariant =
    tenant?.status === 'active' ? 'success' : tenant?.status === 'evicted' ? 'danger' : 'secondary';

  if (!tenant) return null;

  return (
    <Modal isOpen={!!tenant} onClose={onClose} title="Tenant Profile">
      <div className="flex items-center gap-3 pb-4 border-b border-[#18191b]">
        <div className="h-12 w-12 rounded-full bg-[#00e599]/10 text-[#00e599] flex items-center justify-center">
          <UserIcon className="h-6 w-6" />
        </div>
        <div>
          <h3 className="font-medium text-white">{tenant.name}</h3>
          <div className="mt-1">
            <Badge variant={statusVariant} className="capitalize">
              {tenant.status}
            </Badge>
          </div>
        </div>
      </div>

      <div className="space-y-4 pt-4 text-sm">
        <ProfileRow icon={<Mail className="h-4 w-4" />} label="Email" value={tenant.email} />
        <ProfileRow icon={<Phone className="h-4 w-4" />} label="Phone" value={tenant.phone} />
        <ProfileRow icon={<Building2 className="h-4 w-4" />} label="Property" value={tenant.property_name || 'Unassigned'} />
        <ProfileRow icon={<DoorOpen className="h-4 w-4" />} label="Room" value={tenant.unit_number || 'N/A'} />
        <ProfileRow icon={<CreditCard className="h-4 w-4" />} label="Monthly rent" value={formatCurrency(tenant.monthly_rent)} />
        <ProfileRow
          icon={<CalendarClock className="h-4 w-4" />}
          label="Last payment"
          value={tenant.last_payment_date ? formatDate(tenant.last_payment_date) : 'Never'}
        />
        <div className="flex items-start justify-between rounded bg-[#18191b] px-4 py-3">
          <span className="flex items-center gap-2 text-[#797d86]">
            <AlertTriangle className="h-4 w-4" />
            Arrears
          </span>
          <span className={`font-mono font-medium ${tenant.arrears > 0 ? 'text-[#ff3621]' : 'text-[#00e599]'}`}>
            {tenant.arrears > 0 ? formatCurrency(tenant.arrears) : 'Paid up'}
          </span>
        </div>
      </div>
    </Modal>
  );
}

function ProfileRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="flex items-center gap-2 text-[#797d86]">
        <span className="text-[#00e599]">{icon}</span>
        {label}
      </span>
      <span className="text-right text-[#c9cbcf]">{value}</span>
    </div>
  );
}