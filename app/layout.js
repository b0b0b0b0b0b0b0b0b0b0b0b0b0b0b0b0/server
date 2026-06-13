import { Inter } from 'next/font/google';
import '@/styles/variables.css';
import '@/styles/base.css';
import '@/styles/layout.css';
import '@/styles/cards.css';
import '@/styles/forms.css';
import '@/styles/tool-page.css';
import '@/styles/plugins-page.css';
import '@/styles/home-page.css';
import '@/styles/transitions.css';
import '@/styles/analyze-page.css';
import './globals.css';
import { buildRootMetadata } from '@/lib/seo/metadata';
import SiteJsonLd from '@/app/components/SiteJsonLd';
import AppProviders from '@/app/components/AppProviders';
import SiteHeader from '@/app/components/SiteHeader';
import PageTransition from '@/app/components/PageTransition';
import { STORAGE_KEYS, DEFAULT_THEME } from '@/lib/config/constants';

const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  display: 'swap',
});

export const metadata = buildRootMetadata();

const themeBoot = `try{var t=localStorage.getItem('${STORAGE_KEYS.theme}')||'${DEFAULT_THEME}';document.documentElement.classList.toggle('dark',t==='dark')}catch(e){}`;

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBoot }} />
        <SiteJsonLd />
      </head>
      <body className={`${inter.className} min-h-screen antialiased`}>
        <AppProviders>
          <SiteHeader />
          <PageTransition>{children}</PageTransition>
        </AppProviders>
      </body>
    </html>
  );
}
