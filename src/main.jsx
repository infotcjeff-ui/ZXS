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

// Add error handler for unhandled errors
window.addEventListener('error', (event) => {
  console.error('Unhandled error:', event.error)
})

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason)
})

// Render with error boundaries
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
