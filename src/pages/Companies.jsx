import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider.jsx'

function CompaniesPage() {
  const { session, fetchCompanies, deleteCompany, fetchUsers } = useAuth()
  const [companies, setCompanies] = useState([])
  const [users, setUsers] = useState([])
  const [view, setView] = useState('grid')
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState(null)

  const loadCompanies = useCallback(async () => {
    setLoading(true)
    const list = await fetchCompanies()
    setCompanies(list)
    const userList = await fetchUsers()
    setUsers(userList)
    setLoading(false)
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
            onEditLink={`/companies/edit/${company.id}`}
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

function CompanyCard({ company, canEdit, canDelete, onEditLink, onDelete, deleting, users = [] }) {
  const mainMedia =
    company.media?.find((m) => m.isMain) || (company.media && company.media[0]) || null
  
  const getRelatedUsers = () => {
    if (Array.isArray(company.relatedUserIds)) {
      return users.filter(u => company.relatedUserIds.includes(u.email))
    }
    if (company.relatedUserId) {
      const user = users.find(u => u.id === company.relatedUserId)
      return user ? [user] : []
    }
    return []
  }
  
  const relatedUsers = getRelatedUsers()
  
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-slate-100 shadow-xl shadow-black/30 backdrop-blur">
      <div className="flex items-start justify-between gap-3">
        <Link to={`/companies/${company.id}`} className="flex flex-1 items-center gap-3 hover:opacity-80">
          <div className="h-12 w-12 overflow-hidden rounded-xl bg-white/10">
            {mainMedia?.dataUrl ? (
              <img src={mainMedia.dataUrl} alt={company.name} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xs text-slate-300">
                無圖片
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
            <Link
              to={onEditLink}
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


