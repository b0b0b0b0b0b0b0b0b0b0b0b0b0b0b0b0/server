'use client';

import AnalyzeLanding from '@/app/components/analyze/AnalyzeView';
import { useWorkspace } from '@/app/components/WorkspaceProvider';

export default function AnalyzeClient() {
  const { ready } = useWorkspace();

  if (!ready) return null;

  return <AnalyzeLanding />;
}
