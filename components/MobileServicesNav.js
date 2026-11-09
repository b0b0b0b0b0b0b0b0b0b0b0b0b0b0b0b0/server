'use client'

import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { useT } from '@/components/i18n/I18nProvider'
import './mobile-services-nav.css'

const RAIL_MS = 520
const ROT_MS = 300
const PANEL_MS = 420

export default function MobileServicesNav({
  title,
  links,
  account,
}) {
  const t = useT()
  const panelId = useId()
  const timersRef = useRef([])
  const [railExtended, setRailExtended] = useState(false)
  const [chevronDown, setChevronDown] = useState(false)
  const [panelExpanded, setPanelExpanded] = useState(false)
  const [busy, setBusy] = useState(false)

  const schedule = useCallback((fn, ms) => {
    timersRef.current.push(window.setTimeout(fn, ms))
  }, [])

  const clearTimers = useCallback(() => {
    timersRef.current.forEach((id) => window.clearTimeout(id))
    timersRef.current = []
  }, [])

  useEffect(() => () => clearTimers(), [clearTimers])

  const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const runOpen = useCallback(() => {
    clearTimers()
    if (reducedMotion()) {
      setRailExtended(true)
      setChevronDown(true)
      setPanelExpanded(true)
      return
    }
    setBusy(true)
    requestAnimationFrame(() => requestAnimationFrame(() => setRailExtended(true)))
    schedule(() => {
      setChevronDown(true)
      schedule(() => {
        setPanelExpanded(true)
        schedule(() => setBusy(false), PANEL_MS)
      }, ROT_MS)
    }, RAIL_MS)
  }, [clearTimers, schedule])

  const runClose = useCallback(() => {
    clearTimers()
    if (reducedMotion()) {
      setPanelExpanded(false)
      setChevronDown(false)
      setRailExtended(false)
      return
    }
    setBusy(true)
    setPanelExpanded(false)
    schedule(() => {
      setChevronDown(false)
      schedule(() => {
        setRailExtended(false)
        setBusy(false)
      }, ROT_MS)
    }, PANEL_MS)
  }, [clearTimers, schedule])

  const toggle = () => {
    if (busy) return
    if (panelExpanded) runClose()
    else runOpen()
  }

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)')
    const onChange = () => {
      if (!mq.matches) return
      clearTimers()
      setRailExtended(false)
      setChevronDown(false)
      setPanelExpanded(false)
      setBusy(false)
    }
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [clearTimers])

  return (
    <div className="smn">
      <div className="smn-toolbar">
        <button
          type="button"
          className="smn-trigger"
          aria-expanded={panelExpanded}
          aria-busy={busy}
          aria-controls={panelId}
          aria-label={panelExpanded ? t('nav.servicesHide') : t('nav.servicesShow')}
          onClick={toggle}
        >
          <span className="smn-title">
            <span className="smn-dot" aria-hidden="true" />
            {title}
          </span>
          <span className="smn-strip" aria-hidden="true">
            <span className={`smn-rail${railExtended ? ' smn-rail--extended' : ''}`} />
            <span className={`smn-rider${railExtended ? ' smn-rider--end' : ''}`}>
              <span className={`smn-rider-inner${chevronDown ? ' smn-rider-inner--down' : ''}`}>
                <svg className="smn-chevron" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </span>
          </span>
        </button>
        {account}
      </div>
      <div
        id={panelId}
        className={`smn-panel ${panelExpanded ? 'smn-panel--open' : 'smn-panel--collapsed'}`}
        style={{ gridTemplateRows: panelExpanded ? '1fr' : '0fr' }}
        aria-hidden={!panelExpanded}
      >
        <div className="smn-panel-inner">
          <div className="smn-links">
            {links.map((link) => (
              <a key={link.href} href={link.href} className="smn-link" tabIndex={panelExpanded ? undefined : -1}>
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
