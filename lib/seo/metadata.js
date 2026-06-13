import {
  SITE_ABBREV,
  SITE_KEYWORDS,
  SITE_NAME,
  SITE_ORIGIN,
  SITE_PARENT_NAME,
  SITE_PARENT_ORIGIN,
} from '@/lib/config/site.js';

export function buildPageMetadata({
  title,
  description,
  path = '/',
  keywords = [],
  type = 'website',
}) {
  const url = new URL(path, SITE_ORIGIN).toString();
  const mergedKeywords = [...new Set([...SITE_KEYWORDS, ...keywords])];

  return {
    title,
    description,
    keywords: mergedKeywords,
    alternates: {
      canonical: url,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
        'max-video-preview': -1,
      },
    },
    openGraph: {
      type,
      url,
      siteName: SITE_NAME,
      title,
      description,
      locale: 'en_US',
      alternateLocale: ['ru_RU', 'de_DE', 'fr_FR', 'es_ES', 'pl_PL', 'nl_NL', 'ja_JP', 'zh_CN'],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    other: {
      'application-name': SITE_NAME,
      'apple-mobile-web-app-title': SITE_ABBREV,
      'og:see_also': SITE_PARENT_ORIGIN,
    },
    metadataBase: new URL(SITE_ORIGIN),
  };
}

export function buildRootMetadata() {
  const title = `${SITE_NAME} — Minecraft Server Tools`;
  const description =
    'MTools (MST) — free Minecraft server utilities at mtools.modrinth.black: JVM flags generator with Aikar presets, startup scripts for Paper, Purpur, Velocity, and more.';

  return {
    ...buildPageMetadata({ title, description, path: '/' }),
    title: {
      default: title,
      template: `%s — ${SITE_NAME}`,
    },
    authors: [{ name: SITE_PARENT_NAME, url: SITE_PARENT_ORIGIN }],
    creator: SITE_NAME,
    publisher: SITE_PARENT_NAME,
    category: 'technology',
  };
}
