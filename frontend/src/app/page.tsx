'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { apiClient } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import {
  Building2,
  Users,
  CreditCard,
  Wrench,
  Shield,
  BarChart3,
  ArrowRight,
} from 'lucide-react';

interface PublicStats {
  properties: number;
  tenants: number;
  payments: number;
  revenue: number;
}

const features = [
  { icon: Building2, title: 'Property Management', description: 'Manage properties, units, and tenant assignments from a single dashboard.' },
  { icon: Users, title: 'Tenant Portal', description: 'Self-service portal for tenants to view payments, submit requests, and communicate.' },
  { icon: CreditCard, title: 'Payment Tracking', description: 'Track rent payments, M-Pesa integration, payment history, and automated reminders.' },
  { icon: Wrench, title: 'Maintenance Requests', description: 'Tenants submit requests; landlords track progress and resolve faster.' },
  { icon: Shield, title: 'Secure & Compliant', description: 'Role-based access control and Kenyan data compliance.' },
  { icon: BarChart3, title: 'Financial Reports', description: 'Revenue tracking, KRA tax calculations, utility profit analysis, and AI insights.' },
];

function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#00e599]">
        <span className="text-sm font-bold text-black">t</span>
      </div>
      <span className="text-lg font-semibold tracking-tight text-white">Tuiyabelong</span>
    </div>
  );
}

export default function LandingPage() {
  const [stats, setStats] = useState<PublicStats | null>(null);

  useEffect(() => {
    let active = true;
    apiClient
      .get<PublicStats>('/admin/public-stats')
      .then((data) => {
        if (active) setStats(data);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-[#18191b]">
        <div className="container">
          <div className="flex h-16 items-center justify-between">
            <Logo />
            <div className="flex items-center gap-3">
              <Link href="/login">
                <Button variant="ghost" size="md">
                  Sign in
                </Button>
              </Link>
              <Link href="/register">
                <Button variant="primary" size="md">
                  Sign up
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-glow-green" />
        <div className="container relative py-20 md:py-28">
          <div className="max-w-3xl">
            <p className="eyebrow">Rental property management · Kenya</p>
            <h1 className="mt-4 text-display-lg text-white md:mt-6">
              Run your rentals from one
              <span className="text-gradient"> terminal.</span>
            </h1>
            <p className="mt-5 max-w-xl text-body-lg text-[#797d86]">
              Properties, tenants, rent collection, maintenance, and KRA-ready
              reports — in a single portal for landlords and tenants.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href="/register">
                <Button variant="gold" size="lg" className="gap-2">
                  Get started
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" size="lg">
                  Sign in
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats — full width */}
      <section className="border-y border-[#303236]">
        <div className="container py-12">
          <div className="grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-4">
            <div className="border-l-2 border-[#00e599] pl-4">
              <p className="font-mono text-4xl text-white md:text-5xl">{stats?.properties ?? 0}</p>
              <p className="mt-2 text-sm text-[#797d86]">Properties managed</p>
            </div>
            <div className="border-l-2 border-[#00e599] pl-4">
              <p className="font-mono text-4xl text-white md:text-5xl">{stats?.tenants ?? 0}</p>
              <p className="mt-2 text-sm text-[#797d86]">Active tenants</p>
            </div>
            <div className="border-l-2 border-[#00e599] pl-4">
              <p className="font-mono text-4xl text-white md:text-5xl">{stats?.payments ?? 0}</p>
              <p className="mt-2 text-sm text-[#797d86]">Payments recorded</p>
            </div>
            <div className="border-l-2 border-[#00e599] pl-4">
              <p className="font-mono text-4xl text-[#00e599] md:text-5xl">
                {formatCurrency(stats?.revenue ?? 0)}
              </p>
              <p className="mt-2 text-sm text-[#797d86]">Revenue collected</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features — full width */}
      <section className="container py-20 md:py-24">
        <div className="max-w-2xl">
          <p className="eyebrow">Everything included</p>
          <h2 className="mt-4 text-heading-xl text-white md:text-display-md">
            Built for how rental businesses actually run.
          </h2>
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div key={feature.title} className="card p-6">
              <feature.icon className="mb-4 h-6 w-6 text-[#00e599]" />
              <h3 className="mb-2 text-lg font-medium text-white">{feature.title}</h3>
              <p className="text-sm text-[#797d86] leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container pb-20">
        <div className="rounded border border-[#303236] bg-[#0c0d0d] p-10 text-center md:p-16">
          <h2 className="text-heading-xl text-white">Ready to get started?</h2>
          <p className="mx-auto mt-3 max-w-md text-[#797d86]">
            Create your account in minutes and start managing properties, rent, and maintenance today.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link href="/register">
              <Button variant="gold" size="lg">
                Create account
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg">
                Sign in
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#18191b]">
        <div className="container py-6">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-sm text-[#61646b]">&copy; 2026 Tuiyabelong</p>
            <div className="flex items-center gap-6 text-sm text-[#797d86]">
              <Link href="/login" className="hover:text-white">Sign in</Link>
              <Link href="/register" className="hover:text-white">Create account</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}