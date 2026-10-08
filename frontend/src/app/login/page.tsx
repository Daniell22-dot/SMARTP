'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'react-hot-toast';
import { Eye, EyeOff, Loader2, ShieldCheck, Building2 } from 'lucide-react';
import { HumanCheck } from '@/components/HumanCheck';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
  remember: z.boolean().optional(),
});

type LoginForm = z.infer<typeof loginSchema>;

const portalSchema = z.object({
  access_key: z.string().min(1, 'Access key is required'),
  password: z.string().min(1, 'Password is required'),
});

type PortalForm = z.infer<typeof portalSchema>;

function homeForRole(role?: string): string {
  if (role === 'admin') return '/admin/dashboard';
  if (role === 'landlord') return '/landlord/dashboard';
  return '/dashboard';
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, portalLogin } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [portalMode, setPortalMode] = useState<'admin' | 'landlord' | null>(null);
  const [turnstileToken, setTurnstileToken] = useState('');

  const expired = searchParams.get('expired');
  const redirect = searchParams.get('redirect');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { remember: true },
  });

  const {
    register: registerPortal,
    handleSubmit: handlePortalSubmit,
    formState: { errors: portalErrors },
  } = useForm<PortalForm>({
    resolver: zodResolver(portalSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    try {
      const signedIn = await login(data.email, data.password, turnstileToken);
      toast.success('Welcome back!');
      router.push(redirect || homeForRole(signedIn?.role));
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const onPortalSubmit = async (data: PortalForm) => {
    if (!portalMode) return;
    setIsLoading(true);
    try {
      await portalLogin(data.access_key, data.password, portalMode, turnstileToken);
      toast.success(`Signed in to ${portalMode} portal`);
      router.push(portalMode === 'admin' ? '/admin/dashboard' : '/landlord/dashboard');
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || 'Portal login failed. Check your access key and password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black bg-pattern px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#00e599]">
              <span className="text-base font-bold text-black">t</span>
            </div>
            <span className="text-xl font-semibold tracking-tight text-white">Tuiyabelong</span>
          </Link>
        </div>

        {/* Card */}
        <Card className="card-hover">
          <CardHeader className="text-center">
            <CardTitle className="text-heading-lg">
              {portalMode ? `${portalMode === 'admin' ? 'Admin' : 'Landlord'} Portal` : 'Welcome back'}
            </CardTitle>
            <CardDescription>
              {portalMode
                ? `${portalMode === 'admin' ? 'Manage the platform, users, and system settings.' : 'Manage your properties, tenants, and finances.'}`
                : 'Sign in to your tenant portal'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {expired && (
              <div className="p-3 rounded border border-amber-500/20 bg-amber-500/5 text-amber-400 text-sm">
                Your session has expired. Please sign in again.
              </div>
            )}

            {portalMode ? (
              <form onSubmit={handlePortalSubmit(onPortalSubmit)} className="space-y-4">
                <Input
                  label="Access Key"
                  type="password"
                  placeholder="Enter your access key"
                  error={portalErrors.access_key?.message}
                  {...registerPortal('access_key')}
                  disabled={isLoading}
                />
                <div className="relative">
                  <Input
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
                    error={portalErrors.password?.message}
                    {...registerPortal('password')}
                    autoComplete="current-password"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-[38px] text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                <HumanCheck onToken={setTurnstileToken} />
                <Button type="submit" className="w-full" isLoading={isLoading}>
                  {isLoading && <Loader2 className="h-4 w-4 mr-2" />}
                  Sign in to {portalMode} portal
                </Button>
                <button
                  type="button"
                  onClick={() => setPortalMode(null)}
                  className="w-full text-center text-sm text-[#94979e] hover:text-white"
                >
                  Back to tenant sign in
                </button>
              </form>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                label="Email"
                type="email"
                placeholder="you@example.com"
                error={errors.email?.message}
                {...register('email')}
                autoComplete="email"
                disabled={isLoading}
              />

              <div className="relative">
                <Input
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
                  error={errors.password?.message}
                  {...register('password')}
                  autoComplete="current-password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-[38px] text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    {...register('remember')}
                    className="h-4 w-4 rounded border-[#303236] accent-[#00e599]"
                  />
                  <span className="text-sm text-[#94979e]">Remember me</span>
                </label>
                <Link
                  href="/forgot-password"
                  className="text-sm text-[#34d59a] hover:underline"
                >
                  Forgot password?
                </Link>
              </div>

              <HumanCheck onToken={setTurnstileToken} />

              <Button type="submit" className="w-full" isLoading={isLoading}>
                {isLoading && <Loader2 className="h-4 w-4 mr-2" />}
                Sign In
              </Button>
              </form>
            )}

            {!portalMode && (
              <>
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-[#18191b]" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-[#0c0d0d] text-[#797d86]">Portal access</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" type="button" className="gap-2" onClick={() => setPortalMode('admin')}>
                    <ShieldCheck className="h-5 w-5 text-[#00e599]" />
                    Admin Login
                  </Button>
                  <Button variant="outline" type="button" className="gap-2" onClick={() => setPortalMode('landlord')}>
                    <Building2 className="h-5 w-5 text-[#00e599]" />
                    Landlord Login
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <p className="mt-6 text-center text-sm text-[#94979e]">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-[#34d59a] hover:underline font-medium">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}