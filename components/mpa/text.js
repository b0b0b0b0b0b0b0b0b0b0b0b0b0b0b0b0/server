'use client'

import { useMessages } from '@/components/i18n/I18nProvider'

export function useMpaText() {
  return useMessages('mpa') || {}
}

export function errorText(text, code) {
  return text.errors?.[code] || text.errors?.unavailable || code
}

export function passwordStrength(password) {
  if (!password) return 0
  let score = 0
  if (password.length >= 8) score += 1
  if (password.length >= 12) score += 1
  if (/[a-zа-яё]/.test(password) && /[A-ZА-ЯЁ]/.test(password)) score += 1
  if (/\d/.test(password) && /[^\dA-Za-zА-Яа-яЁё]/.test(password)) score += 1
  return Math.max(1, score)
}
