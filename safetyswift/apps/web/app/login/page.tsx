'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import en from '@/locales/en.json';

const loginSchema = z.object({
  email: z.string().email({ message: en.auth.errors.email }),
  password: z.string().min(1, { message: en.auth.errors.password })
});

type LoginValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formError, setFormError] = useState<string | null>(
    searchParams.get('error') ? en.auth.login.invalidCredentials : null
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);

    const result = await signIn('credentials', {
      redirect: false,
      email: values.email,
      password: values.password
    });

    if (!result || result.error) {
      setFormError(en.auth.login.invalidCredentials);
      return;
    }

    router.push('/');
    router.refresh();
  });

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-16">
      <div className="w-full max-w-md space-y-8 rounded-xl border border-slate-200 bg-white p-8 shadow-lg">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold text-slate-900">{en.auth.login.title}</h1>
          <p className="text-sm text-slate-600">{en.auth.login.subtitle}</p>
        </div>
        <form className="space-y-6" onSubmit={onSubmit} noValidate>
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-slate-700">
              {en.auth.shared.emailLabel}
            </label>
            <Input id="email" type="email" autoComplete="email" {...register('email')} />
            {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
          </div>
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium text-slate-700">
              {en.auth.shared.passwordLabel}
            </label>
            <Input id="password" type="password" autoComplete="current-password" {...register('password')} />
            {errors.password && <p className="text-sm text-red-600">{errors.password.message}</p>}
          </div>
          {formError && <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{formError}</div>}
          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? en.auth.shared.submitting : en.auth.login.submit}
          </Button>
        </form>
        <p className="text-center text-sm text-slate-600">
          {en.auth.login.noAccount}{' '}
          <Link href="/register" className="font-medium text-blue-600 hover:text-blue-700">
            {en.auth.login.registerCta}
          </Link>
        </p>
      </div>
    </div>
  );
}
