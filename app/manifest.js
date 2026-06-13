import { SITE_ABBREV, SITE_NAME } from '@/lib/config/site.js';

export default function manifest() {
  return {
    name: `${SITE_NAME} — Minecraft Server Tools`,
    short_name: SITE_ABBREV,
    description:
      'Free Minecraft server tools: JVM flags generator, startup scripts, and optimization utilities.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0c0c0e',
    theme_color: '#f97316',
    lang: 'en',
    categories: ['utilities', 'developer'],
  };
}
