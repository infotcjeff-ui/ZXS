import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react'

const AuthContext = createContext(null)
const SESSION_KEY = 'zxs-auth-session'
const USERS_KEY = 'zxs-users'
const TODOS_KEY = 'zxs-todos-all'
const COMPANIES_KEY = 'zxs-companies'
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000'

const passwordRules = ['Any password is accepted (use strong passwords for safety).']

const validateEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).toLowerCase())

const loadUsers = () => {
  try {
    const raw = localStorage.getItem(USERS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch (err) {
    console.error('Unable to load users', err)
    return []
  }
}

const saveUsers = (users) => {
  try {
    localStorage.setItem(USERS_KEY, JSON.stringify(users))
  } catch (err) {
    console.error('Unable to save users', err)
  }
}

const loadTodos = () => {
  try {
    const raw = localStorage.getItem(TODOS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch (err) {
    console.error('Unable to load todos', err)
    return []
  }
}

const saveTodos = (todos) => {
  try {
    localStorage.setItem(TODOS_KEY, JSON.stringify(todos))
  } catch (err) {
    console.error('Unable to save todos', err)
  }
}

const loadCompanies = () => {
  try {
    const raw = localStorage.getItem(COMPANIES_KEY)
    return raw ? JSON.parse(raw) : []
  } catch (err) {
    console.error('Unable to load companies', err)
    return []
  }
}

const saveCompanies = (companies) => {
  try {
    const jsonString = JSON.stringify(companies)
    const sizeKB = (jsonString.length / 1024).toFixed(2)
    console.log('Saving companies to localStorage, total size:', sizeKB, 'KB')
    
    // Check localStorage quota (typically 5-10MB)
    if (jsonString.length > 5 * 1024 * 1024) {
      console.warn('Warning: Companies data is very large (' + sizeKB + ' KB), may exceed localStorage quota')
    }
    
    localStorage.setItem(COMPANIES_KEY, jsonString)
    console.log('Companies saved successfully, count:', companies.length)
    
    // Verify the save
    const saved = localStorage.getItem(COMPANIES_KEY)
    if (!saved) {
      throw new Error('Failed to save companies: localStorage.getItem returned null')
    }
    
    const parsed = JSON.parse(saved)
    if (parsed.length !== companies.length) {
      throw new Error(`Save verification failed: expected ${companies.length} companies, got ${parsed.length}`)
    }
    
    console.log('Verified: Saved companies count:', parsed.length)
    if (companies.length > 0) {
      const lastCompany = parsed[parsed.length - 1]
      console.log('Last company:', {
        id: lastCompany?.id,
        name: lastCompany?.name,
        mediaCount: lastCompany?.media?.length || 0,
        galleryCount: lastCompany?.gallery?.length || 0
      })
    }
  } catch (err) {
    console.error('Unable to save companies', err)
    if (err.name === 'QuotaExceededError') {
      console.error('localStorage quota exceeded! Image data may be too large.')
      throw new Error('儲存空間不足，請減少圖片數量或大小')
    }
    throw err
  }
}


const ensureAdminUser = () => {
  const users = loadUsers()
  const hasAdmin = users.some((u) => u.email === 'admin@zxsgit.local')
  if (!hasAdmin) {
    users.push({
      id: crypto.randomUUID(),
      name: 'Admin',
      email: 'admin@zxsgit.local',
      password: 'admin321',
      role: 'admin',
      createdAt: Date.now(),
    })
    saveUsers(users)
  }
}

const loadSession = () => {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    return raw ? JSON.parse(raw) : null
  } catch (err) {
    console.error('Unable to load session', err)
    return null
  }
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => {
    try {
      return loadSession()
    } catch (error) {
      console.error('Error loading session:', error)
      return null
    }
  })

  useEffect(() => {
    try {
      ensureAdminUser()
    } catch (error) {
      console.error('Error initializing auth:', error)
    }
  }, [])

  useEffect(() => {
    if (!session) return
    localStorage.setItem(SESSION_KEY, JSON.stringify(session))
  }, [session])

  const register = async ({ name, email, password, confirm }) => {
    if (!name.trim()) return { ok: false, message: 'Name is required' }
    if (!validateEmail(email)) return { ok: false, message: 'Invalid email' }
    if (password !== confirm) return { ok: false, message: 'Passwords must match' }

    // Check existing users (try backend first, then localStorage)
    let users = []
    try {
      const res = await fetch(`${API_BASE}/api/users`)
      if (res.ok) {
        const data = await res.json()
        users = data.users ?? []
      } else {
        throw new Error('Backend unavailable')
      }
    } catch (err) {
      console.error('Backend unavailable, using localStorage', err)
      users = loadUsers()
    }

    const existing = users.find((u) => u.email.toLowerCase() === email.toLowerCase())
    if (existing) return { ok: false, message: 'Email already registered' }

    const newUser = {
      id: crypto.randomUUID(),
      name: name.trim(),
      email: email.toLowerCase(),
      password,
      role: 'member',
      createdAt: Date.now(),
    }

    // Try to save to backend first
    try {
      const res = await fetch(`${API_BASE}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newUser.name, email: newUser.email, password }),
      })
      if (res.ok) {
        const data = await res.json()
        if (data.session) {
          const newSession = {
            name: data.session.name,
            email: data.session.email,
            role: data.session.role,
            token: data.session.token,
            signedInAt: data.session.signedInAt,
          }
          setSession(newSession)
          return { ok: true, message: data.message || 'Account created' }
        }
      }
    } catch (err) {
      console.error('Backend registration failed, using localStorage', err)
    }

    // Fallback to localStorage
    users.push(newUser)
    saveUsers(users)
    // Dispatch event to notify admin page
    window.dispatchEvent(new Event('users:update'))
    const newSession = {
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      token: crypto.randomUUID(),
      signedInAt: Date.now(),
    }
    setSession(newSession)
    return { ok: true, message: 'Account created' }
  }

  const login = async ({ email, password }) => {
    if (!validateEmail(email)) return { ok: false, message: 'Invalid email' }
    const users = loadUsers()
    const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase())
    if (!user) return { ok: false, message: 'User not found' }
    if (user.password !== password) return { ok: false, message: 'Invalid credentials' }
    const newSession = {
      name: user.name,
      email: user.email,
      role: user.role,
      token: crypto.randomUUID(),
      signedInAt: Date.now(),
    }
    setSession(newSession)
    return { ok: true, message: 'Signed in' }
  }

  const logout = () => {
    setSession(null)
    localStorage.removeItem(SESSION_KEY)
  }

  const fetchUsers = useCallback(async () => {
    let backendUsers = []
    let localUsers = []
    
    // Try to fetch from backend
    try {
      const res = await fetch(`${API_BASE}/api/users`)
      if (res.ok) {
        const data = await res.json()
        backendUsers = data.users ?? []
      }
    } catch (err) {
      console.error('Unable to fetch users from backend', err)
    }
    
    // Always load from localStorage as well
    try {
      localUsers = loadUsers().map(({ password, passwordHash, ...rest }) => rest)
    } catch (err) {
      console.error('Unable to load users from localStorage', err)
    }
    
    // Merge users, prioritizing backend data but including localStorage users
    const userMap = new Map()
    const emailMap = new Map() // Track by email to remove duplicates
    
    // Add backend users first
    backendUsers.forEach(user => {
      const email = user.email?.toLowerCase()
      if (email && !emailMap.has(email)) {
        userMap.set(user.id, user)
        emailMap.set(email, user.id)
      }
    })
    
    // Add localStorage users (if not already in map by ID or email)
    localUsers.forEach(user => {
      const email = user.email?.toLowerCase()
      if (email && !emailMap.has(email) && !userMap.has(user.id)) {
        userMap.set(user.id, user)
        emailMap.set(email, user.id)
      }
    })
    
    // Remove duplicate admin users (keep the one with the correct email)
    const adminUsers = Array.from(userMap.values()).filter(u => 
      u.email?.toLowerCase() === 'admin@zxsgit.local'
    )
    if (adminUsers.length > 1) {
      // Keep the first one, remove others
      const keepAdmin = adminUsers[0]
      adminUsers.slice(1).forEach(dup => {
        userMap.delete(dup.id)
      })
    }
    
    // Convert map to array and sort by createdAt
    return Array.from(userMap.values()).sort((a, b) => {
      const aTime = a.createdAt || 0
      const bTime = b.createdAt || 0
      return aTime - bTime
    })
  }, [])

  const deleteUser = useCallback(async (id) => {
    try {
      const res = await fetch(`${API_BASE}/api/users/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok || !data.ok) {
        return { ok: false, message: data.message || '無法刪除使用者' }
      }
      // If deleting self, logout
      const users = loadUsers()
      const target = users.find((u) => u.id === id)
      if (target && session?.email === target.email) {
        logout()
      }
      return { ok: true, message: '使用者已刪除' }
    } catch (err) {
      console.error('Unable to delete user', err)
      // Fallback to localStorage
      const users = loadUsers()
      const target = users.find((u) => u.id === id)
      if (!target) return { ok: false, message: 'User not found' }
      if (target.email === 'admin@zxsgit.local') {
        return { ok: false, message: 'Cannot delete admin account' }
      }
      const filtered = users.filter((u) => u.id !== id)
      saveUsers(filtered)
      if (session?.email === target.email) {
        logout()
      }
      return { ok: true, message: 'User deleted' }
    }
  }, [session, logout])

  const updateUserAsAdmin = ({ id, name, email, role }) => {
    const users = loadUsers()
    const target = users.find((u) => u.id === id)
    if (!target) return { ok: false, message: 'User not found' }
    const emailTaken = users.some(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.id !== id,
    )
    if (emailTaken) return { ok: false, message: 'Email already in use' }
    target.name = name.trim()
    target.email = email.toLowerCase()
    target.role = role
    saveUsers(users)
    // refresh session if editing self
    if (session?.email === target.email) {
      setSession((prev) => (prev ? { ...prev, name: target.name, role: target.role, email: target.email } : prev))
    }
    return { ok: true }
  }

  const updateSelf = ({ name, email, password }) => {
    if (!session) return { ok: false, message: 'Not authenticated' }
    const users = loadUsers()
    const target = users.find((u) => u.email === session.email)
    if (!target) return { ok: false, message: 'User not found' }
    const emailTaken = users.some(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.id !== target.id,
    )
    if (emailTaken) return { ok: false, message: 'Email already in use' }
    target.name = name.trim()
    target.email = email.toLowerCase()
    if (password) target.password = password
    saveUsers(users)
    setSession((prev) =>
      prev
        ? { ...prev, name: target.name, email: target.email, token: crypto.randomUUID(), signedInAt: Date.now() }
        : prev,
    )
    return { ok: true, message: 'Profile updated' }
  }

  const syncUsersToFile = useCallback(async () => {
    try {
      const localUsers = loadUsers()
      const res = await fetch(`${API_BASE}/api/users/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ users: localUsers }),
      })
      const data = await res.json()
      if (res.ok && data.ok) {
        return { ok: true, message: `已同步 ${data.count} 個用戶到 users.json` }
      }
      return { ok: false, message: data.message || '同步失敗' }
    } catch (err) {
      console.error('Unable to sync users to file', err)
      return { ok: false, message: '無法連接到伺服器，請確保伺服器正在運行' }
    }
  }, [])

  const fetchTodos = useCallback(() => loadTodos(), [])
  const saveAllTodos = useCallback((todos) => saveTodos(todos), [])

  const fetchCompanies = useCallback(() => {
    return loadCompanies()
  }, [])

  const getCompany = useCallback((id) => {
    const companies = loadCompanies()
    return companies.find(c => c.id === id) || null
  }, [])

  const createCompany = useCallback((payload) => {
    try {
      console.log('createCompany: Starting with payload:', {
        name: payload.name,
        mediaCount: payload.media?.length || 0,
        galleryCount: payload.gallery?.length || 0,
        relatedUserIdsCount: payload.relatedUserIds?.length || 0
      })
      
      const companies = loadCompanies()
      const newCompany = {
        id: crypto.randomUUID(),
        name: payload.name || '',
        address: payload.address || '',
        description: payload.description || '',
        phone: payload.phone || '',
        website: payload.website || '',
        notes: payload.notes || '',
        media: Array.isArray(payload.media) ? payload.media : [],
        gallery: Array.isArray(payload.gallery) ? payload.gallery : [],
        relatedUserIds: Array.isArray(payload.relatedUserIds) ? payload.relatedUserIds : [],
        ownerEmail: payload.ownerEmail || 'unknown@zxsgit.local',
        ownerName: payload.ownerName || 'Unknown',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }
      
      console.log('createCompany: New company object:', {
        id: newCompany.id,
        name: newCompany.name,
        mediaCount: newCompany.media.length,
        galleryCount: newCompany.gallery.length
      })
      
      companies.push(newCompany)
      saveCompanies(companies)
      
      // Verify the save
      const savedCompanies = loadCompanies()
      const savedCompany = savedCompanies.find(c => c.id === newCompany.id)
      if (!savedCompany) {
        console.error('createCompany: Company was not saved!')
        return { ok: false, message: '建立公司失敗：無法保存到 localStorage' }
      }
      
      console.log('createCompany: Company created and verified, total companies:', savedCompanies.length)
      
      // Dispatch event to notify other components
      window.dispatchEvent(new Event('companies:update'))
      
      // Also trigger a custom storage event for same-tab updates
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'zxs-companies',
        newValue: JSON.stringify(companies)
      }))
      
      return { ok: true, company: newCompany }
    } catch (error) {
      console.error('Error creating company:', error)
      return { ok: false, message: '建立公司時發生錯誤: ' + (error.message || '未知錯誤') }
    }
  }, [])

  const updateCompany = useCallback((id, payload) => {
    try {
      const companies = loadCompanies()
      const index = companies.findIndex(c => c.id === id)
      if (index < 0) {
        return { ok: false, message: '公司不存在' }
      }
      
      console.log('updateCompany: Received payload media:', payload.media?.length || 0)
      console.log('updateCompany: Received payload gallery:', payload.gallery?.length || 0)
      
      // Always update media and gallery from payload - ensure they are arrays
      const updatedCompany = {
        ...companies[index],
        name: payload.name !== undefined ? payload.name : companies[index].name,
        address: payload.address !== undefined ? payload.address : companies[index].address,
        description: payload.description !== undefined ? payload.description : companies[index].description,
        phone: payload.phone !== undefined ? payload.phone : companies[index].phone,
        website: payload.website !== undefined ? payload.website : companies[index].website,
        notes: payload.notes !== undefined ? payload.notes : companies[index].notes,
        ownerEmail: payload.ownerEmail || companies[index].ownerEmail,
        ownerName: payload.ownerName || companies[index].ownerName,
        id: companies[index].id, // Preserve ID
        media: Array.isArray(payload.media) ? payload.media : [],
        gallery: Array.isArray(payload.gallery) ? payload.gallery : [],
        relatedUserIds: Array.isArray(payload.relatedUserIds) ? payload.relatedUserIds : [],
        createdAt: companies[index].createdAt || Date.now(),
        updatedAt: Date.now(),
      }
      
      console.log('updateCompany: Updated company media count:', updatedCompany.media?.length || 0)
      console.log('updateCompany: Updated company gallery count:', updatedCompany.gallery?.length || 0)
      console.log('updateCompany: Media data sample:', updatedCompany.media?.[0] ? { id: updatedCompany.media[0].id, hasDataUrl: !!updatedCompany.media[0].dataUrl, name: updatedCompany.media[0].name } : 'none')
      console.log('updateCompany: Gallery data sample:', updatedCompany.gallery?.[0] ? { id: updatedCompany.gallery[0].id, hasDataUrl: !!updatedCompany.gallery[0].dataUrl, name: updatedCompany.gallery[0].name } : 'none')
      
      companies[index] = updatedCompany
      saveCompanies(companies)
      
      // Verify the save
      const savedCompanies = loadCompanies()
      const savedCompany = savedCompanies.find(c => c.id === id)
      if (savedCompany) {
        console.log('updateCompany: Verified saved company media count:', savedCompany.media?.length || 0)
        console.log('updateCompany: Verified saved company gallery count:', savedCompany.gallery?.length || 0)
      }
      
      // Dispatch event to notify other components
      window.dispatchEvent(new Event('companies:update'))
      
      // Also trigger a custom storage event for same-tab updates
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'zxs-companies',
        newValue: JSON.stringify(companies)
      }))
      
      return { ok: true, company: updatedCompany }
    } catch (error) {
      console.error('Error updating company:', error)
      return { ok: false, message: '更新公司時發生錯誤' }
    }
  }, [])

  const deleteCompany = useCallback((id) => {
    const companies = loadCompanies()
    const filtered = companies.filter(c => c.id !== id)
    if (filtered.length === companies.length) {
      return { ok: false, message: '公司不存在' }
    }
    saveCompanies(filtered)
    window.dispatchEvent(new Event('companies:update'))
    return { ok: true, message: '公司已刪除' }
  }, [])

  const value = useMemo(
    () => ({
      session,
      isAuthenticated: Boolean(session),
      register,
      login,
      logout,
      fetchUsers,
      updateUserAsAdmin,
      deleteUser,
      updateSelf,
      syncUsersToFile,
      fetchTodos,
      saveAllTodos,
      fetchCompanies,
      getCompany,
      createCompany,
      updateCompany,
      deleteCompany,
      passwordRules,
    }),
    [session, fetchUsers, deleteUser, syncUsersToFile, fetchTodos, saveAllTodos, fetchCompanies, getCompany, createCompany, updateCompany, deleteCompany],
  )

  try {
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  } catch (error) {
    console.error('AuthProvider rendering error:', error)
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-100">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-semibold">認證系統錯誤</h1>
          <p className="mb-6 text-sm text-slate-200/80">請重新整理頁面</p>
          <button
            onClick={() => window.location.reload()}
            className="rounded-xl bg-gradient-to-r from-emerald-500 to-sky-500 px-6 py-3 text-sm font-semibold text-white"
          >
            重新載入
          </button>
        </div>
      </div>
    )
  }
}

export const useAuth = () => useContext(AuthContext)


