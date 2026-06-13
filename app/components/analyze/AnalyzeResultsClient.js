'use client';

import { AnalyzeResultsView } from '@/app/components/analyze/AnalyzeView';
import { useLocale } from '@/app/components/AppProviders';
import { translateAnalyzeResults } from '@/lib/tools/analyze/translateResult';

export default function AnalyzeResultsClient({ id, results }) {
  const { t } = useLocale();
  const translated = translateAnalyzeResults(results, t);
  return <AnalyzeResultsView t={t} id={id} results={translated} />;
}
