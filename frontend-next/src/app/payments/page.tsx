'use client';

import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { formatCurrency, formatDate } from '@/lib/utils';
import { apiClient } from '@/lib/api';
import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { CreditCard, Plus, Eye, QrCode, Download, Loader2, AlertCircle } from 'lucide-react';

interface Payment {
  id: number;
  amount: number;
  payment_date: string;
  payment_method: string;
  status: string;
  receipt_url: string | null;
  mpesa_code: string | null;
  transaction_id: string | null;
}

export default function PaymentsPage() {
  const { user } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [mpesaCode, setMpesaCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [qrData, setQrData] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPayments() {
      try {
        const data = await apiClient.get<Payment[]>('/payments/my?limit=50');
        setPayments(data);
      } catch (error) {
        console.error('Failed to load payments:', error);
        toast.error('Failed to load payments');
      } finally {
        setIsLoading(false);
      }
    }
    fetchPayments();
  }, []);

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'success' | 'warning' | 'danger' | 'info'> = {
      paid: 'success',
      pending: 'warning',
      overdue: 'danger',
      failed: 'danger',
    };
    return variants[status] || 'default';
  };

  const handleVerifyMpesa = async () => {
    if (!mpesaCode.trim()) {
      toast.error('Please enter the M-Pesa transaction code');
      return;
    }
    setIsVerifying(true);
    try {
      await apiClient.post('/payments/verify-mpesa', { transaction_code: mpesaCode });
      toast.success('Payment submitted for verification');
      setMpesaCode('');
      setShowModal(false);
      // Refresh payments
      const data = await apiClient.get<Payment[]>('/payments/my?limit=50');
      setPayments(data);
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Verification failed');
    } finally {
      setIsVerifying(false);
    }
  };

  const generateQrCode = () => {
    // M-Pesa QR code generation (simplified)
    const paybill = '400200';
    const account = user?.email || 'tenant';
    const amount = 0; // Would be calculated from lease
    const qrString = `MPESA:${paybill}:${account}:${amount}`;
    setQrData(qrString);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card><CardContent className="h-64 animate-pulse bg-gray-200 dark:bg-gray-700" /></Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Payments</h1>
          <p className="text-gray-500 dark:text-gray-400">View and manage your rent payments</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={generateQrCode} className="gap-2">
            <QrCode className="h-4 w-4" />
            M-Pesa QR
          </Button>
          <Button onClick={() => setShowModal(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Verify M-Pesa
          </Button>
        </div>
      </div>

      {/* M-Pesa QR Modal */}
      {qrData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setQrData(null)}>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">M-Pesa QR Code</h3>
              <button onClick={() => setQrData(null)} className="text-gray-400 hover:text-gray-600">×</button>
            </div>
            <div className="text-center">
              <div className="h-64 w-64 mx-auto bg-white p-4 rounded-lg">
                {/* In production, use a QR code library */}
                <div className="h-full w-full flex items-center justify-center bg-gray-100 rounded">
                  <span className="text-gray-500 text-sm">QR Code: {qrData.slice(0, 50)}...</span>
                </div>
              </div>
              <p className="mt-4 text-sm text-gray-500">Scan with M-Pesa app to pay</p>
              <p className="text-xs text-gray-400 mt-1">Paybill: 400200 | Account: {user?.email}</p>
            </div>
          </div>
        </div>
      )}

      {/* Verify M-Pesa Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setShowModal(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Verify M-Pesa Payment</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">×</button>
            </div>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Enter the M-Pesa transaction code (e.g., NLJ7RT6543) you received via SMS.
            </p>
            <Input
              label="Transaction Code"
              placeholder="NLJ7RT6543"
              value={mpesaCode}
              onChange={(e) => setMpesaCode(e.target.value.toUpperCase())}
              autoFocus
            />
            <div className="flex gap-3 mt-4">
              <Button variant="outline" onClick={() => setShowModal(false)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleVerifyMpesa} isLoading={isVerifying} className="flex-1">
                Verify Payment
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <div className="text-center py-12">
              <CreditCard className="h-16 w-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No payments yet</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">Your payment history will appear here</p>
              <Button onClick={() => setShowModal(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Verify M-Pesa Payment
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-sm text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                    <th className="pb-3 font-medium">Date</th>
                    <th className="pb-3 font-medium">Amount</th>
                    <th className="pb-3 font-medium">Method</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium">M-Pesa Code</th>
                    <th className="pb-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {payments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="py-3 text-gray-900 dark:text-white">{formatDate(payment.payment_date)}</td>
                      <td className="py-3 font-medium text-gray-900 dark:text-white">{formatCurrency(payment.amount)}</td>
                      <td className="py-3 text-gray-600 dark:text-gray-400 capitalize">{payment.payment_method.replace('_', ' ')}</td>
                      <td className="py-3">
                        <Badge variant={getStatusBadge(payment.status)}>{payment.status}</Badge>
                      </td>
                      <td className="py-3 text-gray-600 dark:text-gray-400 font-mono text-sm">
                        {payment.mpesa_code || payment.transaction_id || '—'}
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          {payment.receipt_url && (
                            <a href={payment.receipt_url} target="_blank" rel="noopener" className="text-primary-600 hover:underline text-sm flex items-center gap-1">
                              <Download className="h-3 w-3" />
                              Receipt
                            </a>
                          )}
                          {payment.status === 'pending' && payment.mpesa_code && (
                            <Button variant="ghost" size="sm" onClick={() => { setMpesaCode(payment.mpesa_code!); setShowModal(true); }}>
                              <Eye className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
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