'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'react-hot-toast';
import { Eye, EyeOff, Loader2, Building2, Users, CreditCard, Wrench, Shield, BarChart3 } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

const registerSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirm_password: z.string(),
  terms_accepted: z.boolean().refine((val) => val === true, 'You must accept the terms'),
}).refine((data) => data.password === data.confirm_password, {
  message: 'Passwords do not match',
  path: ['confirm_password'],
});

type LoginForm = z.infer<typeof loginSchema>;
type RegisterForm = z.infer<typeof registerSchema>;

const features = [
  { icon: Building2, title: 'Property Management', description: 'Manage properties, units, and tenant assignments from a single dashboard.' },
  { icon: Users, title: 'Tenant Portal', description: 'Self-service portal for tenants to view payments, submit requests, and communicate.' },
  { icon: CreditCard, title: 'Payment Tracking', description: 'Track rent payments, M-Pesa integration, payment history, and automated reminders.' },
  { icon: Wrench, title: 'Maintenance Requests', description: 'Tenants submit requests with photos; landlords track progress and assign vendors.' },
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
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { login, register: registerUser } = useAuth();

  const loginForm = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const registerForm = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    mode: 'onChange',
  });

  const onLogin = async (data: LoginForm) => {
    setIsLoading(true);
    try {
      await login(data.email, data.password);
      toast.success('Welcome back!');
      router.push('/dashboard');
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const onRegister = async (data: RegisterForm) => {
    setIsLoading(true);
    try {
      await registerUser({
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        phone: data.phone,
        password: data.password,
        terms_accepted: data.terms_accepted,
      });
      toast.success('Account created successfully!');
      router.push('/dashboard');
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-[#18191b]">
        <div className="container">
          <div className="flex h-16 items-center justify-between">
            <Logo />
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="md"
                onClick={() => setMode('login')}
                className={mode === 'login' ? 'text-white' : 'text-[#94979e]'}
              >
                Sign in
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={() => setMode('register')}
              >
                Sign up
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="container flex min-h-[calc(100vh-4rem)] items-center justify-center py-12">
        <div className="w-full max-w-md">
          {/* Auth Card */}
          <div className="rounded border border-[#303236] bg-[#0c0d0d] p-8">
            <div className="mb-8 text-center">
              <h1 className="text-heading-xl font-medium text-white">
                {mode === 'login' ? 'Welcome back' : 'Create your account'}
              </h1>
              <p className="mt-2 text-[#94979e]">
                {mode === 'login'
                  ? 'Sign in to your account'
                  : 'Start managing your properties'}
              </p>
            </div>

            {mode === 'login' ? (
              <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
                <Input
                  label="Email"
                  type="email"
                  placeholder="you@example.com"
                  error={loginForm.formState.errors.email?.message}
                  {...loginForm.register('email')}
                  autoComplete="email"
                  disabled={isLoading}
                />
                <div className="relative">
                  <Input
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    error={loginForm.formState.errors.password?.message}
                    {...loginForm.register('password')}
                    autoComplete="current-password"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-[38px] text-[#61646b] hover:text-[#94979e]"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                <Button type="submit" className="w-full" isLoading={isLoading}>
                  {isLoading && <Loader2 className="h-4 w-4 mr-2" />}
                  Sign in
                </Button>
                <div className="text-center">
                  <Link href="/forgot-password" className="text-sm text-[#34d59a] hover:underline">
                    Forgot password?
                  </Link>
                </div>
              </form>
            ) : (
              <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="First Name"
                    placeholder="John"
                    error={registerForm.formState.errors.first_name?.message}
                    {...registerForm.register('first_name')}
                    disabled={isLoading}
                  />
                  <Input
                    label="Last Name"
                    placeholder="Doe"
                    error={registerForm.formState.errors.last_name?.message}
                    {...registerForm.register('last_name')}
                    disabled={isLoading}
                  />
                </div>
                <Input
                  label="Email"
                  type="email"
                  placeholder="john@example.com"
                  error={registerForm.formState.errors.email?.message}
                  {...registerForm.register('email')}
                  autoComplete="email"
                  disabled={isLoading}
                />
                <Input
                  label="Phone Number"
                  type="tel"
                  placeholder="0712345678"
                  error={registerForm.formState.errors.phone?.message}
                  {...registerForm.register('phone')}
                  autoComplete="tel"
                  disabled={isLoading}
                />
                <div className="relative">
                  <Input
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    error={registerForm.formState.errors.password?.message}
                    {...registerForm.register('password')}
                    autoComplete="new-password"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-[38px] text-[#61646b] hover:text-[#94979e]"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                <div className="relative">
                  <Input
                    label="Confirm Password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    error={registerForm.formState.errors.confirm_password?.message}
                    {...registerForm.register('confirm_password')}
                    autoComplete="new-password"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-[38px] text-[#61646b] hover:text-[#94979e]"
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                <div className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    id="terms"
                    {...registerForm.register('terms_accepted')}
                    className="mt-1 h-4 w-4 rounded border-[#303236] accent-[#00e599]"
                    disabled={isLoading}
                  />
                  <label htmlFor="terms" className="text-sm text-[#94979e]">
                    I agree to the Terms of Service and Privacy Policy
                  </label>
                </div>
                {registerForm.formState.errors.terms_accepted && (
                  <p className="text-sm text-[#ff3621]">{registerForm.formState.errors.terms_accepted.message}</p>
                )}
                <Button type="submit" className="w-full" isLoading={isLoading}>
                  {isLoading && <Loader2 className="h-4 w-4 mr-2" />}
                  Create account
                </Button>
              </form>
            )}

            <div className="mt-6 text-center text-sm text-[#94979e]">
              {mode === 'login' ? (
                <>
                  Don&apos;t have an account?{' '}
                  <button onClick={() => setMode('register')} className="text-[#34d59a] hover:underline font-medium">
                    Sign up
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{' '}
                  <button onClick={() => setMode('login')} className="text-[#34d59a] hover:underline font-medium">
                    Sign in
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Features */}
          <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.title} className="rounded border border-[#18191b] bg-[#0c0d0d] p-4">
                <feature.icon className="mb-3 h-5 w-5 text-[#00e599]" />
                <h3 className="mb-1 text-sm font-medium text-white">{feature.title}</h3>
                <p className="text-xs text-[#797d86] leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#18191b]">
        <div className="container py-6">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-sm text-[#61646b]">
              &copy; 2026 Tuiyabelong
            </p>
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