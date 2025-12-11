import { useMemo, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider.jsx'

function MetricCard({ label, value, trend, tone }) {
  const toneStyles = {
    up: 'text-emerald-300 bg-emerald-500/10 ring-emerald-500/20',
    down: 'text-rose-300 bg-rose-500/10 ring-rose-500/20',
    steady: 'text-sky-200 bg-sky-500/10 ring-sky-500/20',
  }
  const style = toneStyles[tone] ?? toneStyles.steady

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-xl shadow-black/30 backdrop-blur">
      <p className="text-sm font-medium text-slate-200/90">{label}</p>
      <div className="mt-3 flex items-center justify-between">
        <p className="text-3xl font-semibold text-white">{value}</p>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ring-1 ${style}`}
        >
          {trend}
        </span>
      </div>
    </div>
  )
}

function Dashboard() {
  const { session, logout, fetchTodos, fetchCompanies, fetchUsers } = useAuth()
  const [companies, setCompanies] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  const todos = useMemo(() => fetchTodos(), [fetchTodos])
  const todoStats = useMemo(() => {
    const total = todos.length
    const done = todos.filter((t) => t.done).length
    const mine = todos.filter((t) => t.userEmail === session?.email).length
    return {
      total,
      done,
      mine,
      pending: total - done,
    }
  }, [todos, session?.email])

  useEffect(() => {
    const loadData = async () => {
      try {
        const companyList = fetchCompanies()
        const userList = await fetchUsers()
        setCompanies(companyList || [])
        setUsers(userList || [])
      } catch (error) {
        console.error('Error loading companies:', error)
        setCompanies([])
        setUsers([])
      } finally {
        setLoading(false)
      }
    }
    loadData()

    // Listen for company updates
    const handleUpdate = () => {
      const companyList = fetchCompanies()
      setCompanies(companyList || [])
    }
    window.addEventListener('companies:update', handleUpdate)
    return () => {
      window.removeEventListener('companies:update', handleUpdate)
    }
  }, [fetchCompanies, fetchUsers])

  // Get companies related to current user
  const myCompanies = useMemo(() => {
    if (!session?.email) return []
    return companies.filter((c) => {
      // Check if user is owner
      if (c.ownerEmail?.toLowerCase() === session.email.toLowerCase()) return true
      // Check if user is in relatedUserIds
      if (Array.isArray(c.relatedUserIds) && c.relatedUserIds.length > 0) {
        return c.relatedUserIds.some((uid) => {
          const user = users.find((u) => u.id === uid)
          return user?.email?.toLowerCase() === session.email.toLowerCase()
        })
      }
      return false
    })
  }, [companies, users, session?.email])

  const getRelatedUsers = (company) => {
    if (!users || users.length === 0) return []
    if (Array.isArray(company.relatedUserIds) && company.relatedUserIds.length > 0) {
      return users.filter(u => u && u.id && company.relatedUserIds.includes(u.id))
    }
    return []
  }


  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10 lg:py-14">
      <div className="rounded-3xl border border-white/10 bg-gradient-to-r from-white/10 via-white/5 to-white/5 p-8 shadow-2xl shadow-black/40 backdrop-blur">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-200/70">
              主控台
            </p>
            <h1 className="mt-1 text-3xl font-semibold text-white">歡迎，{session?.name}</h1>
            <p className="text-sm text-slate-200/80">
              您的會話令牌已本地儲存，每次登入時會輪換。您可以隨時結束會話。
            </p>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 shadow-inner shadow-black/20 backdrop-blur">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/20 text-lg font-semibold text-sky-100">
              {session?.name?.[0]?.toUpperCase()}
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-white">{session?.name}</span>
              <span className="text-xs text-slate-200/80">{session?.email}</span>
            </div>
            <button
              type="button"
              onClick={logout}
              className="ml-2 rounded-xl bg-white/10 px-3 py-2 text-xs font-semibold text-rose-100 ring-1 ring-rose-500/30 transition hover:bg-rose-500/10 hover:text-white"
            >
              登出
            </button>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-slate-100 shadow-lg shadow-black/30 backdrop-blur">
            <p className="text-sm font-semibold text-white">待辦事項摘要</p>
            <ul className="mt-3 space-y-2 text-sm text-slate-200/80">
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                總數：{' '}
                <span className="font-semibold text-white">{todoStats.total || 0}</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                已完成：{' '}
                <span className="font-semibold text-white">{todoStats.done || 0}</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                待處理：{' '}
                <span className="font-semibold text-white">{todoStats.pending || 0}</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                您的待辦：{' '}
                <span className="font-semibold text-white">{todoStats.mine || 0}</span>
              </li>
            </ul>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-slate-100 shadow-lg shadow-black/30 backdrop-blur">
            <p className="text-sm font-semibold text-white">提醒事項（僅管理員）</p>
            {session?.role === 'admin' ? (
              <ul className="mt-3 space-y-2 text-sm text-slate-200/80">
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  管理員可以編輯所有待辦事項和所有用戶記錄。
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  成員只能編輯自己的待辦事項和個人資料。
                </li>
              </ul>
            ) : (
              <p className="mt-2 text-sm text-slate-200/70">僅限管理員。</p>
            )}
          </div>
        </div>

        {/* Companies Section */}
        <div className="mt-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">已連接的公司</h2>
            <Link
              to="/companies"
              className="text-sm font-semibold text-sky-400 hover:text-sky-300 transition"
            >
              查看全部 →
            </Link>
          </div>
          
          {loading ? (
            <p className="text-sm text-slate-200/70">載入中...</p>
          ) : myCompanies.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center">
              <p className="text-sm text-slate-200/70">您目前沒有連接的公司</p>
              <Link
                to="/companies/new"
                className="mt-3 inline-block rounded-lg bg-gradient-to-r from-emerald-500 to-sky-500 px-4 py-2 text-sm font-semibold text-white shadow hover:opacity-90 transition"
              >
                建立新公司
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {myCompanies.map((company) => {
                const mainImage = company?.gallery && company.gallery.length > 0 ? company.gallery[0] : null
                const relatedUsers = getRelatedUsers(company)
                
                return (
                  <Link
                    key={company.id}
                    to={`/companies/${company.id}`}
                    className="group rounded-2xl border border-white/10 bg-white/5 p-4 shadow-lg shadow-black/30 backdrop-blur transition hover:border-white/20 hover:bg-white/10"
                  >
                    {mainImage ? (
                      <div className="mb-3 aspect-video overflow-hidden rounded-lg">
                        <img
                          src={mainImage.dataUrl}
                          alt={company.name}
                          className="h-full w-full object-cover transition group-hover:scale-105"
                        />
                      </div>
                    ) : (
                      <div className="mb-3 aspect-video rounded-lg bg-slate-800/50 flex items-center justify-center">
                        <span className="text-xs text-slate-400">無圖片</span>
                      </div>
                    )}
                    
                    <h3 className="mb-2 text-lg font-semibold text-white group-hover:text-sky-300 transition">
                      {company.name || '未命名公司'}
                    </h3>
                    
                    {company.address && (
                      <p className="mb-2 text-xs text-slate-200/70 line-clamp-1">
                        📍 {company.address}
                      </p>
                    )}
                    
                    {relatedUsers.length > 0 && (
                      <div className="mb-2 flex flex-wrap gap-1">
                        {relatedUsers.slice(0, 3).map((user) => (
                          <span
                            key={user.id}
                            className="rounded-full bg-sky-500/20 px-2 py-0.5 text-[10px] font-semibold text-sky-200"
                          >
                            {user.name}
                          </span>
                        ))}
                        {relatedUsers.length > 3 && (
                          <span className="rounded-full bg-slate-500/20 px-2 py-0.5 text-[10px] font-semibold text-slate-300">
                            +{relatedUsers.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                    
                    {company.description && (
                      <p className="text-xs text-slate-200/60 line-clamp-2">
                        {company.description}
                      </p>
                    )}
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </div>

    </div>
  )
}

export default Dashboard


