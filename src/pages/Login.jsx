import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import AlertBanner from '../components/AlertBanner.jsx'
import { useAuth } from '../auth/AuthProvider.jsx'

function LoginPage() {
  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [alert, setAlert] = useState(null)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ email: '', password: '' })

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard', { replace: true })
  }, [isAuthenticated, navigate])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setAlert(null)
    setLoading(true)
    const result = await login(form)
    setLoading(false)
    if (!result.ok) {
      setAlert({ kind: 'error', message: result.message })
      return
    }
    setAlert({ kind: 'success', message: result.message })
    const redirectTo = location.state?.from ?? '/dashboard'
    setTimeout(() => navigate(redirectTo, { replace: true }), 350)
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-10 px-4 py-10 lg:flex-row lg:py-14">
      <section className="flex-1 text-center lg:text-left">
        <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-sky-200 ring-1 ring-white/10">
          Secure Access
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
        </p>
        <h1 className="text-4xl font-semibold leading-tight text-white md:text-5xl">
          Welcome back to <span className="text-sky-300">ZXS Console</span>
        </h1>
        <p className="mt-4 max-w-xl text-base text-slate-200/80">
          Sign in with your saved credentials to access your personalized dashboard, quick
          metrics, and secure controls. Session tokens refresh on each login.
        </p>
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-left text-sm text-slate-100 shadow-xl shadow-black/20 backdrop-blur">
            <p className="font-semibold text-white">Roles</p>
            <p className="mt-1 text-slate-200/80">
              Admins see reminders and can edit all todos/users. Members can edit their own.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-left text-sm text-slate-100 shadow-xl shadow-black/20 backdrop-blur">
            <p className="font-semibold text-white">Shared todos</p>
            <p className="mt-1 text-slate-200/80">
              Everyone can view all todos; edit rights depend on your role.
            </p>
          </div>
        </div>
      </section>

      <section className="w-full max-w-md">
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl shadow-black/40 backdrop-blur">
          <div className="absolute -left-10 -top-10 h-36 w-36 rounded-full bg-sky-500/10 blur-3xl" />
          <div className="absolute -bottom-8 -right-10 h-32 w-32 rounded-full bg-fuchsia-500/10 blur-3xl" />
          <div className="relative space-y-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-200/70">
                Login
              </p>
              <h2 className="mt-1 text-2xl font-semibold text-white">Sign in securely</h2>
              <p className="text-sm text-slate-300/80">
                Use the same email you registered. Tokens rotate on success.
              </p>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
              {alert && <AlertBanner kind={alert.kind} message={alert.message} />}

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-100" htmlFor="email">
                  Work email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={form.email}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-slate-100 outline-none ring-2 ring-transparent transition focus:border-sky-400/50 focus:ring-sky-500/40"
                  placeholder="you@company.com"
                  autoComplete="email"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm font-medium text-slate-100">
                  <label htmlFor="password">Password</label>
                  <span className="text-xs text-slate-300/70">Any password allowed</span>
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={form.password}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-slate-100 outline-none ring-2 ring-transparent transition focus:border-sky-400/50 focus:ring-sky-500/40"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-900/40 transition hover:from-sky-400 hover:to-indigo-400 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? 'Verifying…' : 'Sign in'}
              </button>
            </form>

            <p className="text-center text-sm text-slate-200/80">
              New here?{' '}
              <Link to="/register" className="font-semibold text-sky-300 hover:text-sky-200">
                Create your account
              </Link>
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}

export default LoginPage


