'use client';

import { useState, useEffect, useMemo } from 'react';
import { apiClient } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { CreditCard, Search, TrendingUp } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { toast } from 'react-hot-toast';

interface PaymentRow {
  id: number;
  amount: number;
  payment_date: string;
  payment_method: string | null;
  status: string;
  receipt_url: string | null;
  tenant_name: string;
  property_name?: string | null;
}

interface PaymentSummary {
  total_payments: number;
  total_amount: number;
  completed_amount: number;
  pending_amount: number;
  overdue_amount: number;
  average_payment: number;
}

const statusVariant = (status: string) => {
  switch (status) {
    case 'paid':
      return 'success';
    case 'pending':
      return 'warning';
    case 'overdue':
      return 'danger';
    default:
      return 'secondary';
  }
};

export default function LandlordPaymentsPage() {
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [summary, setSummary] = useState<PaymentSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [paymentsData, summaryData] = await Promise.all([
        apiClient.get<PaymentRow[]>('/payments/all?limit=100'),
        apiClient.get<PaymentSummary>('/admin/payments/summary'),
      ]);
      setPayments(paymentsData);
      setSummary(summaryData);
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to load payments');
    } finally {
      setIsLoading(false);
    }
  };

  const filtered = useMemo(() => {
    return payments.filter((p) =>
      !search ||
      p.tenant_name?.toLowerCase().includes(search.toLowerCase()) ||
      p.payment_method?.toLowerCase().includes(search.toLowerCase())
    );
  }, [payments, search]);

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
        <h1 className="text-heading-xl font-medium text-white">Payments</h1>
        <p className="text-body-lg text-[#797d86] mt-2">
          Track rent collection across the portfolio.
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
          <p className="text-sm text-[#797d86]">Average</p>
          <p className="text-3xl font-medium text-white mt-1">
            {formatCurrency(summary?.average_payment ?? 0)}
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="p-4">
          <Input
            placeholder="Search by tenant or method..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-xs"
          />
        </CardContent>
      </Card>

      <div className="table-container">
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <CreditCard className="h-12 w-12 mx-auto mb-3 text-[#303236]" />
            <p className="text-[#797d86]">No payments found</p>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th className="font-medium">Tenant</th>
                <th className="font-medium">Amount</th>
                <th className="font-medium">Date</th>
                <th className="font-medium">Method</th>
                <th className="font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((payment) => (
                <tr key={payment.id}>
                  <td className="text-[#c9cbcf]">{payment.tenant_name}</td>
                  <td className="font-mono text-white">{formatCurrency(payment.amount)}</td>
                  <td className="text-[#c9cbcf]">{formatDate(payment.payment_date)}</td>
                  <td className="text-[#c9cbcf] capitalize">{payment.payment_method || '—'}</td>
                  <td>
                    <Badge variant={statusVariant(payment.status)} className="capitalize">
                      {payment.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}