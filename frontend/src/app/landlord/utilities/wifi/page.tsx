'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { apiClient } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Wifi, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { UtilityCharge } from '@/types';

export default function WifiChargesPage() {
  const { user } = useAuth();
  const [charges, setCharges] = useState<UtilityCharge[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchWifiCharges();
  }, []);

  const fetchWifiCharges = async () => {
    setIsLoading(true);
    try {
      const data = await apiClient.get<UtilityCharge[]>('/utilities?utility_type=wifi');
      setCharges(data);
    } catch (error: any) {
      console.error('Failed to load WiFi charges:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Link href="/landlord/utilities">
            <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">WiFi Charges</h1>
        </div>
        <Card><CardContent className="h-64 animate-pulse bg-gray-200 dark:bg-gray-700" /></Card>
      </div>
    );
  }

  const totalWifi = charges.reduce((sum, c) => sum + c.amount, 0);
  const pendingCount = charges.filter(c => c.status === 'pending').length;
  const paidCount = charges.filter(c => c.status === 'paid').length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-2">
        <Link href="/landlord/utilities">
          <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Wifi className="h-6 w-6 text-purple-600" />
            WiFi Charges
          </h1>
          <p className="text-gray-500 dark:text-gray-400">Manage WiFi subscription charges</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total WiFi Revenue</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{formatCurrency(totalWifi)}</p>
              </div>
              <Wifi className="h-12 w-12 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Pending</p>
                <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 mt-1">{pendingCount}</p>
              </div>
              <Wifi className="h-12 w-12 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Paid</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">{paidCount}</p>
              </div>
              <Wifi className="h-12 w-12 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charges Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wifi className="h-5 w-5 text-purple-600" />
            WiFi Charges
          </CardTitle>
        </CardHeader>
        <CardContent>
          {charges.length === 0 ? (
            <div className="text-center py-12">
              <Wifi className="h-16 w-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No WiFi charges found</h3>
              <Link href="/landlord/utilities">
                <Button className="gap-2 mt-4">
                  <span>+</span> Add WiFi Charge
                </Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-sm text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                    <th className="pb-3 font-medium">Billing Month</th>
                    <th className="pb-3 font-medium">Amount</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium">Notes</th>
                    <th className="pb-3 font-medium">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {charges.map((charge) => (
                    <tr key={charge.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="py-3 text-gray-900 dark:text-white">{charge.billing_month}</td>
                      <td className="py-3 font-medium text-gray-900 dark:text-white">{formatCurrency(charge.amount)}</td>
                      <td className="py-3">
                        <Badge variant={charge.status === 'paid' ? 'success' : 'warning'}>
                          {charge.status}
                        </Badge>
                      </td>
                      <td className="py-3 text-gray-600 dark:text-gray-400 max-w-xs truncate">
                        {charge.notes || '—'}
                      </td>
                      <td className="py-3 text-gray-600 dark:text-gray-400 text-sm">{formatDate(charge.created_at)}</td>
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