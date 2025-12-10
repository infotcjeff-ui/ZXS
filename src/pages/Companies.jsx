import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider.jsx'
import AlertBanner from '../components/AlertBanner.jsx'

function CompaniesPage() {
  const { session, fetchCompanies, deleteCompany, fetchUsers } = useAuth()
  const location = useLocation()
  const [companies, setCompanies] = useState([])
  const [users, setUsers] = useState([])
  const [view, setView] = useState('grid')
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState(null)

  const loadCompanies = useCallback(async () => {
    setLoading(true)
    try {
      const list = fetchCompanies()
      const userList = await fetchUsers()
      setCompanies(list || [])
      setUsers(userList || [])
      console.log('Loaded companies:', list?.length || 0)
    } catch (error) {
      console.error('Error loading companies:', error)
      setCompanies([])
      setUsers([])
    } finally {
      setLoading(false)
    }
  }, [fetchCompanies, fetchUsers])

  // Reload when navigating to this page
  useEffect(() => {
    if (location.pathname === '/companies') {
      loadCompanies()
    }
  }, [location.pathname, loadCompanies])

  useEffect(() => {
    loadCompanies()
    const handleUpdate = () => {
      console.log('Companies update event received')
      loadCompanies()
    }
    const handleStorage = (e) => {
      if (e.key === 'zxs-companies' || !e.key) {
        console.log('Storage event received for companies')
        loadCompanies()
      }
    }
    window.addEventListener('companies:update', handleUpdate)
    window.addEventListener('storage', handleStorage)
    
    // Also listen for focus event to refresh when returning to tab
    const handleFocus = () => {
      loadCompanies()
    }
    window.addEventListener('focus', handleFocus)
    
    return () => {
      window.removeEventListener('companies:update', handleUpdate)
      window.removeEventListener('storage', handleStorage)
      window.removeEventListener('focus', handleFocus)
    }
  }, [loadCompanies])

  const canEdit = (ownerEmail) =>
    session?.role === 'admin' || ownerEmail?.toLowerCase() === session?.email?.toLowerCase()

  const handleDelete = async (id, name) => {
    if (!confirm(`確定要刪除公司 "${name}"？此操作無法復原。`)) return
    setDeletingId(id)
    const res = await deleteCompany(id)
    if (res.ok) {
      loadCompanies()
    }
    setDeletingId(null)
  }

  const getRelatedUsers = (company) => {
    if (!users || users.length === 0) return []
    if (Array.isArray(company.relatedUserIds) && company.relatedUserIds.length > 0) {
      return users.filter(u => u && u.id && company.relatedUserIds.includes(u.id))
    }
    return []
  }

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

      {view === 'grid' ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {companies.length === 0 && (
            <p className="col-span-full text-sm text-slate-200/70">尚未有公司，請先新增。</p>
          )}
          {companies.map((company) => (
            <CompanyCard
              key={company.id}
              company={company}
              users={users}
              canEdit={canEdit(company.ownerEmail)}
              canDelete={session?.role === 'admin'}
              onDelete={() => handleDelete(company.id, company.name)}
              deleting={deletingId === company.id}
              getRelatedUsers={getRelatedUsers}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {companies.length === 0 && (
            <p className="text-sm text-slate-200/70">尚未有公司，請先新增。</p>
          )}
          {companies.map((company) => (
            <CompanyCard
              key={company.id}
              company={company}
              users={users}
              canEdit={canEdit(company.ownerEmail)}
              canDelete={session?.role === 'admin'}
              onDelete={() => handleDelete(company.id, company.name)}
              deleting={deletingId === company.id}
              getRelatedUsers={getRelatedUsers}
              isList
            />
          ))}
        </div>
      )}
    </div>
  )
}

function CompanyCard({ company, users, canEdit, canDelete, onDelete, deleting, getRelatedUsers, isList = false }) {
  const mainMedia = company.media?.find((m) => m.isMain) || (company.media && company.media[0]) || null
  const galleryCount = company.gallery?.length || 0
  const relatedUsers = getRelatedUsers(company)

  if (isList) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-slate-100 shadow-xl shadow-black/30 backdrop-blur">
        <div className="flex items-start gap-4">
          <Link to={`/companies/${company.id}`} className="flex flex-1 items-center gap-4 hover:opacity-80">
            <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl bg-white/10">
              {mainMedia?.dataUrl ? (
                <img src={mainMedia.dataUrl} alt={company.name} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xs text-slate-300">
                  無圖片
                </div>
              )}
              {galleryCount > 0 && (
                <div className="absolute top-2 right-2 flex items-center gap-0.5 rounded-full bg-black/70 px-2 py-1 text-xs text-white">
                  <span>📷</span>
                  <span>{galleryCount}</span>
                </div>
              )}
            </div>
            <div className="flex-1">
              <p className="text-lg font-semibold text-white">{company.name}</p>
              <p className="mt-1 text-xs text-slate-300">地址：{company.address || '—'}</p>
              {company.description && (
                <p className="mt-2 text-sm text-slate-200/80 line-clamp-2">{company.description}</p>
              )}
              {relatedUsers.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
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
              <Link
                to={`/companies/edit/${company.id}`}
                className="rounded-lg bg-white/10 px-3 py-2 text-xs font-semibold text-sky-100 hover:bg-sky-500/20"
              >
                編輯
              </Link>
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
      </div>
    )
  }

  return (
    <Link
      to={`/companies/${company.id}`}
      className="group rounded-2xl border border-white/10 bg-white/5 p-5 text-slate-100 shadow-xl shadow-black/30 backdrop-blur transition hover:border-sky-400/50 hover:bg-white/10"
    >
      <div className="relative mb-4 aspect-video overflow-hidden rounded-xl bg-white/10">
        {mainMedia?.dataUrl ? (
          <img src={mainMedia.dataUrl} alt={company.name} className="h-full w-full object-cover transition group-hover:scale-105" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-slate-300">
            無圖片
          </div>
        )}
        {galleryCount > 0 && (
          <div className="absolute top-2 right-2 flex items-center gap-0.5 rounded-full bg-black/70 px-2 py-1 text-xs text-white">
            <span>📷</span>
            <span>{galleryCount}</span>
          </div>
        )}
      </div>
      <p className="mb-2 text-lg font-semibold text-white group-hover:text-sky-200">{company.name}</p>
      <p className="mb-2 text-xs text-slate-300">地址：{company.address || '—'}</p>
      {company.description && (
        <p className="mb-3 text-sm text-slate-200/80 line-clamp-2">{company.description}</p>
      )}
      {relatedUsers.length > 0 && (
        <div className="flex flex-wrap gap-1">
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
    </Link>
  )
}

export default CompaniesPage

