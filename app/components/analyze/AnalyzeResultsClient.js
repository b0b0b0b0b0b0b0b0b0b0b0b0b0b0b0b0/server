'use client';

import { useEffect } from 'react';
import { AnalyzeResultsView } from '@/app/components/analyze/AnalyzeView';
import { useWorkspace } from '@/app/components/WorkspaceProvider';
import { detectAnalysisKind } from '@/lib/ui/analysisLabel';

export default function AnalyzeResultsClient({ id, results }) {
  const { ready, activeServerId, patch } = useWorkspace();

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

  if (!ready) return null;

  return <AnalyzeResultsView id={id} results={results} />;
}
