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
      try {
        const data = await fetchUsers()
        if (Array.isArray(data) && data.length > 0) {
          setUsers(data)
          setError(null)
        } else {
          setError('No users found. Please register a user first.')
          setUsers([])
        }
      } catch (err) {
        console.error('Error loading users:', err)
        setError('Unable to load users. Please check backend connection.')
        setUsers([])
      }
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
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {(banner || error) && (
                <AlertBanner kind={error ? 'error' : 'success'} message={error || banner} />
              )}
            </div>
            <CopyCSSButton />
          </div>
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

function CopyCSSButton() {
  const [copied, setCopied] = useState(false)

  const adminPageCSS = `
/* Admin Page Styles - Copy this CSS to your website */

.admin-container {
  max-width: 72rem;
  margin: 0 auto;
  padding: 2.5rem 1rem;
}

.admin-panel {
  border-radius: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.05);
  padding: 2rem;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(8px);
}

.admin-title {
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: rgba(226, 232, 240, 0.7);
  margin-bottom: 0.5rem;
}

.admin-heading {
  font-size: 1.875rem;
  font-weight: 600;
  color: white;
  margin-bottom: 0.5rem;
}

.admin-subtitle {
  font-size: 0.875rem;
  color: rgba(226, 232, 240, 0.8);
}

.user-table {
  overflow: hidden;
  border-radius: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(2, 6, 23, 0.4);
}

.user-table-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  padding: 0.75rem 1rem;
}

.user-row {
  display: grid;
  grid-template-columns: repeat(1, minmax(0, 1fr));
  gap: 0.5rem;
  padding: 0.75rem 1rem;
}

@media (min-width: 640px) {
  .user-row {
    grid-template-columns: repeat(5, minmax(0, 1fr));
    align-items: center;
  }
}

.user-field-label {
  font-size: 0.75rem;
  color: rgba(148, 163, 184, 1);
}

.user-input {
  width: 100%;
  border-radius: 0.5rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.05);
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  color: white;
  outline: none;
}

.user-input:focus {
  border-color: rgba(56, 189, 248, 0.5);
}

.user-select {
  width: 100%;
  border-radius: 0.5rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.05);
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  color: rgb(186, 230, 253);
  outline: none;
}

.user-select:focus {
  border-color: rgba(56, 189, 248, 0.5);
}

.btn-save {
  border-radius: 0.5rem;
  background: linear-gradient(to right, rgb(16, 185, 129), rgb(14, 165, 233));
  padding: 0.5rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: white;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  border: none;
  cursor: pointer;
}

.btn-save:disabled {
  opacity: 0.6;
}

.btn-delete {
  border-radius: 0.5rem;
  background: linear-gradient(to right, rgb(244, 63, 94), rgb(239, 68, 68));
  padding: 0.5rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: white;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  border: none;
  cursor: pointer;
}

.btn-delete:disabled {
  opacity: 0.6;
}
`

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(adminPageCSS)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = adminPageCSS
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:bg-white/10 hover:text-white"
      title="複製此頁面的 CSS 樣式"
    >
      {copied ? (
        <>
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
          <span>已複製！</span>
        </>
      ) : (
        <>
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
          <span>複製 CSS</span>
        </>
      )}
    </button>
  )
}

export default AdminPage


