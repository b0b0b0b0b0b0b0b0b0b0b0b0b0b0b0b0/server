import {
  SITE_ABBREV,
  SITE_NAME,
  SITE_ORIGIN,
  SITE_PARENT_NAME,
  SITE_PARENT_ORIGIN,
} from '@/lib/config/site.js';

export function siteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${SITE_ORIGIN}/#website`,
        url: SITE_ORIGIN,
        name: SITE_NAME,
        alternateName: [SITE_ABBREV, 'Minecraft Server Tools', 'MTools MST'],
        description:
          'Free Minecraft server tools: JVM flags generator, startup scripts, and server optimization utilities.',
        inLanguage: ['en', 'ru', 'de', 'fr', 'es', 'pl', 'nl', 'ja', 'zh'],
        isPartOf: {
          '@type': 'WebSite',
          name: SITE_PARENT_NAME,
          url: SITE_PARENT_ORIGIN,
        },
      },
      {
        '@type': 'WebApplication',
        '@id': `${SITE_ORIGIN}/#app`,
        url: SITE_ORIGIN,
        name: SITE_NAME,
        applicationCategory: 'DeveloperApplication',
        operatingSystem: 'Any',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
        },
        featureList: [
          'Minecraft JVM flags generator',
          'Aikar flags presets',
          'Paper and Purpur startup scripts',
          'Velocity and Waterfall proxy flags',
          'RAM overhead calculator',
          'Modrinth and Spigot plugin update tracker',
          'Spark profile and Paper timings analyzer',
        ],
      },
      {
        '@type': 'SoftwareApplication',
        '@id': `${SITE_ORIGIN}/tools/flags#software`,
        url: `${SITE_ORIGIN}/tools/flags`,
        name: 'Minecraft Flags Generator',
        applicationCategory: 'UtilitiesApplication',
        operatingSystem: 'Linux, Windows, macOS',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
        },
      },
    ],
  };
}
