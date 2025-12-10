import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider.jsx'
import AlertBanner from '../components/AlertBanner.jsx'

function CompanyDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { session, getCompany, deleteCompany, updateCompany } = useAuth()
  const [company, setCompany] = useState(null)
  const [loading, setLoading] = useState(true)
  const [alert, setAlert] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let active = true
    const load = async () => {
      setLoading(true)
      const data = await getCompany(id)
      if (active) {
        setCompany(data)
        setFormData(data)
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

  const handleSave = async () => {
    if (!formData.name?.trim()) {
      setAlert({ kind: 'error', message: '公司名稱為必填' })
      return
    }
    setSaving(true)
    setAlert(null)
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
    setSaving(false)
    if (!res.ok) {
      setAlert({ kind: 'error', message: res.message || '更新失敗' })
      return
    }
    setAlert({ kind: 'success', message: '更新成功' })
    setEditing(false)
    const updated = await getCompany(id)
    setCompany(updated)
    setFormData(updated)
    window.dispatchEvent(new Event('companies:update'))
    setTimeout(() => setAlert(null), 2000)
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
          {editing && formData ? (
            <div className="space-y-3 text-sm">
              <div>
                <label className="text-xs text-slate-400">公司名稱 *</label>
                <input
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

