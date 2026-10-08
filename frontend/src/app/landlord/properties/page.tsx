'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Building2, MapPin, CreditCard, Plus, Key, DoorOpen } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface UnitRow {
  id: number;
  unit_number: string;
  bedrooms: number | null;
  bathrooms: number | null;
  monthly_rent: number;
  is_occupied: boolean;
}

interface PropertyRow {
  id: number;
  name: string;
  address_line1: string;
  city: string;
  status: string;
  monthly_rent: number;
  units: UnitRow[];
}

interface DashboardMetrics {
  total_properties: number;
  total_units: number;
  total_revenue: number;
  monthly_revenue: number;
  occupancy_rate: number;
  active_leases: number;
}

const emptyPropertyForm = { name: '', address_line1: '', city: '', state: '', zip_code: '' };
const emptyUnitForm = { unit_number: '', monthly_rent: '', bedrooms: '', bathrooms: '' };

export default function LandlordPropertiesPage() {
  const [properties, setProperties] = useState<PropertyRow[]>([]);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showPropertyModal, setShowPropertyModal] = useState(false);
  const [isSavingProperty, setIsSavingProperty] = useState(false);
  const [propertyForm, setPropertyForm] = useState(emptyPropertyForm);
  const [showUnitModal, setShowUnitModal] = useState(false);
  const [isSavingUnit, setIsSavingUnit] = useState(false);
  const [unitPropertyId, setUnitPropertyId] = useState<number | null>(null);
  const [unitForm, setUnitForm] = useState(emptyUnitForm);

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

  const handleCreateProperty = async () => {
    if (!propertyForm.name.trim() || !propertyForm.address_line1.trim() || !propertyForm.city.trim()) {
      toast.error('Name, address and city are required');
      return;
    }
    setIsSavingProperty(true);
    try {
      await apiClient.post('/properties', {
        ...propertyForm,
        property_type: 'apartment',
      });
      toast.success('Property created');
      setShowPropertyModal(false);
      setPropertyForm(emptyPropertyForm);
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to create property');
    } finally {
      setIsSavingProperty(false);
    }
  };

  const openUnitModal = (propertyId: number) => {
    setUnitPropertyId(propertyId);
    setUnitForm(emptyUnitForm);
    setShowUnitModal(true);
  };

  const handleCreateUnit = async () => {
    if (unitPropertyId === null) return;
    if (!unitForm.unit_number.trim()) {
      toast.error('Room number is required');
      return;
    }
    const rent = parseFloat(unitForm.monthly_rent);
    if (isNaN(rent) || rent <= 0) {
      toast.error('Monthly rent must be greater than 0');
      return;
    }
    setIsSavingUnit(true);
    try {
      await apiClient.post(`/properties/${unitPropertyId}/units`, {
        unit_number: unitForm.unit_number.trim(),
        monthly_rent: rent,
        bedrooms: unitForm.bedrooms ? parseInt(unitForm.bedrooms) : null,
        bathrooms: unitForm.bathrooms ? parseFloat(unitForm.bathrooms) : null,
      });
      toast.success('Room added');
      setShowUnitModal(false);
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to add room');
    } finally {
      setIsSavingUnit(false);
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-heading-xl font-medium text-white">Properties</h1>
          <p className="text-body-lg text-[#797d86] mt-2">
            Portfolio overview and performance.
          </p>
        </div>
        <Button onClick={() => { setPropertyForm(emptyPropertyForm); setShowPropertyModal(true); }} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Property
        </Button>
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
            <Button onClick={() => { setPropertyForm(emptyPropertyForm); setShowPropertyModal(true); }} className="gap-2 mt-4">
              <Plus className="h-4 w-4" />
              Add Your First Property
            </Button>
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
                  From: <span className="font-mono text-white">{formatCurrency(property.monthly_rent)}</span>
                </div>
              </div>

              <div className="border-t border-[#303236] pt-3 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-[#c9cbcf] flex items-center gap-2">
                    <DoorOpen className="h-4 w-4 text-[#61646b]" />
                    Rooms ({property.units?.length || 0})
                  </p>
                  <button
                    onClick={() => openUnitModal(property.id)}
                    className="text-xs text-[#00e599] hover:underline flex items-center gap-1"
                  >
                    <Plus className="h-3 w-3" /> Add Room
                  </button>
                </div>
                {!property.units?.length ? (
                  <p className="text-xs text-[#61646b]">No rooms yet. Add Room 1, Room 2, etc.</p>
                ) : (
                  <div className="space-y-1.5 max-h-48 overflow-y-auto">
                    {property.units.map((unit) => (
                      <div key={unit.id} className="flex items-center justify-between rounded bg-[#1a1b1e] px-3 py-2 text-sm">
                        <span className="flex items-center gap-2 text-[#c9cbcf]">
                          <Key className="h-3.5 w-3.5 text-[#61646b]" />
                          {unit.unit_number}
                          <span className="font-mono text-white">{formatCurrency(unit.monthly_rent)}</span>
                        </span>
                        <Badge variant={unit.is_occupied ? 'success' : 'secondary'} className="text-xs">
                          {unit.is_occupied ? 'Occupied' : 'Vacant'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Property Modal */}
      <Modal
        isOpen={showPropertyModal}
        onClose={() => setShowPropertyModal(false)}
        title="Add Property"
        size="md"
      >
        <div className="space-y-4">
          <Input
            label="Property Name"
            placeholder="e.g. Tuiya Belong"
            value={propertyForm.name}
            onChange={(e) => setPropertyForm({ ...propertyForm, name: e.target.value })}
          />
          <Input
            label="Street Address"
            placeholder="e.g. Kenyatta Avenue"
            value={propertyForm.address_line1}
            onChange={(e) => setPropertyForm({ ...propertyForm, address_line1: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="City / Town"
              placeholder="e.g. Nairobi"
              value={propertyForm.city}
              onChange={(e) => setPropertyForm({ ...propertyForm, city: e.target.value })}
            />
            <Input
              label="County / State"
              placeholder="e.g. Nairobi"
              value={propertyForm.state}
              onChange={(e) => setPropertyForm({ ...propertyForm, state: e.target.value })}
            />
          </div>
          <Input
            label="Postal Code"
            placeholder="e.g. 00100"
            value={propertyForm.zip_code}
            onChange={(e) => setPropertyForm({ ...propertyForm, zip_code: e.target.value })}
          />
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button variant="outline" onClick={() => setShowPropertyModal(false)}>Cancel</Button>
            <Button onClick={handleCreateProperty} isLoading={isSavingProperty}>Create Property</Button>
          </div>
        </div>
      </Modal>

      {/* Add Room Modal */}
      <Modal
        isOpen={showUnitModal}
        onClose={() => setShowUnitModal(false)}
        title="Add Room"
        size="md"
      >
        <div className="space-y-4">
          <Input
            label="Room Number"
            placeholder="e.g. Room 1"
            value={unitForm.unit_number}
            onChange={(e) => setUnitForm({ ...unitForm, unit_number: e.target.value })}
          />
          <Input
            label="Monthly Rent (KES)"
            type="number"
            placeholder="e.g. 15000"
            value={unitForm.monthly_rent}
            onChange={(e) => setUnitForm({ ...unitForm, monthly_rent: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Bedrooms"
              type="number"
              placeholder="e.g. 1"
              value={unitForm.bedrooms}
              onChange={(e) => setUnitForm({ ...unitForm, bedrooms: e.target.value })}
            />
            <Input
              label="Bathrooms"
              type="number"
              placeholder="e.g. 1"
              value={unitForm.bathrooms}
              onChange={(e) => setUnitForm({ ...unitForm, bathrooms: e.target.value })}
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button variant="outline" onClick={() => setShowUnitModal(false)}>Cancel</Button>
            <Button onClick={handleCreateUnit} isLoading={isSavingUnit}>Add Room</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
