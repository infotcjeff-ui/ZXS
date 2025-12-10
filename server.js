import express from 'express'
import cors from 'cors'
import { randomUUID, createHash } from 'crypto'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 4000
const DATA_DIR = path.join(__dirname, 'data')
const USERS_FILE = path.join(DATA_DIR, 'users.json')
const DATA_FILE = path.join(DATA_DIR, 'data.json')

const hashPassword = (password) =>
  createHash('sha256').update(String(password)).digest('base64')

const ensureDataFile = () => {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })
  if (!fs.existsSync(USERS_FILE)) {
    fs.writeFileSync(USERS_FILE, '[]')
  }
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(
      DATA_FILE,
      JSON.stringify(
        {
          todos: [],
          companies: [],
        },
        null,
        2,
      ),
    )
  }
  const users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'))
  const hasAdmin = users.some((u) => u.email === 'admin@zxsgit.local')
  if (!hasAdmin) {
    users.push({
      id: randomUUID(),
      name: 'Admin',
      email: 'admin@zxsgit.local',
      passwordHash: hashPassword('admin321'),
      role: 'admin',
      createdAt: Date.now(),
    })
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2))
  }
}

const loadUsers = () => JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'))
const saveUsers = (users) =>
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2))
const loadData = () => JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'))
const saveData = (data) => fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2))

ensureDataFile()

app.use(cors())
app.use(express.json({ limit: '50mb' })) // Allow larger JSON payloads for images

// Root path
app.get('/', (req, res) => {
  res.json({ 
    ok: true, 
    message: 'ZXSGit API Server',
    version: '1.0.0',
    endpoints: [
      'POST /api/register',
      'POST /api/login',
      'GET /api/users',
      'PUT /api/users/:id',
      'DELETE /api/users/:id',
      'GET /api/todos',
      'POST /api/todos',
      'GET /api/companies',
      'GET /api/companies/:id',
      'POST /api/companies',
      'PUT /api/companies/:id'
    ]
  })
})

app.post('/api/register', (req, res) => {
  const { name, email, password } = req.body ?? {}
  if (!name?.trim() || !email?.trim() || !password?.trim()) {
    return res.status(400).json({ ok: false, message: 'All fields are required' })
  }
  const users = loadUsers()
  const existing = users.find((u) => u.email.toLowerCase() === email.toLowerCase())
  if (existing) {
    return res.status(409).json({ ok: false, message: 'Email already registered' })
  }
  const newUser = {
    id: randomUUID(),
    name: name.trim(),
    email: email.toLowerCase(),
    passwordHash: hashPassword(password),
    role: 'member',
    createdAt: Date.now(),
  }
  users.push(newUser)
  saveUsers(users)
  return res.json({
    ok: true,
    message: 'Account created',
    session: {
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      token: randomUUID(),
      signedInAt: Date.now(),
    },
  })
})

app.post('/api/login', (req, res) => {
  const { email, password } = req.body ?? {}
  if (!email?.trim() || !password?.trim()) {
    return res.status(400).json({ ok: false, message: 'Email and password required' })
  }
  const users = loadUsers()
  const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase())
  if (!user) return res.status(404).json({ ok: false, message: 'User not found' })
  if (user.passwordHash !== hashPassword(password)) {
    return res.status(401).json({ ok: false, message: 'Invalid credentials' })
  }
  return res.json({
    ok: true,
    message: 'Signed in',
    session: {
      name: user.name,
      email: user.email,
      role: user.role,
      token: randomUUID(),
      signedInAt: Date.now(),
    },
  })
})

app.get('/api/users', (req, res) => {
  const users = loadUsers().map(({ passwordHash, ...rest }) => rest)
  return res.json({ ok: true, users })
})

app.put('/api/users/:id', (req, res) => {
  const { id } = req.params
  const { name, email, role, password } = req.body ?? {}
  const users = loadUsers()
  const userIndex = users.findIndex((u) => u.id === id)
  if (userIndex === -1) return res.status(404).json({ ok: false, message: 'User not found' })

  const targetUser = users[userIndex]
  const emailTaken = users.some(
    (u) => u.email.toLowerCase() === email.toLowerCase() && u.id !== id,
  )
  if (emailTaken) return res.status(409).json({ ok: false, message: 'Email already in use' })

  targetUser.name = name?.trim() || targetUser.name
  targetUser.email = email?.toLowerCase() || targetUser.email
  targetUser.role = role || targetUser.role
  if (password) targetUser.passwordHash = hashPassword(password)

  saveUsers(users)
  return res.json({ ok: true, message: 'User updated' })
})

