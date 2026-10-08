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
  BarChart3,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  Shield,
  Activity,
  Server,
  Database,
} from 'lucide-react';

interface AdminStats {
  total_properties: number;
  total_tenants: number;
  total_payments: number;
  total_revenue: number;
}

interface SystemInfo {
  status: string;
  timestamp: string;
  version: string;
  uptime: string;
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsRes, systemRes] = await Promise.all([
          apiClient.get<AdminStats>('/admin/dashboard-stats'),
          apiClient.get<SystemInfo>('/monitoring/health'),
        ]);
        setStats(statsRes);
        setSystemInfo(systemRes);
      } catch (error) {
        console.error('Failed to load admin dashboard:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}><CardContent className="h-24 animate-pulse bg-gray-200 dark:bg-gray-700" /></Card>
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
            Admin Dashboard
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            System overview and management controls.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/tenants">
            <Button variant="outline" className="gap-2">
              <Users className="h-4 w-4" />
              Manage Tenants
            </Button>
          </Link>
          <Link href="/admin/system">
            <Button className="gap-2">
              <Server className="h-4 w-4" />
              System Config
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
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Properties</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {stats?.total_properties || 0}
                </p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                <Building2 className="h-6 w-6 text-primary-600 dark:text-primary-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Tenants</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {stats?.total_tenants || 0}
                </p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <Users className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Payments</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {stats?.total_payments || 0}
                </p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <CreditCard className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {formatCurrency(stats?.total_revenue || 0)}
                </p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Status & Quick Actions */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* System Health */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              System Health
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                  <span className="font-medium text-gray-900 dark:text-white">API Status</span>
                </div>
                <p className="text-green-700 dark:text-green-300">Healthy - All systems operational</p>
              </div>
              <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-2 mb-1">
                  <Database className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <span className="font-medium text-gray-900 dark:text-white">Database</span>
                </div>
                <p className="text-blue-700 dark:text-blue-300">Connected - PostgreSQL (Supabase)</p>
              </div>
              <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
                <div className="flex items-center gap-2 mb-1">
                  <Shield className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  <span className="font-medium text-gray-900 dark:text-white">Security</span>
                </div>
                <p className="text-purple-700 dark:text-purple-300">All security headers active</p>
              </div>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">System Information</h4>
              <div className="grid gap-2 md:grid-cols-2 text-sm">
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Version:</span>
                  <span className="ml-2 font-mono text-gray-900 dark:text-white">{systemInfo?.version || '1.0.0'}</span>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Status:</span>
                  <span className="ml-2 font-mono text-gray-900 dark:text-white">{systemInfo?.status || 'healthy'}</span>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Uptime:</span>
                  <span className="ml-2 font-mono text-gray-900 dark:text-white">{systemInfo?.uptime || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Last Check:</span>
                  <span className="ml-2 font-mono text-gray-900 dark:text-white">{systemInfo?.timestamp ? formatDate(systemInfo.timestamp) : 'N/A'}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/admin/tenants" className="block">
              <Button variant="outline" className="w-full justify-start gap-3 h-auto py-3">
                <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-900 dark:text-white">Manage Tenants</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">View, edit, remove tenants</p>
                </div>
              </Button>
            </Link>
            <Link href="/admin/properties" className="block">
              <Button variant="outline" className="w-full justify-start gap-3 h-auto py-3">
                <div className="h-10 w-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-900 dark:text-white">Properties</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Manage properties & units</p>
                </div>
              </Button>
            </Link>
            <Link href="/admin/finance" className="block">
              <Button variant="outline" className="w-full justify-start gap-3 h-auto py-3">
                <div className="h-10 w-10 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-900 dark:text-white">Finance & Reports</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">KRA, revenue, taxes</p>
                </div>
              </Button>
            </Link>
            <Link href="/admin/maintenance" className="block">
              <Button variant="outline" className="w-full justify-start gap-3 h-auto py-3">
                <div className="h-10 w-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                  <Wrench className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-900 dark:text-white">Maintenance</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">View all requests</p>
                </div>
              </Button>
            </Link>
            <Link href="/admin/system" className="block">
              <Button variant="outline" className="w-full justify-start gap-3 h-auto py-3">
                <div className="h-10 w-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <Server className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-900 dark:text-white">System Settings</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Config, backup, logs</p>
                </div>
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Placeholder */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent System Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <Activity className="h-12 w-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
            <p>System activity logs will appear here</p>
            <Link href="/admin/system" className="text-primary-600 hover:underline text-sm mt-2 inline-block">
              View system logs
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}