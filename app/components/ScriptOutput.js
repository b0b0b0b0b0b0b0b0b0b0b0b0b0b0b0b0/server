'use client';

import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { useLocale } from '@/app/components/AppProviders';

export default function ScriptOutput({
  id,
  value,
  title,
  hint,
  language,
  filename,
}) {
  const { t } = useLocale();
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="script-output">
      <div className="script-output-head">
        <label className="field-label" htmlFor={id}>{title}</label>
        {hint ? <p className="field-hint">{hint}</p> : null}
      </div>
      <div className={`script-output-panel${copied ? ' is-copied' : ''}`}>
        <div className="script-output-toolbar">
          <div className="script-output-dots" aria-hidden>
            <span />
            <span />
            <span />
          </div>
          <span className="script-output-meta">
            {filename ? <span className="script-output-filename">{filename}</span> : null}
            {language ? <span className="script-output-lang">{language}</span> : null}
          </span>
        </div>
        <div className="script-output-body">
          <textarea
            id={id}
            className="script-output-area"
            readOnly
            value={value}
            spellCheck={false}
          />
          <button
            type="button"
            className={`script-output-copy${copied ? ' is-copied' : ''}`}
            onClick={copy}
            aria-label={copied ? t('common.copied') : t('common.copy')}
            title={copied ? t('common.copied') : t('common.copy')}
          >
            <span className="script-output-copy-icons" aria-hidden>
              <span className="script-output-copy-icon script-output-copy-icon-copy">
                <Copy size={16} strokeWidth={2} />
              </span>
              <span className="script-output-copy-icon script-output-copy-icon-check">
                <Check size={16} strokeWidth={2.5} />
              </span>
            </span>
            <span className="script-output-copy-label">
              {copied ? t('common.copied') : t('common.copy')}
            </span>
          </button>
          <span className="script-output-feedback" role="status" aria-live="polite">
            {copied ? t('common.copied') : ''}
          </span>
        </div>
      </div>
    </div>
  );
}
