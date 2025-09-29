'use client';

import { createContext, useContext, useMemo, type ReactNode } from 'react';
import type { Locale } from './get-dictionary';

type LocaleContextValue = {
  locale: Locale;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({
  locale,
  children
}: {
  locale: Locale;
  children: ReactNode;
}) {
  const value = useMemo(() => ({ locale }), [locale]);
  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error('useLocale must be used within a LocaleProvider');
  }
  return context.locale;
}
