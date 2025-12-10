import { useCallback, useEffect, useMemo, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider.jsx'
import AlertBanner from '../components/AlertBanner.jsx'

function CompaniesPage() {
  const { session, fetchCompanies, deleteCompany, updateCompany, fetchUsers } = useAuth()
  const [companies, setCompanies] = useState([])
  const [users, setUsers] = useState([])
  const [view, setView] = useState('grid')
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState(null)
  const [editingId, setEditingId] = useState(null)

  const loadCompanies = useCallback(async () => {
    setLoading(true)
    try {
      const [list, userList] = await Promise.all([
        fetchCompanies(),
        fetchUsers()
      ])
      setCompanies(list || [])
      setUsers(userList || [])
    } catch (error) {
      console.error('Error loading companies:', error)
      setCompanies([])
      setUsers([])
    } finally {
      setLoading(false)
    }
  }, [fetchCompanies, fetchUsers])

  useEffect(() => {
    loadCompanies()
    const handleUpdate = () => loadCompanies()
    window.addEventListener('companies:update', handleUpdate)
    return () => window.removeEventListener('companies:update', handleUpdate)
  }, [loadCompanies])

  const canEdit = (ownerEmail) =>
    session?.role === 'admin' || ownerEmail?.toLowerCase() === session?.email?.toLowerCase()

  const cardData = useMemo(() => companies, [companies])

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10 lg:py-14">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-200/70">
            公司列表
          </p>
          <h1 className="text-3xl font-semibold text-white">所有公司</h1>
          <p className="text-sm text-slate-200/80">
            使用者可建立自己的公司，管理員可編輯所有公司。
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/companies/new"
            className="rounded-xl bg-gradient-to-r from-emerald-500 to-sky-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-900/40 transition hover:from-emerald-400 hover:to-sky-400"
          >
            新增公司
          </Link>
          <div className="flex items-center gap-2 text-xs text-slate-200/80">
            <span>檢視：</span>
            <button
              type="button"
              onClick={() => setView('grid')}
              className={`rounded-lg px-3 py-2 font-semibold ${
                view === 'grid' ? 'bg-white/15 text-white' : 'bg-white/5 text-slate-200'
              }`}
            >
              網格
            </button>
            <button
              type="button"
              onClick={() => setView('list')}
              className={`rounded-lg px-3 py-2 font-semibold ${
                view === 'list' ? 'bg-white/15 text-white' : 'bg-white/5 text-slate-200'
              }`}
            >
              列表
            </button>
          </div>
        </div>
      </div>

      {loading && <p className="text-sm text-slate-200/70">載入公司資料中...</p>}

      <div
        className={
          view === 'grid'
            ? 'grid grid-cols-1 gap-4 md:grid-cols-2'
            : 'flex flex-col gap-4'
        }
      >
        {cardData.length === 0 && (
          <p className="text-sm text-slate-200/70">尚未有公司，請先新增。</p>
        )}
        {cardData.map((company) => (
          <CompanyCard
            key={company.id}
            company={company}
            users={users}
            canEdit={canEdit(company.ownerEmail)}
            canDelete={session?.role === 'admin'}
            isEditing={editingId === company.id}
            onEdit={() => setEditingId(company.id)}
            onCancel={() => setEditingId(null)}
            onSave={async (updatedCompany) => {
              console.log('onSave called with payload:', updatedCompany)
              try {
                const res = await updateCompany(company.id, updatedCompany)
                console.log('updateCompany response:', res)
                if (res.ok) {
                  setEditingId(null)
                  // Reload companies to get fresh data
                  await loadCompanies()
                  // Also dispatch event to notify other components
                  window.dispatchEvent(new Event('companies:update'))
                } else {
                  console.error('Update failed:', res.message)
                }
                return res
              } catch (error) {
                console.error('onSave error:', error)
                return { ok: false, message: error.message || '更新失敗' }
              }
            }}
            onDelete={async () => {
              if (!confirm(`確定要刪除公司 "${company.name}"？此操作無法復原。`)) return
              setDeletingId(company.id)
              const res = await deleteCompany(company.id)
              if (res.ok) {
                loadCompanies()
              }
              setDeletingId(null)
            }}
            deleting={deletingId === company.id}
          />
        ))}
      </div>
    </div>
  )
}

