import { cookies, headers } from 'next/headers';
import { Nunito } from 'next/font/google';
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
import '@/styles/ping-page.css';
import '@/styles/home-page.css';
import '@/styles/transitions.css';
import '@/styles/workspace.css';
import '@/styles/locale-fonts.css';
import '@/styles/rtl.css';
import '@/styles/site-footer.css';
import '@/app/components/kitten/kitten.css';
import '@/components/settings/settings.css';
import './globals.css';
import SiteFooter from '@/app/components/footer/SiteFooter';
import { SITE_VERSION } from '@/lib/config/siteVersion';
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
import { I18nProvider } from '@/components/i18n/I18nProvider';
import ConsoleWarning from '@/components/i18n/ConsoleWarning';
import { getServerT } from '@/lib/i18n/server';

const nunito = Nunito({
  subsets: ['latin', 'latin-ext', 'cyrillic', 'cyrillic-ext'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-nunito',
  display: 'swap',
  preload: false,
  adjustFontFallback: true,
  fallback: ['system-ui', 'arial'],
})

export const metadata = buildRootMetadata();

export default async function RootLayout({ children }) {
  const cookieStore = await cookies();
  const headerStore = await headers();
  const locale = resolveServerLocale(cookieStore, headerStore.get('accept-language'));
  const theme = resolveServerTheme(cookieStore);
  const direction = resolveDocumentDirection(locale);
  const shared = await getServerT();

  return (
    <html
      lang={locale}
      dir={direction}
      className={theme === 'dark' ? `dark ${nunito.variable}` : nunito.variable}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: LOOK_BOOT_SCRIPT }} />
        <link rel="manifest" href="/manifest.webmanifest" crossOrigin="use-credentials" />
        <SiteJsonLd />
      </head>
      <body className={`${nunito.className} min-h-screen antialiased mpa-auto`}>
        <I18nProvider locale={shared.locale} messages={shared.messages}>
          <ConsoleWarning />
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
              tagline={shared.t('footer.tagline')}
              accent={shared.t('footer.accent')}
              version={SITE_VERSION}
            />
          </WorkspaceProvider>
        </AppProviders>
        </I18nProvider>
      </body>
    </html>
  );
}
