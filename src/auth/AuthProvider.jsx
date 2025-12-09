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
  useEffect(() => {
    ensureAdminUser()
  }, [])

  const [session, setSession] = useState(() => loadSession())

  useEffect(() => {
    if (!session) return
    localStorage.setItem(SESSION_KEY, JSON.stringify(session))
  }, [session])

  const register = async ({ name, email, password, confirm }) => {
    if (!name.trim()) return { ok: false, message: 'Name is required' }
    if (!validateEmail(email)) return { ok: false, message: 'Invalid email' }
    if (password !== confirm) return { ok: false, message: 'Passwords must match' }

    const users = loadUsers()
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
    users.push(newUser)
    saveUsers(users)
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
    try {
      const res = await fetch(`${API_BASE}/api/users`)
      if (!res.ok) throw new Error('Failed to fetch users')
      const data = await res.json()
      return data.users ?? []
    } catch (err) {
      console.error('Unable to fetch users, falling back to localStorage', err)
      const users = loadUsers().map(({ password, ...rest }) => rest)
      return users
    }
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

  const fetchTodos = useCallback(() => loadTodos(), [])
  const saveAllTodos = useCallback((todos) => saveTodos(todos), [])
  const fetchCompanies = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/companies`)
      if (!res.ok) throw new Error('Failed to fetch companies')
      const data = await res.json()
      return data.companies ?? []
    } catch (err) {
      console.error('Unable to fetch companies', err)
      return []
    }
  }, [])

  const getCompany = useCallback(async (id) => {
    try {
      const res = await fetch(`${API_BASE}/api/companies/${id}`)
      if (!res.ok) return null
      const data = await res.json()
      return data.company ?? null
    } catch (err) {
      console.error('Unable to load company', err)
      return null
    }
  }, [])

  const createCompany = useCallback(async (payload) => {
    try {
      const res = await fetch(`${API_BASE}/api/companies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok || !data.ok) {
        return { ok: false, message: data.message || '無法建立公司' }
      }
      return { ok: true, company: data.company }
    } catch (err) {
      console.error('Unable to create company', err)
      return { ok: false, message: '伺服器無法使用' }
    }
  }, [])

  const updateCompany = useCallback(async (id, payload) => {
    try {
      const res = await fetch(`${API_BASE}/api/companies/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok || !data.ok) {
        return { ok: false, message: data.message || '無法更新公司' }
      }
      return { ok: true, company: data.company }
    } catch (err) {
      console.error('Unable to update company', err)
      return { ok: false, message: '伺服器無法使用' }
    }
  }, [])

  const deleteCompany = useCallback(async (id) => {
    try {
      const res = await fetch(`${API_BASE}/api/companies/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok || !data.ok) {
        return { ok: false, message: data.message || '無法刪除公司' }
      }
      return { ok: true, message: '公司已刪除' }
    } catch (err) {
      console.error('Unable to delete company', err)
      return { ok: false, message: '伺服器無法使用' }
    }
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
      fetchTodos,
      saveAllTodos,
      fetchCompanies,
      getCompany,
      createCompany,
      updateCompany,
      deleteCompany,
      passwordRules,
    }),
    [session, fetchUsers, deleteUser, fetchTodos, saveAllTodos, fetchCompanies, getCompany, createCompany, updateCompany, deleteCompany],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)


