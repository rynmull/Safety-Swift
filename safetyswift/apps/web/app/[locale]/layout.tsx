import type { ReactNode } from 'react';
import { LocaleProvider } from '@/lib/locale-context';
import type { Locale } from '@/lib/get-dictionary';

export default function LocaleLayout({
  children,
  params
}: {
  children: ReactNode;
  params: { locale: Locale };
}) {
  return <LocaleProvider locale={params.locale}>{children}</LocaleProvider>;
}
