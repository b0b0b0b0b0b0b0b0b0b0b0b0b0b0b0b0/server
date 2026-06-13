'use client';

import AnalyzeLanding from '@/app/components/analyze/AnalyzeView';
import { useLocale } from '@/app/components/AppProviders';

export default function AnalyzeClient() {
  const { t } = useLocale();
  return <AnalyzeLanding t={t} />;
}
