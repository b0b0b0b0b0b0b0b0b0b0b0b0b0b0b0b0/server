import AnalyzeClient from '@/app/components/analyze/AnalyzeClient';
import { buildPageMetadata } from '@/lib/seo/metadata';

export const metadata = buildPageMetadata({
  title: 'Minecraft Server Analyze — Spark Profile & Paper Timings',
  description:
    'Analyze Spark profiles and Paper timings for Minecraft servers. Get JVM, spigot.yml, and performance optimization recommendations.',
  path: '/tools/analyze',
  keywords: [
    'minecraft spark analyzer',
    'paper timings analyzer',
    'minecraft server optimization',
    'aikar flags check',
    'spigot.yml recommendations',
  ],
});

export default function AnalyzePage() {
  return <AnalyzeClient />;
}
