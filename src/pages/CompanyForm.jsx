import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider.jsx'
import AlertBanner from '../components/AlertBanner.jsx'

const blankCompany = {
  id: null,
  name: '',
  address: '',
  phone: '',
  website: '',
  description: '',
  notes: '',
  media: [],
}

function CompanyFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { session, getCompany, createCompany, updateCompany, fetchUsers } = useAuth()
  const [company, setCompany] = useState(blankCompany)
  const [users, setUsers] = useState([])
  const [alert, setAlert] = useState(null)
  const [loading, setLoading] = useState(Boolean(id))
  const dropRef = useRef(null)

  useEffect(() => {
    const loadUsers = async () => {
      const userList = await fetchUsers()
      setUsers(userList)
    }
    loadUsers()
  }, [fetchUsers])

  useEffect(() => {
    if (!id) return
    let active = true
    const load = async () => {
      setLoading(true)
      const data = await getCompany(id)
      if (active && data) {
        setCompany({
          ...blankCompany,
          ...data,
          media: Array.isArray(data.media) ? data.media : [],
        })
      }
      setLoading(false)
    }
    load()
    return () => {
      active = false
    }
  }, [id, getCompany])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!company.name.trim()) {
      setAlert({ kind: 'error', message: '公司名稱為必填' })
      return
    }
    const selectedUser = users.find((u) => u.id === company.relatedUserId)
    const payload = {
      name: company.name.trim(),
      address: company.address || '',
      phone: company.phone || '',
      website: company.website || '',
      description: company.description || '',
      notes: company.notes || '',
      media: Array.isArray(company.media) ? company.media : [],
      ownerEmail: selectedUser?.email || company.ownerEmail || session?.email || 'unknown@zxsgit.local',
      ownerName: selectedUser?.name || company.ownerName || session?.name || 'Unknown',
      relatedUserId: company.relatedUserId || null,
    }
    const result = company.id
      ? await updateCompany(company.id, payload)
      : await createCompany(payload)
    if (!result.ok) {
      setAlert({ kind: 'error', message: result.message })
      return
    }
    window.dispatchEvent(new Event('companies:update'))
    navigate('/companies')
  }

  const onDropFiles = (files) => {
    const list = Array.from(files)
    if (!list.length) return
    const readers = list.map(
      (file) =>
        new Promise((resolve) => {
          const reader = new FileReader()
          reader.onload = () =>
            resolve({ id: crypto.randomUUID(), name: file.name, dataUrl: reader.result, isMain: false })
          reader.readAsDataURL(file)
        }),
    )
    Promise.all(readers).then((media) => {
      setCompany((c) => {
        const existing = c.media || []
        const next =
          existing.length === 0 && media.length
            ? media.map((m, idx) => ({ ...m, isMain: idx === 0 }))
            : media
        return { ...c, media: [...existing, ...next] }
      })
    })
  }

  useEffect(() => {
    const el = dropRef.current
    if (!el) return
    const prevent = (e) => {
      e.preventDefault()
      e.stopPropagation()
    }
    const handleDrop = (e) => {
      prevent(e)
      onDropFiles(e.dataTransfer.files)
    }
    el.addEventListener('dragover', prevent)
    el.addEventListener('drop', handleDrop)
    return () => {
      el.removeEventListener('dragover', prevent)
      el.removeEventListener('drop', handleDrop)
    }
  }, [])

  const removeMedia = (mid) =>
    setCompany((c) => ({ ...c, media: (c.media || []).filter((m) => m.id !== mid) }))

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-10 lg:py-14">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-200/70">
            {company.id ? '編輯公司' : '新增公司'}
          </p>
          <h1 className="text-3xl font-semibold text-white">
            {company.id ? company.name || '編輯公司' : '建立公司'}
          </h1>
          <p className="text-sm text-slate-200/80">拖放圖片到頂部，並可設定主圖片。</p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/companies')}
          className="text-xs font-semibold text-slate-200 hover:text-white"
        >
          返回列表
        </button>
      </div>

      {alert && <AlertBanner kind={alert.kind} message={alert.message} />}
      {loading && id && <p className="text-sm text-slate-200/80">載入公司資料中…</p>}

      <form className="grid grid-cols-1 gap-3 md:grid-cols-2" onSubmit={handleSubmit}>
        <div
          ref={dropRef}
          className="md:col-span-2 rounded-2xl border border-dashed border-sky-400/50 bg-sky-400/5 px-4 py-6 text-center text-sm text-sky-100"
        >
          拖放圖片到此（保存為媒體 JSON）
          <p className="text-xs text-sky-200/80">接受任何圖片；儲存在瀏覽器。</p>
          <p className="mt-1 text-xs text-sky-200/80">
            第一張自動設為主圖片，或在下方點「Set main」更換。
          </p>
        </div>
        <input
          placeholder="公司名稱 *"
          value={company.name}
          onChange={(e) => setCompany((c) => ({ ...c, name: e.target.value }))}
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-slate-100 outline-none ring-2 ring-transparent transition focus:border-sky-400/50 focus:ring-sky-500/40"
        />
        <div>
          <label className="mb-2 block text-xs font-semibold text-slate-200/80">關聯用戶</label>
          <select
            value={company.relatedUserId || ''}
            onChange={(e) => setCompany((c) => ({ ...c, relatedUserId: e.target.value || null }))}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sky-200 outline-none ring-2 ring-transparent transition focus:border-sky-400/50 focus:ring-sky-500/40"
          >
            <option value="" className="bg-slate-900 text-slate-300">選擇用戶（可選）</option>
            {users.map((u) => (
              <option key={u.id} value={u.id} className="bg-slate-900 text-emerald-200">
                {u.name} ({u.email}) {u.role === 'admin' ? '[管理員]' : ''}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-slate-400">選擇與此公司關聯的用戶</p>
        </div>
        <input
          placeholder="地址"
          value={company.address}
          onChange={(e) => setCompany((c) => ({ ...c, address: e.target.value }))}
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-slate-100 outline-none ring-2 ring-transparent transition focus:border-sky-400/50 focus:ring-sky-500/40"
        />
        <input
          placeholder="電話"
          value={company.phone}
          onChange={(e) => setCompany((c) => ({ ...c, phone: e.target.value }))}
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-slate-100 outline-none ring-2 ring-transparent transition focus:border-sky-400/50 focus:ring-sky-500/40"
        />
        <input
          placeholder="網站"
          value={company.website}
          onChange={(e) => setCompany((c) => ({ ...c, website: e.target.value }))}
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-slate-100 outline-none ring-2 ring-transparent transition focus:border-sky-400/50 focus:ring-sky-500/40"
        />
        <textarea
          placeholder="描述"
          value={company.description}
          onChange={(e) => setCompany((c) => ({ ...c, description: e.target.value }))}
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-slate-100 outline-none ring-2 ring-transparent transition focus:border-sky-400/50 focus:ring-sky-500/40 md:col-span-2"
          rows={3}
        />
        <textarea
          placeholder="其他資訊"
          value={company.notes || ''}
          onChange={(e) => setCompany((c) => ({ ...c, notes: e.target.value }))}
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-slate-100 outline-none ring-2 ring-transparent transition focus:border-sky-400/50 focus:ring-sky-500/40 md:col-span-2"
          rows={2}
        />

        {company.media?.length > 0 && (
          <div className="md:col-span-2 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {company.media.map((m) => (
              <div key={m.id} className="relative overflow-hidden rounded-xl border border-white/10 bg-white/5">
                <img src={m.dataUrl} alt={m.name} className="h-24 w-full object-cover" />
                <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-slate-950/60 px-2 py-1 text-[11px] text-white">
                  <span className="truncate">
                    {m.name}
                    {m.isMain ? ' • Main image' : ''}
                  </span>
                  <div className="flex items-center gap-2">
                    {!m.isMain && (
                      <button
                        type="button"
                        onClick={() =>
                          setCompany((c) => ({
                            ...c,
                            media: c.media.map((x) => ({ ...x, isMain: x.id === m.id })),
                          }))
                        }
                        className="text-emerald-200 hover:text-emerald-100"
                      >
                        Set main
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => removeMedia(m.id)}
                      className="text-rose-200 hover:text-rose-100"
                    >
                      ×
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="md:col-span-2 flex justify-end">
          <button
            type="submit"
            className="rounded-xl bg-gradient-to-r from-emerald-500 to-sky-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-900/40 transition hover:from-emerald-400 hover:to-sky-400"
          >
            {company.id ? 'Update company' : 'Create company'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default CompanyFormPage


