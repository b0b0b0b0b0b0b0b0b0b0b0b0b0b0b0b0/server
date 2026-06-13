'use client';

import AnalyzeLanding from '@/app/components/analyze/AnalyzeView';
import { useLocale } from '@/app/components/AppProviders';
import { useWorkspace } from '@/app/components/WorkspaceProvider';

export default function AnalyzeClient() {
  const { t } = useLocale();
  const { ready } = useWorkspace();

  if (!ready) return null;

  return <AnalyzeLanding t={t} />;
}
