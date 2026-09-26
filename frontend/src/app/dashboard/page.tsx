'use client';

import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatCurrency, formatDate } from '@/lib/utils';
import { apiClient } from '@/lib/api';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import {
  Home,
  CreditCard,
  Wrench,
  FileText,
  Bell,
  ArrowRight,
  AlertCircle,
  CheckCircle,
  Clock,
  DollarSign,
  Building2,
  Users,
} from 'lucide-react';

interface DashboardStats {
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
}

interface MaintenanceRequest {
  id: number;
  title: string;
  description: string;
  status: string;
  priority: string;
  created_at: string;
}

interface Notification {
  id: number;
  title: string;
  message: string;
  is_read: boolean;
  type: string;
  created_at: string;
}

export default function TenantDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentPayments, setRecentPayments] = useState<RecentPayment[]>([]);
  const [maintenanceRequests, setMaintenanceRequests] = useState<MaintenanceRequest[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsRes, paymentsRes, maintenanceRes, notifRes] = await Promise.all([
          apiClient.get<DashboardStats>('/dashboard/summary'),
          apiClient.get<RecentPayment[]>('/payments/my?limit=5'),
          apiClient.get<MaintenanceRequest[]>('/maintenance/my?limit=5'),
          apiClient.get<Notification[]>('/notifications?limit=5'),
        ]);

        setStats(statsRes);
        setRecentPayments(paymentsRes);
        setMaintenanceRequests(maintenanceRes);
        setNotifications(notifRes);
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
          <h1 className="text-heading-xl font-bold text-spurs-navy dark:text-white">
            Welcome back, {user?.first_name}!
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Here's what's happening with your rental property today.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/payments">
            <Button variant="secondary" className="gap-2">
              <CreditCard className="h-4 w-4" />
              Make Payment
            </Button>
          </Link>
          <Link href="/maintenance">
            <Button className="gap-2">
              <Wrench className="h-4 w-4" />
              Report Issue
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="card-hover">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">My Rent</p>
                <p className="text-3xl font-bold text-spurs-navy dark:text-white mt-1">
                  {formatCurrency(stats?.total_revenue || 0)}
                </p>
              </div>
              <div className="w-14 h-14 rounded-xl bg-spurs-navy/10 dark:bg-spurs-navy/20 flex items-center justify-center">
                <DollarSign className="h-7 w-7 text-spurs-navy dark:text-spurs-gold" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Pending Payments</p>
                <p className="text-3xl font-bold text-spurs-navy dark:text-white mt-1">
                  {stats?.pending_payments || 0}
                </p>
              </div>
              <div className="w-14 h-14 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <Clock className="h-7 w-7 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Maintenance</p>
                <p className="text-3xl font-bold text-spurs-navy dark:text-white mt-1">
                  {stats?.maintenance_requests || 0}
                </p>
              </div>
              <div className="w-14 h-14 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Wrench className="h-7 w-7 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Notifications</p>
                <p className="text-3xl font-bold text-spurs-navy dark:text-white mt-1">
                  {notifications.filter((n) => !n.is_read).length}
                </p>
              </div>
              <div className="w-14 h-14 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <Bell className="h-7 w-7 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Quick Actions */}
        <Card className="md:col-span-2 lg:col-span-1 card-hover">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-spurs-navy" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/payments" className="block">
              <Button variant="secondary" className="w-full justify-start gap-3 h-auto py-3">
                <div className="w-10 h-10 rounded-xl bg-spurs-navy/10 flex items-center justify-center">
                  <CreditCard className="h-5 w-5 text-spurs-navy" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-spurs-navy dark:text-white">Make a Payment</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Pay rent via M-Pesa or card</p>
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400 ml-auto" />
              </Button>
            </Link>
            <Link href="/maintenance" className="block">
              <Button variant="secondary" className="w-full justify-start gap-3 h-auto py-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                  <Wrench className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-spurs-navy dark:text-white">Report Maintenance</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Submit a new request</p>
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400 ml-auto" />
              </Button>
            </Link>
            <Link href="/my-property" className="block">
              <Button variant="secondary" className="w-full justify-start gap-3 h-auto py-3">
                <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <Home className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-spurs-navy dark:text-white">View My Property</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Unit details & lease info</p>
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400 ml-auto" />
              </Button>
            </Link>
            <Link href="/documents" className="block">
              <Button variant="secondary" className="w-full justify-start gap-3 h-auto py-3">
                <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-spurs-navy dark:text-white">My Documents</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Lease, receipts, IDs</p>
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400 ml-auto" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Recent Payments */}
        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-spurs-navy" />
              Recent Payments
            </CardTitle>
            <Link href="/payments" className="text-sm text-spurs-gold hover:underline">
              View all
            </Link>
          </CardHeader>
          <CardContent>
            {recentPayments.length === 0 ? (
              <div className="text-center py-8">
                <CreditCard className="h-12 w-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                <p className="text-gray-900 dark:text-white mb-2">No payments yet</p>
                <Link href="/payments" className="text-spurs-gold hover:underline text-sm mt-2 inline-block">
                  Make your first payment
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {recentPayments.map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-spurs-navy/10 flex items-center justify-center">
                        <DollarSign className="h-4 w-4 text-spurs-navy" />
                      </div>
                      <div>
                        <p className="font-medium text-spurs-navy dark:text-white">
                          {formatCurrency(payment.amount)}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(payment.payment_date)}
                        </p>
                      </div>
                    </div>
                    <Badge variant={getStatusBadge(payment.status)}>
                      {payment.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Maintenance Requests & Notifications */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Maintenance Requests */}
        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5" />
              Maintenance Requests
            </CardTitle>
            <Link href="/maintenance" className="text-sm text-spurs-gold hover:underline">
              View all
            </Link>
          </CardHeader>
          <CardContent>
            {maintenanceRequests.length === 0 ? (
              <div className="text-center py-8">
                <Wrench className="h-12 w-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                <p className="text-gray-900 dark:text-white mb-2">No maintenance requests</p>
                <Link href="/maintenance" className="text-spurs-gold hover:underline text-sm mt-2 inline-block">
                  Report an issue
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {maintenanceRequests.map((req) => (
                  <div key={req.id} className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-spurs-navy dark:text-white truncate">{req.title}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">{req.description}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                          {formatDate(req.created_at)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Badge variant={getStatusBadge(req.status)}>{req.status}</Badge>
                        <Badge variant={getPriorityBadge(req.priority)}>{req.priority}</Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Recent Notifications
            </CardTitle>
            <Link href="/notifications" className="text-sm text-spurs-gold hover:underline">
              View all
            </Link>
          </CardHeader>
          <CardContent>
            {notifications.length === 0 ? (
              <div className="text-center py-8">
                <Bell className="h-12 w-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                <p className="text-gray-900 dark:text-white mb-2">No notifications yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={cn(
                      'p-3 rounded-lg border-l-4 transition-colors',
                      notif.is_read
                        ? 'bg-gray-50 dark:bg-gray-800/50 border-gray-300 dark:border-gray-600'
                        : 'bg-spurs-navy/5 dark:bg-spurs-navy/10 border-spurs-gold'
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className={cn('font-medium', !notif.is_read && 'text-spurs-navy dark:text-white', notif.is_read && 'text-gray-600 dark:text-gray-400')}>
                          {notif.title}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{notif.message}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                          {formatDate(notif.created_at)}
                        </p>
                      </div>
                      {!notif.is_read && (
                        <div className="h-2 w-2 rounded-full bg-spurs-gold flex-shrink-0 mt-2" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}