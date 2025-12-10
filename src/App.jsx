import { Link, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import LoginPage from './pages/Login.jsx'
import RegisterPage from './pages/Register.jsx'
import Dashboard from './pages/Dashboard.jsx'
import TodoPage from './pages/Todo.jsx'
import AdminPage from './pages/Admin.jsx'
import ProfilePage from './pages/Profile.jsx'
import CompaniesPage from './pages/Companies.jsx'
import CompanyFormPage from './pages/CompanyForm.jsx'
import CompanyDetailPage from './pages/CompanyDetail.jsx'
import PostGeneratorPage from './pages/PostGenerator.jsx'
import ProductsPage from './pages/Products.jsx'
import ProductDetailPage from './pages/ProductDetail.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import { useAuth } from './auth/AuthProvider.jsx'

function NavBar() {
  const { isAuthenticated, session } = useAuth()
  const location = useLocation()
  const isActive = (path) => location.pathname === path

  const navLink = (path, label) => (
    <Link
      to={path}
      className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${
        isActive(path) ? 'bg-white/15 text-white shadow-sm shadow-black/30' : 'text-slate-200/80'
      } hover:text-white`}
    >
      {label}
    </Link>
  )

  return (
    <header className="sticky top-0 z-30 border-b border-white/5 bg-slate-950/60 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4">
        <Link to="/" className="flex items-center gap-2 text-white">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-600 text-lg font-extrabold text-white shadow-lg shadow-sky-900/50">
            ZX
          </span>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-semibold text-slate-200">ZXSGit</span>
            <span className="text-[11px] text-slate-400">Secure Access</span>
          </div>
        </Link>
        <nav className="flex items-center gap-2">
          {!isAuthenticated && navLink('/login', '登入')}
          {!isAuthenticated && navLink('/register', '註冊')}
          {isAuthenticated && navLink('/', '主控台')}
          {isAuthenticated && navLink('/companies', '公司')}
          {isAuthenticated && navLink('/products', '產品')}
          {isAuthenticated && navLink('/todos', '待辦清單')}
          {isAuthenticated && navLink('/posts', '貼文產生')}
          {isAuthenticated && navLink('/profile', '個人資料')}
          {session?.role === 'admin' && navLink('/admin', '管理')}
        </nav>
      </div>
    </header>
  )
}

function AppShell() {
  return (
    <div className="relative min-h-screen overflow-hidden text-slate-100">
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute inset-0 bg-slate-950" />
        <div className="absolute -left-24 top-10 h-80 w-80 rounded-full bg-sky-500/30 blur-[130px]" 
             style={{ animation: 'float 6s ease-in-out infinite' }} />
        <div className="absolute right-0 top-20 h-72 w-72 rounded-full bg-fuchsia-500/25 blur-[140px]"
             style={{ animation: 'float 7s ease-in-out infinite reverse' }} />
        <div className="absolute bottom-0 left-24 h-72 w-72 rounded-full bg-emerald-500/25 blur-[150px]"
             style={{ animation: 'float 8s ease-in-out infinite' }} />
      </div>
      <div className="relative z-10 flex min-h-screen flex-col">
        <NavBar />
        <main className="flex-1">
          <Routes>
            <Route
              path="/"
              element={
                <ProtectedRoute allowedRoles={['admin', 'member']}>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute allowedRoles={['admin', 'member']}>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/companies"
              element={
                <ProtectedRoute>
                  <CompaniesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/companies/new"
              element={
                <ProtectedRoute>
                  <CompanyFormPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/companies/edit/:id"
              element={
                <ProtectedRoute>
                  <CompanyFormPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/companies/:id"
              element={
                <ProtectedRoute allowedRoles={['admin', 'member']}>
                  <CompanyDetailPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/products"
              element={
                <ProtectedRoute allowedRoles={['admin', 'member']}>
                  <ProductsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/products/:id"
              element={
                <ProtectedRoute allowedRoles={['admin', 'member']}>
                  <ProductDetailPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/posts"
              element={
                <ProtectedRoute>
                  <PostGeneratorPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/todos"
              element={
                <ProtectedRoute>
                  <TodoPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminPage />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </main>
        <footer className="border-t border-white/5 bg-slate-950/60 py-4 text-center text-xs text-slate-400 backdrop-blur">
          Client-side demo — hook up your API for production authentication.
        </footer>
      </div>
    </div>
  )
}

function App() {
  return <AppShell />
}

export default App
