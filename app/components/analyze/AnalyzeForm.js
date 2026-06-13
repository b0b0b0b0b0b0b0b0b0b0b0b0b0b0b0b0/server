'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from '@/app/components/AppProviders';
import { useWorkspace } from '@/app/components/WorkspaceProvider';
import { parseAnalyzeLink } from '@/lib/tools/analyze/parseAnalyzeLink';
import { detectAnalysisKind } from '@/lib/ui/analysisLabel';

export default function AnalyzeForm({ autoFocus = false }) {
  const { t } = useLocale();
  const router = useRouter();
  const { patch, activeServerId } = useWorkspace();
  const [link, setLink] = useState('');
  const [error, setError] = useState('');

  const submit = () => {
    const parsed = parseAnalyzeLink(link);
    if (parsed.error === 'spigotTimings') {
      setError(t('tools.analyze.errors.spigotTimings'));
      return;
    }
    if (parsed.error) {
      setError(t('tools.analyze.errors.invalid'));
      return;
    }
    setError('');
    patch((store) => {
      store.saveAnalysis({
        id: parsed.id,
        link: link.trim(),
        kind: detectAnalysisKind(link, parsed.id),
      }, activeServerId);
    });
    router.push(`/tools/analyze/${encodeURIComponent(parsed.id)}`);
  };

  return (
    <div className="analyze-form">
      <label className="field-label" htmlFor="analyze-link">
        {t('tools.analyze.linkLabel')}
      </label>
      <input
        id="analyze-link"
        className="lum-input"
        value={link}
        placeholder={t('tools.analyze.linkPlaceholder')}
        autoFocus={autoFocus}
        onChange={(event) => {
          setLink(event.target.value);
          if (error) setError('');
        }}
        onKeyDown={(event) => {
          if (event.key === 'Enter') submit();
        }}
      />
      {error ? <p className="analyze-form-error">{error}</p> : null}
      {link.trim() ? (
        <button type="button" className="lum-btn lum-btn-primary analyze-form-submit" onClick={submit}>
          {t('tools.analyze.submit')}
        </button>
      ) : null}
    </div>
  );
}
