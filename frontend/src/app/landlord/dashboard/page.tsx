'use client';

import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatCurrency, formatDate } from '@/lib/utils';
import { apiClient } from '@/lib/api';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Building2,
  Users,
  CreditCard,
  Wrench,
  DollarSign,
  Droplets,
  Wifi,
  BarChart3,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  ArrowRight,
} from 'lucide-react';

interface LandlordStats {
  total_properties: number;
  total_units: number;
  occupied_units: number;
  vacant_units: number;
  total_tenants: number;
  total_revenue: number;
  pending_payments: number;
  overdue_payments: number;
  maintenance_requests: number;
}

interface RecentPayment {
  id: number;
  amount: number;
  payment_date: string;
  payment_method: string;
  status: string;
  tenant_name: string;
  property_name: string;
}

interface MaintenanceRequest {
  id: number;
  title: string;
  description: string;
  status: string;
  priority: string;
  created_at: string;
  tenant_name: string;
  unit_number: string;
}

interface TenantSummary {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  status: string;
  unit_number: string | null;
  property_name: string;
  arrears: number;
}

export default function LandlordDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<LandlordStats | null>(null);
  const [recentPayments, setRecentPayments] = useState<RecentPayment[]>([]);
  const [maintenanceRequests, setMaintenanceRequests] = useState<MaintenanceRequest[]>([]);
  const [tenants, setTenants] = useState<TenantSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsRes, paymentsRes, maintenanceRes, tenantsRes] = await Promise.all([
          apiClient.get<LandlordStats>('/admin/dashboard-stats'),
          apiClient.get<RecentPayment[]>('/payments/recent?limit=5'),
          apiClient.get<MaintenanceRequest[]>('/maintenance/all?limit=5'),
          apiClient.get<TenantSummary[]>('/admin/tenants?limit=5'),
        ]);

        setStats(statsRes);
        setRecentPayments(paymentsRes);
        setMaintenanceRequests(maintenanceRes);
        setTenants(tenantsRes);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'success' | 'warning' | 'danger' | 'info'> = {
      paid: 'success',
      pending: 'warning',
      overdue: 'danger',
      failed: 'danger',
      completed: 'success',
      in_progress: 'info',
      cancelled: 'secondary',
      active: 'success',
      inactive: 'secondary',
      evicted: 'danger',
    };
    return variants[status] || 'default';
  };

  const getPriorityBadge = (priority: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'success' | 'warning' | 'danger' | 'info'> = {
      low: 'secondary',
      medium: 'info',
      high: 'warning',
      emergency: 'danger',
    };
    return variants[priority] || 'default';
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}><CardContent className="h-24 animate-pulse bg-gray-200 dark:bg-gray-700" /></Card>
          ))}
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}><CardContent className="h-64 animate-pulse bg-gray-200 dark:bg-gray-700" /></Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Welcome, {user?.first_name}!
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Overview of your rental portfolio performance.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/landlord/tenants">
            <Button variant="outline" className="gap-2">
              <Users className="h-4 w-4" />
              Add Tenant
            </Button>
          </Link>
          <Link href="/landlord/maintenance">
            <Button className="gap-2">
              <Wrench className="h-4 w-4" />
              New Request
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {formatCurrency(stats?.total_revenue || 0)}
                </p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-primary-600 dark:text-primary-400" />
              </div>
            </div>
            <p className="mt-2 text-sm text-green-600 dark:text-green-400 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Occupancy</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {stats && stats.total_units > 0 ? Math.round((stats.occupied_units / stats.total_units) * 100) : 0}%
                </p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <Users className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              {stats?.occupied_units || 0} of {stats?.total_units || 0} units occupied
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Pending Payments</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {stats?.pending_payments || 0}
                </p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
            <p className="mt-2 text-sm text-red-600 dark:text-red-400">
              {stats?.overdue_payments || 0} overdue
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Maintenance</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {stats?.maintenance_requests || 0}
                </p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Wrench className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Active requests
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats Row */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-6 text-center">
            <Building2 className="h-10 w-10 text-primary-600 dark:text-primary-400 mx-auto mb-2" />
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats?.total_properties || 0}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Properties</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <Users className="h-10 w-10 text-green-600 dark:text-green-400 mx-auto mb-2" />
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats?.total_tenants || 0}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Active Tenants</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <Droplets className="h-10 w-10 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats?.vacant_units || 0}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Vacant Units</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Payments */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Recent Payments
            </CardTitle>
            <Link href="/landlord/payments" className="text-sm text-primary-600 hover:underline">
              View all
            </Link>
          </CardHeader>
          <CardContent>
            {recentPayments.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <CreditCard className="h-12 w-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                <p>No recent payments</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-sm text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                      <th className="pb-3 font-medium">Tenant</th>
                      <th className="pb-3 font-medium">Property</th>
                      <th className="pb-3 font-medium">Amount</th>
                      <th className="pb-3 font-medium">Date</th>
                      <th className="pb-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {recentPayments.map((payment) => (
                      <tr key={payment.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <td className="py-3 font-medium text-gray-900 dark:text-white">{payment.tenant_name}</td>
                        <td className="py-3 text-gray-600 dark:text-gray-400">{payment.property_name}</td>
                        <td className="py-3 font-medium text-gray-900 dark:text-white">{formatCurrency(payment.amount)}</td>
                        <td className="py-3 text-gray-600 dark:text-gray-400">{formatDate(payment.payment_date)}</td>
                        <td className="py-3">
                          <Badge variant={getStatusBadge(payment.status)}>{payment.status}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Maintenance Requests */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5" />
              Maintenance
            </CardTitle>
            <Link href="/landlord/maintenance" className="text-sm text-primary-600 hover:underline">
              View all
            </Link>
          </CardHeader>
          <CardContent>
            {maintenanceRequests.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <Wrench className="h-12 w-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                <p>No maintenance requests</p>
              </div>
            ) : (
              <div className="space-y-3">
                {maintenanceRequests.map((req) => (
                  <div key={req.id} className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 dark:text-white truncate">{req.title}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Unit: {req.unit_number}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">{formatDate(req.created_at)}</p>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <Badge variant={getStatusBadge(req.status)} className="text-xs">{req.status}</Badge>
                        <Badge variant={getPriorityBadge(req.priority)} className="text-xs">{req.priority}</Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tenants with Arrears */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Tenants Overview
          </CardTitle>
          <Link href="/landlord/tenants" className="text-sm text-primary-600 hover:underline">
            View all
          </Link>
        </CardHeader>
        <CardContent>
          {tenants.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Users className="h-12 w-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
              <p>No tenants yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-sm text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                    <th className="pb-3 font-medium">Tenant</th>
                    <th className="pb-3 font-medium">Property</th>
                    <th className="pb-3 font-medium">Unit</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium">Arrears</th>
                    <th className="pb-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {tenants.map((tenant) => (
                    <tr key={tenant.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="py-3">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {tenant.first_name} {tenant.last_name}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{tenant.email}</p>
                        </div>
                      </td>
                      <td className="py-3 text-gray-600 dark:text-gray-400">{tenant.property_name}</td>
                      <td className="py-3 text-gray-600 dark:text-gray-400">{tenant.unit_number || 'N/A'}</td>
                      <td className="py-3">
                        <Badge variant={getStatusBadge(tenant.status)}>{tenant.status}</Badge>
                      </td>
                      <td className="py-3">
                        {tenant.arrears > 0 ? (
                          <span className="text-red-600 dark:text-red-400 font-medium">
                            {formatCurrency(tenant.arrears)}
                          </span>
                        ) : (
                          <span className="text-green-600 dark:text-green-400">Current</span>
                        )}
                      </td>
                      <td className="py-3">
                        <Link href={`/landlord/tenants/${tenant.id}`} className="text-primary-600 hover:underline text-sm">
                          View
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