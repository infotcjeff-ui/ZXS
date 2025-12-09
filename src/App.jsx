import { useEffect, useMemo, useState } from 'react'
import './index.css'

const passwordChecks = [
  { key: 'length', label: 'At least 12 characters', test: (p) => p.length >= 12 },
  { key: 'upper', label: 'Uppercase letter', test: (p) => /[A-Z]/.test(p) },
  { key: 'lower', label: 'Lowercase letter', test: (p) => /[a-z]/.test(p) },
  { key: 'number', label: 'Number', test: (p) => /\d/.test(p) },
  { key: 'symbol', label: 'Symbol', test: (p) => /[^A-Za-z0-9]/.test(p) },
]

const emailRegex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/

const defaultMetrics = [
  { label: 'Last login location', value: 'Chicago, IL (approx.)', risk: 'Verified' },
  { label: '2FA status', value: 'Enabled (TOTP)', risk: 'Strongly recommended' },
  { label: 'Sessions', value: '1 active, 0 risky', risk: 'Monitor' },
]

const alerts = [
  { title: 'Password hygiene', message: 'Rotate passwords every 90 days; avoid reuse.' },
  { title: 'Device trust', message: 'Enroll at least one backup factor for recovery.' },
  { title: 'Network safety', message: 'Prefer private networks; avoid unknown Wi‑Fi.' },
]

function hashPassword(text) {
  const encoder = new TextEncoder()
  const data = encoder.encode(text)
  if (window.crypto?.subtle) {
    return window.crypto.subtle.digest('SHA-256', data).then((buf) => {
      const view = new DataView(buf)
      let hex = ''
      for (let i = 0; i < view.byteLength; i++) {
        hex += view.getUint8(i).toString(16).padStart(2, '0')
      }
      return hex
    })
  }
  // Fallback for older browsers
  return Promise.resolve(btoa(text))
}