function CompanyCard({ company, canEdit, canDelete, isEditing, onEdit, onCancel, onSave, onDelete, deleting, users = [] }) {
  const [formData, setFormData] = useState(company)
  const [saving, setSaving] = useState(false)
  const [alert, setAlert] = useState(null)
  const editFormRef = useRef(null)
  const nameInputRef = useRef(null)
  const dropRef = useRef(null)

  useEffect(() => {
    if (isEditing) {
      setFormData({
        ...company,
        media: Array.isArray(company.media) ? company.media : [],
        gallery: Array.isArray(company.gallery) ? company.gallery : [],
        relatedUserIds: Array.isArray(company.relatedUserIds) 
          ? company.relatedUserIds 
          : company.relatedUserId 
            ? [company.relatedUserId] 
            : [],
      })
      // Scroll to form and focus on name input
      setTimeout(() => {
        editFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
        nameInputRef.current?.focus()
      }, 100)
    }
  }, [isEditing, company])

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
      setFormData((c) => {
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
    if (!isEditing) return
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
  }, [isEditing])

  const removeMedia = (mid) =>
    setFormData((c) => ({ ...c, media: (c.media || []).filter((m) => m.id !== mid) }))

  const onDropGalleryFiles = (files) => {
    const list = Array.from(files)
    if (!list.length) return
    
    // Limit gallery to 5 images
    const currentGallery = formData?.gallery || []
    const remainingSlots = 5 - currentGallery.length
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
      setFormData((c) => ({
        ...c,
        gallery: [...(c.gallery || []), ...gallery]
      }))
    })
  }

  const removeGalleryImage = (gid) =>
    setFormData((c) => ({ ...c, gallery: (c.gallery || []).filter((g) => g.id !== gid) }))

  const mainMedia =
    company.media?.find((m) => m.isMain) || (company.media && company.media[0]) || null
  const galleryCount = company.gallery?.length || 0
  
  const getRelatedUsers = () => {
    if (!users || users.length === 0) return []
    if (Array.isArray(company.relatedUserIds) && company.relatedUserIds.length > 0) {
      return users.filter(u => u && u.id && company.relatedUserIds.includes(u.id))
    }
    if (company.relatedUserId) {
      const user = users.find(u => u && u.id === company.relatedUserId)
      return user ? [user] : []
    }
    return []
  }
  
  const relatedUsers = getRelatedUsers()

  const handleSave = async () => {
    if (!formData.name?.trim()) {
      setAlert({ kind: 'error', message: '公司名稱為必填' })
      return
    }
    setSaving(true)
    setAlert(null)
    try {
      // Prepare payload with all fields
      const payload = {
        name: formData.name.trim(),
        address: formData.address || '',
        phone: formData.phone || '',
        website: formData.website || '',
        description: formData.description || '',
        notes: formData.notes || '',
        media: Array.isArray(formData.media) ? formData.media : [],
        gallery: Array.isArray(formData.gallery) ? formData.gallery : [],
        ownerEmail: formData.ownerEmail || company.ownerEmail || 'unknown@zxsgit.local',
        ownerName: formData.ownerName || company.ownerName || 'Unknown',
        relatedUserIds: Array.isArray(formData.relatedUserIds) ? formData.relatedUserIds : [],
        relatedUserId: Array.isArray(formData.relatedUserIds) && formData.relatedUserIds.length > 0 ? formData.relatedUserIds[0] : null,
      }
      
      console.log('Saving company with payload:', payload)
      console.log('Gallery count:', payload.gallery.length)
      console.log('Related users count:', payload.relatedUserIds.length)
      
      const res = await onSave(payload)
      
      console.log('Save response:', res)
      
      if (!res.ok) {
        setAlert({ kind: 'error', message: res.message || '更新失敗' })
        setSaving(false)
      } else {
        setAlert({ kind: 'success', message: '更新成功' })
        // Reload companies to get updated data
        window.dispatchEvent(new Event('companies:update'))
        setTimeout(() => {
          setAlert(null)
          onCancel() // Close edit mode after successful save
        }, 1500)
      }
    } catch (error) {
      console.error('Save error:', error)
      setAlert({ kind: 'error', message: '更新時發生錯誤: ' + (error.message || '未知錯誤') })
      setSaving(false)
    }
  }

  if (isEditing) {
    return (
      <div ref={editFormRef} className="rounded-2xl border border-white/10 bg-white/5 p-5 text-slate-100 shadow-xl shadow-black/30 backdrop-blur">
        {alert && <AlertBanner kind={alert.kind} message={alert.message} />}
        <div className="space-y-3">
          <div>
            <label className="text-xs text-slate-400">公司名稱 *</label>
            <input
              ref={nameInputRef}
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-sky-400/50"
            />
          </div>
          <div>
            <label className="mb-2 block text-xs font-semibold text-slate-200/80">圖片管理</label>
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
                id={`file-input-${company.id}`}
              />
              <label
                htmlFor={`file-input-${company.id}`}
                className="mt-2 inline-block cursor-pointer rounded bg-sky-500/20 px-3 py-1 text-xs text-sky-200 hover:bg-sky-500/30"
              >
                選擇圖片
              </label>
            </div>
            {formData.media?.length > 0 && (
              <div className="mb-3 grid grid-cols-2 gap-2">
                {formData.media.map((m) => (
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
                              setFormData((c) => ({
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
                    const isSelected = Array.isArray(formData.relatedUserIds) && formData.relatedUserIds.includes(u.id)
                    return (
                      <label
                        key={u.id}
                        className="flex cursor-pointer items-center gap-2 rounded px-2 py-1 text-xs transition hover:bg-white/10"
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            const currentIds = Array.isArray(formData.relatedUserIds) ? formData.relatedUserIds : []
                            if (e.target.checked) {
                              setFormData((c) => ({ ...c, relatedUserIds: [...currentIds, u.id] }))
                            } else {
                              setFormData((c) => ({ ...c, relatedUserIds: currentIds.filter((id) => id !== u.id) }))
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
              已選擇 {Array.isArray(formData.relatedUserIds) ? formData.relatedUserIds.length : 0} 位用戶
            </p>
          </div>
          <div>
            <label className="mb-2 block text-xs font-semibold text-slate-200/80">圖庫（最多 5 張）</label>
            <div className="mb-3 rounded-lg border border-dashed border-purple-400/50 bg-purple-400/5 px-3 py-4 text-center text-xs text-purple-100">
              拖放圖片到此或點擊上傳
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => onDropGalleryFiles(e.target.files)}
                className="mt-2 hidden"
                id={`gallery-input-${company.id}`}
                disabled={(formData?.gallery?.length || 0) >= 5}
              />
              <label
                htmlFor={`gallery-input-${company.id}`}
                className={`mt-2 inline-block cursor-pointer rounded px-3 py-1 text-xs ${
                  (formData?.gallery?.length || 0) >= 5
                    ? 'bg-slate-500/20 text-slate-400 cursor-not-allowed'
                    : 'bg-purple-500/20 text-purple-200 hover:bg-purple-500/30'
                }`}
              >
                {(formData?.gallery?.length || 0) >= 5 ? '已達上限（5 張）' : `選擇圖片 (${formData?.gallery?.length || 0}/5)`}
              </label>
            </div>
            {formData?.gallery && formData.gallery.length > 0 && (
              <div className="mb-3 grid grid-cols-3 gap-2">
                {formData.gallery.map((g) => (
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
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-slate-400">地址</label>
              <input
                value={formData.address || ''}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white outline-none focus:border-sky-400/50"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400">電話</label>
              <input
                value={formData.phone || ''}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white outline-none focus:border-sky-400/50"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400">網站</label>
              <input
                value={formData.website || ''}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white outline-none focus:border-sky-400/50"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400">備註</label>
              <input
                value={formData.notes || ''}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white outline-none focus:border-sky-400/50"
              />
            </div>
          </div>
          <div>
            <label className="text-xs text-slate-400">描述</label>
            <textarea
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white outline-none focus:border-sky-400/50"
              rows={3}
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || !formData.name?.trim()}
              className="rounded-lg bg-gradient-to-r from-emerald-500 to-sky-500 px-4 py-2 text-xs font-semibold text-white shadow disabled:opacity-60"
            >
              {saving ? '儲存中...' : '儲存'}
            </button>
            <button
              type="button"
              onClick={onCancel}
              disabled={saving}
              className="rounded-lg bg-white/10 px-4 py-2 text-xs font-semibold text-slate-200 hover:bg-white/15 disabled:opacity-60"
            >
              取消
            </button>
          </div>
        </div>
      </div>
    )
  }
  
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-slate-100 shadow-xl shadow-black/30 backdrop-blur">
      <div className="flex items-start justify-between gap-3">
        <Link to={`/companies/${company.id}`} className="flex flex-1 items-center gap-3 hover:opacity-80">
          <div className="h-12 w-12 overflow-hidden rounded-xl bg-white/10 relative">
            {mainMedia?.dataUrl ? (
              <img src={mainMedia.dataUrl} alt={company.name} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xs text-slate-300">
                無圖片
              </div>
            )}
            {galleryCount > 0 && (
              <div className="absolute bottom-0 right-0 flex items-center gap-0.5 rounded-tl bg-black/70 px-1.5 py-0.5 text-[10px] text-white">
                <span>📷</span>
                <span>{galleryCount}</span>
              </div>
            )}
          </div>
          <div className="flex-1">
            <p className="text-lg font-semibold text-white">{company.name}</p>
            <p className="text-xs text-slate-300">擁有者：{company.ownerName || company.ownerEmail}</p>
            {relatedUsers.length > 0 && (
              <div className="mt-1 flex flex-wrap gap-1">
                <span className="text-xs text-slate-400">關聯用戶：</span>
                {relatedUsers.map((u) => (
                  <span
                    key={u.id}
                    className="rounded-full bg-sky-500/20 px-2 py-0.5 text-xs text-sky-200"
                  >
                    {u.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        </Link>
        <div className="flex items-center gap-2">
          {canEdit && (
            <button
              type="button"
              onClick={onEdit}
              className="rounded-lg bg-white/10 px-3 py-2 text-xs font-semibold text-sky-100 hover:bg-sky-500/20"
            >
              編輯
            </button>
          )}
          {canDelete && (
            <button
              type="button"
              onClick={onDelete}
              disabled={deleting}
              className="rounded-lg bg-gradient-to-r from-rose-500 to-red-500 px-3 py-2 text-xs font-semibold text-white shadow disabled:opacity-60"
            >
              {deleting ? '刪除中...' : '刪除'}
            </button>
          )}
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-200/80 sm:grid-cols-3">
        <Info label="地址" value={company.address} />
        <Info label="電話" value={company.phone} />
        <Info label="網站" value={company.website} />
        <Info label="備註" value={company.notes} />
      </div>
      {company.description && (
        <p className="mt-3 text-sm text-slate-200/80 line-clamp-3">{company.description}</p>
      )}
      {company.media?.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto">
          {company.media
            .filter((m) => !m.isMain)
            .map((m) => (
              <img
                key={m.id}
                src={m.dataUrl}
                alt="media"
                className="h-16 w-24 flex-none rounded-lg border border-white/10 object-cover"
              />
            ))}
        </div>
      )}
    </div>
  )
}

function Info({ label, value }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2">
      <p className="text-[11px] uppercase tracking-wide text-slate-400">{label}</p>
      <p className="text-sm text-white">{value || '—'}</p>
    </div>
  )
}

export default CompaniesPage


