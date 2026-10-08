'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { apiClient } from '@/lib/api';
import { toast } from 'react-hot-toast';
import { Loader2, Eye, EyeOff, KeyRound, Mail } from 'lucide-react';
import { HumanCheck } from '@/components/HumanCheck';

const recoverSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirm_password: z.string(),
}).refine((data) => data.password === data.confirm_password, {
  message: 'Passwords do not match',
  path: ['confirm_password'],
});

type RecoverForm = z.infer<typeof recoverSchema>;

export default function RecoverAccountPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [turnstileToken, setTurnstileToken] = useState('');

  const calculateStrength = (pwd: string) => {
    let strength = 0;
    if (pwd.length >= 8) strength += 1;
    if (/[A-Z]/.test(pwd)) strength += 1;
    if (/[a-z]/.test(pwd)) strength += 1;
    if (/[0-9]/.test(pwd)) strength += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) strength += 1;
    return strength;
  };

  const strengthLabels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
  const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-lime-500', 'bg-green-500'];

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RecoverForm>({
    resolver: zodResolver(recoverSchema),
    mode: 'onChange',
  });

  const password = watch('password', '');

  useEffect(() => {
    setPasswordStrength(calculateStrength(password));
  }, [password]);

  const onSubmit = async (data: RecoverForm) => {
    setIsLoading(true);
    try {
      await apiClient.post('/auth/reset-password', {
        email: data.email,
        new_password: data.password,
        turnstile_token: turnstileToken || null,
      });
      toast.success('Password has been reset. You can now sign in.');
      router.push('/login');
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to reset password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black bg-pattern px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#00e599]">
              <span className="text-base font-bold text-black">t</span>
            </div>
            <span className="text-xl font-semibold tracking-tight text-white">Tuiyabelong</span>
          </Link>
        </div>

        <div className="rounded-lg border border-[#00e599]/20 bg-[#00e599]/5 p-3 mb-4 flex items-start gap-2">
          <KeyRound className="h-4 w-4 text-[#00e599] mt-0.5 shrink-0" />
          <p className="text-sm text-[#9ab8ad]">
            Recover your account by setting a new password directly. No email or verification code needed.
          </p>
        </div>

        <Card>
          <CardHeader className="text-center">
            <CardTitle>Recover your account</CardTitle>
            <CardDescription>Enter your email and choose a new password</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="relative">
                <Input
                  label="Email"
                  type="email"
                  placeholder="you@example.com"
                  error={errors.email?.message}
                  {...register('email')}
                  autoComplete="email"
                  disabled={isLoading}
                />
                <Mail className="absolute right-3 top-[38px] h-5 w-5 text-[#61646b]" />
              </div>

              <div className="relative">
                <Input
                  label="New Password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  error={errors.password?.message}
                  {...register('password')}
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

              {password && (
                <div className="space-y-1">
                  <div className="h-1.5 bg-[#18191b] rounded-full overflow-hidden">
                    <div
                      className="h-full transition-all duration-300"
                      style={{ width: `${(passwordStrength / 5) * 100}%` }}
                    >
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${strengthColors[passwordStrength - 1] || 'bg-[#18191b]'}`}
                        style={{ width: '100%' }}
                      />
                    </div>
                  </div>
                  <p className="text-xs text-[#61646b]">
                    Password strength: {strengthLabels[passwordStrength - 1] || 'Very Weak'}
                  </p>
                </div>
              )}

              <div className="relative">
                <Input
                  label="Confirm Password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  error={errors.confirm_password?.message}
                  {...register('confirm_password')}
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

              <HumanCheck onToken={setTurnstileToken} />

              <Button type="submit" className="w-full" isLoading={isLoading}>
                {isLoading && <Loader2 className="h-4 w-4 mr-2" />}
                Set New Password
              </Button>
            </form>

            <div className="text-center">
              <Link href="/login" className="text-[#34d59a] hover:underline">
                Back to Sign In
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}