import { useRef, useState } from 'react'
import { useAuth } from '../auth/AuthProvider.jsx'
import AlertBanner from '../components/AlertBanner.jsx'

function ProfilePage() {
  const { session, updateSelf } = useAuth()
  const formRef = useRef(null)
  const [form, setForm] = useState({
    name: session?.name || '',
    email: session?.email || '',
    password: '',
  })
  const [alert, setAlert] = useState(null)
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    const res = await updateSelf(form)
    setSaving(false)
    setAlert({
      kind: res.ok ? 'success' : 'error',
      message: res.message || (res.ok ? 'Profile updated' : 'Update failed'),
    })
    if (res.ok) setForm((f) => ({ ...f, password: '' }))
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-10 lg:py-14">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/30 backdrop-blur">
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-200/70">
            User Information
          </p>
          <h1 className="text-3xl font-semibold text-white">Your account</h1>
          <p className="text-sm text-slate-200/80">
            View your details and update name, email, or password. Changes refresh your session.
          </p>
          <div className="mt-2">
            <button
              type="button"
              onClick={() => formRef.current?.scrollIntoView({ behavior: 'smooth' })}
              className="rounded-xl bg-gradient-to-r from-sky-500 to-indigo-500 px-3 py-2 text-xs font-semibold text-white shadow-lg shadow-sky-900/40 transition hover:from-sky-400 hover:to-indigo-400"
            >
              Edit info
            </button>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <InfoCard label="Name" value={session?.name} />
          <InfoCard label="Email" value={session?.email} />
          <InfoCard label="Role" value={session?.role} />
          <InfoCard
            label="Signed in at"
            value={session?.signedInAt ? new Date(session.signedInAt).toLocaleString() : '—'}
          />
        </div>

        <div
          ref={formRef}
          className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-5 shadow-inner shadow-black/20"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-white">Edit profile</p>
              <p className="text-xs text-slate-200/70">Update your own information here.</p>
            </div>
            <button
              type="button"
              onClick={() => setForm({ name: session?.name || '', email: session?.email || '', password: '' })}
              className="text-xs font-semibold text-sky-200 hover:text-sky-100"
            >
              Reset
            </button>
          </div>

          <form className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2" onSubmit={handleSubmit}>
            {alert && <div className="col-span-full"><AlertBanner kind={alert.kind} message={alert.message} /></div>}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-100" htmlFor="name">
                Name
              </label>
              <input
                id="name"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-slate-100 outline-none ring-2 ring-transparent transition focus:border-emerald-400/50 focus:ring-emerald-500/40"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-100" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-slate-100 outline-none ring-2 ring-transparent transition focus:border-emerald-400/50 focus:ring-emerald-500/40"
              />
            </div>
            <div className="space-y-2 col-span-full sm:col-span-2">
              <label className="text-sm font-medium text-slate-100" htmlFor="password">
                Password (optional)
              </label>
              <input
                id="password"
                type="password"
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-slate-100 outline-none ring-2 ring-transparent transition focus:border-emerald-400/50 focus:ring-emerald-500/40"
                placeholder="Leave blank to keep current password"
              />
            </div>
            <div className="col-span-full flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-gradient-to-r from-emerald-500 to-sky-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-900/40 transition hover:from-emerald-400 hover:to-sky-400 disabled:opacity-70"
              >
                {saving ? 'Saving…' : 'Save changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

function InfoCard({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-left text-sm text-slate-100 shadow-xl shadow-black/20 backdrop-blur">
      <p className="text-xs text-slate-400">{label}</p>
      <p className="mt-1 text-base font-semibold text-white">{value || '—'}</p>
    </div>
  )
}

export default ProfilePage


