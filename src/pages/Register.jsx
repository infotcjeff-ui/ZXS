import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AlertBanner from '../components/AlertBanner.jsx'
import { useAuth } from '../auth/AuthProvider.jsx'

function RegisterPage() {
  const { register, isAuthenticated, passwordRules } = useAuth()
  const navigate = useNavigate()
  const [alert, setAlert] = useState(null)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirm: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

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
    const result = await register(form)
    setLoading(false)
    if (!result.ok) {
      setAlert({ kind: 'error', message: result.message })
      return
    }
    setAlert({ kind: 'success', message: result.message })
    setTimeout(() => navigate('/dashboard', { replace: true }), 350)
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-10 px-4 py-10 lg:flex-row lg:py-14">
      <section className="w-full max-w-md">
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl shadow-black/40 backdrop-blur">
          <div className="absolute -left-12 -top-12 h-40 w-40 rounded-full bg-emerald-500/10 blur-3xl" />
          <div className="absolute -bottom-10 -right-10 h-36 w-36 rounded-full bg-sky-500/10 blur-3xl" />
          <div className="relative space-y-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-200/70">
                Register
              </p>
              <h2 className="mt-1 text-2xl font-semibold text-white">Create your account</h2>
              <p className="text-sm text-slate-300/80">
                Passwords stay client-side hashed. Strong policy enforced before submission.
              </p>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
              {alert && <AlertBanner kind={alert.kind} message={alert.message} />}

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-100" htmlFor="name">
                  Full name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={form.name}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-slate-100 outline-none ring-2 ring-transparent transition focus:border-emerald-400/50 focus:ring-emerald-500/40"
                  placeholder="Alex Mercer"
                  autoComplete="name"
                />
              </div>

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
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-slate-100 outline-none ring-2 ring-transparent transition focus:border-emerald-400/50 focus:ring-emerald-500/40"
                  placeholder="you@company.com"
                  autoComplete="email"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-100" htmlFor="password">
                  Password (any strength)
                </label>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={form.password}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-slate-100 outline-none ring-2 ring-transparent transition focus:border-emerald-400/50 focus:ring-emerald-500/40"
                  placeholder="••••••••"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="text-xs font-semibold text-emerald-200 hover:text-emerald-100"
                >
                  {showPassword ? 'Hide password' : 'Show password'}
                </button>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-100" htmlFor="confirm">
                  Confirm password
                </label>
                <input
                  id="confirm"
                  name="confirm"
                  type={showConfirm ? 'text' : 'password'}
                  required
                  value={form.confirm}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-slate-100 outline-none ring-2 ring-transparent transition focus:border-emerald-400/50 focus:ring-emerald-500/40"
                  placeholder="Match your password"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((p) => !p)}
                  className="text-xs font-semibold text-emerald-200 hover:text-emerald-100"
                >
                  {showConfirm ? 'Hide confirmation' : 'Show confirmation'}
                </button>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-slate-100 shadow-inner shadow-black/20 backdrop-blur">
                <p className="mb-2 font-semibold text-white">Password note</p>
                <ul className="grid grid-cols-1 gap-1 text-slate-200/80">
                  {passwordRules.map((rule) => (
                    <li key={rule} className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      {rule}
                    </li>
                  ))}
                </ul>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-sky-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-900/40 transition hover:from-emerald-400 hover:to-sky-400 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? 'Creating…' : 'Create account'}
              </button>
            </form>

            <p className="text-center text-sm text-slate-200/80">
              Already registered?{' '}
              <Link to="/login" className="font-semibold text-emerald-300 hover:text-emerald-200">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </section>

      <section className="flex-1 text-center lg:text-right">
        <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-200 ring-1 ring-white/10">
          Figma-inspired layout
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
        </p>
        <h1 className="text-4xl font-semibold leading-tight text-white md:text-5xl">
          Onboard with <span className="text-emerald-300">elevated UI</span>
        </h1>
        <p className="mt-4 max-w-xl text-base text-slate-200/80 lg:ml-auto">
          The layout mirrors modern Figma cards: soft glassmorphism, layered gradients, and
          accessible focus outlines to keep the flow consistent across devices.
        </p>
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:ml-auto">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-left text-sm text-slate-100 shadow-xl shadow-black/20 backdrop-blur">
            <p className="font-semibold text-white">Roles</p>
            <p className="mt-1 text-slate-200/80">
              New accounts are <span className="font-semibold text-emerald-200">member</span> by default.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-left text-sm text-slate-100 shadow-xl shadow-black/20 backdrop-blur">
            <p className="font-semibold text-white">Admin access</p>
            <p className="mt-1 text-slate-200/80">
              Admins can edit all users and todos; members can edit only their own.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}

export default RegisterPage


