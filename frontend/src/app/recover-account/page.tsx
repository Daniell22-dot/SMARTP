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
import { Loader2, Eye, EyeOff, KeyRound, Mail, Phone, ShieldCheck } from 'lucide-react';
import { HumanCheck } from '@/components/HumanCheck';

const identitySchema = z.object({
  email: z.string().email('Invalid email address'),
  phone: z.string().min(9, 'Enter the phone number on your account'),
});

const setSchema = z.object({
  recovery_pin: z.string().length(6, 'Enter the 6-digit PIN'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirm_password: z.string(),
}).refine((data) => data.password === data.confirm_password, {
  message: 'Passwords do not match',
  path: ['confirm_password'],
});

type IdentityForm = z.infer<typeof identitySchema>;
type SetForm = z.infer<typeof setSchema>;

export default function RecoverAccountPage() {
  const router = useRouter();
  const [step, setStep] = useState<'identity' | 'set'>('identity');
  const [email, setEmail] = useState('');
  const [issuedPin, setIssuedPin] = useState('');
  const [pinExpires, setPinExpires] = useState(15);
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

  const identity = useForm<IdentityForm>({
    resolver: zodResolver(identitySchema),
    defaultValues: { email: '', phone: '' },
  });

  const setForm = useForm<SetForm>({
    resolver: zodResolver(setSchema),
    mode: 'onChange',
  });

  const password = setForm.watch('password', '');

  useEffect(() => {
    setPasswordStrength(calculateStrength(password));
  }, [password]);

  const onIdentitySubmit = async (data: IdentityForm) => {
    setIsLoading(true);
    try {
      const res = await apiClient.post<{ pin: string; expires_minutes: number; message: string }>(
        '/auth/identity-check',
        { email: data.email, phone: data.phone, turnstile_token: turnstileToken || null }
      );
      setEmail(data.email);
      setIssuedPin(res.pin);
      setPinExpires(res.expires_minutes);
      toast.success(res.message);
      setStep('set');
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'We could not verify your identity. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const onSetSubmit = async (data: SetForm) => {
    setIsLoading(true);
    try {
      await apiClient.post('/auth/reset-password', {
        email,
        new_password: data.password,
        recovery_pin: data.recovery_pin,
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
            Recover your account securely. No email or SMS — verify with your account email and phone, then use the
            PIN shown on screen.
          </p>
        </div>

        <Card>
          <CardHeader className="text-center">
            <CardTitle>{step === 'identity' ? 'Recover your account' : 'Set a new password'}</CardTitle>
            <CardDescription>
              {step === 'identity'
                ? 'Enter the email and phone number on your account'
                : `Recovering ${email}`}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {step === 'identity' && (
              <form onSubmit={identity.handleSubmit(onIdentitySubmit)} className="space-y-4">
                <div className="relative">
                  <Input
                    label="Email"
                    type="email"
                    placeholder="you@example.com"
                    error={identity.formState.errors.email?.message}
                    {...identity.register('email')}
                    autoComplete="email"
                    disabled={isLoading}
                  />
                  <Mail className="absolute right-3 top-[38px] h-5 w-5 text-[#61646b]" />
                </div>

                <div className="relative">
                  <Input
                    label="Phone Number"
                    type="tel"
                    placeholder="0712345678"
                    error={identity.formState.errors.phone?.message}
                    {...identity.register('phone')}
                    autoComplete="tel"
                    disabled={isLoading}
                  />
                  <Phone className="absolute right-3 top-[38px] h-5 w-5 text-[#61646b]" />
                </div>

                <HumanCheck onToken={setTurnstileToken} />

                <Button type="submit" className="w-full" isLoading={isLoading}>
                  {isLoading && <Loader2 className="h-4 w-4 mr-2" />}
                  Verify &amp; Get PIN
                </Button>
              </form>
            )}

            {step === 'set' && issuedPin && (
              <>
                <div className="rounded-lg border border-dashed border-[#00e599]/40 bg-[#00e599]/10 p-4 text-center">
                  <p className="text-xs uppercase tracking-wide text-[#9ab8ad] mb-1">Your recovery PIN</p>
                  <p className="text-3xl font-bold tracking-[0.35em] text-white">{issuedPin}</p>
                  <p className="text-xs text-[#61646b] mt-2">
                    Valid for {pinExpires} minutes · single use · don't share it
                  </p>
                </div>

                <form onSubmit={setForm.handleSubmit(onSetSubmit)} className="space-y-4">
                  <div className="relative">
                    <Input
                      label="Recovery PIN"
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      placeholder="Enter the 6-digit PIN above"
                      error={setForm.formState.errors.recovery_pin?.message}
                      {...setForm.register('recovery_pin')}
                      disabled={isLoading}
                    />
                    <ShieldCheck className="absolute right-3 top-[38px] h-5 w-5 text-[#00e599]" />
                  </div>

                  <div className="relative">
                    <Input
                      label="New Password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      error={setForm.formState.errors.password?.message}
                      {...setForm.register('password')}
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
                      error={setForm.formState.errors.confirm_password?.message}
                      {...setForm.register('confirm_password')}
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

                  <Button type="submit" className="w-full" isLoading={isLoading}>
                    {isLoading && <Loader2 className="h-4 w-4 mr-2" />}
                    Set New Password
                  </Button>
                </form>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setStep('identity')}
                    className="text-sm text-[#61646b] hover:text-[#94979e]"
                  >
                    Wrong info? Start over
                  </button>
                </div>
              </>
            )}

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