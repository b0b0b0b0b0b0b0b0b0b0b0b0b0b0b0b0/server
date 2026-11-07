'use client'

import { createContext, useCallback, useContext, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { LOCALE_COOKIE, format, htmlLang, lookup } from '@/lib/i18n/locales'

const I18nContext = createContext({ locale: 'ru', messages: {} })

function readLocaleCookie() {
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${LOCALE_COOKIE}=([^;]*)`))
  return match ? decodeURIComponent(match[1]) : null
}

export function I18nProvider({ locale, messages, children }) {
  const router = useRouter()

  useEffect(() => {
    document.documentElement.lang = htmlLang(locale)
    const check = () => {
      const shared = readLocaleCookie()
      if (shared && shared !== locale) router.refresh()
    }
    const onVisible = () => {
      if (document.visibilityState === 'visible') check()
    }
    window.addEventListener('focus', check)
    window.addEventListener('site-locale-changed', check)
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      window.removeEventListener('focus', check)
      window.removeEventListener('site-locale-changed', check)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [locale, router])

  return <I18nContext.Provider value={{ locale, messages }}>{children}</I18nContext.Provider>
}

export function useLocale() {
  return useContext(I18nContext).locale
}

export function useMessages(key) {
  const { messages } = useContext(I18nContext)
  return key ? lookup(messages, key) : messages
}

export function useT() {
  const { messages } = useContext(I18nContext)
  return useCallback(
    /** @param {string} key @param {Record<string, string | number>} [vars] @returns {any} */
    (key, vars) => {
      const value = lookup(messages, key)
      return format(value === undefined ? key : value, vars)
    },
    [messages],
  )
}
