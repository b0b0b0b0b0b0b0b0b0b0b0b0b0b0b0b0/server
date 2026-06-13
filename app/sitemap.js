import { SITE_ORIGIN, SITE_ROUTES } from '@/lib/config/site.js';

export default function sitemap() {
  return SITE_ROUTES.map((route) => ({
    url: `${SITE_ORIGIN}${route.path}`,
    lastModified: new Date(),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
