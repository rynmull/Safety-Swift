/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    typedRoutes: true
  },
  reactStrictMode: true,
  transpilePackages: ['@safetyswift/ui'],
  i18n: {
    locales: ['en', 'es'],
    defaultLocale: 'en'
  }
};

export default nextConfig;
