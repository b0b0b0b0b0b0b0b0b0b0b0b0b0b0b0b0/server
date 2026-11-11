export const PALETTE_COOKIE = 'site-palette'
export const THEME_COOKIE = 'site-theme'
export const SOUNDS_COOKIE = 'site-kitten-sounds'
export const CALM_COOKIE = 'site-kitten-calm'
export const LOCALE_COOKIE = 'site-locale'

const MAX_AGE = 60 * 60 * 24 * 365
const THEMES = ['system', 'light', 'dark']

function domainPart() {
  const host = window.location.hostname
  return host === 'modrinth.black' || host.endsWith('.modrinth.black') ? ';domain=.modrinth.black' : ''
}

export function readPref(name) {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`))
  return match ? decodeURIComponent(match[1]) : null
}

export function writePref(name, value) {
  if (typeof document === 'undefined' || !value) return
  const domain = domainPart()
  if (domain) document.cookie = `${name}=;path=/;max-age=0;samesite=lax`
  document.cookie = `${name}=${encodeURIComponent(value)};path=/;max-age=${MAX_AGE};samesite=lax${domain}`
}

export function readTheme() {
  const theme = readPref(THEME_COOKIE)
  return THEMES.includes(theme) ? theme : 'system'
}

export function readPalette(known) {
  const palette = readPref(PALETTE_COOKIE)
  return palette && known[palette] ? palette : 'pink'
}

export function applyLook() {
  if (typeof window !== 'undefined' && typeof window.__siteLookApply === 'function') window.__siteLookApply()
}
