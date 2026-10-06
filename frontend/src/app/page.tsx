'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import {
  Building2,
  Users,
  CreditCard,
  Wrench,
  Shield,
  BarChart3,
  ArrowRight,
  CheckCircle,
  Star,
  Mail,
  Menu,
  X,
} from 'lucide-react';

const features = [
  {
    icon: Building2,
    title: 'Property Management',
    description: 'Manage multiple properties, units, and tenant assignments from a single dashboard.',
  },
  {
    icon: Users,
    title: 'Tenant Portal',
    description: 'Self-service portal for tenants to view payments, submit maintenance requests, and communicate.',
  },
  {
    icon: CreditCard,
    title: 'Payment Tracking',
    description: 'Track rent payments, M-Pesa integration, payment history, and automated reminders.',
  },
  {
    icon: Wrench,
    title: 'Maintenance Requests',
    description: 'Tenants submit requests with photos; landlords track progress and assign vendors.',
  },
  {
    icon: Shield,
    title: 'Secure & Compliant',
    description: 'Bank-grade encryption, role-based access control, and Kenyan data compliance.',
  },
  {
    icon: BarChart3,
    title: 'Financial Reports',
    description: 'Real-time revenue tracking, KRA tax calculations, utility profit analysis, and AI insights.',
  },
];

const stats = [
  { label: 'Properties Managed', value: '50+' },
  { label: 'Active Tenants', value: '200+' },
  { label: 'Monthly Transactions', value: '1,000+' },
  { label: 'Maintenance Resolved', value: '98%' },
];

const testimonials = [
  {
    name: 'James Mwangi',
    role: 'Property Owner, Nairobi',
    content: 'RMS transformed how I manage my 12 rental properties. The payment tracking and M-Pesa integration save me hours every month.',
    avatar: 'JM',
  },
  {
    name: 'Sarah Otieno',
    role: 'Tenant, Westlands',
    content: 'Finally a system where I can pay rent, report issues, and get receipts all from my phone. No more chasing the caretaker!',
    avatar: 'SO',
  },
  {
    name: 'Peter Kimani',
    role: 'Property Manager, Kilimani',
    content: 'The maintenance tracking is a game changer. Tenants submit requests with photos, I assign vendors, and everyone stays updated.',
    avatar: 'PK',
  },
];

