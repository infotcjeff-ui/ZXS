import { useEffect, useState, useRef } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider.jsx'
import AlertBanner from '../components/AlertBanner.jsx'

function CompanyDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { session, getCompany, deleteCompany, updateCompany, fetchUsers } = useAuth()
  const [company, setCompany] = useState(null)
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [alert, setAlert] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState(null)
  const [saving, setSaving] = useState(false)
  const editFormRef = useRef(null)
  const nameInputRef = useRef(null)
  const dropRef = useRef(null)

  useEffect(() => {
    let active = true
    const load = async () => {
      setLoading(true)
      try {
        const [data, userList] = await Promise.all([
          getCompany(id),
          fetchUsers()
        ])
        if (active && data) {
          setCompany(data)
          setFormData({
            ...data,
            media: Array.isArray(data.media) ? data.media : [],
            relatedUserIds: Array.isArray(data.relatedUserIds)
              ? data.relatedUserIds
              : data.relatedUserId
                ? [data.relatedUserId]
                : [],
          })
          setUsers(userList)
        }
      } catch (error) {
        console.error('Error loading company data:', error)
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }
    load()
    return () => {
      active = false
    }
  }, [id, getCompany, fetchUsers])

  useEffect(() => {
    if (editing && formData) {
      // Scroll to form and focus on name input
      setTimeout(() => {
        editFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        nameInputRef.current?.focus()
      }, 100)
    }
  }, [editing, formData])

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
    if (!editing) return
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
  }, [editing])

  const removeMedia = (mid) =>
    setFormData((c) => ({ ...c, media: (c.media || []).filter((m) => m.id !== mid) }))

  const handleDelete = async () => {
    if (!confirm(`確定要刪除公司 "${company.name}"？此操作無法復原。`)) return
    setDeleting(true)
    const res = await deleteCompany(id)
    if (!res.ok) {
      setAlert({ kind: 'error', message: res.message })
      setDeleting(false)
      return
    }
    window.dispatchEvent(new Event('companies:update'))
    navigate('/companies')
  }

  const handleSave = async () => {
    if (!formData?.name?.trim()) {
      setAlert({ kind: 'error', message: '公司名稱為必填' })
      return
    }
    setSaving(true)
    setAlert(null)
    try {
      const res = await updateCompany(id, {
        name: formData.name.trim(),
        address: formData.address || '',
        phone: formData.phone || '',
        website: formData.website || '',
        description: formData.description || '',
        notes: formData.notes || '',
        media: Array.isArray(formData.media) ? formData.media : [],
        ownerEmail: formData.ownerEmail || company.ownerEmail,
        ownerName: formData.ownerName || company.ownerName,
        relatedUserIds: Array.isArray(formData.relatedUserIds) ? formData.relatedUserIds : [],
        relatedUserId: Array.isArray(formData.relatedUserIds) && formData.relatedUserIds.length > 0 ? formData.relatedUserIds[0] : null,
      })
      if (!res.ok) {
        setAlert({ kind: 'error', message: res.message || '更新失敗' })
        setSaving(false)
        return
      }
      setAlert({ kind: 'success', message: '更新成功' })
      // Reload company data
      const updated = await getCompany(id)
      if (updated) {
        setCompany(updated)
        setFormData(updated)
      }
      window.dispatchEvent(new Event('companies:update'))
      setTimeout(() => {
        setAlert(null)
        setEditing(false) // Close edit mode after successful save
      }, 1500)
    } catch (error) {
      console.error('Save error:', error)
      setAlert({ kind: 'error', message: '更新時發生錯誤' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10 lg:py-14">
        <p className="text-sm text-slate-200/70">載入公司資料中...</p>
      </div>
    )
  }

  if (!company) {
    return (
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10 lg:py-14">
        <p className="text-sm text-slate-200/70">找不到公司資料</p>
        <Link to="/companies" className="text-sky-400 hover:text-sky-300">
          返回公司列表
        </Link>
      </div>
    )
  }

  const mainMedia = company.media?.find((m) => m.isMain) || (company.media && company.media[0]) || null
  const otherMedia = company.media?.filter((m) => !m.isMain) || []
  const canEdit = session?.role === 'admin' || company.ownerEmail?.toLowerCase() === session?.email?.toLowerCase()
  const canDelete = session?.role === 'admin'

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10 lg:py-14">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link to="/companies" className="mb-4 inline-block text-xs text-sky-400 hover:text-sky-300">
            ← 返回公司列表
          </Link>
          <h1 className="text-3xl font-semibold text-white">{company.name}</h1>
          <p className="mt-2 text-sm text-slate-200/80">
            擁有者：{company.ownerName || company.ownerEmail}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {canEdit && !editing && (
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="rounded-lg bg-gradient-to-r from-emerald-500 to-sky-500 px-4 py-2 text-sm font-semibold text-white shadow hover:from-emerald-400 hover:to-sky-400"
            >
              編輯
            </button>
          )}
          {canEdit && editing && (
            <>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving || !formData?.name?.trim()}
                className="rounded-lg bg-gradient-to-r from-emerald-500 to-sky-500 px-4 py-2 text-sm font-semibold text-white shadow disabled:opacity-60"
              >
                {saving ? '儲存中...' : '儲存'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditing(false)
                  setFormData(company)
                }}
                disabled={saving}
                className="rounded-lg bg-white/10 px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-white/15 disabled:opacity-60"
              >
                取消
              </button>
            </>
          )}
          {canDelete && !editing && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="rounded-lg bg-gradient-to-r from-rose-500 to-red-500 px-4 py-2 text-sm font-semibold text-white shadow disabled:opacity-60"
            >
              {deleting ? '刪除中...' : '刪除'}
            </button>
          )}
        </div>
      </div>

      {alert && <AlertBanner kind={alert.kind} message={alert.message} />}

      {/* Main Content: Two Column Layout */}
      <div ref={editFormRef} className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Left Column: Images */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="mb-4 text-lg font-semibold text-white">圖片管理</h2>
          
          {editing && formData ? (
            <>
              <div
                ref={dropRef}
                className="mb-4 rounded-lg border border-dashed border-sky-400/50 bg-sky-400/5 px-3 py-4 text-center text-xs text-sky-100"
              >
                拖放圖片到此或點擊上傳
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => onDropFiles(e.target.files)}
                  className="mt-2 hidden"
                  id="file-input-detail"
                />
                <label
                  htmlFor="file-input-detail"
                  className="mt-2 inline-block cursor-pointer rounded bg-sky-500/20 px-3 py-1 text-xs text-sky-200 hover:bg-sky-500/30"
                >
                  選擇圖片
                </label>
              </div>
              {formData.media?.length > 0 ? (
                <div className="space-y-3">
                  {formData.media.map((m) => (
                    <div key={m.id} className="relative overflow-hidden rounded-lg border border-white/10 bg-white/5">
                      <img src={m.dataUrl} alt={m.name} className="h-32 w-full object-cover" />
                      <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-slate-950/80 px-3 py-2 text-xs text-white">
                        <span className="truncate flex-1">
                          {m.isMain && <span className="text-emerald-300">主圖 • </span>}
                          {m.name}
                        </span>
                        <div className="flex items-center gap-2">
                          {!m.isMain && (
                            <button
                              type="button"
                              onClick={() =>
                                setFormData((c) => ({
                                  ...c,
                                  media: c.media.map((x) => ({ ...x, isMain: x.id === m.id })),
                                }))
                              }
                              className="rounded px-2 py-1 text-[10px] font-semibold text-emerald-200 hover:bg-emerald-500/20"
                            >
                              設為主圖
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => removeMedia(m.id)}
                            className="rounded px-2 py-1 text-[10px] font-semibold text-rose-200 hover:bg-rose-500/20"
                          >
                            刪除
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-400 text-center py-4">暫無圖片</p>
              )}
            </>
          ) : (
            <>
              {mainMedia?.dataUrl ? (
                <div className="mb-4 aspect-video overflow-hidden rounded-xl border border-white/10 bg-white/5">
                  <img
                    src={mainMedia.dataUrl}
                    alt={company.name}
                    className="h-full w-full object-cover"
                  />
                </div>
              ) : (
                <div className="mb-4 aspect-video flex items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-400">
                  無主圖片
                </div>
              )}
              {otherMedia.length > 0 && (
                <div>
                  <h3 className="mb-2 text-sm font-semibold text-white">其他圖片</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {otherMedia.map((m) => (
                      <div key={m.id} className="aspect-video overflow-hidden rounded-lg border border-white/10 bg-white/5">
                        <img src={m.dataUrl} alt={m.name} className="h-full w-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Right Column: All Form Fields */}
        <div className="space-y-6">
          {/* Basic Information */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="mb-4 text-lg font-semibold text-white">基本資訊</h2>
            {editing && formData ? (
              <div className="space-y-3 text-sm">
                <div>
                  <label className="text-xs text-slate-400">公司名稱 *</label>
                  <input
                    ref={nameInputRef}
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-sky-400/50"
                  />
                </div>
                <InfoRowEditable label="地址" value={formData.address || ''} onChange={(v) => setFormData({ ...formData, address: v })} editing={editing} />
                <InfoRowEditable label="電話" value={formData.phone || ''} onChange={(v) => setFormData({ ...formData, phone: v })} editing={editing} />
                <InfoRowEditable label="網站" value={formData.website || ''} onChange={(v) => setFormData({ ...formData, website: v })} editing={editing} />
                <InfoRowEditable label="備註" value={formData.notes || ''} onChange={(v) => setFormData({ ...formData, notes: v })} editing={editing} />
              </div>
            ) : (
              <div className="space-y-3 text-sm">
                <InfoRow label="地址" value={company.address} />
                <InfoRow label="電話" value={company.phone} />
                <InfoRow label="網站" value={company.website} />
                <InfoRow label="備註" value={company.notes} />
              </div>
            )}
          </div>

          {/* Description */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="mb-4 text-lg font-semibold text-white">描述</h2>
            {editing && formData ? (
              <textarea
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-sky-400/50"
                rows={6}
              />
            ) : (
              <p className="text-sm text-slate-200/80 whitespace-pre-wrap">{company.description || '—'}</p>
            )}
          </div>

          {/* Related Users */}
          {editing && formData ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <h2 className="mb-4 text-lg font-semibold text-white">關聯用戶（可多選）</h2>
              <div className="max-h-48 overflow-y-auto rounded-lg border border-white/10 bg-white/5 p-3 scrollable-container">
                {users.length === 0 ? (
                  <p className="text-sm text-slate-400">暫無用戶</p>
                ) : (
                  <div className="space-y-2">
                    {users.map((u) => {
                      const isSelected = Array.isArray(formData.relatedUserIds) && formData.relatedUserIds.includes(u.id)
                      return (
                        <label
                          key={u.id}
                          className="flex cursor-pointer items-center gap-3 rounded-lg border border-white/10 bg-white/5 p-3 transition hover:bg-white/10"
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
                            className="h-4 w-4 rounded border-white/20 bg-white/5 text-sky-500 focus:ring-sky-500"
                          />
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-white">{u.name}</p>
                            <p className="text-xs text-slate-300">{u.email}</p>
                          </div>
                          {u.role === 'admin' && (
                            <span className="rounded-full bg-emerald-500/20 px-2 py-1 text-xs text-emerald-200">
                              管理員
                            </span>
                          )}
                        </label>
                      )
                    })}
                  </div>
                )}
              </div>
              <p className="mt-2 text-xs text-slate-400">
                已選擇 {Array.isArray(formData.relatedUserIds) ? formData.relatedUserIds.length : 0} 位用戶
              </p>
            </div>
          ) : (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <h2 className="mb-4 text-lg font-semibold text-white">關聯用戶</h2>
              {(() => {
                const relatedUserIds = Array.isArray(company.relatedUserIds)
                  ? company.relatedUserIds
                  : company.relatedUserId
                    ? [company.relatedUserId]
                    : []
                const relatedUsers = users.filter(u => relatedUserIds.includes(u.id))
                return relatedUsers.length > 0 ? (
                  <div className="space-y-2">
                    {relatedUsers.map((u) => (
                      <div key={u.id} className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 p-3">
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-white">{u.name}</p>
                          <p className="text-xs text-slate-300">{u.email}</p>
                        </div>
                        {u.role === 'admin' && (
                          <span className="rounded-full bg-emerald-500/20 px-2 py-1 text-xs text-emerald-200">
                            管理員
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-400">暫無關聯用戶</p>
                )
              })()}
            </div>
          )}
        </div>
      </div>

    </div>
  )
}

function InfoRow({ label, value }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
      <p className="text-white">{value || '—'}</p>
    </div>
  )
}

function InfoRowEditable({ label, value, onChange, editing }) {
  if (editing) {
    return (
      <div>
        <label className="text-xs text-slate-400">{label}</label>
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-sky-400/50"
        />
      </div>
    )
  }
  return <InfoRow label={label} value={value} />
}

export default CompanyDetailPage

