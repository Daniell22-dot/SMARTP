'use client';

import { useState, useEffect, useMemo } from 'react';
import { apiClient } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Users, Search, Building2, DoorClosed, AlertTriangle, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

interface TenantRow {
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

const statusVariant = (status: string) => {
  switch (status) {
    case 'active':
      return 'success';
    case 'evicted':
      return 'danger';
    default:
      return 'secondary';
  }
};

export default function LandlordTenantsPage() {
  const [tenants, setTenants] = useState<TenantRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchTenants();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchTenants = async () => {
    setIsLoading(true);
    try {
      const data = await apiClient.get<TenantRow[]>('/admin/tenants');
      setTenants(data);
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to load tenants');
    } finally {
      setIsLoading(false);
    }
  };

  const filtered = useMemo(() => {
    return tenants.filter((t) => {
      const matchesSearch =
        !search ||
        t.name.toLowerCase().includes(search.toLowerCase()) ||
        t.email.toLowerCase().includes(search.toLowerCase()) ||
        t.unit_number.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = !statusFilter || t.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [tenants, search, statusFilter]);

  const summary = useMemo(() => {
    return {
      total: tenants.length,
      active: tenants.filter((t) => t.status === 'active').length,
      unassigned: tenants.filter((t) => t.unit_number === 'N/A').length,
      arrears: tenants.reduce((sum, t) => sum + t.arrears, 0),
    };
  }, [tenants]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card><CardContent className="h-48 animate-pulse bg-gray-200 dark:bg-gray-700" /></Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-heading-xl font-medium text-white">Tenants</h1>
        <p className="text-body-lg text-[#797d86] mt-2">
          Manage tenants across all properties.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="card p-5">
          <p className="text-sm text-[#797d86]">Total Tenants</p>
          <p className="text-3xl font-medium text-white mt-1">{summary.total}</p>
        </div>
        <div className="card p-5">
          <p className="text-sm text-[#797d86]">Active</p>
          <p className="text-3xl font-medium text-[#00e599] mt-1">{summary.active}</p>
        </div>
        <div className="card p-5">
          <p className="text-sm text-[#797d86]">Unassigned</p>
          <p className="text-3xl font-medium text-[#d4d4d8] mt-1">{summary.unassigned}</p>
        </div>
        <div className="card p-5">
          <p className="text-sm text-[#797d86]">Total Arrears</p>
          <p className="text-3xl font-medium text-[#ff3621] mt-1">{formatCurrency(summary.arrears)}</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <Input
              placeholder="Search tenants..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-xs"
            />
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-44"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="evicted">Evicted</option>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="text-center py-16">
              <Users className="h-12 w-12 mx-auto mb-3 text-[#303236]" />
              <p className="text-[#797d86]">No tenants found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs text-[#797d86] uppercase tracking-wider border-b border-[#303236]">
                    <th className="px-4 py-3 font-medium">Tenant</th>
                    <th className="px-4 py-3 font-medium">Contact</th>
                    <th className="px-4 py-3 font-medium">Property / Unit</th>
                    <th className="px-4 py-3 font-medium">Monthly Rent</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Last Payment</th>
                    <th className="px-4 py-3 font-medium">Arrears</th>
                    <th className="px-4 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#18191b]">
                  {filtered.map((tenant) => (
                    <tr key={tenant.id} className="hover:bg-[#0c0d0d]/50 transition-colors">
                      <td className="px-4 py-3 text-sm text-[#c9cbcf]">
                        <span className="font-medium text-white">{tenant.name}</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-[#c9cbcf]">
                        <p>{tenant.email}</p>
                        <p className="text-[#61646b]">{tenant.phone}</p>
                      </td>
                      <td className="px-4 py-3 text-sm text-[#c9cbcf]">
                        <div className="flex items-center gap-1.5">
                          <Building2 className="h-3.5 w-3.5 text-[#61646b]" />
                          {tenant.property_name} ({tenant.unit_number})
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm font-mono text-white">
                        {formatCurrency(tenant.monthly_rent)}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={statusVariant(tenant.status)} className="capitalize">
                          {tenant.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-sm text-[#c9cbcf]">
                        {tenant.last_payment_date ? formatDate(tenant.last_payment_date) : 'Never'}
                      </td>
                      <td className="px-4 py-3">
                        {tenant.arrears > 0 ? (
                          <span className="inline-flex items-center gap-1 text-[#ff3621] font-medium">
                            <AlertTriangle className="h-3.5 w-3.5" />
                            {formatCurrency(tenant.arrears)}
                          </span>
                        ) : (
                          <span className="text-[#00e599]">Paid up</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <Link href="/landlord/messages">
                          <Button variant="ghost" size="icon" aria-label="Message tenant" className="text-[#00e599]">
                            <MessageSquare className="h-4 w-4" />
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}