import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../auth/AuthProvider.jsx'
import Dashboard from './Dashboard.jsx'
import CompaniesPage from './Companies.jsx'
import ProductsPage from './Products.jsx'
import TodoPage from './Todo.jsx'
import PostGeneratorPage from './PostGenerator.jsx'
import ProfilePage from './Profile.jsx'
import AdminPage from './Admin.jsx'

function OnePageScroll() {
  const { isAuthenticated, session } = useAuth()
  const [activeSection, setActiveSection] = useState('dashboard')
  const sectionsRef = useRef({})

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 100

      for (const [id, element] of Object.entries(sectionsRef.current)) {
        if (element) {
          const { offsetTop, offsetHeight } = element
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(id)
            break
          }
        }
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToSection = (id) => {
    const element = sectionsRef.current[id]
    if (element) {
      const offset = 80 // Header height
      const elementPosition = element.offsetTop
      const offsetPosition = elementPosition - offset

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      })
      setActiveSection(id)
    }
  }

  const setRef = (id) => (el) => {
    if (el) sectionsRef.current[id] = el
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="relative">
      {/* Dashboard Section */}
      <section
        id="dashboard"
        ref={setRef('dashboard')}
        className="min-h-screen scroll-mt-20"
      >
        <Dashboard />
      </section>

      {/* Companies Section */}
      <section
        id="companies"
        ref={setRef('companies')}
        className="min-h-screen scroll-mt-20"
      >
        <CompaniesPage />
      </section>

      {/* Products Section */}
      <section
        id="products"
        ref={setRef('products')}
        className="min-h-screen scroll-mt-20"
      >
        <ProductsPage />
      </section>

      {/* Todos Section */}
      <section
        id="todos"
        ref={setRef('todos')}
        className="min-h-screen scroll-mt-20"
      >
        <TodoPage />
      </section>

      {/* Posts Section */}
      <section
        id="posts"
        ref={setRef('posts')}
        className="min-h-screen scroll-mt-20"
      >
        <PostGeneratorPage />
      </section>

      {/* Profile Section */}
      <section
        id="profile"
        ref={setRef('profile')}
        className="min-h-screen scroll-mt-20"
      >
        <ProfilePage />
      </section>

      {/* Admin Section */}
      {session?.role === 'admin' && (
        <section
          id="admin"
          ref={setRef('admin')}
          className="min-h-screen scroll-mt-20"
        >
          <AdminPage />
        </section>
      )}

      {/* Floating Navigation */}
      <nav className="fixed right-6 top-1/2 z-50 -translate-y-1/2 space-y-2">
        <NavDot
          id="dashboard"
          label="主控台"
          active={activeSection === 'dashboard'}
          onClick={() => scrollToSection('dashboard')}
        />
        <NavDot
          id="companies"
          label="公司"
          active={activeSection === 'companies'}
          onClick={() => scrollToSection('companies')}
        />
        <NavDot
          id="products"
          label="產品"
          active={activeSection === 'products'}
          onClick={() => scrollToSection('products')}
        />
        <NavDot
          id="todos"
          label="待辦"
          active={activeSection === 'todos'}
          onClick={() => scrollToSection('todos')}
        />
        <NavDot
          id="posts"
          label="貼文"
          active={activeSection === 'posts'}
          onClick={() => scrollToSection('posts')}
        />
        <NavDot
          id="profile"
          label="資料"
          active={activeSection === 'profile'}
          onClick={() => scrollToSection('profile')}
        />
        {session?.role === 'admin' && (
          <NavDot
            id="admin"
            label="管理"
            active={activeSection === 'admin'}
            onClick={() => scrollToSection('admin')}
          />
        )}
      </nav>
    </div>
  )
}

function NavDot({ id, label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative flex items-center"
      title={label}
    >
      <div
        className={`h-3 w-3 rounded-full transition-all ${
          active
            ? 'bg-sky-400 shadow-lg shadow-sky-500/50'
            : 'bg-white/20 hover:bg-white/40'
        }`}
      />
      <span
        className={`absolute right-6 whitespace-nowrap rounded-lg px-3 py-1 text-xs font-semibold text-white opacity-0 transition-opacity group-hover:opacity-100 ${
          active ? 'bg-sky-500' : 'bg-slate-800'
        }`}
      >
        {label}
      </span>
    </button>
  )
}

export default OnePageScroll

