import { cookies, headers } from 'next/headers';
import AnalyzeResultsClient from '@/app/components/analyze/AnalyzeResultsClient';
import { resolveServerLocale } from '@/lib/core/detectLocale';
import { I18n } from '@/lib/core/I18n';
import { buildPageMetadata } from '@/lib/seo/metadata';
import { translateAnalyzeResults } from '@/lib/tools/analyze/translateResult';
import { runAnalysis } from '@/lib/tools/analyze/runAnalysis';
import { catalog } from '@/locales/index';

export async function generateMetadata({ params }) {
  const { id } = await params;
  return buildPageMetadata({
    title: `Server Analysis — ${id}`,
    description: 'Spark profile and Paper timings optimization recommendations for your Minecraft server.',
    path: `/tools/analyze/${id}`,
  });
}

export default async function AnalyzeIdPage({ params }) {
  const { id } = await params;
  const results = await runAnalysis(decodeURIComponent(id));
  const cookieStore = await cookies();
  const headerStore = await headers();
  const locale = resolveServerLocale(cookieStore, headerStore.get('accept-language'));
  const i18n = new I18n(catalog, locale);
  const translated = translateAnalyzeResults(results, (key, params) => i18n.t(key, params));

  return <AnalyzeResultsClient id={id} results={translated} />;
}
