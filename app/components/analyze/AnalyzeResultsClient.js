'use client';

import { useEffect } from 'react';
import { AnalyzeResultsView } from '@/app/components/analyze/AnalyzeView';
import { useLocale } from '@/app/components/AppProviders';
import { useWorkspace } from '@/app/components/WorkspaceProvider';
import { translateAnalyzeResults } from '@/lib/tools/analyze/translateResult';
import { detectAnalysisKind } from '@/lib/ui/analysisLabel';

export default function AnalyzeResultsClient({ id, results }) {
  const { t } = useLocale();
  const { ready, activeServerId, patch } = useWorkspace();
  const translated = translateAnalyzeResults(results, t);

  useEffect(() => {
    if (!ready) return;
    patch((store) => {
      store.saveAnalysis({
        id,
        link: id,
        kind: detectAnalysisKind(id, id),
      }, activeServerId);
    });
  }, [ready, id, activeServerId, patch]);

  return <AnalyzeResultsView t={t} id={id} results={translated} />;
}
