'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/Card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { TrendingUp, Landmark, Receipt } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface PaymentSummary {
  total_payments: number;
  total_amount: number;
  completed_amount: number;
  pending_amount: number;
  overdue_amount: number;
  average_payment: number;
}

interface KRAStats {
  total_revenue: string;
  total_tax: string;
  net_profit: string;
  kra_details: string;
}

interface DashboardMetrics {
  monthly_revenue: number;
  total_revenue: number;
}

interface RevenueChart {
  labels: string[];
  datasets: Array<{ label: string; data: number[] }>;
}

export default function AdminFinancePage() {
  const [summary, setSummary] = useState<PaymentSummary | null>(null);
  const [stats, setStats] = useState<KRAStats | null>(null);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [chart, setChart] = useState<RevenueChart | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [summaryData, statsData, metricsData, chartData] = await Promise.all([
        apiClient.get<PaymentSummary>('/admin/payments/summary'),
        apiClient.get<KRAStats>('/admin/stats'),
        apiClient.get<DashboardMetrics>('/admin/metrics'),
        apiClient.get<RevenueChart>('/admin/revenue-chart?period=6'),
      ]);
      setSummary(summaryData);
      setStats(statsData);
      setMetrics(metricsData);
      setChart(chartData);
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to load finance data');
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
        <h1 className="text-heading-xl font-medium text-white">Finance</h1>
        <p className="text-body-lg text-[#797d86] mt-2">
          Payments, revenue and tax overview.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="card p-5">
          <p className="text-sm text-[#797d86]">Collected</p>
          <p className="text-3xl font-medium text-[#00e599] mt-1">
            {formatCurrency(summary?.completed_amount ?? 0)}
          </p>
        </div>
        <div className="card p-5">
          <p className="text-sm text-[#797d86]">Pending</p>
          <p className="text-3xl font-medium text-amber-400 mt-1">
            {formatCurrency(summary?.pending_amount ?? 0)}
          </p>
        </div>
        <div className="card p-5">
          <p className="text-sm text-[#797d86]">Overdue</p>
          <p className="text-3xl font-medium text-[#ff3621] mt-1">
            {formatCurrency(summary?.overdue_amount ?? 0)}
          </p>
        </div>
        <div className="card p-5">
          <p className="text-sm text-[#797d86]">Monthly Revenue</p>
          <p className="text-3xl font-medium text-white mt-1">
            {formatCurrency(metrics?.monthly_revenue ?? 0)}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardContent>
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-5 w-5 text-[#00e599]" />
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
                  <span className="text-[#797d86]">Revenue</span>
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

          <Card>
            <CardContent>
              <div className="flex items-center gap-2 mb-3">
                <Receipt className="h-5 w-5 text-[#00e599]" />
                <h2 className="font-medium text-white">Payments</h2>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-[#797d86]">Total</p>
                  <p className="text-lg font-mono text-white">{summary?.total_payments ?? 0}</p>
                </div>
                <div>
                  <p className="text-[#797d86]">Average</p>
                  <p className="text-lg font-mono text-white">{formatCurrency(summary?.average_payment ?? 0)}</p>
                </div>
                <div>
                  <p className="text-[#797d86]">Total amount</p>
                  <p className="text-lg font-mono text-white">{formatCurrency(summary?.total_amount ?? 0)}</p>
                </div>
                <div>
                  <p className="text-[#797d86]">Lifetime revenue</p>
                  <p className="text-lg font-mono text-white">{formatCurrency(metrics?.total_revenue ?? 0)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}