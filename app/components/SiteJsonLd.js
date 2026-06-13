import { siteJsonLd } from '@/lib/seo/jsonLd.js';

export default function SiteJsonLd() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(siteJsonLd()) }}
    />
  );
}
