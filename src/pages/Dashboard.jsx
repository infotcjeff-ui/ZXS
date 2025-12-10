import { useEffect, useMemo, useState } from 'react'
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

  useEffect(() => {
    const load = async () => {
      const list = await fetchCompanies()
      setCompanies(list)
      const userList = await fetchUsers()
      setUsers(userList)
    }
    load()
  }, [fetchCompanies, fetchUsers])

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

  const myCompanies = useMemo(
    () => companies.filter((c) => {
      const ownerMatch = c.ownerEmail?.toLowerCase() === session?.email?.toLowerCase()
      const relatedMatch = Array.isArray(c.relatedUserIds) 
        ? c.relatedUserIds.includes(session?.email)
        : c.relatedUserId && users.find(u => u.id === c.relatedUserId)?.email === session?.email
      return ownerMatch || relatedMatch
    }),
    [companies, session?.email, users],
  )

  const getRelatedUsers = (company) => {
    if (Array.isArray(company.relatedUserIds)) {
      return users.filter(u => company.relatedUserIds.includes(u.email))
    }
    if (company.relatedUserId) {
      const user = users.find(u => u.id === company.relatedUserId)
      return user ? [user] : []
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
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-slate-100 shadow-xl shadow-black/30 backdrop-blur">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-white">您的公司</p>
              <p className="text-sm text-slate-200/80">
                與您帳戶關聯的公司。可在公司頁面進行管理。
              </p>
            </div>
          </div>
          {myCompanies.length === 0 ? (
            <p className="text-sm text-slate-200/70">尚無公司資料。</p>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {myCompanies.map((c) => {
                const mainMedia = c.media?.find((m) => m.isMain) || (c.media && c.media[0]) || null
                const relatedUsers = getRelatedUsers(c)
                return (
                  <Link
                    key={c.id}
                    to={`/companies/${c.id}`}
                    className="group rounded-2xl border border-white/10 bg-white/5 p-4 shadow-inner shadow-black/20 transition hover:border-sky-400/50 hover:bg-white/10"
                  >
                    {mainMedia?.dataUrl && (
                      <div className="mb-3 aspect-video overflow-hidden rounded-xl bg-white/10">
                        <img
                          src={mainMedia.dataUrl}
                          alt={c.name}
                          className="h-full w-full object-cover transition group-hover:scale-105"
                        />
                      </div>
                    )}
                    <p className="text-base font-semibold text-white group-hover:text-sky-200">{c.name}</p>
                    <p className="mt-1 text-xs text-slate-300">
                      擁有者：{c.ownerName || c.ownerEmail}
                    </p>
                    {relatedUsers.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
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
                    <p className="mt-2 text-sm text-slate-200/80">{c.address || '無地址'}</p>
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