function AlertBanner({ alert }) {
  if (!alert) return null
  const intent = alert.type === 'error' ? 'from-red-500/80 to-rose-500/80' : 'from-emerald-500/80 to-teal-500/80'
  return (
    <div className={`glass-panel border-white/20 bg-gradient-to-r ${intent} p-4 text-sm text-white shadow-lg`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <p className="font-semibold">{alert.title}</p>
          <p className="text-white/80">{alert.message}</p>
        </div>
        <span className="pill">{alert.timestamp}</span>
      </div>
    </div>
  )
}

function PasswordChecklist({ password }) {
  return (
    <div className="grid grid-cols-2 gap-2 text-xs text-white/80">
      {passwordChecks.map((item) => {
        const ok = item.test(password)
        return (
          <div key={item.key} className={`flex items-center gap-2 rounded-lg border px-3 py-2 ${ok ? 'border-emerald-400/40 bg-emerald-500/10' : 'border-white/10 bg-white/5'}`}>
            <span className={`h-2 w-2 rounded-full ${ok ? 'bg-emerald-400 shadow-[0_0_0_4px] shadow-emerald-400/20' : 'bg-white/30'}`} />
            <span>{item.label}</span>
          </div>
        )
      })}
    </div>
  )
}

function Dashboard({ user, onLogout }) {
  return (
    <div className="mx-auto max-w-6xl px-6 py-10 space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="pill">Secure workspace</p>
          <h1 className="mt-2 text-3xl font-bold text-white">Welcome back, {user.name || user.email}</h1>
          <p className="text-white/70">Your session is protected with client-side hashing and session locking.</p>
        </div>
        <button className="btn-secondary" onClick={onLogout}>
          Sign out
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 glass-panel p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/60 text-sm">Threat watch</p>
              <h2 className="text-xl font-semibold text-white">Realtime security posture</h2>
            </div>
            <span className="pill bg-emerald-500/20 text-emerald-200 border-emerald-400/30">Healthy</span>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {defaultMetrics.map((metric) => (
              <div key={metric.label} className="rounded-xl border border-white/10 bg-white/5 p-4 shadow-inner">
                <p className="text-sm text-white/60">{metric.label}</p>
                <p className="mt-2 text-lg font-semibold text-white">{metric.value}</p>
                <p className="text-xs text-white/60">{metric.risk}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="glass-panel p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Recommended actions</h3>
            <span className="pill bg-sky-500/20 text-sky-100 border-sky-400/30">Hardening</span>
          </div>
          <div className="space-y-3">
            <button className="btn-primary w-full">Enable WebAuthn key</button>
            <button className="btn-secondary w-full">Review active devices</button>
            <button className="btn-secondary w-full">Download backup codes</button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="glass-panel p-6 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Alerts & tips</h3>
            <span className="pill bg-indigo-500/20 text-indigo-100 border-indigo-400/30">Live</span>
          </div>
          {alerts.map((item) => (
            <div key={item.title} className="rounded-xl border border-white/10 bg-white/5 p-3">
              <p className="text-sm font-semibold text-white">{item.title}</p>
              <p className="text-sm text-white/70">{item.message}</p>
            </div>
          ))}
        </div>
        <div className="glass-panel p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Audit log</h3>
            <span className="pill bg-white/10">Demo</span>
          </div>
          <div className="space-y-2 text-sm text-white/70">
            <div className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2">
              <span>Login verified</span>
              <span className="pill bg-emerald-500/20 text-emerald-100 border-emerald-400/30">SHA-256 check</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2">
              <span>Session locked</span>
              <span className="pill bg-sky-500/20 text-sky-100 border-sky-400/30">Local only</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2">
              <span>Policy check</span>
              <span className="pill bg-amber-500/20 text-amber-100 border-amber-400/30">Strong password</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function App() {
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [alert, setAlert] = useState(null)
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(false)

  const passwordStrength = useMemo(() => {
    const passed = passwordChecks.reduce((acc, check) => acc + Number(check.test(form.password)), 0)
    return Math.round((passed / passwordChecks.length) * 100)
  }, [form.password])

  useEffect(() => {
    const savedSession = localStorage.getItem('demoSession')
    if (savedSession) {
      setSession(JSON.parse(savedSession))
    }
  }, [])

  const setTimedAlert = (nextAlert) => {
    const timestamp = new Date().toLocaleTimeString()
    setAlert({ ...nextAlert, timestamp })
    setTimeout(() => setAlert(null), 4000)
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setLoading(true)
    setAlert(null)

    if (!form.name.trim() || !form.email.trim() || !form.password || !form.confirm) {
      setTimedAlert({ type: 'error', title: 'Missing fields', message: 'Please fill in all required fields.' })
      setLoading(false)
      return
    }

    if (!emailRegex.test(form.email)) {
      setTimedAlert({ type: 'error', title: 'Invalid email', message: 'Use a valid email format (e.g. name@example.com).' })
      setLoading(false)
      return
    }

    if (form.password !== form.confirm) {
      setTimedAlert({ type: 'error', title: 'Passwords do not match', message: 'Please confirm the same password.' })
      setLoading(false)
      return
    }

    const allChecksPass = passwordChecks.every((c) => c.test(form.password))
    if (!allChecksPass) {
      setTimedAlert({ type: 'error', title: 'Weak password', message: 'Meet all password requirements for stronger security.' })
      setLoading(false)
      return
    }

    const storedUser = JSON.parse(localStorage.getItem('demoUser') || 'null')
    if (storedUser?.email === form.email) {
      setTimedAlert({ type: 'error', title: 'User exists', message: 'An account with this email is already registered.' })
      setLoading(false)
      return
    }

    const passwordHash = await hashPassword(form.password)
    const userRecord = { name: form.name.trim(), email: form.email.toLowerCase(), passwordHash }
    localStorage.setItem('demoUser', JSON.stringify(userRecord))
    localStorage.setItem('demoSession', JSON.stringify(userRecord))
    setSession(userRecord)
    setMode('login')
    setTimedAlert({ type: 'success', title: 'Registration complete', message: 'Session established locally (demo only).' })
    setLoading(false)
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setAlert(null)

    const storedUser = JSON.parse(localStorage.getItem('demoUser') || 'null')
    if (!storedUser) {
      setTimedAlert({ type: 'error', title: 'No account found', message: 'Please register first to create secure credentials.' })
      setLoading(false)
      return
    }

    const incomingHash = await hashPassword(form.password)
    if (storedUser.email !== form.email.toLowerCase() || storedUser.passwordHash !== incomingHash) {
      setTimedAlert({ type: 'error', title: 'Access denied', message: 'Email or password is incorrect. Security log updated.' })
      setLoading(false)
      return
    }

    localStorage.setItem('demoSession', JSON.stringify(storedUser))
    setSession(storedUser)
    setTimedAlert({ type: 'success', title: 'Login successful', message: 'Session locked to this browser (demo).' })
    setLoading(false)
  }

  const handleLogout = () => {
    localStorage.removeItem('demoSession')
    setSession(null)
    setTimedAlert({ type: 'success', title: 'Signed out', message: 'Session cleared locally.' })
  }

  if (session) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
        <Dashboard user={session} onLogout={handleLogout} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center px-4 py-10">
        <div className="w-full space-y-4 md:w-5/6 lg:w-3/4">
          <div className="flex items-center justify-between">
            <div>
              <p className="pill">Figma-inspired glass UI</p>
              <h1 className="mt-2 text-3xl font-bold text-white">Secure Access Portal</h1>
              <p className="text-white/70">Client-side hashing, strong validation, and rich feedback.</p>
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <span className="pill bg-emerald-500/20 text-emerald-100 border-emerald-400/30">SHA-256</span>
              <span className="pill bg-sky-500/20 text-sky-100 border-sky-400/30">Local-first</span>
            </div>
          </div>

          <AlertBanner alert={alert} />

          <div className="grid gap-6 md:grid-cols-[1.2fr_1fr] items-start">
            <div className="glass-panel p-8 space-y-6">
              <div className="flex items-center gap-2 rounded-full bg-white/10 p-1 text-sm">
                <button
                  className={`flex-1 rounded-full px-4 py-2 transition ${mode === 'login' ? 'bg-sky-500 text-white shadow-md shadow-sky-500/30' : 'text-white/70'}`}
                  onClick={() => setMode('login')}
                >
                  Login
                </button>
                <button
                  className={`flex-1 rounded-full px-4 py-2 transition ${mode === 'register' ? 'bg-fuchsia-500 text-white shadow-md shadow-fuchsia-500/30' : 'text-white/70'}`}
                  onClick={() => setMode('register')}
                >
                  Register
                </button>
              </div>

              <form className="space-y-4" onSubmit={mode === 'login' ? handleLogin : handleRegister}>
                {mode === 'register' && (
                  <div className="space-y-2">
                    <label className="text-sm text-white/70">Full name</label>
                    <input
                      className="input"
                      name="name"
                      autoComplete="name"
                      placeholder="Alex Johnson"
                      value={form.name}
                      onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                )}
                <div className="space-y-2">
                  <label className="text-sm text-white/70">Email</label>
                  <input
                    className="input"
                    type="email"
                    name="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="flex items-center justify-between text-sm text-white/70">
                    <span>Password</span>
                    {mode === 'login' ? <span className="pill bg-white/5">Never stored in plain text</span> : null}
                  </label>
                  <input
                    className="input"
                    type="password"
                    name="password"
                    autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                    placeholder="Min 12 chars with symbols"
                    value={form.password}
                    onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
                    required
                  />
                  {mode === 'register' && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs text-white/60">
                        <span>Password strength</span>
                        <span className="pill">{passwordStrength}%</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-white/10">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-rose-500 via-amber-400 to-emerald-400 transition-all duration-300"
                          style={{ width: `${passwordStrength}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {mode === 'register' && (
                  <div className="space-y-2">
                    <label className="text-sm text-white/70">Confirm password</label>
                    <input
                      className="input"
                      type="password"
                      name="confirm"
                      autoComplete="new-password"
                      placeholder="Repeat password"
                      value={form.confirm}
                      onChange={(e) => setForm((prev) => ({ ...prev, confirm: e.target.value }))}
                      required
                    />
                  </div>
                )}

                <button className="btn-primary w-full" type="submit" disabled={loading}>
                  {loading ? 'Please wait…' : mode === 'login' ? 'Login securely' : 'Create secure account'}
                </button>

                <p className="text-xs text-white/60">
                  Demo only: credentials hashed locally with SHA-256 and stored in browser storage. For production, add a secure backend
                  with salted hashing, rate limiting, and device-based MFA.
                </p>
              </form>
            </div>

            <div className="glass-panel p-6 space-y-5 border border-sky-500/10">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Security checklist</h3>
                <span className="pill bg-sky-500/20 text-sky-100 border-sky-400/30">Live</span>
              </div>
              <PasswordChecklist password={form.password} />
              <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
                <p className="font-semibold text-white">Design tokens</p>
                <p className="mt-1">Palette · Sky 500, Indigo 500, Fuchsia 500 · Glass layers · 16px radius · Soft shadows</p>
                <p className="mt-1">Typography · Inter · Semi-bold headings · Tight leading · Figma-ready spacing scale.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
