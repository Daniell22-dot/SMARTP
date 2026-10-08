'use client';

import { useState, useEffect, useMemo } from 'react';
import { apiClient } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { ConfirmDialog } from '@/components/ui/Modal';
import { Users, Trash2, AlertTriangle, Eye } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { TenantProfileModal, TenantProfile } from '@/components/TenantProfileModal';

interface TenantRow extends TenantProfile {}

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

export default function AdminTenantsPage() {
  const [tenants, setTenants] = useState<TenantRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [deletingTenant, setDeletingTenant] = useState<TenantRow | null>(null);
  const [viewingTenant, setViewingTenant] = useState<TenantRow | null>(null);

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
      arrears: tenants.reduce((sum, t) => sum + t.arrears, 0),
    };
  }, [tenants]);

  const handleDelete = async () => {
    if (!deletingTenant) return;
    setIsDeleting(true);
    try {
      await apiClient.delete(`/admin/tenants/${deletingTenant.id}`);
      toast.success('Tenant deleted');
      setDeletingTenant(null);
      fetchTenants();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to delete tenant');
    } finally {
      setIsDeleting(false);
    }
  };

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
          Administer all tenant accounts.
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
          <p className="text-sm text-[#797d86]">Total Arrears</p>
          <p className="text-3xl font-medium text-[#ff3621] mt-1">{formatCurrency(summary.arrears)}</p>
        </div>
        <div className="card p-5">
          <p className="text-sm text-[#797d86]">Evicted</p>
          <p className="text-3xl font-medium text-white mt-1">
            {tenants.filter((t) => t.status === 'evicted').length}
          </p>
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

      <div className="table-container">
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <Users className="h-12 w-12 mx-auto mb-3 text-[#303236]" />
            <p className="text-[#797d86]">No tenants found</p>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th className="font-medium">Tenant</th>
                <th className="font-medium">Contact</th>
                <th className="font-medium">Property / Unit</th>
                <th className="font-medium">Monthly Rent</th>
                <th className="font-medium">Status</th>
                <th className="font-medium">Last Payment</th>
                <th className="font-medium">Arrears</th>
                <th className="font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((tenant) => (
                <tr key={tenant.id} className="hover:bg-[#0c0d0d]/50 transition-colors">
                  <td className="text-[#c9cbcf]">
                    <span className="font-medium text-white">{tenant.name}</span>
                  </td>
                  <td className="text-[#c9cbcf]">
                    <p>{tenant.email}</p>
                    <p className="text-[#61646b]">{tenant.phone}</p>
                  </td>
                  <td className="text-[#c9cbcf]">
                    {tenant.property_name} ({tenant.unit_number})
                  </td>
                  <td className="font-mono text-white">{formatCurrency(tenant.monthly_rent)}</td>
                  <td>
                    <Badge variant={statusVariant(tenant.status)} className="capitalize">
                      {tenant.status}
                    </Badge>
                  </td>
                  <td className="text-[#c9cbcf]">
                    {tenant.last_payment_date ? formatDate(tenant.last_payment_date) : 'Never'}
                  </td>
                  <td>
                    {tenant.arrears > 0 ? (
                      <span className="inline-flex items-center gap-1 text-[#ff3621] font-medium">
                        <AlertTriangle className="h-3.5 w-3.5" />
                        {formatCurrency(tenant.arrears)}
                      </span>
                    ) : (
                      <span className="text-[#00e599]">Paid up</span>
                    )}
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="View tenant profile"
                        className="text-[#00e599]"
                        onClick={() => setViewingTenant(tenant)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Link href="/admin/messages">
                        <Button variant="ghost" size="icon" aria-label="Message tenant" className="text-[#00e599]">
                          <Users className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Delete tenant"
                        className="text-[#ff3621]"
                        onClick={() => setDeletingTenant(tenant)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <ConfirmDialog
        isOpen={!!deletingTenant}
        onClose={() => setDeletingTenant(null)}
        onConfirm={handleDelete}
        title="Delete Tenant"
        message={`Are you sure you want to delete ${deletingTenant?.name}? This permanently removes their account and associated records. This action cannot be undone.`}
        confirmText="Delete"
        isLoading={isDeleting}
        variant="danger"
      />

      <TenantProfileModal tenant={viewingTenant} onClose={() => setViewingTenant(null)} />
    </div>
  );
}