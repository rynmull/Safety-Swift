'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { API_BASE_URL } from '@/lib/api-client';
import en from '@/locales/en.json';

const registerSchema = z
  .object({
    email: z.string().email({ message: en.auth.errors.email }),
    password: z.string().min(8, { message: en.auth.errors.passwordLength }),
    name: z
      .string()
      .max(100, { message: en.auth.errors.name })
      .optional(),
    orgName: z.string().min(2, { message: en.auth.errors.orgName }),
    locale: z.enum(['en', 'es'])
  })
  .refine((value) => !value.name || value.name.trim().length > 0, {
    path: ['name'],
    message: en.auth.errors.name
  });

type RegisterValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      password: '',
      name: '',
      orgName: '',
      locale: 'en'
    }
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);

    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: values.email,
        password: values.password,
        name: values.name?.trim() || undefined,
        orgName: values.orgName,
        locale: values.locale
      })
    });

    if (!response.ok) {
      const data = (await response.json().catch(() => null)) as { error?: string } | null;
      setFormError(data?.error ?? en.auth.register.genericError);
      return;
    }

    await signIn('credentials', {
      redirect: false,
      email: values.email,
      password: values.password
    });

    router.push('/');
    router.refresh();
  });

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-16">
      <div className="w-full max-w-md space-y-8 rounded-xl border border-slate-200 bg-white p-8 shadow-lg">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold text-slate-900">{en.auth.register.title}</h1>
          <p className="text-sm text-slate-600">{en.auth.register.subtitle}</p>
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
            <Input id="password" type="password" autoComplete="new-password" {...register('password')} />
            {errors.password && <p className="text-sm text-red-600">{errors.password.message}</p>}
          </div>
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium text-slate-700">
              {en.auth.register.nameLabel}
            </label>
            <Input id="name" type="text" autoComplete="name" {...register('name')} />
            {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
          </div>
          <div className="space-y-2">
            <label htmlFor="orgName" className="text-sm font-medium text-slate-700">
              {en.auth.register.orgLabel}
            </label>
            <Input id="orgName" type="text" autoComplete="organization" {...register('orgName')} />
            {errors.orgName && <p className="text-sm text-red-600">{errors.orgName.message}</p>}
          </div>
          <div className="space-y-2">
            <label htmlFor="locale" className="text-sm font-medium text-slate-700">
              {en.auth.register.localeLabel}
            </label>
            <select
              id="locale"
              className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              {...register('locale')}
            >
              <option value="en">{en.auth.register.localeEnglish}</option>
              <option value="es">{en.auth.register.localeSpanish}</option>
            </select>
            {errors.locale && <p className="text-sm text-red-600">{errors.locale.message}</p>}
          </div>
          {formError && <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{formError}</div>}
          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? en.auth.shared.submitting : en.auth.register.submit}
          </Button>
        </form>
        <p className="text-center text-sm text-slate-600">
          {en.auth.register.haveAccount}{' '}
          <Link href="/login" className="font-medium text-blue-600 hover:text-blue-700">
            {en.auth.register.loginCta}
          </Link>
        </p>
      </div>
    </div>
  );
}
