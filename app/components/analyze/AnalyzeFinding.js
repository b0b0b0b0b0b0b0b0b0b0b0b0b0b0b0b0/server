import { AlertTriangle, CheckCircle2, CircleAlert } from 'lucide-react';

const SEVERITY_ICONS = {
  ok: CheckCircle2,
  issue: CircleAlert,
  warn: AlertTriangle,
};

export function parseFinding(name) {
  const isOk = name.startsWith('✅');
  const isIssue = name.startsWith('❌');
  const isWarn = name.startsWith('⚠');
  const severity = isOk ? 'ok' : isIssue ? 'issue' : isWarn ? 'warn' : 'issue';
  const raw = name.replace(/^[✅❌⚠]\s*/, '').trim();
  const segments = raw.includes('.') ? raw.split('.') : [raw];
  const label = segments[0];
  const path = segments.length > 1 ? segments.slice(1) : null;
  return { severity, label, path, raw };
}

export default function AnalyzeFinding({ field }) {
  const { severity, label, path } = parseFinding(field.name);
  const Icon = SEVERITY_ICONS[severity];

  return (
    <li className={`analyze-finding analyze-finding--${severity}`}>
      <header className="analyze-finding-head">
        <span className="analyze-finding-icon">
          <Icon size={18} strokeWidth={2.25} />
        </span>
        <div className="analyze-finding-titles">
          <h3 className="analyze-finding-label">{label}</h3>
          {path?.length > 0 && (
            <ol className="analyze-finding-path">
              {path.map((segment) => (
                <li key={segment}>{segment}</li>
              ))}
            </ol>
          )}
        </div>
      </header>
      <p className="analyze-finding-message">{field.value}</p>
      {field.buttons?.length > 0 && (
        <div className="analyze-finding-actions">
          {field.buttons.map((button, index) => (
            <a
              key={`${button.text}-${index}`}
              href={button.url}
              target="_blank"
              rel="noopener noreferrer"
              className="analyze-finding-btn"
            >
              {button.text}
            </a>
          ))}
        </div>
      )}
    </li>
  );
}
