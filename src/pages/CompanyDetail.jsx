import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider.jsx'
import AlertBanner from '../components/AlertBanner.jsx'

function CompanyDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { session, getCompany, deleteCompany } = useAuth()
  const [company, setCompany] = useState(null)
  const [loading, setLoading] = useState(true)
  const [alert, setAlert] = useState(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    let active = true
    const load = async () => {
      setLoading(true)
      const data = await getCompany(id)
      if (active) {
        setCompany(data)
        setLoading(false)
      }
    }
    load()
    return () => {
      active = false
    }
  }, [id, getCompany])

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

      {mainMedia?.dataUrl && (
        <div className="aspect-video overflow-hidden rounded-2xl border border-white/10 bg-white/5">
          <img
            src={mainMedia.dataUrl}
            alt={company.name}
            className="h-full w-full object-cover"
          />
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="mb-4 text-lg font-semibold text-white">基本資訊</h2>
          <div className="space-y-3 text-sm">
            <InfoRow label="地址" value={company.address} />
            <InfoRow label="電話" value={company.phone} />
            <InfoRow label="網站" value={company.website} />
            <InfoRow label="備註" value={company.notes} />
          </div>
        </div>

        {company.description && (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="mb-4 text-lg font-semibold text-white">描述</h2>
            <p className="text-sm text-slate-200/80 whitespace-pre-wrap">{company.description}</p>
          </div>
        )}
      </div>

      {otherMedia.length > 0 && (
        <div>
          <h2 className="mb-4 text-lg font-semibold text-white">其他圖片</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {otherMedia.map((m) => (
              <div key={m.id} className="aspect-video overflow-hidden rounded-xl border border-white/10 bg-white/5">
                <img src={m.dataUrl} alt={m.name} className="h-full w-full object-cover" />
              </div>
            ))}
          </div>
        </div>
      )}
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

export default CompanyDetailPage

