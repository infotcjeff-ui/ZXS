import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider.jsx'

function HomePage() {
  const { fetchCompanies } = useAuth()
  const [companies, setCompanies] = useState([])
  const [loading, setLoading] = useState(true)

  const loadCompanies = useCallback(async () => {
    setLoading(true)
    const list = await fetchCompanies()
    setCompanies(list)
    setLoading(false)
  }, [fetchCompanies])

  useEffect(() => {
    loadCompanies()
  }, [loadCompanies])

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10 lg:py-14">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-200/70">首頁</p>
        <h1 className="text-3xl font-semibold text-white">所有公司</h1>
        <p className="text-sm text-slate-200/80">瀏覽所有註冊的公司資訊</p>
      </div>

      {loading && <p className="text-sm text-slate-200/70">載入公司資料中...</p>}

      {!loading && companies.length === 0 && (
        <p className="text-sm text-slate-200/70">尚未有公司資料</p>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {companies.map((company) => (
          <Link
            key={company.id}
            to={`/companies/${company.id}`}
            className="group rounded-2xl border border-white/10 bg-white/5 p-5 text-slate-100 shadow-xl shadow-black/30 backdrop-blur transition hover:border-sky-400/50 hover:bg-white/10"
          >
            <div className="mb-4 aspect-video overflow-hidden rounded-xl bg-white/10">
              {(() => {
                const mainImage = company?.gallery && company.gallery.length > 0 ? company.gallery[0] : null
                return mainImage?.dataUrl ? (
                  <img
                    src={mainImage.dataUrl}
                    alt={company.name}
                    className="h-full w-full object-cover transition group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs text-slate-300">
                    無圖片
                  </div>
                )
              })()}
            </div>
            <h3 className="mb-2 text-lg font-semibold text-white group-hover:text-sky-200">
              {company.name}
            </h3>
            <p className="mb-3 text-xs text-slate-300">{company.ownerName || company.ownerEmail}</p>
            {company.description && (
              <p className="line-clamp-2 text-sm text-slate-200/80">{company.description}</p>
            )}
            <div className="mt-4 flex items-center gap-2 text-xs text-sky-300">
              <span>查看詳情</span>
              <span>→</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default HomePage

