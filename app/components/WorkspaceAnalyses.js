'use client';

import Link from 'next/link';
import { X } from 'lucide-react';
import { useLocale } from '@/app/components/AppProviders';
import LumTooltip from '@/app/components/LumTooltip';
import { useWorkspace } from '@/app/components/WorkspaceProvider';
import { formatAnalysisLabel } from '@/lib/ui/analysisLabel';

export default function WorkspaceAnalyses() {
  const { t, locale } = useLocale();
  const { ready, activeServerId, workspace, patch } = useWorkspace();

  if (!ready || !workspace) return null;

  const analyses = workspace.getAnalyses(activeServerId);
  if (!analyses.length) return null;

  return (
    <div className="workspace-analyses">
      <p className="workspace-analyses-title">{t('workspace.recentAnalyses')}</p>
      <ul className="workspace-analyses-list">
        {analyses.map((entry) => (
          <li key={entry.id} className="workspace-analyses-item">
            <Link href={`/tools/analyze/${encodeURIComponent(entry.id)}`} className="workspace-analyses-link">
              {formatAnalysisLabel(entry, locale)}
            </Link>
            <LumTooltip content={t('workspace.tooltips.removeAnalysis')} side="bottom">
              <button
                type="button"
                className="workspace-analyses-remove lum-btn"
                onClick={() => patch((store) => { store.removeAnalysis(entry.id, activeServerId); })}
                aria-label={t('workspace.removeAnalysis')}
              >
                <X size={14} />
              </button>
            </LumTooltip>
          </li>
        ))}
      </ul>
      <p className="workspace-analyses-hint">{t('workspace.analysesHint')}</p>
    </div>
  );
}
