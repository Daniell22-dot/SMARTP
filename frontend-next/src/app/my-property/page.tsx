'use client';

import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency, formatDate } from '@/lib/utils';
import { apiClient } from '@/lib/api';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Home, Building2, DollarSign, Calendar, MapPin, Key, Users, AlertCircle } from 'lucide-react';

interface Property {
  id: number;
  name: string;
  property_type: string;
  address_line1: string;
  city: string;
  state: string;
  monthly_rent: number;
}

interface Unit {
  id: number;
  unit_number: string;
  bedrooms: number;
  bathrooms: number;
  monthly_rent: number;
  is_occupied: boolean;
}

interface Lease {
  id: number;
  start_date: string;
  end_date: string;
  monthly_rent: number;
  security_deposit: number;
  status: string;
}

export default function MyPropertyPage() {
  const { user } = useAuth();
  const [property, setProperty] = useState<Property | null>(null);
  const [unit, setUnit] = useState<Unit | null>(null);
  const [lease, setLease] = useState<Lease | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [propRes, unitRes, leaseRes] = await Promise.all([
          apiClient.get<Property>('/properties/my'),
          apiClient.get<Unit>('/tenants/my-status').then((r) => r.unit).catch(() => null),
          apiClient.get<Lease>('/leases/my').catch(() => null),
        ]);
        setProperty(propRes);
        setUnit(unitRes);
        setLease(leaseRes);
      } catch (error) {
        console.error('Failed to load property data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}><CardContent className="h-40 animate-pulse bg-gray-200 dark:bg-gray-700" /></Card>
          ))}
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="text-center py-16">
        <Home className="h-16 w-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Property Assigned</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          You don't have a property assigned yet. Contact your landlord to get set up.
        </p>
        <Link href="/maintenance">
          <button className="text-primary-600 hover:underline">Report an Issue</button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Property Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            {property.name}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50">
              <MapPin className="h-5 w-5 text-gray-400 mb-1" />
              <p className="text-sm text-gray-500 dark:text-gray-400">Address</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {property.address_line1}, {property.city}, {property.state}
              </p>
            </div>
            <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50">
              <DollarSign className="h-5 w-5 text-gray-400 mb-1" />
              <p className="text-sm text-gray-500 dark:text-gray-400">Monthly Rent</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {formatCurrency(property.monthly_rent)}
              </p>
            </div>
            <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50">
              <Calendar className="h-5 w-5 text-gray-400 mb-1" />
              <p className="text-sm text-gray-500 dark:text-gray-400">Property Type</p>
              <p className="font-medium text-gray-900 dark:text-white capitalize">{property.property_type}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Unit Details */}
      {unit && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Unit {unit.unit_number}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50 text-center">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{unit.bedrooms}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Bedrooms</p>
              </div>
              <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50 text-center">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{unit.bathrooms}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Bathrooms</p>
              </div>
              <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50 text-center">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(unit.monthly_rent)}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Monthly Rent</p>
              </div>
              <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50 text-center">
                <Badge variant={unit.is_occupied ? 'success' : 'warning'}>
                  {unit.is_occupied ? 'Occupied' : 'Vacant'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lease Information */}
      {lease && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Lease Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                <p className="text-sm text-gray-500 dark:text-gray-400">Lease Start</p>
                <p className="font-medium text-gray-900 dark:text-white">{formatDate(lease.start_date)}</p>
              </div>
              <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                <p className="text-sm text-gray-500 dark:text-gray-400">Lease End</p>
                <p className="font-medium text-gray-900 dark:text-white">{formatDate(lease.end_date)}</p>
              </div>
              <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                <p className="text-sm text-gray-500 dark:text-gray-400">Monthly Rent</p>
                <p className="font-medium text-gray-900 dark:text-white">{formatCurrency(lease.monthly_rent)}</p>
              </div>
              <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                <p className="text-sm text-gray-500 dark:text-gray-400">Security Deposit</p>
                <p className="font-medium text-gray-900 dark:text-white">{formatCurrency(lease.security_deposit)}</p>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <Badge variant={lease.status === 'active' ? 'success' : 'secondary'}>
                {lease.status}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <Link href="/payments">
            <button className="w-full p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 flex flex-col items-center gap-2 transition-colors">
              <DollarSign className="h-8 w-8 text-primary-600 dark:text-primary-400" />
              <span className="font-medium text-gray-900 dark:text-white">Make Payment</span>
              <span className="text-sm text-gray-500 dark:text-gray-400">Pay rent via M-Pesa</span>
            </button>
          </Link>
          <Link href="/maintenance">
            <button className="w-full p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 flex flex-col items-center gap-2 transition-colors">
              <AlertCircle className="h-8 w-8 text-orange-600 dark:text-orange-400" />
              <span className="font-medium text-gray-900 dark:text-white">Report Issue</span>
              <span className="text-sm text-gray-500 dark:text-gray-400">Maintenance request</span>
            </button>
          </Link>
          <Link href="/documents">
            <button className="w-full p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 flex flex-col items-center gap-2 transition-colors">
              <Key className="h-8 w-8 text-green-600 dark:text-green-400" />
              <span className="font-medium text-gray-900 dark:text-white">Documents</span>
              <span className="text-sm text-gray-500 dark:text-gray-400">Lease, receipts, IDs</span>
            </button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}