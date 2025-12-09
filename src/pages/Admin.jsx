import { useEffect, useState } from 'react'
import { useAuth } from '../auth/AuthProvider.jsx'
import AlertBanner from '../components/AlertBanner.jsx'

function AdminPage() {
  const { fetchUsers, updateUserAsAdmin, deleteUser } = useAuth()
  const [users, setUsers] = useState([])
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)
  const [savingId, setSavingId] = useState(null)
  const [deletingId, setDeletingId] = useState(null)
  const [banner, setBanner] = useState(null)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const data = await fetchUsers()
      if (!data.length) setError('Unable to load users. Is backend running on :4000?')
      setUsers(data)
      setLoading(false)
    }
    load()
  }, [fetchUsers])

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-10 lg:py-14">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl shadow-black/30 backdrop-blur">
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-200/70">
            Admin
          </p>
          <h1 className="text-3xl font-semibold text-white">User registry</h1>
          <p className="text-sm text-slate-200/80">
            Admin account: <span className="font-semibold text-white">admin@zxsgit.local</span>{' '}
            / <span className="font-semibold text-white">admin321</span>
          </p>
        </div>

        <div className="mt-6">
          {(banner || error) && (
            <AlertBanner kind={error ? 'error' : 'success'} message={error || banner} />
          )}
          {loading ? (
            <p className="text-sm text-slate-200/80">Loading users…</p>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-950/40">
              <div className="flex items-center justify-between border-b border-white/5 px-4 py-3">
                <p className="text-sm font-semibold text-white">
                  Total registered: {users.length}
                </p>
              </div>
              <div className="divide-y divide-white/5">
                {users.map((u) => (
                  <UserRow
                    key={u.id}
                    user={u}
                    onSave={async (payload) => {
                      setSavingId(u.id)
                      const res = await updateUserAsAdmin(payload)
                      if (!res.ok) setError(res.message)
                      else {
                        setError(null)
                        setBanner('User updated')
                        setUsers(await fetchUsers())
                      }
                      setSavingId(null)
                    }}
                    onDelete={async (id) => {
                      if (!confirm(`確定要刪除使用者 "${u.name}" (${u.email})？此操作無法復原。`)) return
                      setDeletingId(id)
                      const res = await deleteUser(id)
                      if (!res.ok) setError(res.message)
                      else {
                        setError(null)
                        setBanner(res.message || 'User deleted')
                        setUsers(await fetchUsers())
                      }
                      setDeletingId(null)
                    }}
                    saving={savingId === u.id}
                    deleting={deletingId === u.id}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function UserRow({ user, onSave, onDelete, saving, deleting }) {
  const [form, setForm] = useState({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  })

  useEffect(() => {
    setForm({ id: user.id, name: user.name, email: user.email, role: user.role })
  }, [user])

  const isAdmin = user.email === 'admin@zxsgit.local'

  return (
    <div className="grid grid-cols-1 gap-2 px-4 py-3 sm:grid-cols-5 sm:items-center">
      <div>
        <p className="text-xs text-slate-400">Name</p>
        <input
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-sky-400/50"
        />
      </div>
      <div>
        <p className="text-xs text-slate-400">Email</p>
        <input
          value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-sky-400/50"
        />
      </div>
      <div>
        <p className="text-xs text-slate-400">Role</p>
        <select
          value={form.role}
          onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-sky-200 outline-none focus:border-sky-400/50"
        >
          <option value="admin" className="bg-slate-900 text-emerald-200">admin</option>
          <option value="member" className="bg-slate-900 text-sky-200">member</option>
        </select>
      </div>
      <div>
        <p className="text-xs text-slate-400">Created</p>
        <p className="text-sm text-slate-200">
          {user.createdAt ? new Date(user.createdAt).toLocaleString() : '—'}
        </p>
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onSave(form)}
          disabled={saving || deleting}
          className="rounded-lg bg-gradient-to-r from-emerald-500 to-sky-500 px-3 py-2 text-xs font-semibold text-white shadow disabled:opacity-60"
        >
          {saving ? 'Saving…' : 'Save'}
        </button>
        {!isAdmin && (
          <button
            type="button"
            onClick={() => onDelete(user.id)}
            disabled={saving || deleting}
            className="rounded-lg bg-gradient-to-r from-rose-500 to-red-500 px-3 py-2 text-xs font-semibold text-white shadow disabled:opacity-60"
          >
            {deleting ? 'Deleting…' : 'Delete'}
          </button>
        )}
      </div>
    </div>
  )
}

export default AdminPage


