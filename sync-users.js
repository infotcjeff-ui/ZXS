import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { createHash } from 'crypto'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const USERS_FILE = path.join(__dirname, 'data', 'users.json')
const hashPassword = (password) =>
  createHash('sha256').update(String(password)).digest('base64')

// Load users from localStorage backup or create empty array
// This script expects users to be synced via the API, but we can also read from a backup
const loadLocalStorageBackup = () => {
  // Try to read from a backup file if it exists
  const backupFile = path.join(__dirname, 'data', 'users-backup.json')
  if (fs.existsSync(backupFile)) {
    try {
      return JSON.parse(fs.readFileSync(backupFile, 'utf8'))
    } catch (err) {
      console.error('Error reading backup file:', err)
    }
  }
  return []
}

// Ensure data directory exists
if (!fs.existsSync(path.dirname(USERS_FILE))) {
  fs.mkdirSync(path.dirname(USERS_FILE), { recursive: true })
}

// Load existing users from file
let existingUsers = []
if (fs.existsSync(USERS_FILE)) {
  try {
    existingUsers = JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'))
  } catch (err) {
    console.error('Error reading users.json:', err)
    existingUsers = []
  }
}

// Try to load from backup
const backupUsers = loadLocalStorageBackup()

// Merge users (prioritize existing file users)
const userMap = new Map()
const emailMap = new Map()

// Add existing users first
existingUsers.forEach(user => {
  const email = user.email?.toLowerCase()
  if (email && !emailMap.has(email)) {
    userMap.set(user.id, user)
    emailMap.set(email, user.id)
  }
})

// Add backup users if not already present
backupUsers.forEach(user => {
  const email = user.email?.toLowerCase()
  if (!email) return
  
  const processedUser = {
    ...user,
    email: email,
    passwordHash: user.passwordHash || (user.password ? hashPassword(user.password) : null),
  }
  delete processedUser.password
  
  if (emailMap.has(email)) {
    const existingId = emailMap.get(email)
    userMap.set(existingId, { ...userMap.get(existingId), ...processedUser })
  } else if (user.id && userMap.has(user.id)) {
    userMap.set(user.id, { ...userMap.get(user.id), ...processedUser })
  } else {
    userMap.set(user.id || `temp-${Date.now()}`, processedUser)
    emailMap.set(email, user.id)
  }
})

// Ensure admin user exists
const hasAdmin = Array.from(userMap.values()).some(u => u.email?.toLowerCase() === 'admin@zxsgit.local')
if (!hasAdmin) {
  const { randomUUID } = await import('crypto')
  userMap.set(randomUUID(), {
    id: randomUUID(),
    name: 'Admin',
    email: 'admin@zxsgit.local',
    passwordHash: hashPassword('admin321'),
    role: 'admin',
    createdAt: Date.now(),
  })
}

const mergedUsers = Array.from(userMap.values())

// Save to users.json
fs.writeFileSync(USERS_FILE, JSON.stringify(mergedUsers, null, 2))
console.log(`✅ 已同步 ${mergedUsers.length} 個用戶到 ${USERS_FILE}`)
console.log(`用戶列表:`)
mergedUsers.forEach(u => {
  console.log(`  - ${u.name} (${u.email}) [${u.role}]`)
})