const navLinks = [
  { label: 'Features', href: '#features' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Testimonials', href: '#testimonials' },
  { label: 'Contact', href: '#contact' },
];

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5">
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#00e599]">
        <span className="text-sm font-bold text-black">r</span>
      </div>
      <span className="text-lg font-semibold tracking-tight text-white">rms</span>
    </Link>
  );
}

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Announcement bar */}
      <div className="border-b border-[#18191b] bg-black">
        <div className="container">
          <p className="py-2.5 text-center font-mono text-caps uppercase tracking-widest text-[#797d86]">
            <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-[#00e599] align-middle" />
            Rental management for Kenyan landlords
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="fixed top-10 left-0 right-0 z-50 border-b border-[#18191b] bg-black/80 backdrop-blur-md">
        <div className="container">
          <div className="flex h-16 items-center justify-between">
            <Logo />
            <div className="hidden items-center gap-8 md:flex">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-sm text-[#94979e] transition-colors hover:text-white"
                >
                  {link.label}
                </a>
              ))}
            </div>
            <div className="hidden items-center gap-3 md:flex">
              <Link href="/login">
                <Button variant="ghost" size="md">
                  Sign in
                </Button>
              </Link>
              <Link href="/register">
                <Button variant="primary" size="md">
                  Get started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
            <button
              className="md:hidden text-white"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
        {mobileMenuOpen && (
          <div className="border-t border-[#18191b] bg-black md:hidden">
            <div className="container py-4 space-y-3">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="block text-sm text-[#94979e] hover:text-white"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </a>
              ))}
              <div className="flex gap-3 pt-2">
                <Link href="/login" className="flex-1">
                  <Button variant="secondary" size="md" className="w-full">
                    Sign in
                  </Button>
                </Link>
                <Link href="/register" className="flex-1">
                  <Button variant="primary" size="md" className="w-full">
                    Get started
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden pt-40 pb-20 md:pt-52 md:pb-28">
        <div className="absolute inset-0 bg-glow-green" />
        <div className="absolute inset-0 bg-dot-grid [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]" />
        <div className="container relative">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-8">
              <span className="inline-flex items-center gap-2 rounded-full border border-[#00e599]/20 bg-[#00e599]/5 px-3 py-1 font-mono text-caps uppercase tracking-widest text-[#00e599]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#00e599]" />
                Built for Kenya
              </span>
            </div>
            <h1 className="text-display-lg md:text-display-xl font-normal tracking-tight leading-[1.05] mb-8">
              Rental management
              <br />
              <span className="text-gradient">built for Kenya.</span>
            </h1>
            <p className="mx-auto mb-10 max-w-2xl text-body-lg text-[#94979e] leading-relaxed">
              The complete rental management platform for Kenyan landlords. Track payments,
              manage maintenance, communicate with tenants, and generate financial reports —
              all in one place.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/register">
                <Button variant="primary" size="lg" className="gap-2 px-8 py-3">
                  Start free trial
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="secondary" size="lg" className="px-8 py-3">
                  Sign in to dashboard
                </Button>
              </Link>
            </div>
            <p className="mt-6 font-mono text-caps uppercase tracking-widest text-[#61646b]">
              No credit card required · 14-day free trial · Cancel anytime
            </p>
          </div>

          {/* Terminal / code panel */}
          <div className="mx-auto mt-20 max-w-3xl">
            <div className="code-panel overflow-hidden">
              <div className="flex items-center gap-2 border-b border-[#18191b] px-4 py-3">
                <span className="h-2.5 w-2.5 rounded-full bg-[#ff3621]/60" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-500/60" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#00e599]/60" />
                <span className="ml-3 font-mono text-xs text-[#61646b]">rms-cli — zsh</span>
              </div>
              <div className="p-6 font-mono text-sm leading-7">
                <p>
                  <span className="text-[#00e599]">$</span>{' '}
                  <span className="text-[#c9cbcf]">rms tenant add --name &quot;Daniel Manyasa&quot; --unit B-3</span>
                </p>
                <p className="text-[#00e599]">→ tenant assigned · unit B-3 linked ✓</p>
                <p className="mt-3">
                  <span className="text-[#00e599]">$</span>{' '}
                  <span className="text-[#c9cbcf]">rms rent collect --unit B-3 --amount 18,000 --via mpesa</span>
                </p>
                <p className="text-[#00e599]">→ payment recorded · KRA receipt generated ✓</p>
                <p className="mt-3">
                  <span className="text-[#00e599]">$</span>{' '}
                  <span className="text-[#c9cbcf]">rms report --month jan --owner landlord-1</span>
                </p>
                <p className="text-[#00e599]">→ 24 payments · KES 432,000 collected · occupancy 96%</p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="mx-auto mt-20 grid max-w-4xl grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-4xl font-normal tracking-tight text-[#00e599] md:text-5xl">
                  {stat.value}
                </div>
                <div className="mt-2 font-mono text-caps uppercase tracking-widest text-[#797d86]">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="section border-t border-[#18191b]">
        <div className="container">
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <p className="eyebrow mb-4">Features</p>
            <h2 className="text-display-md font-normal tracking-tight text-white">
              Everything you need to manage rentals
            </h2>
            <p className="mt-4 text-body-lg text-[#94979e]">
              Powerful features designed for Kenyan property owners and managers.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <Card key={feature.title} className="card-hover p-6">
                <div className="mb-6 flex h-10 w-10 items-center justify-center rounded border border-[#00e599]/20 bg-[#00e599]/5">
                  <feature.icon className="h-5 w-5 text-[#00e599]" />
                </div>
                <h3 className="mb-3 text-heading-lg font-medium text-white">{feature.title}</h3>
                <p className="text-[#94979e] leading-relaxed">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="section border-t border-[#18191b]">
        <div className="container">
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <p className="eyebrow mb-4">How it works</p>
            <h2 className="text-display-md font-normal tracking-tight text-white">
              Get started in 3 simple steps
            </h2>
          </div>

          <div className="grid gap-8 md:grid-cols-3 md:gap-12">
            {[
              { step: '01', title: 'Add your properties', description: 'Create your property portfolio with units, rent amounts, and tenant details in minutes.', icon: Building2 },
              { step: '02', title: 'Invite tenants', description: 'Tenants register themselves, verify their identity, and get instant access to their portal.', icon: Users },
              { step: '03', title: 'Manage & grow', description: 'Collect payments, handle maintenance, generate reports, and scale your rental business.', icon: BarChart3 },
            ].map((item) => (
              <div key={item.step} className="relative">
                <span className="font-mono text-sm text-[#00e599]">{item.step}</span>
                <div className="mt-4 mb-6 flex h-10 w-10 items-center justify-center rounded border border-[#00e599]/20 bg-[#00e599]/5">
                  <item.icon className="h-5 w-5 text-[#00e599]" />
                </div>
                <h3 className="mb-3 text-heading-lg font-medium text-white">{item.title}</h3>
                <p className="text-[#94979e] leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="section border-t border-[#18191b]">
        <div className="container">
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <p className="eyebrow mb-4">Testimonials</p>
            <h2 className="text-display-md font-normal tracking-tight text-white">
              Trusted by property owners across Kenya
            </h2>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.name} className="card-hover p-6">
                <div className="mb-4 flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-[#00e599] text-[#00e599]" />
                  ))}
                </div>
                <p className="mb-6 text-[#c9cbcf] italic leading-relaxed">&quot;{testimonial.content}&quot;</p>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#18191b] text-sm font-medium text-[#c9cbcf]">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-medium text-white">{testimonial.name}</div>
                    <div className="text-sm text-[#797d86]">{testimonial.role}</div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section border-t border-[#18191b]">
        <div className="container text-center">
          <div className="absolute inset-0 bg-glow-green" />
          <h2 className="text-display-md md:text-display-lg font-normal tracking-tight text-white">
            Ready to simplify your rental management?
          </h2>
          <p className="mx-auto mt-4 mb-10 max-w-2xl text-body-lg text-[#94979e]">
            Join hundreds of Kenyan landlords who trust RMS to manage their properties efficiently.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/register">
              <Button variant="primary" size="lg" className="gap-2 px-8 py-3">
                Start your free trial
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="secondary" size="lg" className="px-8 py-3">
                Sign in
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="border-t border-[#18191b] bg-black">
        <div className="container py-16">
          <div className="mb-12 grid gap-12 md:grid-cols-4">
            <div className="md:col-span-2">
              <div className="mb-6 flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#00e599]">
                  <span className="text-sm font-bold text-black">r</span>
                </div>
                <span className="text-lg font-semibold tracking-tight text-white">rms</span>
              </div>
              <p className="mb-8 max-w-md text-[#797d86] leading-relaxed">
                The complete rental management platform for Kenyan landlords. Built for the local
                market with M-Pesa integration, KRA compliance, and bilingual support.
              </p>
              <div className="flex gap-6 text-[#797d86]">
                <a href="https://twitter.com" target="_blank" rel="noopener" className="transition-colors hover:text-white">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"/></svg>
                </a>
                <a href="https://linkedin.com" target="_blank" rel="noopener" className="transition-colors hover:text-white">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
                </a>
                <a href="mailto:hello@rms.co.ke" className="transition-colors hover:text-white">
                  <Mail className="h-5 w-5" />
                </a>
              </div>
            </div>
            <div>
              <h4 className="mb-6 font-mono text-caps uppercase tracking-widest text-[#797d86]">Product</h4>
              <ul className="space-y-3 text-[#94979e]">
                <li><a href="#features" className="transition-colors hover:text-white">Features</a></li>
                <li><a href="#testimonials" className="transition-colors hover:text-white">Testimonials</a></li>
                <li><a href="/pricing" className="transition-colors hover:text-white">Pricing</a></li>
                <li><a href="/docs" className="transition-colors hover:text-white">Documentation</a></li>
              </ul>
            </div>
            <div>
              <h4 className="mb-6 font-mono text-caps uppercase tracking-widest text-[#797d86]">Company</h4>
              <ul className="space-y-3 text-[#94979e]">
                <li><a href="/about" className="transition-colors hover:text-white">About Us</a></li>
                <li><a href="/blog" className="transition-colors hover:text-white">Blog</a></li>
                <li><a href="/careers" className="transition-colors hover:text-white">Careers</a></li>
                <li><a href="/contact" className="transition-colors hover:text-white">Contact</a></li>
              </ul>
            </div>
          </div>
          <div className="flex flex-col items-center justify-between gap-4 border-t border-[#18191b] pt-8 md:flex-row">
            <p className="font-mono text-caps uppercase tracking-widest text-[#61646b]">
              © 2026 Rental Management System
            </p>
            <div className="flex items-center gap-6 text-sm text-[#797d86]">
              <a href="/privacy" className="transition-colors hover:text-white">Privacy Policy</a>
              <a href="/terms" className="transition-colors hover:text-white">Terms of Service</a>
              <a href="/cookies" className="transition-colors hover:text-white">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}