import Link from 'next/link';
import { buttonVariants } from '@safetyswift/ui';
import { getDictionary, locales, type Locale } from '@/lib/get-dictionary';
import { LocaleSwitcher } from '@/components/locale-switcher';

type HomeDictionary = {
  navigation: {
    brand: string;
    localeToggle: string;
    login: string;
  };
  hero: {
    title: string;
    subtitle: string;
    primaryCta: string;
    secondaryCta: string;
  };
  features: {
    title: string;
    incidentReporting: { title: string; description: string };
    certificationTracking: { title: string; description: string };
    oshaForms: { title: string; description: string };
  };
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleHomePage({
  params
}: {
  params: { locale: Locale };
}) {
  const dictionary = (await getDictionary(params.locale)) as HomeDictionary;

  return (
    <main className="flex min-h-screen flex-col">
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-4">
          <Link href={`/${params.locale}`} className="text-xl font-semibold text-slate-900">
            {dictionary.navigation.brand}
          </Link>
          <div className="flex items-center gap-6">
            <LocaleSwitcher label={dictionary.navigation.localeToggle} />
            <Link
              href={`/${params.locale}/auth/login`}
              className="text-sm font-medium text-blue-600 transition hover:text-blue-700"
            >
              {dictionary.navigation.login}
            </Link>
          </div>
        </div>
      </header>
      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center gap-12 px-6 py-16">
        <section className="grid gap-8 lg:grid-cols-2 lg:items-center">
          <div className="space-y-6">
            <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
              {dictionary.hero.title}
            </h1>
            <p className="text-lg text-slate-600">{dictionary.hero.subtitle}</p>
            <div className="flex flex-wrap items-center gap-4">
              <Link
                href={`/${params.locale}/app/dashboard`}
                className={buttonVariants({ variant: 'primary' })}
              >
                {dictionary.hero.primaryCta}
              </Link>
              <Link
                href={`/${params.locale}/demo`}
                className={buttonVariants({ variant: 'secondary' })}
              >
                {dictionary.hero.secondaryCta}
              </Link>
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">{dictionary.features.title}</h2>
            <dl className="mt-6 space-y-4">
              <Feature
                title={dictionary.features.incidentReporting.title}
                description={dictionary.features.incidentReporting.description}
              />
              <Feature
                title={dictionary.features.certificationTracking.title}
                description={dictionary.features.certificationTracking.description}
              />
              <Feature
                title={dictionary.features.oshaForms.title}
                description={dictionary.features.oshaForms.description}
              />
            </dl>
          </div>
        </section>
      </div>
    </main>
  );
}

function Feature({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <dt className="text-base font-semibold text-slate-900">{title}</dt>
      <dd className="mt-1 text-sm text-slate-600">{description}</dd>
    </div>
  );
}
