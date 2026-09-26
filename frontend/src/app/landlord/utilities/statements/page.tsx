'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { apiClient } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { ClipboardList, ArrowLeft, Download, Search, Loader2, Building2, Home, Users } from 'lucide-react';
import Link from 'next/link';
import { UtilityStatement } from '@/types';

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
      // For now, we'll fetch all charges and group by unit/billing month
      // In production, this would be a dedicated statements endpoint
      const charges = await apiClient.get<any[]>('/utilities');
      
      // Group charges by billing month and unit
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

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Link href="/landlord/utilities">
            <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Utility Statements</h1>
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
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
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
      <Card>
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
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No statements generated yet</h3>
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
                          <span className="font-medium text-gray-900 dark:text-white">{stmt.property_name}</span>
                        </div>
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <Home className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-900 dark:text-white">{stmt.unit_number}</span>
                        </div>
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-900 dark:text-white">{stmt.tenant_name}</span>
                        </div>
                      </td>
                      <td className="py-3 text-gray-900 dark:text-white">{stmt.billing_month}</td>
                      <td className="py-3 font-medium text-gray-900 dark:text-white">{formatCurrency(stmt.total_amount)}</td>
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

function Modal({ isOpen, onClose, title, size = 'md', children }: any) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div className={`w-full max-w-${size === 'sm' ? 'md' : size === 'lg' ? '2xl' : 'xl'} bg-white dark:bg-gray-800 rounded-xl shadow-xl`} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">×</button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}

function Button({ children, variant = 'primary', size = 'md', isLoading, type = 'button', onClick, className = '', ...props }: any) {
  const base = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';
  const variants = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700',
    outline: 'border border-gray-300 bg-white hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:hover:bg-gray-700',
    ghost: 'bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800',
    danger: 'bg-red-600 text-white hover:bg-red-700',
  };
  const sizes = {
    sm: 'h-8 px-3 text-xs',
    md: 'h-10 px-4 py-2 text-sm',
    lg: 'h-12 px-8 text-base',
    icon: 'h-10 w-10',
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isLoading}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {isLoading && <svg className="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>}
      {children}
    </button>
  );
}

function toast({ success, error }: any) {
  // Simple toast implementation
  if (success) alert(success);
  if (error) alert(error);
}

const Plus = () => <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>;