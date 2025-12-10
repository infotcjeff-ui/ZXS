import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider.jsx'
import AlertBanner from '../components/AlertBanner.jsx'

const blankCompany = {
  id: null,
  name: '',
  address: '',
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
  const [saving, setSaving] = useState(false)
  const dropRef = useRef(null)
  const galleryDropRef = useRef(null)

  useEffect(() => {
    const loadUsers = async () => {
      const userList = await fetchUsers()
      setUsers(userList || [])
    }
    loadUsers()
  }, [fetchUsers])

  useEffect(() => {
    if (!id) return
    let active = true
    const load = async () => {
      setLoading(true)
      const data = getCompany(id)
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
    setSaving(true)
    setAlert(null)

    const selectedUserIds = Array.isArray(company.relatedUserIds) ? company.relatedUserIds : []
    const firstSelectedUser = selectedUserIds.length > 0
      ? users.find((u) => u.id === selectedUserIds[0])
      : null

    const payload = {
      name: company.name.trim(),
      address: company.address || '',
      description: company.description || '',
      media: Array.isArray(company.media) ? company.media : [],
      gallery: Array.isArray(company.gallery) ? company.gallery : [],
      ownerEmail: firstSelectedUser?.email || company.ownerEmail || session?.email || 'unknown@zxsgit.local',
      ownerName: firstSelectedUser?.name || company.ownerName || session?.name || 'Unknown',
      relatedUserIds: selectedUserIds,
    }

    try {
      console.log('Submitting company update with:')
      console.log('- Media items:', payload.media?.length || 0)
      console.log('- Gallery items:', payload.gallery?.length || 0)
      console.log('- Media data:', payload.media)
      console.log('- Gallery data:', payload.gallery)
      
      const result = company.id
        ? updateCompany(company.id, payload)
        : createCompany(payload)

      console.log('Company save result:', result)
      console.log('Saved company:', result.company)
      console.log('Saved company media:', result.company?.media)
      console.log('Saved company gallery:', result.company?.gallery)

      if (!result.ok) {
        setAlert({ kind: 'error', message: result.message })
        setSaving(false)
        return
      }

      setAlert({ kind: 'success', message: company.id ? '更新成功' : '建立成功' })
      setSaving(false) // Reset saving state
      
      // Verify the save by reading back from localStorage
      const savedCompanies = JSON.parse(localStorage.getItem('zxs-companies') || '[]')
      const savedCompany = savedCompanies.find(c => c.id === (company.id || result.company?.id))
      if (savedCompany) {
        console.log('Verified saved company media count:', savedCompany.media?.length || 0)
        console.log('Verified saved company gallery count:', savedCompany.gallery?.length || 0)
      } else {
        console.error('Company not found in localStorage after save!')
        setAlert({ kind: 'error', message: '儲存成功但無法驗證，請重新整理頁面檢查' })
        setSaving(false)
        return
      }
      
      // Dispatch event immediately
      window.dispatchEvent(new Event('companies:update'))
      
      // Force a small delay to ensure localStorage is updated and event listeners process
      setTimeout(() => {
        if (company.id) {
          // If editing, navigate to detail page to see updates
          navigate(`/companies/${company.id}`)
        } else {
          // If creating, navigate to list
          navigate('/companies')
        }
      }, 300)
    } catch (error) {
      console.error('Error saving company:', error)
      setAlert({ kind: 'error', message: '儲存時發生錯誤: ' + error.message })
      setSaving(false)
    }
  }

  // Compress image to reduce localStorage size
  const compressImage = (file, maxWidth = 1200, maxHeight = 1200, quality = 0.7) => {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const img = new Image()
        img.onload = () => {
          const canvas = document.createElement('canvas')
          let width = img.width
          let height = img.height

          // Calculate new dimensions
          if (width > height) {
            if (width > maxWidth) {
              height = (height * maxWidth) / width
              width = maxWidth
            }
          } else {
            if (height > maxHeight) {
              width = (width * maxHeight) / height
              height = maxHeight
            }
          }

          canvas.width = width
          canvas.height = height

          const ctx = canvas.getContext('2d')
          ctx.drawImage(img, 0, 0, width, height)

          // Convert to compressed data URL
          const compressedDataUrl = canvas.toDataURL('image/jpeg', quality)
          resolve({
            id: crypto.randomUUID(),
            name: file.name,
            dataUrl: compressedDataUrl,
            isMain: false,
          })
        }
        img.src = e.target.result
      }
      reader.readAsDataURL(file)
    })
  }

  const onDropFiles = (files) => {
    const list = Array.from(files)
    if (!list.length) return
    
    // Filter only image files
    const imageFiles = list.filter(file => file.type.startsWith('image/'))
    if (imageFiles.length === 0) {
      setAlert({ kind: 'error', message: '請選擇圖片檔案' })
      return
    }

    // Check file size (warn if > 5MB before compression)
    const largeFiles = imageFiles.filter(f => f.size > 5 * 1024 * 1024)
    if (largeFiles.length > 0) {
      setAlert({ kind: 'error', message: '圖片檔案過大，請選擇較小的圖片（建議 < 5MB）' })
      return
    }

    const readers = imageFiles.map(file => compressImage(file))
    Promise.all(readers)
      .then((media) => {
        setCompany((c) => {
          const existing = c.media || []
          const next =
            existing.length === 0 && media.length
              ? media.map((m, idx) => ({ ...m, isMain: idx === 0 }))
              : media
          return { ...c, media: [...existing, ...next] }
        })
        setAlert({ kind: 'success', message: `已上傳 ${media.length} 張圖片（已壓縮）` })
      })
      .catch((error) => {
        console.error('Error compressing images:', error)
        setAlert({ kind: 'error', message: '圖片處理失敗: ' + error.message })
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
    
    // Filter only image files
    const imageFiles = list.filter(file => file.type.startsWith('image/'))
    if (imageFiles.length === 0) {
      setAlert({ kind: 'error', message: '請選擇圖片檔案' })
      return
    }

    // Check file size (warn if > 5MB before compression)
    const largeFiles = imageFiles.filter(f => f.size > 5 * 1024 * 1024)
    if (largeFiles.length > 0) {
      setAlert({ kind: 'error', message: '圖片檔案過大，請選擇較小的圖片（建議 < 5MB）' })
      return
    }

    if (imageFiles.length > remainingSlots) {
      setAlert({ kind: 'error', message: `圖庫最多只能上傳 5 張圖片，您只能再上傳 ${remainingSlots} 張` })
      imageFiles.splice(remainingSlots)
    }

    const readers = imageFiles.map(file => compressImage(file))
    Promise.all(readers)
      .then((gallery) => {
        setCompany((c) => ({
          ...c,
          gallery: [...(c.gallery || []), ...gallery]
        }))
        setAlert({ kind: 'success', message: `已上傳 ${gallery.length} 張圖片到圖庫（已壓縮）` })
      })
      .catch((error) => {
        console.error('Error compressing gallery images:', error)
        setAlert({ kind: 'error', message: '圖片處理失敗: ' + error.message })
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
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-10 lg:py-14">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-200/70">
            {company.id ? '編輯公司' : '新增公司'}
          </p>
          <h1 className="text-3xl font-semibold text-white">
            {company.id ? company.name || '編輯公司' : '建立公司'}
          </h1>
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
          </div>
        </div>

        {/* Right Column: Form Fields */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="mb-4 text-lg font-semibold text-white">公司資訊</h2>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-400">標題 *</label>
                <input
                  value={company.name || ''}
                  onChange={(e) => setCompany((c) => ({ ...c, name: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-sky-400/50"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400">地址</label>
                <input
                  value={company.address || ''}
                  onChange={(e) => setCompany((c) => ({ ...c, address: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-sky-400/50"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400">描述</label>
                <textarea
                  value={company.description || ''}
                  onChange={(e) => setCompany((c) => ({ ...c, description: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-sky-400/50"
                  rows={4}
                />
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
              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  disabled={saving || !company.name?.trim()}
                  className="rounded-lg bg-gradient-to-r from-emerald-500 to-sky-500 px-4 py-2 text-xs font-semibold text-white shadow disabled:opacity-60"
                >
                  {saving ? '儲存中...' : company.id ? '更新公司' : '建立公司'}
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

