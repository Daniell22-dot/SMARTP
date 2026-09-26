'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { apiClient } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { ClipboardList, ArrowLeft, Download, Search, Loader2, Building2, Home, Users, Plus } from 'lucide-react';
import Link from 'next/link';
import { UtilityStatement } from '@/types';
import { toast } from 'react-hot-toast';

export default function StatementsPage() {
  const { user } = useAuth();
  const [statements, setStatements] = useState<UtilityStatement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [generatingUnit, setGeneratingUnit] = useState<{ unitId: number; billingMonth: string } | null>(null);
  const [billingMonth, setBillingMonth] = useState(new Date().toISOString().slice(0, 7));
  const [unitId, setUnitId] = useState('');

  useEffect(() => {
    fetchStatements();
  }, []);

  const fetchStatements = async () => {
    setIsLoading(true);
    try {
      const charges = await apiClient.get<any[]>('/utilities');
      
      const statementMap = new Map<string, UtilityStatement>();
      charges.forEach((charge: any) => {
        const key = `${charge.unit_id || 'global'}-${charge.billing_month}`;
        if (!statementMap.has(key)) {
          statementMap.set(key, {
            tenant_name: 'Tenant',
            tenant_email: null,
            tenant_phone: null,
            property_name: 'Property',
            unit_number: charge.unit_id?.toString() || 'N/A',
            billing_month: charge.billing_month,
            charges: [],
            total_amount: 0,
            generated_at: new Date().toISOString(),
          });
        }
        const stmt = statementMap.get(key)!;
        stmt.charges.push({
          id: charge.id,
          utility_type: charge.utility_type,
          units_consumed: charge.units_consumed,
          amount: charge.amount,
          status: charge.status,
          notes: charge.notes,
        });
        stmt.total_amount += charge.amount;
      });
      
      setStatements(Array.from(statementMap.values()).sort((a, b) => 
        b.billing_month.localeCompare(a.billing_month)
      ));
    } catch (error: any) {
      console.error('Failed to load statements:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateStatement = async () => {
    if (!unitId || !billingMonth) return;
    setGeneratingUnit({ unitId: parseInt(unitId), billingMonth });
    try {
      const statement = await apiClient.get<UtilityStatement>(`/utilities/statement/${unitId}?billing_month=${billingMonth}`);
      setStatements(prev => [statement, ...prev.filter(s => s.unit_number !== unitId || s.billing_month !== billingMonth)]);
      toast.success('Statement generated successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to generate statement');
    } finally {
      setGeneratingUnit(null);
      setShowGenerateModal(false);
    }
  };

  const downloadStatement = (stmt: UtilityStatement) => {
    // Create CSV content
    const csvHeader = 'Utility Type,Units Consumed,Amount,Status,Notes\n';
    const csvRows = stmt.charges.map(c => 
      `${c.utility_type},${c.units_consumed || ''},${c.amount},${c.status},${c.notes || ''}`
    ).join('\n');
    const csv = csvHeader + csvRows;
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `utility-statement-${stmt.unit_number}-${stmt.billing_month}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Link href="/landlord/utilities">
            <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
          </Link>
          <h1 className="text-heading-xl font-bold text-spurs-navy dark:text-white">Utility Statements</h1>
        </div>
        <Card><CardContent className="h-64 animate-pulse bg-gray-200 dark:bg-gray-700" /></Card>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    return status === 'paid' ? 'success' : 'warning';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2">
          <Link href="/landlord/utilities">
            <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
          </Link>
          <div>
            <h1 className="text-heading-xl font-bold text-spurs-navy dark:text-white flex items-center gap-2">
              <ClipboardList className="h-6 w-6 text-gray-600" />
              Utility Statements
            </h1>
            <p className="text-gray-500 dark:text-gray-400">View and generate tenant utility statements</p>
          </div>
        </div>
        <Button onClick={() => setShowGenerateModal(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Generate Statement
        </Button>
      </div>

      {/* Statements List */}
      <Card className="card-hover">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5" />
            All Statements
          </CardTitle>
        </CardHeader>
        <CardContent>
          {statements.length === 0 ? (
            <div className="text-center py-12">
              <ClipboardList className="h-16 w-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
              <h3 className="text-lg font-medium text-spurs-navy dark:text-white mb-2">No statements generated yet</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">Generate statements for specific units and billing months</p>
              <Button onClick={() => setShowGenerateModal(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Generate Statement
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-sm text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                    <th className="pb-3 font-medium">Property</th>
                    <th className="pb-3 font-medium">Unit</th>
                    <th className="pb-3 font-medium">Tenant</th>
                    <th className="pb-3 font-medium">Billing Month</th>
                    <th className="pb-3 font-medium">Total Amount</th>
                    <th className="pb-3 font-medium">Charges</th>
                    <th className="pb-3 font-medium">Generated</th>
                    <th className="pb-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {statements.map((stmt) => (
                    <tr key={`${stmt.unit_number}-${stmt.billing_month}`} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-gray-400" />
                          <span className="font-medium text-spurs-navy dark:text-white">{stmt.property_name}</span>
                        </div>
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <Home className="h-4 w-4 text-gray-400" />
                          <span className="text-spurs-navy dark:text-white">{stmt.unit_number}</span>
                        </div>
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-gray-400" />
                          <span className="text-spurs-navy dark:text-white">{stmt.tenant_name}</span>
                        </div>
                      </td>
                      <td className="py-3 text-spurs-navy dark:text-white">{stmt.billing_month}</td>
                      <td className="py-3 font-medium text-spurs-navy dark:text-white">{formatCurrency(stmt.total_amount)}</td>
                      <td className="py-3 text-gray-600 dark:text-gray-400">{stmt.charges.length} charge(s)</td>
                      <td className="py-3 text-gray-600 dark:text-gray-400 text-sm">{formatDate(stmt.generated_at)}</td>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" onClick={() => downloadStatement(stmt)}>
                            <Download className="h-4 w-4 mr-1" />
                            Download
                          </Button>
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

      {/* Generate Statement Modal */}
      <Modal
        isOpen={showGenerateModal}
        onClose={() => setShowGenerateModal(false)}
        title="Generate Utility Statement"
        size="lg"
      >
        <form className="space-y-4" onSubmit={e => { e.preventDefault(); generateStatement(); }}>
          <Input
            label="Unit ID"
            type="number"
            placeholder="e.g., 1"
            value={unitId}
            onChange={e => setUnitId(e.target.value)}
            required
          />
          <Input
            label="Billing Month"
            type="month"
            value={billingMonth}
            onChange={e => setBillingMonth(e.target.value)}
            required
          />
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button type="button" variant="outline" onClick={() => setShowGenerateModal(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={!!generatingUnit}>
              Generate Statement
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}