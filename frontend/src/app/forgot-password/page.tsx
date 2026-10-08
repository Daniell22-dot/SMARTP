'use client';

import { useState } from 'react';
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
import { Loader2, Mail, CheckCircle } from 'lucide-react';
import { HumanCheck } from '@/components/HumanCheck';

const forgotSchema = z.object({
  email: z.string().email('Invalid email address'),
});

type ForgotForm = z.infer<typeof forgotSchema>;

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotForm>({
    resolver: zodResolver(forgotSchema),
  });

  const onSubmit = async (data: ForgotForm) => {
    setIsLoading(true);
    try {
      await apiClient.post('/auth/forgot-password', { ...data, turnstile_token: turnstileToken || null });
      setIsSubmitted(true);
      toast.success('If an account exists, a reset link has been sent.');
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to send reset link');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black bg-pattern px-4 py-12">
        <div className="w-full max-w-md text-center">
          <div className="h-14 w-14 rounded-full bg-[#00e599]/10 border border-[#00e599]/20 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-7 w-7 text-[#00e599]" />
          </div>
          <h1 className="text-2xl font-medium text-white mb-2">
            Check your email
          </h1>
          <p className="text-[#94979e] mb-6">
            If an account exists for that email, you'll receive a password reset link shortly.
          </p>
          <Link href="/login">
            <Button className="w-full">Back to Sign In</Button>
          </Link>
        </div>
      </div>
    );
  }

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

        <Card>
          <CardHeader className="text-center">
            <CardTitle>Forgot password?</CardTitle>
            <CardDescription>Enter your email and we'll send you a reset link</CardDescription>
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

              <HumanCheck onToken={setTurnstileToken} />

              <Button type="submit" className="w-full" isLoading={isLoading}>
                {isLoading && <Loader2 className="h-4 w-4 mr-2" />}
                Send Reset Link
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