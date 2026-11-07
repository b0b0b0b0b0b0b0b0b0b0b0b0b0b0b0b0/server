'use client'

import '@/components/mpa/mpa.css'

const PERK_ICONS = [
  'M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z',
  'M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3',
  'M19 14c1.5-1.5 3-3.2 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.8 0-3 .5-4.5 2-1.5-1.5-2.7-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4 3 5.5l7 7Z',
]

export const ACCOUNT_SITE = 'https://modrinth.black'
export const USER_ICON = 'M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z'
const LOCK_ICON = 'M7 11V7a5 5 0 0 1 10 0v4M5 11h14a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2Z'
const BACK_ICON = 'M19 12H5M12 19l-7-7 7-7'
const GITHUB_ICON = 'M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.1.79-.25.79-.56v-2c-3.2.7-3.87-1.36-3.87-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.19 1.76 1.19 1.03 1.76 2.69 1.25 3.35.96.1-.75.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.79 0c2.21-1.49 3.18-1.18 3.18-1.18.63 1.59.23 2.76.11 3.05.74.8 1.19 1.83 1.19 3.09 0 4.42-2.7 5.39-5.27 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.51 11.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z'
const TELEGRAM_ICON = 'M21.94 4.3 18.6 20.05c-.25 1.1-.9 1.38-1.83.86l-5.05-3.72-2.44 2.35c-.27.27-.5.5-1.02.5l.36-5.15 9.37-8.47c.4-.36-.09-.56-.63-.2L5.78 13.5.8 11.95c-1.08-.34-1.1-1.08.23-1.6L20.5 2.84c.9-.33 1.69.21 1.44 1.46Z'

const STRENGTH_COLORS = ['#ef4444', '#f59e0b', '#eab308', '#22c55e']

export function Svg({ path, className = 'mpa-icon' }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
      <path d={path} />
    </svg>
  )
}

export function Frame({ side, home, children }) {
  return (
    <div className="mpa-page">
      <div className="mpa-blob mpa-blob--a" aria-hidden="true" />
      <div className="mpa-blob mpa-blob--b" aria-hidden="true" />
      {home ? (
        <a href="/" className="mpa-back">
          <Svg path={BACK_ICON} className="mpa-icon mpa-icon--sm" />
          {home}
        </a>
      ) : null}
      <div className="mpa-frame">
        <div className="mpa-frame-glow" aria-hidden="true" />
        <div className="mpa-frame-inner">
          <aside className="mpa-side">{side}</aside>
          <div className="mpa-main">{children}</div>
        </div>
      </div>
    </div>
  )
}

export function Side({ text }) {
  return (
    <>
      <div>
        <div className="mpa-side-badge mpa-rise" style={{ animationDelay: '0.1s' }}>
          <Svg path={USER_ICON} className="mpa-icon mpa-icon--lg" />
        </div>
        <h2 className="mpa-side-title mpa-rise" style={{ animationDelay: '0.16s' }}>{text.sideTitle}</h2>
        <p className="mpa-side-lead mpa-rise" style={{ animationDelay: '0.22s' }}>{text.sideLead}</p>
      </div>
      <ul className="mpa-perks">
        {text.perks.map((perk, index) => (
          <li key={perk.title} className="mpa-perk mpa-rise" style={{ animationDelay: `${0.3 + index * 0.08}s` }}>
            <span className="mpa-perk-icon">
              <Svg path={PERK_ICONS[index]} className="mpa-icon mpa-icon--sm" />
            </span>
            <span>
              <span className="mpa-perk-title">{perk.title}</span>
              <span className="mpa-perk-text">{perk.text}</span>
            </span>
          </li>
        ))}
      </ul>
    </>
  )
}

export function Field({ label, hint, icon, children }) {
  return (
    <label className="mpa-label">
      <span className="mpa-label-text">{label}</span>
      <span className="mpa-control">
        <Svg path={icon} className="mpa-icon mpa-field-icon" />
        {children}
      </span>
      {hint ? <span className="mpa-field-hint">{hint}</span> : null}
    </label>
  )
}

export function PasswordField({ label, visible, onToggle, toggleLabel, inputProps, after }) {
  return (
    <label className="mpa-label">
      <span className="mpa-label-text">{label}</span>
      <span className="mpa-control">
        <Svg path={LOCK_ICON} className="mpa-icon mpa-field-icon" />
        <input type={visible ? 'text' : 'password'} className="mpa-input mpa-input--toggle" {...inputProps} />
        <button type="button" data-password-toggle className="mpa-eye" onClick={onToggle} aria-label={toggleLabel} aria-pressed={visible} data-tooltip={toggleLabel}>
          <Svg
            className="mpa-icon"
            path={visible
              ? 'M3 3l18 18M10.6 10.6a2 2 0 0 0 2.8 2.8M9.9 5.1A9.8 9.8 0 0 1 12 5c6 0 9.5 7 9.5 7a16 16 0 0 1-3.2 3.9M6.3 6.3A16 16 0 0 0 2.5 12S6 19 12 19a9.6 9.6 0 0 0 4-.9'
              : 'M2.5 12S6 5 12 5s9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7ZM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z'}
          />
        </button>
      </span>
      {after}
    </label>
  )
}

export function Strength({ value, labels, hint }) {
  return (
    <span className="mpa-strength">
      <span className="mpa-strength-bars">
        {[1, 2, 3, 4].map((level) => (
          <span key={level} className="mpa-strength-track">
            <span
              className="mpa-strength-fill"
              style={{ width: value >= level ? '100%' : '0%', backgroundColor: STRENGTH_COLORS[Math.max(0, value - 1)] }}
            />
          </span>
        ))}
      </span>
      <span className="mpa-strength-label">{value ? labels[value] : hint}</span>
    </span>
  )
}

export function ErrorBox({ children, shakeKey }) {
  if (!children) return null
  return (
    <p key={shakeKey} role="alert" className="mpa-alert">
      {children}
    </p>
  )
}

export function Spinner() {
  return <span className="mpa-spinner" aria-hidden="true" />
}

export function QuickLogin({ text, back }) {
  const next = encodeURIComponent(back)
  const buttons = [
    { href: `${ACCOUNT_SITE}/login?via=telegram&next=${next}`, label: text.telegram, icon: TELEGRAM_ICON },
    { href: `${ACCOUNT_SITE}/api/auth/github?next=${next}`, label: text.github, icon: GITHUB_ICON },
  ]
  return (
    <>
      <div className="mpa-quick">
        <div className="mpa-quick-text">
          <span className="mpa-perk-title">{text.quickTitle}</span>
          <span className="mpa-quick-hint">{text.quickHint}</span>
        </div>
        <div className="mpa-quick-buttons">
          {buttons.map((button) => (
            <a key={button.icon} href={button.href} className="mpa-quick-button" aria-label={button.label} data-tooltip={button.label}>
              <svg className="mpa-icon" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d={button.icon} />
              </svg>
            </a>
          ))}
        </div>
      </div>
      <div className="mpa-or">
        <span />
        {text.or}
        <span />
      </div>
    </>
  )
}
