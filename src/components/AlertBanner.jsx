const toneStyles = {
  success: 'from-emerald-500/20 to-emerald-500/10 text-emerald-200 border-emerald-500/30',
  error: 'from-rose-500/20 to-rose-500/10 text-rose-200 border-rose-500/30',
  info: 'from-sky-500/20 to-sky-500/10 text-sky-100 border-sky-500/30',
}

function AlertBanner({ kind = 'info', message }) {
  if (!message) return null
  const tone = toneStyles[kind] ?? toneStyles.info

  return (
    <div
      className={`w-full rounded-xl border bg-gradient-to-br px-4 py-3 text-sm font-medium shadow-lg shadow-black/30 backdrop-blur ${tone}`}
      role="alert"
    >
      {message}
    </div>
  )
}

export default AlertBanner


