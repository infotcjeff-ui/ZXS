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
  notes: '',
  description: '',
  media: [],
  gallery: [],
  relatedUserIds: [],
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
  const galleryDropRef = useRef(null)

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
          gallery: Array.isArray(data.gallery) ? data.gallery : [],
          relatedUserIds: Array.isArray(data.relatedUserIds) 
            ? data.relatedUserIds 
            : data.relatedUserId 
              ? [data.relatedUserId] 
              : [],
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
    // Get first selected user as owner (or use existing owner)
    const selectedUserIds = Array.isArray(company.relatedUserIds) ? company.relatedUserIds : []
    const firstSelectedUser = selectedUserIds.length > 0 
      ? users.find((u) => u.id === selectedUserIds[0])
      : null
    
    const payload = {
      name: company.name.trim(),
      address: company.address || '',
      phone: company.phone || '',
      website: company.website || '',
      description: company.description || '',
      notes: company.notes || '',
      media: Array.isArray(company.media) ? company.media : [],
      gallery: Array.isArray(company.gallery) ? company.gallery : [],
      ownerEmail: firstSelectedUser?.email || company.ownerEmail || session?.email || 'unknown@zxsgit.local',
      ownerName: firstSelectedUser?.name || company.ownerName || session?.name || 'Unknown',
      relatedUserIds: selectedUserIds,
      relatedUserId: selectedUserIds.length > 0 ? selectedUserIds[0] : null, // Keep for backward compatibility
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

  const onDropGalleryFiles = (files) => {
    const list = Array.from(files)
    if (!list.length) return

    const currentGalleryCount = company.gallery?.length || 0
    const remainingSlots = 5 - currentGalleryCount

    if (remainingSlots <= 0) {
      setAlert({ kind: 'error', message: '圖庫最多只能上傳 5 張圖片' })
      return
    }
    if (list.length > remainingSlots) {
      setAlert({ kind: 'error', message: `圖庫最多只能上傳 5 張圖片，您只能再上傳 ${remainingSlots} 張` })
      list.splice(remainingSlots)
    }
    
    const readers = list.map(
      (file) =>
        new Promise((resolve) => {
          const reader = new FileReader()
          reader.onload = () =>
            resolve({ id: crypto.randomUUID(), name: file.name, dataUrl: reader.result })
          reader.readAsDataURL(file)
        }),
    )
    Promise.all(readers).then((gallery) => {
      setCompany((c) => ({
        ...c,
        gallery: [...(c.gallery || []), ...gallery]
      }))
    })
  }

  useEffect(() => {
    const el = dropRef.current
    const galleryEl = galleryDropRef.current
    if (!el && !galleryEl) return
    const prevent = (e) => {
      e.preventDefault()
      e.stopPropagation()
    }
    const handleDrop = (e) => {
      prevent(e)
      onDropFiles(e.dataTransfer.files)
    }
    const handleGalleryDrop = (e) => {
      prevent(e)
      onDropGalleryFiles(e.dataTransfer.files)
    }
    if (el) {
      el.addEventListener('dragover', prevent)
      el.addEventListener('drop', handleDrop)
    }
    if (galleryEl) {
      galleryEl.addEventListener('dragover', prevent)
      galleryEl.addEventListener('drop', handleGalleryDrop)
    }
    return () => {
      if (el) {
        el.removeEventListener('dragover', prevent)
        el.removeEventListener('drop', handleDrop)
      }
      if (galleryEl) {
        galleryEl.removeEventListener('dragover', prevent)
        galleryEl.removeEventListener('drop', handleGalleryDrop)
      }
    }
  }, [])

  const removeMedia = (mid) =>
    setCompany((c) => ({ ...c, media: (c.media || []).filter((m) => m.id !== mid) }))

  const removeGalleryImage = (gid) =>
    setCompany((c) => ({ ...c, gallery: (c.gallery || []).filter((g) => g.id !== gid) }))

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

      <form className="grid grid-cols-1 gap-6 lg:grid-cols-2" onSubmit={handleSubmit}>
        {/* Left Column: Images */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="mb-4 text-lg font-semibold text-white">圖片管理</h2>
            <div
              ref={dropRef}
              className="mb-3 rounded-lg border border-dashed border-sky-400/50 bg-sky-400/5 px-3 py-4 text-center text-xs text-sky-100"
            >
              拖放圖片到此或點擊上傳
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => onDropFiles(e.target.files)}
                className="mt-2 hidden"
                id="file-input-form"
              />
              <label
                htmlFor="file-input-form"
                className="mt-2 inline-block cursor-pointer rounded bg-sky-500/20 px-3 py-1 text-xs text-sky-200 hover:bg-sky-500/30"
              >
                選擇圖片
              </label>
            </div>
            {company.media?.length > 0 ? (
              <div className="mb-3 grid grid-cols-2 gap-2">
                {company.media.map((m) => (
                  <div key={m.id} className="relative overflow-hidden rounded-lg border border-white/10 bg-white/5">
                    <img src={m.dataUrl} alt={m.name} className="h-20 w-full object-cover" />
                    <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-slate-950/80 px-2 py-1 text-[10px] text-white">
                      <span className="truncate flex-1">
                        {m.isMain && <span className="text-emerald-300">主圖 • </span>}
                        {m.name}
                      </span>
                      <div className="flex items-center gap-1">
                        {!m.isMain && (
                          <button
                            type="button"
                            onClick={() =>
                              setCompany((c) => ({
                                ...c,
                                media: c.media.map((x) => ({ ...x, isMain: x.id === m.id })),
                              }))
                            }
                            className="text-emerald-200 hover:text-emerald-100 text-[10px]"
                          >
                            設為主
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => removeMedia(m.id)}
                          className="text-rose-200 hover:text-rose-100 text-[10px]"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400 text-center py-4">暫無圖片</p>
            )}
          </div>
        </div>

        {/* Right Column: Form Fields */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="mb-4 text-lg font-semibold text-white">公司資訊</h2>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-400">公司名稱 *</label>
                <input
                  value={company.name || ''}
                  onChange={(e) => setCompany((c) => ({ ...c, name: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-sky-400/50"
                />
              </div>
              <div>
                <label className="mb-2 block text-xs font-semibold text-slate-200/80">圖庫（最多 5 張）</label>
                <div
                  ref={galleryDropRef}
                  className="mb-3 rounded-lg border border-dashed border-purple-400/50 bg-purple-400/5 px-3 py-4 text-center text-xs text-purple-100"
                >
                  拖放圖片到此或點擊上傳
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => onDropGalleryFiles(e.target.files)}
                    className="mt-2 hidden"
                    id="gallery-input-form"
                    disabled={(company?.gallery?.length || 0) >= 5}
                  />
                  <label
                    htmlFor="gallery-input-form"
                    className={`mt-2 inline-block cursor-pointer rounded px-3 py-1 text-xs ${
                      (company?.gallery?.length || 0) >= 5
                        ? 'bg-slate-500/20 text-slate-400 cursor-not-allowed'
                        : 'bg-purple-500/20 text-purple-200 hover:bg-purple-500/30'
                    }`}
                  >
                    {(company?.gallery?.length || 0) >= 5 ? '已達上限（5 張）' : `選擇圖片 (${company?.gallery?.length || 0}/5)`}
                  </label>
                </div>
                {company?.gallery && company.gallery.length > 0 && (
                  <div className="mb-3 grid grid-cols-3 gap-2">
                    {company.gallery.map((g) => (
                      <div key={g.id} className="relative overflow-hidden rounded-lg border border-white/10 bg-white/5">
                        <img src={g.dataUrl} alt={g.name} className="h-20 w-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeGalleryImage(g.id)}
                          className="absolute top-1 right-1 rounded bg-rose-500/80 px-1.5 py-0.5 text-[10px] font-semibold text-white hover:bg-rose-500"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <label className="mb-2 block text-xs font-semibold text-slate-200/80">關聯用戶（可多選）</label>
                <div className="max-h-32 overflow-y-auto rounded-lg border border-white/10 bg-white/5 p-2 scrollable-container">
                  {users.length === 0 ? (
                    <p className="text-xs text-slate-400">暫無用戶</p>
                  ) : (
                    <div className="space-y-1">
                      {users.map((u) => {
                        const isSelected = Array.isArray(company.relatedUserIds) && company.relatedUserIds.includes(u.id)
                        return (
                          <label
                            key={u.id}
                            className="flex cursor-pointer items-center gap-2 rounded px-2 py-1 text-xs transition hover:bg-white/10"
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => {
                                const currentIds = Array.isArray(company.relatedUserIds) ? company.relatedUserIds : []
                                if (e.target.checked) {
                                  setCompany((c) => ({ ...c, relatedUserIds: [...currentIds, u.id] }))
                                } else {
                                  setCompany((c) => ({ ...c, relatedUserIds: currentIds.filter((id) => id !== u.id) }))
                                }
                              }}
                              className="h-3 w-3 rounded border-white/20 bg-white/5 text-sky-500 focus:ring-sky-500"
                            />
                            <span className="text-slate-200">{u.name}</span>
                            {u.role === 'admin' && (
                              <span className="rounded-full bg-emerald-500/20 px-1.5 py-0.5 text-[10px] text-emerald-200">
                                管理員
                              </span>
                            )}
                          </label>
                        )
                      })}
                    </div>
                  )}
                </div>
                <p className="mt-1 text-xs text-slate-400">
                  已選擇 {Array.isArray(company.relatedUserIds) ? company.relatedUserIds.length : 0} 位用戶
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-slate-400">地址</label>
                  <input
                    value={company.address || ''}
                    onChange={(e) => setCompany((c) => ({ ...c, address: e.target.value }))}
                    className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white outline-none focus:border-sky-400/50"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400">電話</label>
                  <input
                    value={company.phone || ''}
                    onChange={(e) => setCompany((c) => ({ ...c, phone: e.target.value }))}
                    className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white outline-none focus:border-sky-400/50"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400">網站</label>
                  <input
                    value={company.website || ''}
                    onChange={(e) => setCompany((c) => ({ ...c, website: e.target.value }))}
                    className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white outline-none focus:border-sky-400/50"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400">備註</label>
                  <input
                    value={company.notes || ''}
                    onChange={(e) => setCompany((c) => ({ ...c, notes: e.target.value }))}
                    className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white outline-none focus:border-sky-400/50"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-400">描述</label>
                <textarea
                  value={company.description || ''}
                  onChange={(e) => setCompany((c) => ({ ...c, description: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white outline-none focus:border-sky-400/50"
                  rows={3}
                />
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  disabled={!company.name?.trim()}
                  className="rounded-lg bg-gradient-to-r from-emerald-500 to-sky-500 px-4 py-2 text-xs font-semibold text-white shadow disabled:opacity-60"
                >
                  {company.id ? '更新公司' : '建立公司'}
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/companies')}
                  className="rounded-lg bg-white/10 px-4 py-2 text-xs font-semibold text-slate-200 hover:bg-white/15"
                >
                  取消
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}

export default CompanyFormPage


