import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../auth/AuthProvider.jsx'

function MetricCard({ label, value, trend, tone }) {
  const toneStyles = {
    up: 'text-emerald-300 bg-emerald-500/10 ring-emerald-500/20',
    down: 'text-rose-300 bg-rose-500/10 ring-rose-500/20',
    steady: 'text-sky-200 bg-sky-500/10 ring-sky-500/20',
  }
  const style = toneStyles[tone] ?? toneStyles.steady

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-xl shadow-black/30 backdrop-blur">
      <p className="text-sm font-medium text-slate-200/90">{label}</p>
      <div className="mt-3 flex items-center justify-between">
        <p className="text-3xl font-semibold text-white">{value}</p>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ring-1 ${style}`}
        >
          {trend}
        </span>
      </div>
    </div>
  )
}

function Dashboard() {
  const { session, logout, fetchTodos, fetchCompanies } = useAuth()
  const [companies, setCompanies] = useState([])

  useEffect(() => {
    const load = async () => {
      const list = await fetchCompanies()
      setCompanies(list)
    }
    load()
  }, [fetchCompanies])

  const todos = useMemo(() => fetchTodos(), [fetchTodos])
  const todoStats = useMemo(() => {
    const total = todos.length
    const done = todos.filter((t) => t.done).length
    const mine = todos.filter((t) => t.userEmail === session?.email).length
    return {
      total,
      done,
      mine,
      pending: total - done,
    }
  }, [todos, session?.email])

  const myCompanies = useMemo(
    () => companies.filter((c) => c.ownerEmail?.toLowerCase() === session?.email?.toLowerCase()),
    [companies, session?.email],
  )

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10 lg:py-14">
      <div className="rounded-3xl border border-white/10 bg-gradient-to-r from-white/10 via-white/5 to-white/5 p-8 shadow-2xl shadow-black/40 backdrop-blur">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-200/70">
              Dashboard
            </p>
            <h1 className="mt-1 text-3xl font-semibold text-white">Welcome, {session?.name}</h1>
            <p className="text-sm text-slate-200/80">
              Your session token is locally stored and rotates each login. You can end it anytime.
            </p>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 shadow-inner shadow-black/20 backdrop-blur">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/20 text-lg font-semibold text-sky-100">
              {session?.name?.[0]?.toUpperCase()}
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-white">{session?.name}</span>
              <span className="text-xs text-slate-200/80">{session?.email}</span>
            </div>
            <button
              type="button"
              onClick={logout}
              className="ml-2 rounded-xl bg-white/10 px-3 py-2 text-xs font-semibold text-rose-100 ring-1 ring-rose-500/30 transition hover:bg-rose-500/10 hover:text-white"
            >
              Sign out
            </button>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-slate-100 shadow-lg shadow-black/30 backdrop-blur">
            <p className="text-sm font-semibold text-white">Todo summary</p>
            <ul className="mt-3 space-y-2 text-sm text-slate-200/80">
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Total todos:{' '}
                <span className="font-semibold text-white">{todoStats.total || 0}</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Completed:{' '}
                <span className="font-semibold text-white">{todoStats.done || 0}</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Pending:{' '}
                <span className="font-semibold text-white">{todoStats.pending || 0}</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Your todos:{' '}
                <span className="font-semibold text-white">{todoStats.mine || 0}</span>
              </li>
            </ul>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-slate-100 shadow-lg shadow-black/30 backdrop-blur">
            <p className="text-sm font-semibold text-white">Reminder (admins only)</p>
            {session?.role === 'admin' ? (
              <ul className="mt-3 space-y-2 text-sm text-slate-200/80">
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  Admin can edit all todos and all user records.
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  Members can edit only their own todos and profile.
                </li>
              </ul>
            ) : (
              <p className="mt-2 text-sm text-slate-200/70">Reserved for admin.</p>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-slate-100 shadow-xl shadow-black/30 backdrop-blur">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-white">Your companies</p>
              <p className="text-sm text-slate-200/80">
                Companies linked to your account. Manage them in the Companies section.
              </p>
            </div>
          </div>
          {myCompanies.length === 0 ? (
            <p className="text-sm text-slate-200/70">No companies yet.</p>
          ) : (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {myCompanies.map((c) => (
                <div
                  key={c.id}
                  className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-inner shadow-black/20"
                >
                  <p className="text-base font-semibold text-white">{c.name}</p>
                  <p className="text-xs text-slate-300">
                    {c.industry || '—'} {c.size ? `• ${c.size}` : ''}
                  </p>
                  <p className="mt-1 text-sm text-slate-200/80">{c.address || 'No address'}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard


