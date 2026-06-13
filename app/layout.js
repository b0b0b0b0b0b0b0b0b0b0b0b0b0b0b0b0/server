import { cookies, headers } from 'next/headers';
import { Inter } from 'next/font/google';
import '@/styles/variables.css';
import '@/styles/base.css';
import '@/styles/layout.css';
import '@/styles/cards.css';
import '@/styles/forms.css';
import '@/styles/tool-page.css';
import '@/styles/flags-page.css';
import '@/styles/plugins-page.css';
import '@/styles/analyze-page.css';
import '@/styles/home-page.css';
import '@/styles/transitions.css';
import '@/styles/workspace.css';
import './globals.css';
import { buildRootMetadata } from '@/lib/seo/metadata';
import SiteJsonLd from '@/app/components/SiteJsonLd';
import AppProviders from '@/app/components/AppProviders';
import WorkspaceProvider from '@/app/components/WorkspaceProvider';
import SiteHeader from '@/app/components/SiteHeader';
import PageTransition from '@/app/components/PageTransition';
import { resolveServerLocale } from '@/lib/core/detectLocale';
import { resolveServerTheme } from '@/lib/core/ThemeStore';

const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  display: 'swap',
});

export const metadata = buildRootMetadata();

export default async function RootLayout({ children }) {
  const cookieStore = await cookies();
  const headerStore = await headers();
  const locale = resolveServerLocale(cookieStore, headerStore.get('accept-language'));
  const theme = resolveServerTheme(cookieStore);

  return (
    <html lang={locale} className={theme === 'dark' ? 'dark' : undefined} suppressHydrationWarning>
      <head>
        <SiteJsonLd />
      </head>
      <body className={`${inter.className} min-h-screen antialiased`}>
        <AppProviders initialLocale={locale} initialTheme={theme}>
          <WorkspaceProvider>
            <SiteHeader />
            <PageTransition>{children}</PageTransition>
          </WorkspaceProvider>
        </AppProviders>
      </body>
    </html>
  );
}
