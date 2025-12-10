import { useEffect, useState, useRef } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider.jsx'
import AlertBanner from '../components/AlertBanner.jsx'

function CompanyDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { session, getCompany, deleteCompany, fetchUsers } = useAuth()
  const [company, setCompany] = useState(null)
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [alert, setAlert] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [selectedGalleryIndex, setSelectedGalleryIndex] = useState(0)

  useEffect(() => {
    let active = true
    const load = async () => {
      setLoading(true)
      try {
        const data = getCompany(id)
        const userList = await fetchUsers()
        if (active && data) {
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
          console.log('CompanyDetail: Loaded company data:', normalizedCompany)
          console.log('CompanyDetail: Media count:', normalizedCompany.media?.length || 0)
          console.log('CompanyDetail: Gallery count:', normalizedCompany.gallery?.length || 0)
          console.log('CompanyDetail: Media sample:', normalizedCompany.media?.[0] ? { id: normalizedCompany.media[0].id, hasDataUrl: !!normalizedCompany.media[0].dataUrl } : 'none')
          console.log('CompanyDetail: Gallery sample:', normalizedCompany.gallery?.[0] ? { id: normalizedCompany.gallery[0].id, hasDataUrl: !!normalizedCompany.gallery[0].dataUrl } : 'none')
          
          // Force re-render by creating a new object reference
          setCompany({ ...normalizedCompany })
          setUsers(userList || [])
        } else if (active && !data) {
          console.error('CompanyDetail: Company not found for ID:', id)
          setAlert({ kind: 'error', message: '找不到公司資料' })
        }
      } catch (error) {
        console.error('Error loading company data:', error)
        setAlert({ kind: 'error', message: '載入公司資料失敗' })
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }
    load()

    const handleUpdate = () => {
      console.log('CompanyDetail: Update event received, reloading...')
      if (active) {
        load()
      }
    }
    const handleStorage = (e) => {
      if (e.key === 'zxs-companies' || !e.key) {
        console.log('CompanyDetail: Storage event received, reloading...')
        if (active) {
          load()
        }
      }
    }
    window.addEventListener('companies:update', handleUpdate)
    window.addEventListener('storage', handleStorage)

    return () => {
      active = false
      window.removeEventListener('companies:update', handleUpdate)
      window.removeEventListener('storage', handleStorage)
    }
  }, [id, getCompany, fetchUsers])

  useEffect(() => {
    if (company?.gallery && company.gallery.length > 0) {
      setSelectedGalleryIndex(0)
    }
  }, [company?.id])

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

  const mainMedia = company?.media?.find((m) => m.isMain) || (company?.media && company.media[0]) || null
  const canEdit = session?.role === 'admin' || company?.ownerEmail?.toLowerCase() === session?.email?.toLowerCase()
  const canDelete = session?.role === 'admin'

  const getRelatedUsers = () => {
    if (!users || users.length === 0) return []
    if (Array.isArray(company.relatedUserIds) && company.relatedUserIds.length > 0) {
      return users.filter(u => u && u.id && company.relatedUserIds.includes(u.id))
    }
    return []
  }

  const relatedUsers = getRelatedUsers()

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
        <div className="flex items-center gap-2">
          {canEdit && (
            <Link
              to={`/companies/edit/${company.id}`}
              className="rounded-lg bg-gradient-to-r from-emerald-500 to-sky-500 px-4 py-2 text-sm font-semibold text-white shadow hover:from-emerald-400 hover:to-sky-400"
            >
              編輯
            </Link>
          )}
          {canDelete && (
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

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Left Column: Images */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="mb-4 text-lg font-semibold text-white">圖片</h2>
          
          {/* Main Image */}
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
              {/* Main Gallery Image */}
              <div className="mb-3 rounded-xl border border-white/10 bg-white/5 p-2">
                <div className="aspect-video overflow-hidden rounded-lg">
                  <img
                    src={company.gallery[selectedGalleryIndex]?.dataUrl}
                    alt={`Gallery ${selectedGalleryIndex + 1}`}
                    className="h-full w-full object-contain"
                  />
                </div>
              </div>
              
              {/* Gallery Thumbnail Grid */}
              {company.gallery.length > 1 && (
                <div className="relative">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedGalleryIndex((prev) => (prev === 0 ? company.gallery.length - 1 : prev - 1))}
                      className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 text-white hover:bg-white/20 transition"
                    >
                      ←
                    </button>
                    
                    <div className="flex-1 grid grid-cols-4 gap-2">
                      {Array.from({ length: Math.min(4, company.gallery.length) }).map((_, idx) => {
                        const galleryIndex = (selectedGalleryIndex - 1 + idx + company.gallery.length) % company.gallery.length
                        const g = company.gallery[galleryIndex]
                        const isSelected = galleryIndex === selectedGalleryIndex
                        
                        return (
                          <button
                            key={`${g.id}-${idx}`}
                            type="button"
                            onClick={() => setSelectedGalleryIndex(galleryIndex)}
                            className={`rounded-lg border-2 overflow-hidden transition ${
                              isSelected
                                ? 'border-sky-400 bg-sky-400/20'
                                : 'border-white/10 bg-white/5 hover:border-white/20'
                            }`}
                          >
                            <div className="aspect-square overflow-hidden">
                              <img
                                src={g.dataUrl}
                                alt={`Thumbnail ${galleryIndex + 1}`}
                                className="h-full w-full object-cover"
                              />
                            </div>
                          </button>
                        )
                      })}
                    </div>
                    
                    <button
                      type="button"
                      onClick={() => setSelectedGalleryIndex((prev) => (prev === company.gallery.length - 1 ? 0 : prev + 1))}
                      className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 text-white hover:bg-white/20 transition"
                    >
                      →
                    </button>
                  </div>
                  <p className="mt-2 text-center text-xs text-slate-400">
                    {selectedGalleryIndex + 1} / {company.gallery.length}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Company Information */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="mb-4 text-lg font-semibold text-white">公司資訊</h2>
          <div className="space-y-4 text-sm">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">標題</p>
              <p className="text-white">{company.name || '—'}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">地址</p>
              <p className="text-white">{company.address || '—'}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">描述</p>
              <p className="mt-1 text-sm text-slate-200/80 whitespace-pre-wrap">{company.description || '—'}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400 mb-2">關聯用戶</p>
              {relatedUsers.length > 0 ? (
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
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CompanyDetailPage

