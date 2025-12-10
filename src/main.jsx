import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './auth/AuthProvider.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'

// Ensure root element exists
const rootElement = document.getElementById('root')
if (!rootElement) {
  throw new Error('Root element not found')
}

// Clear loading message immediately when React starts
if (rootElement) {
  rootElement.style.position = 'relative'
}

// Add error handler for unhandled errors
window.addEventListener('error', (event) => {
  console.error('Unhandled error:', event.error)
  // Show error in root if React failed to render
  if (rootElement && rootElement.children.length === 0) {
    rootElement.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: center; min-height: 100vh; flex-direction: column; gap: 1rem; padding: 2rem;">
        <h1 style="color: #e2e8f0; font-size: 1.5rem;">載入錯誤</h1>
        <p style="color: #94a3b8; text-align: center;">發生錯誤：${event.error?.message || '未知錯誤'}</p>
        <p style="color: #64748b; font-size: 0.875rem; text-align: center;">請檢查瀏覽器控制台獲取更多資訊</p>
        <button onclick="window.location.reload(true)" style="padding: 0.75rem 1.5rem; background: linear-gradient(to right, #10b981, #0ea5e9); color: white; border: none; border-radius: 0.5rem; cursor: pointer; font-weight: 600;">
          重新載入
        </button>
      </div>
    `
  }
})

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason)
})

// Render with error boundaries
try {
  createRoot(rootElement).render(
    <StrictMode>
      <ErrorBoundary>
        <BrowserRouter basename="/ZXS">
          <ErrorBoundary>
            <AuthProvider>
              <ErrorBoundary>
                <App />
              </ErrorBoundary>
            </AuthProvider>
          </ErrorBoundary>
        </BrowserRouter>
      </ErrorBoundary>
    </StrictMode>,
  )
} catch (error) {
  console.error('Failed to render React app:', error)
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: center; min-height: 100vh; flex-direction: column; gap: 1rem; padding: 2rem;">
        <h1 style="color: #e2e8f0; font-size: 1.5rem;">初始化失敗</h1>
        <p style="color: #94a3b8; text-align: center;">${error.message || '無法載入應用程式'}</p>
        <button onclick="window.location.reload(true)" style="padding: 0.75rem 1.5rem; background: linear-gradient(to right, #10b981, #0ea5e9); color: white; border: none; border-radius: 0.5rem; cursor: pointer; font-weight: 600;">
          重新載入
        </button>
      </div>
    `
  }
}
