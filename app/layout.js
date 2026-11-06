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
import '@/styles/rgb-page.css';
import '@/styles/home-page.css';
import '@/styles/transitions.css';
import '@/styles/workspace.css';
import '@/styles/locale-fonts.css';
import '@/styles/rtl.css';
import '@/styles/site-footer.css';
import '@/app/components/kitten/kitten.css';
import './globals.css';
import SiteFooter from '@/app/components/footer/SiteFooter';
import PeekKitten from '@/app/components/kitten/PeekKitten';
import OiiaParty from '@/app/components/kitten/OiiaParty';
import { buildRootMetadata } from '@/lib/seo/metadata';
import SiteJsonLd from '@/app/components/SiteJsonLd';
import AppProviders from '@/app/components/AppProviders';
import WorkspaceProvider from '@/app/components/WorkspaceProvider';
import SiteHeader from '@/app/components/SiteHeader';
import PageTransition from '@/app/components/PageTransition';
import { resolveServerLocale } from '@/lib/core/detectLocale';
import { resolveDocumentDirection } from '@/lib/core/localeDirection';
import { resolveServerTheme } from '@/lib/core/ThemeStore';
import { LOOK_BOOT_SCRIPT } from '@/lib/core/siteLook';

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
  const direction = resolveDocumentDirection(locale);

  return (
    <html
      lang={locale}
      dir={direction}
      className={theme === 'dark' ? 'dark' : undefined}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: LOOK_BOOT_SCRIPT }} />
        <link rel="manifest" href="/manifest.webmanifest" crossOrigin="use-credentials" />
        <SiteJsonLd />
      </head>
      <body className={`${inter.className} min-h-screen antialiased mpa-auto`}>
        <AppProviders initialLocale={locale}>
          <WorkspaceProvider>
            <SiteHeader />
            <PageTransition>{children}</PageTransition>
            <OiiaParty />
            <div className="sf-peek">
              <PeekKitten />
            </div>
            <SiteFooter
              here="mtools"
              title="MTools"
              domain="mtools.modrinth.black"
              tagline="Инструменты для серверов Minecraft: флаги запуска, анализ лагов, плагины и градиенты."
              accent="Всё для своего сервера в одном месте"
            />
          </WorkspaceProvider>
        </AppProviders>
      </body>
    </html>
  );
}
