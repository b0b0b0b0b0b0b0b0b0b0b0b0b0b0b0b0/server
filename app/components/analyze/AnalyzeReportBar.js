'use client';

import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { useLocale } from '@/app/components/AppProviders';
import LumTooltip from '@/app/components/LumTooltip';
import { pluralRu } from '@/lib/core/pluralRu';

function issuesLabel(count, locale, t) {
  if (locale === 'ru') {
    return pluralRu(count, {
      one: 'проблема',
      few: 'проблемы',
      many: 'проблем',
    });
  }
  return count === 1 ? t('tools.analyze.reportIssue') : t('tools.analyze.reportIssues');
}

function passedLabel(count, locale, t) {
  if (locale === 'ru') {
    return pluralRu(count, {
      one: 'в норме',
      few: 'в норме',
      many: 'в норме',
    });
  }
  return count === 1 ? t('tools.analyze.reportPassedOne') : t('tools.analyze.reportPassed');
}

export default function AnalyzeReportBar({ id, issueCount, okCount }) {
  const { t, locale } = useLocale();
  const [copied, setCopied] = useState(false);

  const copyLink = async () => {
    const shareUrl = `${window.location.origin}/tools/analyze/${encodeURIComponent(id)}`;
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="analyze-report-bar">
      <div className="analyze-report-stat analyze-report-stat--issue">
        <span className="analyze-report-stat-value">{issueCount}</span>
        <span className="analyze-report-stat-label">{issuesLabel(issueCount, locale, t)}</span>
      </div>
      {okCount > 0 && (
        <div className="analyze-report-stat analyze-report-stat--ok">
          <span className="analyze-report-stat-value">{okCount}</span>
          <span className="analyze-report-stat-label">{passedLabel(okCount, locale, t)}</span>
        </div>
      )}
      <LumTooltip content={t('tools.analyze.tooltips.copyLink')} side="bottom">
        <button
          type="button"
          className={`analyze-report-id${copied ? ' is-copied' : ''}`}
          onClick={copyLink}
          aria-label={t('tools.analyze.copyProfileLink')}
        >
        <span className="analyze-report-id-label">{t('tools.analyze.reportProfile')}</span>
        <span className="analyze-report-id-value">
          <code>{id}</code>
          <span className="analyze-report-id-icon" aria-hidden>
            {copied ? <Check size={14} /> : <Copy size={14} />}
          </span>
        </span>
        {copied ? <span className="analyze-report-id-hint">{t('common.copied')}</span> : null}
        </button>
      </LumTooltip>
    </div>
  );
}
