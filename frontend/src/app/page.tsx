'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
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
  Phone,
  MapPin,
  Trophy,
  Zap,
  Target,
  Globe,
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
  { label: 'Properties Managed', value: '50+', icon: Building2 },
  { label: 'Active Tenants', value: '200+', icon: Users },
  { label: 'Monthly Transactions', value: '1,000+', icon: CreditCard },
  { label: 'Maintenance Resolved', value: '98%', icon: Wrench },
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

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="container">
          <div className="flex items-center justify-between h-16 md:h-20">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-spurs-navy flex items-center justify-center">
                <span className="text-white font-bold text-xl">RMS</span>
              </div>
              <span className="font-bold text-xl text-spurs-navy dark:text-white hidden sm:block">Rental Management System</span>
            </Link>
            <div className="flex items-center gap-8">
              <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600 dark:text-gray-400">
                <a href="#features" className="hover:text-spurs-gold transition-colors">Features</a>
                <a href="#how-it-works" className="hover:text-spurs-gold transition-colors">How It Works</a>
                <a href="#testimonials" className="hover:text-spurs-gold transition-colors">Testimonials</a>
                <a href="#contact" className="hover:text-spurs-gold transition-colors">Contact</a>
              </div>
              <div className="flex items-center gap-3">
                <Link href="/login">
                  <Button variant="ghost" size="md" className="text-spurs-navy dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800">
                    Sign In
                  </Button>
                </Link>
                <Link href="/register">
                  <Button className="bg-spurs-gold text-spurs-navy hover:bg-spurs-gold/90" size="md">
                    Get Started Free
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section - Clean, no grid pattern */}
      <section className="pt-32 pb-20 md:pt-40 md:pb-32">
        <div className="container">
          <div className="text-center max-w-4xl mx-auto">
            <Badge className="mb-6 inline-flex items-center gap-2 bg-spurs-gold/10 text-spurs-gold border-spurs-gold/20 px-4 py-2">
              <Trophy className="h-4 w-4" />
              <span className="font-semibold">Built for Kenyan Landlords</span>
            </Badge>
            <h1 className="text-display-lg md:text-display-lg lg:text-display-xl font-bold text-spurs-navy dark:text-white tracking-tight mb-8 leading-tight">
              Manage Your Rental Properties 
              <br />
              <span className="text-gradient">Effortlessly</span>
            </h1>
            <p className="text-body-lg md:text-display-sm text-gray-600 dark:text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed">
              The complete rental management platform for Kenyan landlords. Track payments, manage maintenance,
              communicate with tenants, and generate financial reports — all in one place.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/register">
                <Button size="lg" className="bg-spurs-gold text-spurs-navy hover:bg-spurs-gold/90 gap-2 px-8 py-3">
                  Start Free Trial
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="secondary" size="lg" className="px-8 py-3">
                  Sign In to Dashboard
                </Button>
              </Link>
            </div>
            <p className="mt-6 text-sm text-gray-500 dark:text-gray-400">
              No credit card required · 14-day free trial · Cancel anytime
            </p>
          </div>

          {/* Stats */}
          <div className="mt-16 md:mt-24 grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {stats.map((stat) => (
              <Card key={stat.label} className="text-center card-hover">
                <CardContent className="py-8">
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <stat.icon className="h-10 w-10 text-spurs-navy dark:text-spurs-gold" />
                  </div>
                  <div className="text-4xl md:text-5xl font-bold text-spurs-navy dark:text-white">{stat.value}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="section bg-white dark:bg-gray-900">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-display-md font-bold text-spurs-navy dark:text-white mb-4">
              Everything You Need to Manage Rentals
            </h2>
            <p className="text-body-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Powerful features designed for Kenyan property owners and managers.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {features.map((feature) => (
              <Card key={feature.title} className="h-full card-hover p-6">
                <div className="w-12 h-12 rounded-lg bg-spurs-navy/10 dark:bg-spurs-navy/20 flex items-center justify-center mb-6">
                  <feature.icon className="h-7 w-7 text-spurs-navy dark:text-spurs-gold" />
                </div>
                <h3 className="text-heading-lg font-bold text-spurs-navy dark:text-white mb-3">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="section bg-gray-50 dark:bg-gray-800/50">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-display-md font-bold text-spurs-navy dark:text-white mb-4">
              Get Started in 3 Simple Steps
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 md:gap-12">
            {[
              { step: '01', title: 'Add Your Properties', description: 'Create your property portfolio with units, rent amounts, and tenant details in minutes.', icon: Building2 },
              { step: '02', title: 'Invite Tenants', description: 'Tenants register themselves, verify their identity, and get instant access to their portal.', icon: Users },
              { step: '03', title: 'Manage & Grow', description: 'Collect payments, handle maintenance, generate reports, and scale your rental business.', icon: BarChart3 },
            ].map((item, index) => (
              <Card key={item.step} className="relative p-8 card-hover">
                <div className="absolute -top-3 left-8 w-8 h-8 rounded-full bg-spurs-gold text-spurs-navy flex items-center justify-center font-bold text-lg">
                  {item.step}
                </div>
                <div className="pt-3">
                  <div className="w-12 h-12 rounded-lg bg-spurs-navy/10 dark:bg-spurs-navy/20 flex items-center justify-center mb-6">
                    <item.icon className="h-7 w-7 text-spurs-navy dark:text-spurs-gold" />
                  </div>
                  <h3 className="text-heading-lg font-bold text-spurs-navy dark:text-white mb-3">{item.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{item.description}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="section bg-white dark:bg-gray-900">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-display-md font-bold text-spurs-navy dark:text-white mb-4">
              Trusted by Property Owners Across Kenya
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.name} className="h-full p-6 card-hover">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-spurs-gold text-spurs-gold" />
                  ))}
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-6 italic leading-relaxed">"{testimonial.content}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-spurs-navy/10 dark:bg-spurs-navy/20 flex items-center justify-center text-spurs-navy dark:text-spurs-gold font-bold">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-spurs-navy dark:text-white">{testimonial.name}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{testimonial.role}</div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section bg-spurs-navy dark:bg-spurs-navy">
        <div className="container text-center">
          <h2 className="text-display-md md:text-display-lg font-bold text-white mb-4">
            Ready to Simplify Your Rental Management?
          </h2>
          <p className="text-body-lg md:text-display-sm text-spurs-gold/90 mb-10 max-w-2xl mx-auto">
            Join hundreds of Kenyan landlords who trust RMS to manage their properties efficiently.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register">
              <Button size="lg" variant="secondary" className="px-8 py-3 gap-2">
                Start Your Free Trial
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="ghost" className="px-8 py-3 border-white text-white hover:bg-white/10">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-spurs-navy/95 dark:bg-spurs-navy border-t border-gray-800">
        <div className="container py-16">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="md:col-span-2">
              <Link href="/" className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-spurs-gold flex items-center justify-center">
                  <span className="text-spurs-navy font-bold text-xl">RMS</span>
                </div>
                <span className="font-bold text-xl text-white">Rental Management System</span>
              </Link>
              <p className="text-gray-400 max-w-md mb-8 leading-relaxed">
                The complete rental management platform for Kenyan landlords. Built for the local market with M-Pesa integration,
                KRA compliance, and bilingual support.
              </p>
              <div className="flex gap-6 text-gray-400">
                <a href="https://twitter.com" target="_blank" rel="noopener" className="hover:text-spurs-gold transition-colors">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"/></svg>
                </a>
                <a href="https://linkedin.com" target="_blank" rel="noopener" className="hover:text-spurs-gold transition-colors">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
                </a>
                <a href="mailto:hello@rms.co.ke" className="hover:text-spurs-gold transition-colors">
                  <Mail className="h-6 w-6" />
                </a>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-6">Product</h4>
              <ul className="space-y-3 text-gray-400">
                <li><a href="#features" className="hover:text-spurs-gold transition-colors">Features</a></li>
                <li><a href="#testimonials" className="hover:text-spurs-gold transition-colors">Testimonials</a></li>
                <li><a href="/pricing" className="hover:text-spurs-gold transition-colors">Pricing</a></li>
                <li><a href="/docs" className="hover:text-spurs-gold transition-colors">Documentation</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-6">Company</h4>
              <ul className="space-y-3 text-gray-400">
                <li><a href="/about" className="hover:text-spurs-gold transition-colors">About Us</a></li>
                <li><a href="/blog" className="hover:text-spurs-gold transition-colors">Blog</a></li>
                <li><a href="/careers" className="hover:text-spurs-gold transition-colors">Careers</a></li>
                <li><a href="/contact" className="hover:text-spurs-gold transition-colors">Contact</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-400 text-sm">
              © 2024 Rental Management System. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-sm text-gray-400">
              <a href="/privacy" className="hover:text-spurs-gold transition-colors">Privacy Policy</a>
              <a href="/terms" className="hover:text-spurs-gold transition-colors">Terms of Service</a>
              <a href="/cookies" className="hover:text-spurs-gold transition-colors">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}