import { Component } from 'react'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-100">
          <div className="mx-auto max-w-md rounded-2xl border border-white/10 bg-white/5 p-8 text-center shadow-xl">
            <h1 className="mb-4 text-2xl font-semibold text-white">發生錯誤</h1>
            <p className="mb-6 text-sm text-slate-200/80">
              應用程式載入時發生錯誤。請重新整理頁面。
            </p>
            <button
              onClick={() => {
                window.location.href = '/ZXS/'
              }}
              className="rounded-xl bg-gradient-to-r from-emerald-500 to-sky-500 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:from-emerald-400 hover:to-sky-400"
            >
              返回首頁
            </button>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-4 text-left">
                <summary className="cursor-pointer text-xs text-slate-400">錯誤詳情</summary>
                <pre className="mt-2 overflow-auto rounded bg-slate-900/50 p-2 text-xs text-red-300">
                  {this.state.error.toString()}
                  {this.state.error.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary

