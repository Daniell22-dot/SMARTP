'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { apiClient } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Droplets, Wifi, Plus, Search, Filter, Download, Edit, Trash2, Loader2, AlertTriangle, CheckCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { UtilityCharge } from '@/types';

const utilitySchema = z.object({
  utility_type: z.enum(['water', 'wifi']),
  units_consumed: z.number().nullable().optional(),
  amount: z.number().min(1, 'Amount must be greater than 0'),
  billing_month: z.string().min(7, 'Billing month is required (YYYY-MM)'),
  notes: z.string().optional(),
});

type UtilityForm = z.infer<typeof utilitySchema>;

export default function UtilitiesPage() {
  const { user } = useAuth();
  const [charges, setCharges] = useState<UtilityCharge[]>([]);
  const [filteredCharges, setFilteredCharges] = useState<UtilityCharge[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCharge, setEditingCharge] = useState<UtilityCharge | null>(null);
  const [deletingCharge, setDeletingCharge] = useState<UtilityCharge | null>(null);
  const [filters, setFilters] = useState({
    utility_type: '',
    billing_month: '',
    status: '',
    search: '',
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setValue,
    watch,
  } = useForm<UtilityForm>({
    resolver: zodResolver(utilitySchema),
    defaultValues: {
      utility_type: 'water',
      units_consumed: null,
      amount: 0,
      billing_month: new Date().toISOString().slice(0, 7),
      notes: '',
    },
  });

  const utilityType = watch('utility_type');

  useEffect(() => {
    fetchCharges();
  }, []);

  useEffect(() => {
    let result = charges;
    if (filters.utility_type) {
      result = result.filter(c => c.utility_type === filters.utility_type);
    }
    if (filters.billing_month) {
      result = result.filter(c => c.billing_month === filters.billing_month);
    }
    if (filters.status) {
      result = result.filter(c => c.status === filters.status);
    }
    if (filters.search) {
      const search = filters.search.toLowerCase();
      result = result.filter(c => 
        c.billing_month.toLowerCase().includes(search) ||
        c.notes?.toLowerCase().includes(search) ||
        c.amount.toString().includes(search)
      );
    }
    setFilteredCharges(result);
  }, [charges, filters]);

  const fetchCharges = async () => {
    setIsLoading(true);
    try {
      const data = await apiClient.get<UtilityCharge[]>('/utilities');
      setCharges(data);
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to load utility charges');
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: UtilityForm) => {
    try {
      if (editingCharge) {
        await apiClient.put<UtilityCharge>(`/utilities/${editingCharge.id}`, data);
        toast.success('Utility charge updated successfully');
      } else {
        await apiClient.post<UtilityCharge>('/utilities', data);
        toast.success('Utility charge created successfully');
      }
      setShowModal(false);
      reset();
      setEditingCharge(null);
      fetchCharges();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to save utility charge');
    }
  };

  const handleDelete = async () => {
    if (!deletingCharge) return;
    try {
      await apiClient.delete(`/utilities/${deletingCharge.id}`);
      toast.success('Utility charge deleted');
      setDeletingCharge(null);
      fetchCharges();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to delete utility charge');
    }
  };

  const openCreateModal = () => {
    reset({
      utility_type: 'water',
      units_consumed: null,
      amount: 0,
      billing_month: new Date().toISOString().slice(0, 7),
      notes: '',
    });
    setEditingCharge(null);
    setShowModal(true);
  };

  const openEditModal = (charge: UtilityCharge) => {
    setEditingCharge(charge);
    setValue('utility_type', charge.utility_type);
    setValue('units_consumed', charge.units_consumed);
    setValue('amount', charge.amount);
    setValue('billing_month', charge.billing_month);
    setValue('notes', charge.notes || '');
    setShowModal(true);
  };

  const getStatusBadge = (status: string) => {
    return status === 'paid' ? 'success' : 'warning';
  };

  const getUtilityIcon = (type: UtilityType) => {
    return type === 'water' ? <Droplets className="h-4 w-4 text-blue-600" /> : <Wifi className="h-4 w-4 text-purple-600" />;
  };

  const getUtilityLabel = (type: UtilityType) => {
    return type === 'water' ? 'Water' : 'WiFi';
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Utilities</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage water and WiFi charges</p>
        </div>
        <Button onClick={openCreateModal} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Charge
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <Input
              placeholder="Search charges..."
              value={filters.search}
              onChange={e => setFilters({ ...filters, search: e.target.value })}
              className="max-w-xs"
            />
            <Select
              value={filters.utility_type}
              onChange={e => setFilters({ ...filters, utility_type: e.target.value })}
              className="w-40"
            >
              <option value="">All Types</option>
              <option value="water">Water</option>
              <option value="wifi">WiFi</option>
            </Select>
            <Select
              value={filters.status}
              onChange={e => setFilters({ ...filters, status: e.target.value })}
              className="w-40"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
            </Select>
            <Input
              type="month"
              value={filters.billing_month}
              onChange={e => setFilters({ ...filters, billing_month: e.target.value })}
              className="w-40"
            />
          </div>
        </CardContent>
      </Card>

      {/* Charges Table */}
      <Card>
        <CardContent>
          {filteredCharges.length === 0 ? (
            <div className="text-center py-12">
              <Droplets className="h-16 w-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No utility charges found</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">Get started by adding your first utility charge</p>
              <Button onClick={openCreateModal} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Charge
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-sm text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                    <th className="pb-3 font-medium">Type</th>
                    <th className="pb-3 font-medium">Billing Month</th>
                    <th className="pb-3 font-medium">Units Consumed</th>
                    <th className="pb-3 font-medium">Amount</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium">Notes</th>
                    <th className="pb-3 font-medium">Created</th>
                    <th className="pb-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredCharges.map((charge) => (
                    <tr key={charge.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          {getUtilityIcon(charge.utility_type)}
                          <span className="font-medium capitalize">{getUtilityLabel(charge.utility_type)}</span>
                        </div>
                      </td>
                      <td className="py-3 text-gray-900 dark:text-white">{charge.billing_month}</td>
                      <td className="py-3 text-gray-600 dark:text-gray-400">
                        {charge.units_consumed !== null ? `${charge.units_consumed} units` : '—'}
                      </td>
                      <td className="py-3 font-medium text-gray-900 dark:text-white">
                        {formatCurrency(charge.amount)}
                      </td>
                      <td className="py-3">
                        <Badge variant={getStatusBadge(charge.status)}>
                          {charge.status}
                        </Badge>
                      </td>
                      <td className="py-3 text-gray-600 dark:text-gray-400 max-w-xs truncate">
                        {charge.notes || '—'}
                      </td>
                      <td className="py-3 text-gray-600 dark:text-gray-400 text-sm">
                        {formatDate(charge.created_at)}
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditModal(charge)}
                            aria-label="Edit charge"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => { setDeletingCharge(charge); }}
                            aria-label="Delete charge"
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
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

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => { setShowModal(false); reset(); setEditingCharge(null); }}
        title={editingCharge ? 'Edit Utility Charge' : 'Add Utility Charge'}
        size="lg"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Utility Type"
              error={errors.utility_type?.message}
              {...register('utility_type')}
              disabled={!!editingCharge}
            >
              <option value="water">Water</option>
              <option value="wifi">WiFi</option>
            </Select>

            <Input
              label="Billing Month"
              type="month"
              error={errors.billing_month?.message}
              {...register('billing_month', { valueAsString: true })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Amount (KES)"
              type="number"
              step="0.01"
              min="1"
              error={errors.amount?.message}
              {...register('amount', { valueAsNumber: true })}
            />

            {utilityType === 'water' && (
              <Input
                label="Units Consumed (m³)"
                type="number"
                step="0.01"
                min="0"
                error={errors.units_consumed?.message}
                {...register('units_consumed', { valueAsNumber: true })}
              />
            )}
          </div>

          <Input
            label="Notes (Optional)"
            {...register('notes')}
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button type="button" variant="outline" onClick={() => { setShowModal(false); reset(); setEditingCharge(null); }}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isLoading}>
              {editingCharge ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deletingCharge}
        onClose={() => setDeletingCharge(null)}
        title="Delete Utility Charge"
        description={`Are you sure you want to delete this ${deletingCharge?.utility_type} charge for ${deletingCharge?.billing_month}? This action cannot be undone.`}
        size="sm"
      >
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setDeletingCharge(null)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete} isLoading={isLoading}>
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
}