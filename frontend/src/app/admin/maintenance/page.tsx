'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';
import { formatDateTime } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Select } from '@/components/ui/Input';
import { Wrench, AlertTriangle } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface MaintenanceRow {
  id: number;
  type: string;
  description: string;
  status: string;
  priority: string;
  created_at: string;
  tenant_name: string;
  unit_number: string | number | null;
}

interface MaintenanceSummary {
  total_requests: number;
  pending: number;
  in_progress: number;
  completed: number;
  urgent_count: number;
}

const statusVariants: Record<string, 'success' | 'warning' | 'info' | 'secondary' | 'danger'> = {
  pending: 'warning',
  in_progress: 'info',
  completed: 'success',
  cancelled: 'secondary',
};

const priorityVariants: Record<string, 'danger' | 'warning' | 'secondary' | 'info'> = {
  emergency: 'danger',
  high: 'warning',
  medium: 'secondary',
  low: 'secondary',
};

const validStatuses = ['pending', 'in_progress', 'completed', 'cancelled'];

export default function AdminMaintenancePage() {
  const [requests, setRequests] = useState<MaintenanceRow[]>([]);
  const [summary, setSummary] = useState<MaintenanceSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [requestsData, summaryData] = await Promise.all([
        apiClient.get<MaintenanceRow[]>('/maintenance/all'),
        apiClient.get<MaintenanceSummary>('/admin/maintenance/summary'),
      ]);
      setRequests(requestsData);
      setSummary(summaryData);
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to load maintenance requests');
    } finally {
      setIsLoading(false);
    }
  };

  const updateStatus = async (id: number, status: string) => {
    setUpdatingId(id);
    try {
      await apiClient.put(`/maintenance/${id}/status`, { status });
      toast.success('Status updated');
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to update status');
    } finally {
      setUpdatingId(null);
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
      <div>
        <h1 className="text-heading-xl font-medium text-white">Maintenance</h1>
        <p className="text-body-lg text-[#797d86] mt-2">
          All maintenance requests and resolution workflow.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="card p-5">
          <p className="text-sm text-[#797d86]">Total Requests</p>
          <p className="text-3xl font-medium text-white mt-1">{summary?.total_requests ?? 0}</p>
        </div>
        <div className="card p-5">
          <p className="text-sm text-[#797d86]">Pending</p>
          <p className="text-3xl font-medium text-amber-400 mt-1">{summary?.pending ?? 0}</p>
        </div>
        <div className="card p-5">
          <p className="text-sm text-[#797d86]">In Progress</p>
          <p className="text-3xl font-medium text-[#00e599] mt-1">{summary?.in_progress ?? 0}</p>
        </div>
        <div className="card p-5">
          <p className="text-sm text-[#797d86]">Completed</p>
          <p className="text-3xl font-medium text-white mt-1">{summary?.completed ?? 0}</p>
        </div>
      </div>

      {!!summary?.urgent_count && (
        <div className="alert-warning">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <div>
            <p className="font-medium">Urgent attention needed</p>
            <p className="text-sm mt-1">
              {summary.urgent_count} request(s) flagged high priority or emergency.
            </p>
          </div>
        </div>
      )}

      <div className="table-container">
        {requests.length === 0 ? (
          <div className="text-center py-16">
            <Wrench className="h-12 w-12 mx-auto mb-3 text-[#303236]" />
            <p className="text-[#797d86]">No maintenance requests yet.</p>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th className="font-medium">Tenant</th>
                <th className="font-medium">Unit</th>
                <th className="font-medium">Issue</th>
                <th className="font-medium">Priority</th>
                <th className="font-medium">Status</th>
                <th className="font-medium">Created</th>
                <th className="font-medium">Update</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((req) => (
                <tr key={req.id}>
                  <td className="text-[#c9cbcf]">{req.tenant_name}</td>
                  <td className="font-mono text-[#c9cbcf]">{req.unit_number ?? '—'}</td>
                  <td className="text-[#c9cbcf]">
                    <p className="font-medium text-white">{req.type}</p>
                    <p className="text-[#61646b] max-w-md truncate">{req.description}</p>
                  </td>
                  <td>
                    <Badge variant={priorityVariants[req.priority] ?? 'secondary'} className="capitalize">
                      {req.priority}
                    </Badge>
                  </td>
                  <td>
                    <Badge variant={statusVariants[req.status] ?? 'secondary'} className="capitalize">
                      {req.status.replace('_', ' ')}
                    </Badge>
                  </td>
                  <td className="text-[#c9cbcf] text-sm">{formatDateTime(req.created_at)}</td>
                  <td>
                    <Select
                      value={req.status}
                      disabled={updatingId === req.id}
                      onChange={(e) => updateStatus(req.id, e.target.value)}
                      className="w-40 py-1.5 text-sm"
                      aria-label="Update status"
                    >
                      {validStatuses.map((s) => (
                        <option key={s} value={s}>
                          {s.replace('_', ' ')}
                        </option>
                      ))}
                    </Select>
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