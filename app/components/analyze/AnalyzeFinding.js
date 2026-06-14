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
  const parsed = parseFinding(field.name);
  const severity = field.severity ?? parsed.severity;
  const Icon = SEVERITY_ICONS[severity];
  const isConfigFinding = Boolean(field.configKey || field.configFile);
  const configSegments = field.configKey?.split('.') ?? null;
  const label = configSegments?.[0] ?? parsed.label;
  const path = configSegments && configSegments.length > 1 ? configSegments.slice(1) : parsed.path;

  return (
    <li className={`analyze-finding analyze-finding--${severity}`}>
      <header className="analyze-finding-head">
        <span className="analyze-finding-icon">
          <Icon size={18} strokeWidth={2.25} />
        </span>
        <div className="analyze-finding-titles">
          <h3 className="analyze-finding-label">
            {isConfigFinding ? <code>{label}</code> : label}
          </h3>
          {path?.length > 0 && (
            <ol className="analyze-finding-path">
              {path.map((segment) => (
                <li key={segment}>
                  <code>{segment}</code>
                </li>
              ))}
            </ol>
          )}
        </div>
      </header>
      {field.configFile ? <p className="analyze-finding-file">{field.configFile}</p> : null}
      <p className={`analyze-finding-message${isConfigFinding ? ' analyze-finding-message--yaml' : ''}`}>{field.value}</p>
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
