import { useEffect, useMemo, useState } from 'react'

const templates = [
  {
    title: '港車情報｜智能物流新里程',
    body: '🚛 5G 物聯網上線，車隊即時定位＋溫控監測。\n⚡ 港珠澳橋口岸提貨時窗縮短 15%。\n🛡️ 司機培訓升級：防疲勞駕駛＋急煞測試。',
  },
  {
    title: '路線優化｜跨境卡車速報',
    body: '🛣️ 深圳灣口岸夜班增班，凌晨排隊更快。\n📦 快消品專線：坪山→觀塘 4 小時送達。\n♻️ 回程優惠：冷鏈回頭車 9 折。',
  },
  {
    title: '司機故事｜安全月亮點',
    body: '👷 連續 120 天零事故，感謝前線司機！\n🔧 每週免費車況健檢，煞車＋胎壓必查。\n🎁 本週分享：留言抽油卡，限 20 名。',
  },
  {
    title: '車輛升級｜新能源卡車上線',
    body: '🔋 新增 10 輛換電重卡，坪山/洪梅站點同步啟用。\n🌱 單趟碳排降 30%，綠色運輸更省心。\n📍 支援：廣州南沙、香港葵涌雙向派送。',
  },
]

const colors = [
  ['#0f172a', '#1e293b'],
  ['#0b1224', '#111827'],
  ['#0a1329', '#0f1f3a'],
  ['#0c1a2e', '#132a46'],
]

function PostGeneratorPage() {
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [refLink, setRefLink] = useState('')
  const [imageData, setImageData] = useState(null)
  const [downloadUrl, setDownloadUrl] = useState('')

  const randomTemplate = useMemo(() => () => {
    const pick = templates[Math.floor(Math.random() * templates.length)]
    setTitle(pick.title)
    setBody(pick.body)
  }, [])

  useEffect(() => {
    randomTemplate()
  }, [randomTemplate])

  const onImageSelect = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setImageData({ name: file.name, dataUrl: reader.result })
    reader.readAsDataURL(file)
  }

  const wrapText = (ctx, text, x, y, maxWidth, lineHeight) => {
    const words = text.split(' ')
    let line = ''
    let cursorY = y
    words.forEach((word) => {
      const testLine = line + word + ' '
      const metrics = ctx.measureText(testLine)
      if (metrics.width > maxWidth) {
        ctx.fillText(line, x, cursorY)
        line = word + ' '
        cursorY += lineHeight
      } else {
        line = testLine
      }
    })
    if (line) ctx.fillText(line, x, cursorY)
    return cursorY + lineHeight
  }

  const generateImage = async () => {
    const canvas = document.createElement('canvas')
    canvas.width = 1080
    canvas.height = 1920
    const ctx = canvas.getContext('2d')

    // background
    const [c1, c2] = colors[Math.floor(Math.random() * colors.length)]
    const grad = ctx.createLinearGradient(0, 0, 0, canvas.height)
    grad.addColorStop(0, c1)
    grad.addColorStop(1, c2)
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // optional image
    if (imageData?.dataUrl) {
      const img = new Image()
      img.src = imageData.dataUrl
      await new Promise((res) => {
        img.onload = res
        img.onerror = res
      })
      const scale = Math.min(canvas.width / img.width, 900 / img.height)
      const w = img.width * scale
      const h = img.height * scale
      const x = (canvas.width - w) / 2
      const y = 200
      ctx.drawImage(img, x, y, w, h)
    }

    // title
    ctx.fillStyle = '#f8fafc'
    ctx.font = 'bold 64px "Noto Sans TC", "Microsoft JhengHei", sans-serif'
    ctx.textAlign = 'left'
    wrapText(ctx, title, 80, 120, canvas.width - 160, 72)

    // body
    ctx.fillStyle = '#e2e8f0'
    ctx.font = '500 44px "Noto Sans TC", "Microsoft JhengHei", sans-serif'
    const bodyLines = body.split('\n')
    let y = 1150
    bodyLines.forEach((line) => {
      y = wrapText(ctx, line, 80, y, canvas.width - 160, 60)
    })

    // reference link
    if (refLink.trim()) {
      ctx.fillStyle = '#cbd5e1'
      ctx.font = '400 32px "Noto Sans TC", "Microsoft JhengHei", sans-serif'
      wrapText(ctx, `參考連結：${refLink.trim()}`, 80, y + 40, canvas.width - 160, 46)
    }

    // watermark
    ctx.fillStyle = 'rgba(255,255,255,0.45)'
    ctx.font = '600 34px "Noto Sans TC", "Microsoft JhengHei", sans-serif'
    ctx.textAlign = 'right'
    ctx.fillText('ZXSGit 貼文產生', canvas.width - 60, canvas.height - 60)

    const url = canvas.toDataURL('image/png')
    setDownloadUrl(url)

    const a = document.createElement('a')
    a.href = url
    a.download = 'hk-truck-post.png'
    a.click()
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-10 lg:py-14">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/30 backdrop-blur">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-200/70">貼文產生</p>
            <h1 className="text-3xl font-semibold text-white">香港卡車主題貼文</h1>
            <p className="text-sm text-slate-200/80">輸入文字、參考連結與圖片，生成可下載的貼文圖片。</p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-white">標題</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-slate-100 outline-none ring-2 ring-transparent transition focus:border-sky-400/50 focus:ring-sky-500/40"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-white">內文</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={6}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-slate-100 outline-none ring-2 ring-transparent transition focus:border-sky-400/50 focus:ring-sky-500/40"
            />
            <p className="text-xs text-slate-300">
              建議包含：路線更新、車隊升級、安全措施、司機故事、客戶回饋、優惠資訊。
            </p>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-white">參考連結（可作為 AI 生成來源）</label>
            <input
              value={refLink}
              onChange={(e) => setRefLink(e.target.value)}
              placeholder="https://example.com/article"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-slate-100 outline-none ring-2 ring-transparent transition focus:border-sky-400/50 focus:ring-sky-500/40"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-white">圖片（上傳或貼圖）</label>
            <input type="file" accept="image/*" onChange={onImageSelect} className="text-slate-200" />
            {imageData && (
              <div className="relative mt-2 h-40 overflow-hidden rounded-xl border border-white/10 bg-white/5">
                <img src={imageData.dataUrl} alt={imageData.name} className="h-full w-full object-cover" />
                <div className="absolute inset-x-0 bottom-0 bg-slate-950/60 px-3 py-2 text-xs text-white">
                  {imageData.name}
                </div>
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={generateImage}
              className="rounded-xl bg-gradient-to-r from-emerald-500 to-sky-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-900/40 transition hover:from-emerald-400 hover:to-sky-400"
            >
              生成並下載圖片
            </button>
            <button
              type="button"
              onClick={randomTemplate}
              className="rounded-xl bg-white/10 px-4 py-3 text-sm font-semibold text-slate-100 ring-1 ring-white/10 transition hover:bg-white/15"
            >
              隨機文案
            </button>
          </div>
          {downloadUrl && (
            <div className="text-xs text-slate-300">
              已生成圖片，可再次點擊「生成並下載圖片」覆蓋。
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default PostGeneratorPage


