'use client';

import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { formatDate } from '@/lib/utils';
import { apiClient } from '@/lib/api';
import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Wrench, Plus, AlertCircle, Loader2, Eye } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const maintenanceSchema = z.object({
  type: z.string().min(1, 'Please select a type'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  priority: z.string().min(1, 'Please select a priority'),
  preferred_time: z.string().optional(),
});

type MaintenanceForm = z.infer<typeof maintenanceSchema>;

interface MaintenanceRequest {
  id: number;
  title: string;
  description: string;
  status: string;
  priority: string;
  created_at: string;
}

export default function MaintenancePage() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<MaintenanceForm>({
    resolver: zodResolver(maintenanceSchema),
    defaultValues: {
      type: 'plumbing',
      priority: 'medium',
      preferred_time: 'anytime',
    },
  });

  useEffect(() => {
    async function fetchRequests() {
      try {
        const data = await apiClient.get<MaintenanceRequest[]>('/maintenance/my?limit=50');
        setRequests(data);
      } catch (error) {
        console.error('Failed to load maintenance requests:', error);
        toast.error('Failed to load requests');
      } finally {
        setIsLoading(false);
      }
    }
    fetchRequests();
  }, []);

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'success' | 'warning' | 'danger' | 'info'> = {
      pending: 'warning',
      in_progress: 'info',
      completed: 'success',
      cancelled: 'secondary',
    };
    return variants[status] || 'default';
  };

  const getPriorityBadge = (priority: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'success' | 'warning' | 'danger' | 'info'> = {
      low: 'secondary',
      medium: 'info',
      high: 'warning',
      emergency: 'danger',
    };
    return variants[priority] || 'default';
  };

  const onSubmit = async (formData: MaintenanceForm) => {
    setIsSubmitting(true);
    try {
      await apiClient.post('/maintenance', formData);
      toast.success('Maintenance request submitted');
      setShowModal(false);
      reset();
      const response = await apiClient.get<MaintenanceRequest[]>('/maintenance/my?limit=50');
      setRequests(response);
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to submit request');
    } finally {
      setIsSubmitting(false);
    }
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Maintenance</h1>
          <p className="text-gray-500 dark:text-gray-400">Submit and track maintenance requests</p>
        </div>
        <Button onClick={() => setShowModal(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          New Request
        </Button>
      </div>

      {/* New Request Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setShowModal(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">New Maintenance Request</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">×</button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Select
                label="Type"
                error={errors.type?.message}
                {...register('type')}
              >
                <option value="plumbing">Plumbing</option>
                <option value="electrical">Electrical</option>
                <option value="appliance">Appliance</option>
                <option value="structural">Structural</option>
                <option value="hvac">HVAC</option>
                <option value="pest">Pest Control</option>
                <option value="other">Other</option>
              </Select>

              <Select
                label="Priority"
                error={errors.priority?.message}
                {...register('priority')}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="emergency">Emergency</option>
              </Select>

              <Select
                label="Preferred Time"
                {...register('preferred_time')}
              >
                <option value="anytime">Anytime</option>
                <option value="morning">Morning (8AM-12PM)</option>
                <option value="afternoon">Afternoon (12PM-5PM)</option>
                <option value="evening">Evening (5PM-8PM)</option>
                <option value="weekend">Weekend</option>
              </Select>

              <Textarea
                label="Description"
                placeholder="Describe the issue in detail..."
                rows={4}
                error={errors.description?.message}
                {...register('description')}
              />

              <div className="flex gap-3 pt-2">
                <Button variant="outline" type="button" onClick={() => setShowModal(false)} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" isLoading={isSubmitting} className="flex-1">
                  Submit Request
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Requests List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5" />
            Your Requests
          </CardTitle>
        </CardHeader>
        <CardContent>
          {requests.length === 0 ? (
            <div className="text-center py-12">
              <Wrench className="h-16 w-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No maintenance requests</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">Submit a request if you need repairs</p>
              <Button onClick={() => setShowModal(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                New Request
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map((req) => (
                <div key={req.id} className="p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-gray-900 dark:text-white">{req.title}</h4>
                        <Badge variant={getStatusBadge(req.status)}>{req.status}</Badge>
                        <Badge variant={getPriorityBadge(req.priority)}>{req.priority}</Badge>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">{req.description}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">
                        Submitted: {formatDate(req.created_at)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}