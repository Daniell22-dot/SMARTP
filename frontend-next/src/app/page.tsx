import Link from 'next/link';
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
  Phone,
  MapPin,
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary-600 flex items-center justify-center">
                <span className="text-white font-bold text-lg">RMS</span>
              </div>
              <span className="font-semibold text-xl text-gray-900 dark:text-white">Rental RMS</span>
            </Link>
            <div className="flex items-center gap-6">
              <div className="hidden md:flex items-center gap-6 text-sm text-gray-600 dark:text-gray-400">
                <a href="#features" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Features</a>
                <a href="#how-it-works" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">How It Works</a>
                <a href="#testimonials" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Testimonials</a>
                <a href="#contact" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Contact</a>
              </div>
              <div className="flex items-center gap-3">
                <Link href="/login">
                  <Button variant="ghost" size="sm">Sign In</Button>
                </Link>
                <Link href="/register">
                  <Button size="sm">Get Started Free</Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <Badge variant="success" className="mb-6 inline-flex items-center gap-2">
              <CheckCircle className="h-3 w-3" />
              New: AI Financial Reports & M-Pesa QR Payments
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white tracking-tight mb-6">
              Manage Your Rental Properties <br />
              <span className="text-primary-600 dark:text-primary-400">Effortlessly</span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
              The complete rental management platform for Kenyan landlords. Track payments, manage maintenance,
              communicate with tenants, and generate financial reports — all in one place.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/register">
                <Button size="lg" className="w-full sm:w-auto gap-2">
                  Start Free Trial
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Sign In to Dashboard
                </Button>
              </Link>
            </div>
            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
              No credit card required · 14-day free trial · Cancel anytime
            </p>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {stats.map((stat) => (
              <Card key={stat.label} className="text-center">
                <CardContent className="py-6">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <stat.icon className="h-8 w-8 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">{stat.value}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 lg:py-28 bg-white dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Everything You Need to Manage Rentals
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Powerful features designed for Kenyan property owners and managers.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <Card key={feature.title} className="h-full hover:shadow-card-hover transition-shadow">
                <CardContent className="p-6">
                  <div className="h-12 w-12 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 lg:py-28 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Get Started in 3 Simple Steps
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Add Your Properties', description: 'Create your property portfolio with units, rent amounts, and tenant details in minutes.' },
              { step: '02', title: 'Invite Tenants', description: 'Tenants register themselves, verify their identity, and get instant access to their portal.' },
              { step: '03', title: 'Manage & Grow', description: 'Collect payments, handle maintenance, generate reports, and scale your rental business.' },
            ].map((item, index) => (
              <Card key={item.step} className="relative">
                <CardContent className="p-6">
                  <div className="text-4xl font-bold text-primary-100 dark:text-primary-900/30 mb-4">{item.step}</div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{item.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 lg:py-28 bg-white dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Trusted by Property Owners Across Kenya
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.name} className="h-full">
                <CardContent className="p-6">
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 mb-6 italic">"{testimonial.content}"</p>
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-700 dark:text-primary-300 font-semibold">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">{testimonial.name}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{testimonial.role}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-28 bg-primary-600 dark:bg-primary-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to Simplify Your Rental Management?
          </h2>
          <p className="text-lg text-primary-100 mb-8 max-w-2xl mx-auto">
            Join hundreds of Kenyan landlords who trust RMS to manage their properties efficiently.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto gap-2">
                Start Your Free Trial
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="w-full sm:w-auto border-white text-white hover:bg-primary-500">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Contact / Footer */}
      <footer id="contact" className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div className="md:col-span-2">
              <Link href="/" className="flex items-center gap-2 mb-4">
                <div className="h-8 w-8 rounded-lg bg-primary-600 flex items-center justify-center">
                  <span className="text-white font-bold text-lg">RMS</span>
                </div>
                <span className="font-semibold text-xl">Rental RMS</span>
              </Link>
              <p className="text-gray-400 max-w-md mb-6">
                The complete rental management platform for Kenyan landlords. Built for the local market with M-Pesa integration,
                KRA compliance, and bilingual support.
              </p>
              <div className="flex gap-6 text-gray-400">
                <a href="https://twitter.com" target="_blank" rel="noopener" className="hover:text-white transition-colors">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"/></svg>
                </a>
                <a href="https://linkedin.com" target="_blank" rel="noopener" className="hover:text-white transition-colors">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
                </a>
                <a href="mailto:hello@rms.co.ke" className="hover:text-white transition-colors">
                  <Mail className="h-6 w-6" />
                </a>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#testimonials" className="hover:text-white transition-colors">Testimonials</a></li>
                <li><a href="/pricing" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="/docs" className="hover:text-white transition-colors">Documentation</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="/about" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="/blog" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="/careers" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="/contact" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-400 text-sm">
              © 2024 Rental RMS. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-sm text-gray-400">
              <a href="/privacy" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="/terms" className="hover:text-white transition-colors">Terms of Service</a>
              <a href="/cookies" className="hover:text-white transition-colors">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}