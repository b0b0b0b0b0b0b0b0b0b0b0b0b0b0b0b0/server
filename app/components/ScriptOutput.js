'use client';

import { useEffect, useMemo, useState } from 'react';
import { Check, Copy, Download } from 'lucide-react';
import { useLocale } from '@/app/components/AppProviders';
import { highlightScriptLine, splitScriptLines } from '@/lib/ui/highlightScript';

export default function ScriptOutput({
  id,
  value,
  title,
  hint,
  language,
  filename,
  filenameBasename,
  filenameExtension = '',
  onBasenameChange,
}) {
  const { t } = useLocale();
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [draftBasename, setDraftBasename] = useState(filenameBasename ?? '');
  const lines = useMemo(() => splitScriptLines(value), [value]);
  const highlightedLines = useMemo(
    () => lines.map((line) => highlightScriptLine(line, language)),
    [lines, language],
  );
  const downloadName = filename || `${draftBasename || 'script'}${filenameExtension}`;

  useEffect(() => {
    setDraftBasename(filenameBasename ?? '');
  }, [filenameBasename]);

  const copy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  const download = () => {
    const blob = new Blob([value], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = downloadName;
    link.click();
    URL.revokeObjectURL(url);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2000);
  };

  const commitBasename = () => {
    if (!onBasenameChange) return;
    const next = draftBasename.trim();
    if (next && next !== filenameBasename) {
      onBasenameChange(next);
    } else {
      setDraftBasename(filenameBasename ?? '');
    }
  };

  return (
    <div className="script-output">
      <div className="script-output-head">
        <label className="field-label" htmlFor={id}>{title}</label>
        {hint ? <p className="field-hint">{hint}</p> : null}
      </div>
      <div className={`script-output-panel${copied || saved ? ' is-copied' : ''}`}>
        <div className="script-output-toolbar">
          <div className="script-output-dots" aria-hidden>
            <span />
            <span />
            <span />
          </div>
          <span className="script-output-meta">
            {onBasenameChange ? (
              <span className="script-output-filename">
                <input
                  className="script-output-filename-input"
                  value={draftBasename}
                  aria-label={t('tools.flags.scriptFilename')}
                  onChange={(event) => setDraftBasename(event.target.value)}
                  onFocus={(event) => event.target.select()}
                  onClick={(event) => event.currentTarget.select()}
                  onBlur={commitBasename}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.currentTarget.blur();
                    }
                  }}
                />
                {filenameExtension ? (
                  <span className="script-output-filename-ext">{filenameExtension}</span>
                ) : null}
              </span>
            ) : (
              filename ? <span className="script-output-filename">{filename}</span> : null
            )}
            {language ? <span className="script-output-lang">{language}</span> : null}
          </span>
        </div>
        <div className="script-output-body">
          <div
            id={id}
            className="script-output-scroll"
            tabIndex={0}
            role="region"
            aria-label={title}
          >
            {highlightedLines.map((lineHtml, index) => (
              <div key={`line-${index}`} className="script-output-row">
                <span className="script-output-line-num" aria-hidden>
                  {index + 1}
                </span>
                <span
                  className="script-output-line"
                  dangerouslySetInnerHTML={{ __html: lineHtml }}
                />
              </div>
            ))}
          </div>
          <span className="script-output-sr-only">{value}</span>
          <div className="script-output-actions">
            <button
              type="button"
              className={`script-output-action script-output-copy${copied ? ' is-copied' : ''}`}
              onClick={copy}
              aria-label={copied ? t('common.copied') : t('common.copy')}
              title={copied ? t('common.copied') : t('common.copy')}
            >
              <span className="script-output-action-icons" aria-hidden>
                <span className="script-output-action-icon script-output-action-icon-copy">
                  <Copy size={16} strokeWidth={2} />
                </span>
                <span className="script-output-action-icon script-output-action-icon-check">
                  <Check size={16} strokeWidth={2.5} />
                </span>
              </span>
              <span className="script-output-action-label">
                {copied ? t('common.copied') : t('common.copy')}
              </span>
            </button>
            <button
              type="button"
              className={`script-output-action script-output-download${saved ? ' is-saved' : ''}`}
              onClick={download}
              aria-label={saved ? t('common.downloaded') : t('common.download')}
              title={saved ? t('common.downloaded') : t('common.download')}
            >
              <span className="script-output-action-icons" aria-hidden>
                <span className="script-output-action-icon script-output-action-icon-download">
                  <Download size={16} strokeWidth={2} />
                </span>
                <span className="script-output-action-icon script-output-action-icon-check">
                  <Check size={16} strokeWidth={2.5} />
                </span>
              </span>
              <span className="script-output-action-label">
                {saved ? t('common.downloaded') : t('common.download')}
              </span>
            </button>
          </div>
          <span className="script-output-feedback" role="status" aria-live="polite">
            {copied ? t('common.copied') : saved ? t('common.downloaded') : ''}
          </span>
        </div>
      </div>
    </div>
  );
}
