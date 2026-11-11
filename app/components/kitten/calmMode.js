'use client'

import { CALM_COOKIE, readPref } from '@/components/settings/sharedPrefs'

export function calmMode() {
  return readPref(CALM_COOKIE) === 'on'
}
