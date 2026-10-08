'use client';

import { useState, useEffect, useMemo } from 'react';
import { apiClient } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Building2, MapPin, CreditCard } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface PropertyRow {
  id: number;
  name: string;
  address_line1: string;
  city: string;
  status: string;
  monthly_rent: number;
}

interface DashboardMetrics {
  total_properties: number;
  total_units: number;
  total_revenue: number;
  monthly_revenue: number;
  occupancy_rate: number;
  active_leases: number;
}

export default function LandlordPropertiesPage() {
  const [properties, setProperties] = useState<PropertyRow[]>([]);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [propsData, metricsData] = await Promise.all([
        apiClient.get<PropertyRow[]>('/properties'),
        apiClient.get<DashboardMetrics>('/admin/metrics'),
      ]);
      setProperties(propsData);
      setMetrics(metricsData);
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to load properties');
    } finally {
      setIsLoading(false);
    }
  };

  const statusVariant = (status: string) => {
    return status === 'active' ? 'success' : 'secondary';
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
        <h1 className="text-heading-xl font-medium text-white">Properties</h1>
        <p className="text-body-lg text-[#797d86] mt-2">
          Portfolio overview and performance.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="card p-5">
          <p className="text-sm text-[#797d86]">Properties</p>
          <p className="text-3xl font-medium text-white mt-1">{metrics?.total_properties ?? 0}</p>
        </div>
        <div className="card p-5">
          <p className="text-sm text-[#797d86]">Units</p>
          <p className="text-3xl font-medium text-white mt-1">{metrics?.total_units ?? 0}</p>
        </div>
        <div className="card p-5">
          <p className="text-sm text-[#797d86]">Occupancy</p>
          <p className="text-3xl font-medium text-[#00e599] mt-1">{metrics?.occupancy_rate ?? 0}%</p>
        </div>
        <div className="card p-5">
          <p className="text-sm text-[#797d86]">Monthly Revenue</p>
          <p className="text-3xl font-medium text-white mt-1">{formatCurrency(metrics?.monthly_revenue ?? 0)}</p>
        </div>
      </div>

      {properties.length === 0 ? (
        <Card>
          <CardContent className="text-center py-16">
            <Building2 className="h-12 w-12 mx-auto mb-3 text-[#303236]" />
            <p className="text-[#797d86]">No properties registered yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {properties.map((property) => (
            <div key={property.id} className="card p-5 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded flex items-center justify-center bg-[#00e599]/10 text-[#00e599]">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-medium text-white">{property.name}</h3>
                    <p className="text-sm text-[#797d86]">{property.city}</p>
                  </div>
                </div>
                <Badge variant={statusVariant(property.status)} className="capitalize">
                  {property.status}
                </Badge>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-[#c9cbcf]">
                  <MapPin className="h-4 w-4 text-[#61646b]" />
                  {property.address_line1}
                </div>
                <div className="flex items-center gap-2 text-[#c9cbcf]">
                  <CreditCard className="h-4 w-4 text-[#61646b]" />
                  Monthly rent: <span className="font-mono text-white">{formatCurrency(property.monthly_rent)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}