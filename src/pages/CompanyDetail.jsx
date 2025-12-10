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
  const [selectedGalleryIndex, setSelectedGalleryIndex] = useState(0)
  const editFormRef = useRef(null)
  const dropRef = useRef(null)
  const galleryDropRef = useRef(null)

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
          // Normalize company data to ensure consistency
          const normalizedCompany = {
            ...data,
            media: Array.isArray(data.media) ? data.media : [],
            gallery: Array.isArray(data.gallery) ? data.gallery : [],
            relatedUserIds: Array.isArray(data.relatedUserIds)
              ? data.relatedUserIds
              : data.relatedUserId
                ? [data.relatedUserId]
                : [],
          }
          setCompany(normalizedCompany)
          setFormData(normalizedCompany)
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
    if (editing) {
      // Only scroll to form when entering edit mode, don't focus to avoid interrupting user input
      setTimeout(() => {
        editFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 100)
    }
  }, [editing]) // Only trigger when editing state changes, not when formData changes

  const onDropFiles = (files, isGallery = false) => {
    const list = Array.from(files)
    if (!list.length) return
    
    // Limit gallery to 5 images
    if (isGallery) {
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
    }
    
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
      if (isGallery) {
        setFormData((c) => ({
          ...c,
          gallery: [...(c.gallery || []), ...media]
        }))
      } else {
        setFormData((c) => {
          const existing = c.media || []
          const next =
            existing.length === 0 && media.length
              ? media.map((m, idx) => ({ ...m, isMain: idx === 0 }))
              : media
          return { ...c, media: [...existing, ...next] }
        })
      }
    })
  }

  useEffect(() => {
    if (!editing) return
    const el = dropRef.current
    const galleryEl = galleryDropRef.current
    if (!el && !galleryEl) return
    const prevent = (e) => {
      e.preventDefault()
      e.stopPropagation()
    }
    const handleDrop = (e) => {
      prevent(e)
      onDropFiles(e.dataTransfer.files, false)
    }
    const handleGalleryDrop = (e) => {
      prevent(e)
      onDropFiles(e.dataTransfer.files, true)
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
  }, [editing, formData])

  const removeMedia = (mid) =>
    setFormData((c) => ({ ...c, media: (c.media || []).filter((m) => m.id !== mid) }))

  const removeGalleryImage = (gid) =>
    setFormData((c) => ({ ...c, gallery: (c.gallery || []).filter((g) => g.id !== gid) }))

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
        gallery: Array.isArray(formData.gallery) ? formData.gallery : [],
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
      // Reload company data and users
      const [updated, updatedUsers] = await Promise.all([
        getCompany(id),
        fetchUsers()
      ])
      if (updated) {
        // Ensure all fields are properly initialized
        const normalizedCompany = {
          ...updated,
          media: Array.isArray(updated.media) ? updated.media : [],
          gallery: Array.isArray(updated.gallery) ? updated.gallery : [],
          relatedUserIds: Array.isArray(updated.relatedUserIds)
            ? updated.relatedUserIds
            : updated.relatedUserId
              ? [updated.relatedUserId]
              : [],
        }
        setCompany(normalizedCompany)
        setFormData(normalizedCompany)
      }
      if (updatedUsers) {
        setUsers(updatedUsers)
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

  // Reset gallery index when company changes
  useEffect(() => {
    if (company?.gallery && company.gallery.length > 0) {
      setSelectedGalleryIndex(0)
    }
  }, [company?.id])

  const mainMedia = company?.media?.find((m) => m.isMain) || (company?.media && company.media[0]) || null
  const otherMedia = company?.media?.filter((m) => !m.isMain) || []
  const canEdit = session?.role === 'admin' || company?.ownerEmail?.toLowerCase() === session?.email?.toLowerCase()
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
                    <div key={m.id} className="relative rounded-lg border border-white/10 bg-white/5 p-2">
                      <div className="max-h-64 overflow-auto">
                        <img src={m.dataUrl} alt={m.name} className="w-full h-auto object-contain" />
                      </div>
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
              
              {/* Gallery Section */}
              <div className="mt-6">
                <h3 className="mb-3 text-sm font-semibold text-white">圖庫（最多 5 張）</h3>
                <div
                  ref={galleryDropRef}
                  className="mb-3 rounded-lg border border-dashed border-purple-400/50 bg-purple-400/5 px-3 py-4 text-center text-xs text-purple-100"
                >
                  拖放圖片到此或點擊上傳
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => onDropFiles(e.target.files, true)}
                    className="mt-2 hidden"
                    id="gallery-input-detail"
                    disabled={(formData?.gallery?.length || 0) >= 5}
                  />
                  <label
                    htmlFor="gallery-input-detail"
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
                  <div className="space-y-2">
                    {formData.gallery.map((g) => (
                      <div key={g.id} className="relative rounded-lg border border-white/10 bg-white/5 p-2">
                        <div className="max-h-32 overflow-auto">
                          <img src={g.dataUrl} alt={g.name} className="w-full h-auto object-contain" />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeGalleryImage(g.id)}
                          className="absolute top-2 right-2 rounded bg-rose-500/80 px-2 py-1 text-[10px] font-semibold text-white hover:bg-rose-500"
                        >
                          刪除
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              {mainMedia?.dataUrl ? (
                <div className="mb-4 rounded-xl border border-white/10 bg-white/5 p-2">
                  <div className="max-h-96 overflow-auto">
                    <img
                      src={mainMedia.dataUrl}
                      alt={company.name}
                      className="w-full h-auto object-contain"
                    />
                  </div>
                </div>
              ) : (
                <div className="mb-4 aspect-video flex items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-400">
                  無主圖片
                </div>
              )}
              
              {/* Gallery Display */}
              {company.gallery && company.gallery.length > 0 && (
                <div className="mb-4">
                  <h3 className="mb-3 text-sm font-semibold text-white">圖庫</h3>
                  {/* Main Gallery Image Display */}
                  <div className="mb-3 rounded-xl border border-white/10 bg-white/5 p-2">
                    <div className="max-h-96 overflow-auto">
                      <img
                        src={company.gallery[selectedGalleryIndex]?.dataUrl}
                        alt={`Gallery ${selectedGalleryIndex + 1}`}
                        className="w-full h-auto object-contain"
                      />
                    </div>
                  </div>
                  
                  {/* Gallery Thumbnail Grid (4 images with arrows) */}
                  {company.gallery.length > 1 && (
                    <div className="relative">
                      <div className="flex items-center gap-2">
                        {/* Left Arrow */}
                        {selectedGalleryIndex > 0 && (
                          <button
                            type="button"
                            onClick={() => setSelectedGalleryIndex(Math.max(0, selectedGalleryIndex - 1))}
                            className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 text-white hover:bg-white/20"
                          >
                            ←
                          </button>
                        )}
                        {selectedGalleryIndex === 0 && <div className="w-10" />}
                        
                        {/* Thumbnail Grid (4 images, showing current viewport) */}
                        <div className="flex-1 grid grid-cols-4 gap-2">
                          {(() => {
                            // Calculate which 4 images to show
                            const startIdx = Math.max(0, Math.min(selectedGalleryIndex - 1, company.gallery.length - 4))
                            const endIdx = Math.min(startIdx + 4, company.gallery.length)
                            return company.gallery.slice(startIdx, endIdx).map((g, idx) => {
                              const actualIdx = startIdx + idx
                              return (
                                <button
                                  key={g.id}
                                  type="button"
                                  onClick={() => setSelectedGalleryIndex(actualIdx)}
                                  className={`rounded-lg border-2 overflow-hidden transition ${
                                    selectedGalleryIndex === actualIdx
                                      ? 'border-sky-400 bg-sky-400/20'
                                      : 'border-white/10 bg-white/5 hover:border-white/20'
                                  }`}
                                >
                                  <div className="aspect-square overflow-hidden">
                                    <img
                                      src={g.dataUrl}
                                      alt={`Thumbnail ${actualIdx + 1}`}
                                      className="h-full w-full object-cover"
                                    />
                                  </div>
                                </button>
                              )
                            })
                          })()}
                        </div>
                        
                        {/* Right Arrow */}
                        {selectedGalleryIndex < company.gallery.length - 1 && (
                          <button
                            type="button"
                            onClick={() => setSelectedGalleryIndex(Math.min(company.gallery.length - 1, selectedGalleryIndex + 1))}
                            className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 text-white hover:bg-white/20"
                          >
                            →
                          </button>
                        )}
                        {selectedGalleryIndex >= company.gallery.length - 1 && <div className="w-10" />}
                      </div>
                      {/* Gallery Counter */}
                      <p className="mt-2 text-center text-xs text-slate-400">
                        {selectedGalleryIndex + 1} / {company.gallery.length}
                      </p>
                    </div>
                  )}
                </div>
              )}
              
              {otherMedia.length > 0 && (
                <div>
                  <h3 className="mb-2 text-sm font-semibold text-white">其他圖片</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {otherMedia.map((m) => (
                      <div key={m.id} className="rounded-lg border border-white/10 bg-white/5 p-1">
                        <div className="max-h-32 overflow-auto">
                          <img src={m.dataUrl} alt={m.name} className="w-full h-auto object-contain" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Right Column: All Form Fields in One Section */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="mb-4 text-lg font-semibold text-white">公司資訊</h2>
          {editing && formData ? (
            <div className="space-y-4 text-sm">
              <div>
                <label className="text-xs text-slate-400">公司名稱 *</label>
                <input
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-sky-400/50"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400">地址</label>
                <input
                  value={formData.address || ''}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-sky-400/50"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400">電話</label>
                <input
                  value={formData.phone || ''}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-sky-400/50"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400">網站</label>
                <input
                  value={formData.website || ''}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-sky-400/50"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400">備註</label>
                <input
                  value={formData.notes || ''}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-sky-400/50"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400">描述</label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-sky-400/50"
                  rows={4}
                />
              </div>
              <div>
                <label className="mb-2 block text-xs text-slate-400">關聯用戶（可多選）</label>
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
              {/* Save/Cancel Buttons */}
              <div className="flex justify-end gap-2 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving || !formData?.name?.trim()}
                  className="rounded-lg bg-gradient-to-r from-emerald-500 to-sky-500 px-6 py-2 text-sm font-semibold text-white shadow disabled:opacity-60"
                >
                  {saving ? '儲存中...' : '儲存'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditing(false)
                    // Reset formData to current company state
                    const normalizedCompany = {
                      ...company,
                      media: Array.isArray(company.media) ? company.media : [],
                      gallery: Array.isArray(company.gallery) ? company.gallery : [],
                      relatedUserIds: Array.isArray(company.relatedUserIds)
                        ? company.relatedUserIds
                        : company.relatedUserId
                          ? [company.relatedUserId]
                          : [],
                    }
                    setFormData(normalizedCompany)
                  }}
                  disabled={saving}
                  className="rounded-lg bg-white/10 px-6 py-2 text-sm font-semibold text-slate-200 hover:bg-white/15 disabled:opacity-60"
                >
                  取消
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4 text-sm">
              <InfoRow label="地址" value={company.address} />
              <InfoRow label="電話" value={company.phone} />
              <InfoRow label="網站" value={company.website} />
              <InfoRow label="備註" value={company.notes} />
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400">描述</p>
                <p className="mt-1 text-sm text-slate-200/80 whitespace-pre-wrap">{company.description || '—'}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400 mb-2">關聯用戶</p>
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

