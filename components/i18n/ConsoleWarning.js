'use client'

import { useEffect } from 'react'
import { useT } from '@/components/i18n/I18nProvider'

let shown = false

export default function ConsoleWarning() {
  const t = useT()

  useEffect(() => {
    if (shown) return undefined
    const warn = () => {
      if (shown) return
      shown = true
      console.log('%c🐉', 'padding:50px 0px;font-size:300px;color:transparent;text-shadow:0 0 0 #22b369')
      console.log('%c' + t('console.stop'), 'color: #1a9456; font-size: 70px; font-weight: bold;')
      console.log('%c' + t('console.warn'), 'color: #d6d6d6; font-size: 21px;')
      console.log('%c' + t('console.report'), 'color: red; font-size: 21px;')
    }
    if (document.readyState === 'complete') {
      warn()
      return undefined
    }
    window.addEventListener('load', warn)
    return () => window.removeEventListener('load', warn)
  }, [t])

  return null
}
