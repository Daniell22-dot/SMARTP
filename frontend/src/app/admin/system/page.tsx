'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Activity, Server, Database, Shield, Cpu, RefreshCw, CheckCircle2, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface SystemInfo {
  system_name: string;
  version: string;
  environment: string;
  statistics: {
    total_users: number;
    total_properties: number;
    total_payments: number;
  };
  server_time: string;
  timezone: string;
}

interface HealthStatus {
  status: string;
  db_connected: boolean;
  timestamp: string;
}

export default function AdminSystemPage() {
  const [info, setInfo] = useState<SystemInfo | null>(null);
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSettingUp, setIsSettingUp] = useState(false);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [infoData, healthData] = await Promise.all([
        apiClient.get<SystemInfo>('/admin/system-info'),
        apiClient.get<HealthStatus>('/monitoring/health'),
      ]);
      setInfo(infoData);
      setHealth(healthData);
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to load system info');
    } finally {
      setIsLoading(false);
    }
  };

  const runSetup = async () => {
    setIsSettingUp(true);
    try {
      const res = await apiClient.get<{ message: string }>('/auth/setup-db');
      toast.success(res.message || 'Database setup completed');
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Database setup failed');
    } finally {
      setIsSettingUp(false);
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-heading-xl font-medium text-white">System</h1>
          <p className="text-body-lg text-[#797d86] mt-2">
            Platform health, configuration and maintenance tools.
          </p>
        </div>
        <Button variant="outline" onClick={runSetup} isLoading={isSettingUp} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Run DB Setup
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="h-5 w-5 text-[#00e599]" />
            <p className="text-sm text-[#797d86]">API Status</p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`h-2.5 w-2.5 rounded-full ${health?.status === 'online' ? 'bg-[#00e599]' : 'bg-[#ff3621]'}`} />
            <p className="text-lg font-medium text-white capitalize">{health?.status ?? 'unknown'}</p>
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-2">
            <Database className="h-5 w-5 text-[#00e599]" />
            <p className="text-sm text-[#797d86]">Database</p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`h-2.5 w-2.5 rounded-full ${health?.db_connected ? 'bg-[#00e599]' : 'bg-[#ff3621]'}`} />
            <p className="text-lg font-medium text-white">
              {health?.db_connected ? 'Connected' : 'Disconnected'}
            </p>
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="h-5 w-5 text-amber-400" />
            <p className="text-sm text-[#797d86]">Environment</p>
          </div>
          <Badge variant={info?.environment === 'production' ? 'danger' : 'success'} className="mt-1">
            {info?.environment ?? 'unknown'}
          </Badge>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardContent>
            <div className="flex items-center gap-2 mb-4">
              <Server className="h-5 w-5 text-[#00e599]" />
              <h2 className="font-medium text-white">Application</h2>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between border-b border-[#18191b] pb-2">
                <span className="text-[#797d86]">System</span>
                <span className="font-mono text-white">{info?.system_name ?? '—'}</span>
              </div>
              <div className="flex justify-between border-b border-[#18191b] pb-2">
                <span className="text-[#797d86]">Version</span>
                <span className="font-mono text-white">{info?.version ?? '—'}</span>
              </div>
              <div className="flex justify-between border-b border-[#18191b] pb-2">
                <span className="text-[#797d86]">Timezone</span>
                <span className="font-mono text-white">{info?.timezone ?? '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#797d86]">Server time</span>
                <span className="font-mono text-white">{info?.server_time ? new Date(info.server_time).toLocaleString() : '—'}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="flex items-center gap-2 mb-4">
              <Cpu className="h-5 w-5 text-[#00e599]" />
              <h2 className="font-medium text-white">Data</h2>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 rounded border border-[#303236] bg-[#0c0d0d] text-center">
                <p className="text-3xl font-mono text-white">{info?.statistics?.total_users ?? 0}</p>
                <p className="text-xs text-[#797d86] mt-1">Users</p>
              </div>
              <div className="p-4 rounded border border-[#303236] bg-[#0c0d0d] text-center">
                <p className="text-3xl font-mono text-white">{info?.statistics?.total_properties ?? 0}</p>
                <p className="text-xs text-[#797d86] mt-1">Properties</p>
              </div>
              <div className="p-4 rounded border border-[#303236] bg-[#0c0d0d] text-center">
                <p className="text-3xl font-mono text-white">{info?.statistics?.total_payments ?? 0}</p>
                <p className="text-xs text-[#797d86] mt-1">Payments</p>
              </div>
            </div>
            <div className="mt-5 flex items-start gap-3 p-4 rounded border border-[#00e599]/20 bg-[#00e599]/5 text-[#00e599]">
              <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" />
              <p className="text-sm">
                All tables are verified. Use <span className="font-mono">Run DB Setup</span> to re-initialize
                schema if a new model is deployed.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}