'use client'

import { CALM_COOKIE, readPref, writePref } from '@/components/settings/sharedPrefs'

const STORAGE_KEY = 'kitten-calm'
const listeners = new Set()

export function calmMode() {
  if (typeof window === 'undefined') return false
  const shared = readPref(CALM_COOKIE)
  if (shared === 'on' || shared === 'off') return shared === 'on'
  try {
    return localStorage.getItem(STORAGE_KEY) === 'on'
  } catch {
    return false
  }
}

export function setCalmMode(next) {
  writePref(CALM_COOKIE, next ? 'on' : 'off')
  try {
    localStorage.setItem(STORAGE_KEY, next ? 'on' : 'off')
  } catch {}
  listeners.forEach((listener) => listener(next))
}

export function onCalmModeChange(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}
