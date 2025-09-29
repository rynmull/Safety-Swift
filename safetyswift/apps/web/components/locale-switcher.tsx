'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { Locale } from '@/lib/get-dictionary';
import { locales } from '@/lib/get-dictionary';
import { useLocale } from '@/lib/locale-context';

export function LocaleSwitcher({ label }: { label: string }) {
  const currentLocale = useLocale();
  const pathname = usePathname();

  const basePath = pathname?.split('/').slice(2).join('/') ?? '';

  return (
    <div className="flex items-center gap-2 text-sm text-slate-600">
      <span className="font-medium text-slate-700">{label}</span>
      <div className="inline-flex rounded-md border border-slate-200 bg-white p-1 shadow-sm">
        {locales.map((locale) => (
          <LocaleButton key={locale} locale={locale} basePath={basePath} active={locale === currentLocale} />
        ))}
      </div>
    </div>
  );
}

function LocaleButton({
  locale,
  basePath,
  active
}: {
  locale: Locale;
  basePath: string;
  active: boolean;
}) {
  const href = `/${locale}${basePath ? `/${basePath}` : ''}`;
  return (
    <Link
      href={href}
      className={`rounded px-3 py-1 text-sm font-medium transition hover:text-blue-600 ${
        active ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600'
      }`}
    >
      {locale.toUpperCase()}
    </Link>
  );
}
