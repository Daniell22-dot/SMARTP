'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Landmark, Pencil, Save, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { formatCurrency } from '@/lib/utils';

interface TaxSettings {
  kra_tax_rate: number;
  county_rates: number;
  tax_override: number;
  notes: string;
}

const emptySettings: TaxSettings = { kra_tax_rate: 0, county_rates: 0, tax_override: 0, notes: '' };

export function TaxSettingsCard({ onSaved }: { onSaved?: () => void }) {
  const [settings, setSettings] = useState<TaxSettings | null>(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<TaxSettings>(emptySettings);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    apiClient
      .get<TaxSettings>('/admin/tax-settings')
      .then((data) => {
        setSettings(data);
        setForm({
          kra_tax_rate: data.kra_tax_rate ?? 0,
          county_rates: data.county_rates ?? 0,
          tax_override: data.tax_override ?? 0,
          notes: data.notes ?? '',
        });
      })
      .catch(() => setSettings(emptySettings));
  }, []);

  const startEditing = () => {
    setForm(settings ?? emptySettings);
    setEditing(true);
  };

  const save = async () => {
    setIsSaving(true);
    try {
      const saved = await apiClient.put<TaxSettings>('/admin/tax-settings', form);
      setSettings(saved);
      setEditing(false);
      toast.success('Tax details saved');
      onSaved?.();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to save tax details');
    } finally {
      setIsSaving(false);
    }
  };

  const num = (v: string) => {
    const n = parseFloat(v);
    return isNaN(n) ? 0 : n;
  };

  return (
    <Card>
      <CardContent>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Landmark className="h-5 w-5 text-amber-400" />
            <h2 className="font-medium text-white">Tax Settings</h2>
          </div>
          {!editing && (
            <Button variant="ghost" size="sm" className="gap-1.5 text-[#00e599]" onClick={startEditing}>
              <Pencil className="h-4 w-4" />
              Edit
            </Button>
          )}
        </div>

        <p className="text-xs text-[#797d86] mb-4">
          Enter your own KRA tax details. These are used to estimate tax due and net profit.
        </p>

        {editing ? (
          <div className="space-y-3 text-sm">
            <Input
              label="KRA tax rate (%)"
              type="number"
              min="0"
              step="0.01"
              placeholder="e.g. 25"
              value={form.kra_tax_rate === 0 ? '' : String(form.kra_tax_rate)}
              onChange={(e) => setForm({ ...form, kra_tax_rate: num(e.target.value) })}
            />
            <Input
              label="County land rates (KES / year)"
              type="number"
              min="0"
              placeholder="e.g. 25000"
              value={form.county_rates === 0 ? '' : String(form.county_rates)}
              onChange={(e) => setForm({ ...form, county_rates: num(e.target.value) })}
            />
            <Input
              label="Tax amount override (KES) — if you know the exact figure"
              type="number"
              min="0"
              placeholder="Optional"
              value={form.tax_override === 0 ? '' : String(form.tax_override)}
              onChange={(e) => setForm({ ...form, tax_override: num(e.target.value) })}
            />
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[#94979e]">Notes (shown on reports)</label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="e.g. 25% corporate tax + Nairobi county land rates"
                rows={2}
                className="w-full rounded-lg border border-[#303236] bg-[#0c0d0d] px-3 py-2 text-sm text-white placeholder:text-[#61646b] focus:border-[#00e599] focus:outline-none"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setEditing(false)}>
                <X className="h-4 w-4" />
                Cancel
              </Button>
              <Button size="sm" className="gap-1.5" onClick={save} isLoading={isSaving}>
                <Save className="h-4 w-4" />
                Save
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3 text-sm">
            <div className="flex justify-between border-b border-[#18191b] pb-2">
              <span className="text-[#797d86]">KRA rate</span>
              <span className="font-mono text-white">{settings?.kra_tax_rate ?? 0}%</span>
            </div>
            <div className="flex justify-between border-b border-[#18191b] pb-2">
              <span className="text-[#797d86]">County rates</span>
              <span className="font-mono text-white">{formatCurrency(settings?.county_rates ?? 0)}</span>
            </div>
            <div className="flex justify-between border-b border-[#18191b] pb-2">
              <span className="text-[#797d86]">Override</span>
              <span className="font-mono text-white">{formatCurrency(settings?.tax_override ?? 0)}</span>
            </div>
            {settings?.notes && <p className="text-xs text-[#797d86]">{settings.notes}</p>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}