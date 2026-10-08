'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/Card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { BarChart3, TrendingUp, Percent, Landmark } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { TaxSettingsCard } from '@/components/TaxSettingsCard';

interface KRAStats {
  total_revenue: string;
  total_tax: string;
  net_profit: string;
  kra_details: string;
  currency: string;
  timestamp: string;
}

interface DashboardMetrics {
  total_tenants: number;
  total_properties: number;
  total_units: number;
  total_revenue: number;
  monthly_revenue: number;
  overdue_amount: number;
  active_leases: number;
  maintenance_requests: number;
  occupancy_rate: number;
  currency: string;
}

interface RevenueChart {
  labels: string[];
  datasets: Array<{ label: string; data: number[] }>;
}

interface AINarrative {
  stats: KRAStats;
  narrative: string | { error: string };
}

export default function LandlordReportsPage() {
  const [stats, setStats] = useState<KRAStats | null>(null);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [chart, setChart] = useState<RevenueChart | null>(null);
  const [narrative, setNarrative] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [statsData, metricsData, chartData] = await Promise.all([
        apiClient.get<KRAStats>('/admin/stats'),
        apiClient.get<DashboardMetrics>('/admin/metrics'),
        apiClient.get<RevenueChart>('/admin/revenue-chart?period=6'),
      ]);
      setStats(statsData);
      setMetrics(metricsData);
      setChart(chartData);

      try {
        const aiRes = await apiClient.get<AINarrative>('/reports/ai-narrative');
        if (typeof aiRes.narrative === 'string') {
          setNarrative(aiRes.narrative);
        } else if (aiRes.narrative?.error) {
          setNarrative(`AI narrative unavailable: ${aiRes.narrative.error}`);
        }
      } catch (e) {
        // AI narrative is best-effort; ignore failures
      }
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to load reports');
    } finally {
      setIsLoading(false);
    }
  };

  const chartData = chart?.labels.map((label, i) => ({
    month: label,
    revenue: chart.datasets[0]?.data[i] ?? 0,
  }));

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
        <h1 className="text-heading-xl font-medium text-white">Reports</h1>
        <p className="text-body-lg text-[#797d86] mt-2">
          Financial performance and tax summary (KRA).
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="card p-5">
          <p className="text-sm text-[#797d86]">Total Revenue</p>
          <p className="text-2xl font-medium text-[#00e599] mt-1">{stats?.total_revenue ?? '—'}</p>
        </div>
        <div className="card p-5">
          <p className="text-sm text-[#797d86]">Estimated Tax</p>
          <p className="text-2xl font-medium text-amber-400 mt-1">{stats?.total_tax ?? '—'}</p>
        </div>
        <div className="card p-5">
          <p className="text-sm text-[#797d86]">Net Profit</p>
          <p className="text-2xl font-medium text-white mt-1">{stats?.net_profit ?? '—'}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardContent>
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="h-5 w-5 text-[#00e599]" />
              <h2 className="font-medium text-white">Revenue Trend (6 months)</h2>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData ?? []} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid stroke="#18191b" vertical={false} />
                  <XAxis dataKey="month" tick={{ fill: '#797d86', fontSize: 12 }} axisLine={{ stroke: '#303236' }} tickLine={false} />
                  <YAxis tick={{ fill: '#797d86', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0c0d0d', border: '1px solid #303236', borderRadius: 4, color: '#fff' }}
                    labelStyle={{ color: '#797d86' }}
                  />
                  <Bar dataKey="revenue" fill="#00e599" radius={[4, 4, 0, 0]} maxBarSize={48} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardContent>
              <div className="flex items-center gap-2 mb-3">
                <Landmark className="h-5 w-5 text-amber-400" />
                <h2 className="font-medium text-white">KRA Summary</h2>
              </div>
              <p className="text-sm text-[#797d86]">{stats?.kra_details ?? '—'}</p>
              <div className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between border-b border-[#18191b] pb-2">
                  <span className="text-[#797d86]">Gross revenue</span>
                  <span className="font-mono text-white">{stats?.total_revenue ?? '—'}</span>
                </div>
                <div className="flex justify-between border-b border-[#18191b] pb-2">
                  <span className="text-[#797d86]">Tax due</span>
                  <span className="font-mono text-amber-400">{stats?.total_tax ?? '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#797d86]">Net profit</span>
                  <span className="font-mono text-[#00e599]">{stats?.net_profit ?? '—'}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <TaxSettingsCard onSaved={fetchData} />

          <Card>
            <CardContent>
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="h-5 w-5 text-[#00e599]" />
                <h2 className="font-medium text-white">Key Metrics</h2>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-[#797d86]">Occupancy</p>
                  <p className="text-lg font-mono text-white">{metrics?.occupancy_rate ?? 0}%</p>
                </div>
                <div>
                  <p className="text-[#797d86]">Active leases</p>
                  <p className="text-lg font-mono text-white">{metrics?.active_leases ?? 0}</p>
                </div>
                <div>
                  <p className="text-[#797d86]">Maintenance</p>
                  <p className="text-lg font-mono text-white">{metrics?.maintenance_requests ?? 0}</p>
                </div>
                <div>
                  <p className="text-[#797d86]">Overdue</p>
                  <p className="text-lg font-mono text-[#ff3621]">{metrics?.overdue_amount ?? 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {narrative && (
        <Card>
          <CardContent>
            <div className="flex items-center gap-2 mb-3">
              <Percent className="h-5 w-5 text-[#00e599]" />
              <h2 className="font-medium text-white">AI Financial Analysis</h2>
            </div>
            <p className="text-sm text-[#c9cbcf] whitespace-pre-wrap">{narrative}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}