app.delete('/api/users/:id', (req, res) => {
  const { id } = req.params
  const users = loadUsers()
  const target = users.find((u) => u.id === id)
  if (!target) return res.status(404).json({ ok: false, message: 'User not found' })
  // Prevent deleting admin account
  if (target.email === 'admin@zxsgit.local') {
    return res.status(403).json({ ok: false, message: 'Cannot delete admin account' })
  }
  const filtered = users.filter((u) => u.id !== id)
  saveUsers(filtered)
  return res.json({ ok: true, message: 'User deleted' })
})

// Todos API
app.get('/api/todos', (req, res) => {
  const data = loadData()
  return res.json({ ok: true, todos: data.todos || [] })
})

app.post('/api/todos', (req, res) => {
  const { todos } = req.body ?? {}
  if (!Array.isArray(todos)) {
    return res.status(400).json({ ok: false, message: 'Invalid todos format' })
  }
  const data = loadData()
  data.todos = todos
  saveData(data)
  return res.json({ ok: true, message: 'Todos saved' })
})

app.get('/api/companies', (req, res) => {
  const data = loadData()
  return res.json({ ok: true, companies: data.companies || [] })
})

app.get('/api/companies/:id', (req, res) => {
  const data = loadData()
  const company = (data.companies || []).find((c) => c.id === req.params.id)
  if (!company) return res.status(404).json({ ok: false, message: 'Company not found' })
  return res.json({ ok: true, company })
})

app.post('/api/companies', (req, res) => {
  const payload = req.body ?? {}
  if (!payload.name?.trim()) {
    return res.status(400).json({ ok: false, message: 'Name is required' })
  }
  const data = loadData()
  const newCompany = {
    id: randomUUID(),
    name: payload.name.trim(),
    address: payload.address ?? '',
    phone: payload.phone ?? '',
    website: payload.website ?? '',
    description: payload.description ?? '',
    notes: payload.notes ?? '',
    media: Array.isArray(payload.media) ? payload.media : [],
    gallery: Array.isArray(payload.gallery) ? payload.gallery : [],
    ownerEmail: payload.ownerEmail ?? 'unknown@zxsgit.local',
    ownerName: payload.ownerName ?? 'Unknown',
    relatedUserId: payload.relatedUserId || null,
    relatedUserIds: Array.isArray(payload.relatedUserIds) ? payload.relatedUserIds : [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }
  data.companies = data.companies || []
  data.companies.push(newCompany)
  saveData(data)
  return res.json({ ok: true, company: newCompany })
})

app.put('/api/companies/:id', (req, res) => {
  const payload = req.body ?? {}
  const data = loadData()
  const companies = data.companies || []
  const target = companies.find((c) => c.id === req.params.id)
  if (!target) return res.status(404).json({ ok: false, message: 'Company not found' })

  target.name = payload.name?.trim() || target.name
  target.address = payload.address ?? target.address
  target.phone = payload.phone ?? target.phone
  target.website = payload.website ?? target.website
  target.description = payload.description ?? target.description
  target.notes = payload.notes ?? target.notes
  // Always update media and gallery from payload if provided
  if (payload.media !== undefined) {
    target.media = Array.isArray(payload.media) ? payload.media : []
  }
  if (payload.gallery !== undefined) {
    target.gallery = Array.isArray(payload.gallery) ? payload.gallery : []
  }
  target.ownerEmail = payload.ownerEmail ?? target.ownerEmail
  target.ownerName = payload.ownerName ?? target.ownerName
  // Always update relatedUserIds from payload if provided
  if (payload.relatedUserIds !== undefined) {
    target.relatedUserIds = Array.isArray(payload.relatedUserIds) ? payload.relatedUserIds : []
    // Also update relatedUserId for backward compatibility (use first one if array has items)
    target.relatedUserId = Array.isArray(payload.relatedUserIds) && payload.relatedUserIds.length > 0 
      ? payload.relatedUserIds[0] 
      : null
  } else if (payload.relatedUserId !== undefined) {
    // If only relatedUserId is provided, update both
    target.relatedUserId = payload.relatedUserId
    target.relatedUserIds = payload.relatedUserId ? [payload.relatedUserId] : []
  }
  target.updatedAt = Date.now()

  console.log('Updating company:', target.id)
  console.log('Updated name:', target.name)
  console.log('Updated gallery count:', target.gallery?.length || 0)
  console.log('Updated media count:', target.media?.length || 0)
  console.log('Updated relatedUserIds:', target.relatedUserIds)
  console.log('Updated relatedUserId:', target.relatedUserId)

  saveData(data)
  console.log('Company saved successfully to data.json')
  return res.json({ ok: true, company: target })
})

app.delete('/api/companies/:id', (req, res) => {
  const { id } = req.params
  const data = loadData()
  const companies = data.companies || []
  const target = companies.find((c) => c.id === id)
  if (!target) return res.status(404).json({ ok: false, message: 'Company not found' })
  data.companies = companies.filter((c) => c.id !== id)
  saveData(data)
  return res.json({ ok: true, message: 'Company deleted' })
})

app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`)
})


