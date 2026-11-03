'use client'

import { useEffect, useState } from 'react'
import { useCaptcha } from '@/components/mpa/useCaptcha'
import { errorText, getText } from '@/components/mpa/text'
import '@/components/mpa/mpa.css'

function safeLocalNext() {
  const next = new URLSearchParams(window.location.search).get('next') || ''
  return next.startsWith('/') && !next.startsWith('//') && !next.includes('\\') ? next : '/account'
}

export default function AuthPanel() {
  const [text, setText] = useState(getText)
  const [mode, setMode] = useState('login')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [website, setWebsite] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const loginProof = useCaptcha('login')
  const registerProof = useCaptcha('register')

  useEffect(() => {
    setText(getText())
    if (new URLSearchParams(window.location.search).get('mode') === 'register') setMode('register')
    fetch('/api/me', { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => { if (data?.user) window.location.replace(safeLocalNext()) })
      .catch(() => {})
  }, [])

  const submit = async (event) => {
    event.preventDefault()
    if (busy) return
    setBusy(true)
    setError('')
    try {
      const captcha = await (mode === 'login' ? loginProof() : registerProof())
      const res = await fetch(`/api/auth/${mode}`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password, captcha, website }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data?.user) {
        setError(errorText(text, data?.error))
        setBusy(false)
        return
      }
      window.location.assign(safeLocalNext())
    } catch {
      setError(errorText(text, 'unavailable'))
      setBusy(false)
    }
  }

  return (
    <div className="mpa-shell">
      <form className="mpa-card" onSubmit={submit}>
        <div className="mpa-tabs" role="tablist">
          {['login', 'register'].map((tab) => (
            <button
              key={tab}
              type="button"
              role="tab"
              aria-selected={mode === tab}
              className={`mpa-tab ${mode === tab ? 'mpa-tab--active' : ''}`}
              onClick={() => { setMode(tab); setError('') }}
            >
              {tab === 'login' ? text.login : text.register}
            </button>
          ))}
        </div>
        <p className="mpa-hint">{text.oneAccount}</p>
        <label className="mpa-field">
          <span>{text.username}</span>
          <input
            className="mpa-input"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            maxLength={64}
            required
          />
        </label>
        <label className="mpa-field">
          <span>{text.password}</span>
          <input
            className="mpa-input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            maxLength={256}
            required
          />
        </label>
        <input
          className="mpa-trap"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
        />
        {error && <p className="mpa-error" role="alert">{error}</p>}
        <button type="submit" className="mpa-btn mpa-btn--primary" disabled={busy}>
          {busy ? text.working : mode === 'login' ? text.signIn : text.signUp}
        </button>
      </form>
    </div>
  )
}
