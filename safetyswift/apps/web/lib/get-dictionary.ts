import { cache } from 'react';

export const locales = ['en', 'es'] as const;
export type Locale = (typeof locales)[number];

type Dictionary = Record<string, unknown>;

type Dictionaries = Record<Locale, () => Promise<Dictionary>>;

const dictionaries: Dictionaries = {
  en: () => import('../locales/en.json').then((module) => module.default),
  es: () => import('../locales/es.json').then((module) => module.default)
};

export const getDictionary = cache(async (locale: string) => {
  const normalized = locales.includes(locale as Locale) ? (locale as Locale) : 'en';
  return dictionaries[normalized]();
});
