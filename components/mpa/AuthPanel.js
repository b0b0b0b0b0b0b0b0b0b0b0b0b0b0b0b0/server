'use client'

import { useEffect, useState } from 'react'
import GuardKitten from '@/components/mpa/Kitten'
import { useCaptcha } from '@/components/mpa/useCaptcha'
import { errorText, passwordStrength, useMpaText } from '@/components/mpa/text'
import { ErrorBox, Field, Frame, PasswordField, QuickLogin, Side, Spinner, Strength, Svg, USER_ICON } from '@/components/mpa/ui'
import { randomNickname } from '@/components/mpa/nickname'

const INSERT_PATH = 'M9 10l-5 5 5 5M20 4v7a4 4 0 0 1-4 4H4'
const DICE_PATH = 'M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2ZM8.5 8.5h.01M15.5 8.5h.01M12 12h.01M8.5 15.5h.01M15.5 15.5h.01'

function safeLocalNext() {
  const next = new URLSearchParams(window.location.search).get('next') || ''
  return next.startsWith('/') && !next.startsWith('//') && !next.includes('\\') ? next : '/account'
}

export default function AuthPanel() {
  const text = useMpaText()
  const [mode, setMode] = useState('login')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [website, setWebsite] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [example, setExample] = useState('')
  const [focused, setFocused] = useState(null)
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState({ text: '', id: 0 })
  const [back, setBack] = useState('')
  const loginProof = useCaptcha('login')
  const registerProof = useCaptcha('register')
  const isRegister = mode === 'register'

  useEffect(() => {
    setExample(randomNickname())
  }, [])

  const fillNickname = () => {
    if (!username && example) {
      setUsername(example)
      return
    }
    let next = randomNickname()
    while (next === username) next = randomNickname()
    setUsername(next)
  }

  useEffect(() => {
    setBack(window.location.origin + safeLocalNext())
    if (new URLSearchParams(window.location.search).get('mode') === 'register') setMode('register')
    fetch('/api/me', { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => { if (data?.user) window.location.replace(safeLocalNext()) })
      .catch(() => {})
  }, [])

  const fail = (code) => setError((prev) => ({ text: errorText(text, code), id: prev.id + 1 }))

  const switchMode = (next) => {
    setMode(next)
    setError({ text: '', id: 0 })
  }

  const submit = async (event) => {
    event.preventDefault()
    if (busy || done) return
    setBusy(true)
    setError((prev) => ({ text: '', id: prev.id }))
    try {
      const captcha = await (isRegister ? registerProof() : loginProof())
      const res = await fetch(`/api/auth/${mode}`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password, captcha, website }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data?.user) {
        fail(data?.error)
        setBusy(false)
        return
      }
      setDone(true)
      window.location.assign(safeLocalNext())
    } catch {
      fail('unavailable')
      setBusy(false)
    }
  }

  return (
    <Frame side={<Side text={text} />} home={text.home}>
      <div key={mode} className={`mpa-swap ${isRegister ? 'mpa-swap--right' : 'mpa-swap--left'}`}>
        <div className="mpa-head">
          <div>
            <h1 className="mpa-title">{isRegister ? text.registerTitle : text.loginTitle}</h1>
            <p className="mpa-lead">{isRegister ? text.registerLead : text.loginLead}</p>
          </div>
          <GuardKitten field={focused} reveal={showPassword} typed={username.length} label={text.petKitten} />
        </div>

        {back ? <QuickLogin text={text} back={back} /> : null}

        <form onSubmit={submit} className="mpa-form">
          <Field label={text.username} hint={isRegister ? text.usernameHint : null} icon={USER_ICON}>
            <input
              className={isRegister ? 'mpa-input mpa-input--toggle' : 'mpa-input'}
              name="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onFocus={() => setFocused('username')}
              onBlur={() => setFocused((current) => (current === 'username' ? null : current))}
              placeholder={example ? (text.usernamePlaceholder || '').replace('{name}', example) : ''}
              autoComplete="username"
              autoCapitalize="none"
              spellCheck={false}
              maxLength={24}
              required
            />
            {isRegister ? (
              <button type="button" className={username ? 'mpa-eye mpa-dice' : 'mpa-eye'} onClick={fillNickname} aria-label={username ? text.randomNick : text.useNick} data-tooltip={username ? text.randomNick : text.useNick}>
                <Svg path={username ? DICE_PATH : INSERT_PATH} />
              </button>
            ) : null}
          </Field>

          <PasswordField
            label={text.password}
            visible={showPassword}
            onToggle={() => setShowPassword((value) => !value)}
            toggleLabel={showPassword ? text.hidePassword : text.showPassword}
            inputProps={{
              name: 'password',
              value: password,
              onChange: (e) => setPassword(e.target.value),
              onFocus: () => setFocused('password'),
              onBlur: (e) => {
                if (e.relatedTarget?.hasAttribute?.('data-password-toggle')) return
                setFocused((current) => (current === 'password' ? null : current))
              },
              placeholder: isRegister ? text.newPasswordPlaceholder : text.passwordPlaceholder,
              autoComplete: isRegister ? 'new-password' : 'current-password',
              maxLength: 128,
              required: true,
            }}
            after={isRegister ? <Strength value={passwordStrength(password)} labels={text.strength} hint={text.passwordHint} /> : null}
          />

          <input
            className="mpa-trap"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
          />

          <ErrorBox shakeKey={error.id}>{error.text}</ErrorBox>

          <button type="submit" className="mpa-submit" disabled={busy || done || !username || !password}>
            {busy || done ? <Spinner /> : null}
            {isRegister ? text.submitRegister : text.submitLogin}
          </button>
        </form>

        {isRegister ? <p className="mpa-note">{text.noRecovery}</p> : null}

        <p className="mpa-switch">
          {isRegister ? text.haveAccount : text.noAccount}{' '}
          <button type="button" className="mpa-link" onClick={() => switchMode(isRegister ? 'login' : 'register')}>
            {isRegister ? text.switchLogin : text.switchRegister}
          </button>
        </p>
      </div>
    </Frame>
  )
}
