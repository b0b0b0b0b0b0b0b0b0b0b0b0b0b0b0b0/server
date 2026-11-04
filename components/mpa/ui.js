'use client'

import '@/components/mpa/mpa.css'

const PERK_ICONS = [
  'M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z',
  'M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3',
  'M19 14c1.5-1.5 3-3.2 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.8 0-3 .5-4.5 2-1.5-1.5-2.7-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4 3 5.5l7 7Z',
]

export const USER_ICON = 'M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z'
const LOCK_ICON = 'M7 11V7a5 5 0 0 1 10 0v4M5 11h14a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2Z'
const BACK_ICON = 'M19 12H5M12 19l-7-7 7-7'
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
        <button type="button" data-password-toggle className="mpa-eye" onClick={onToggle} aria-label={toggleLabel} aria-pressed={visible}>
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
