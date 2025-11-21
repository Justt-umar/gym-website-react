import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const DB_DIR = path.join(__dirname, '../db')
const USERS_FILE = path.join(DB_DIR, 'users.json')
const PROGRESS_FILE = path.join(DB_DIR, 'progress.json')

// Admin email to receive all user data
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@minakshifitness.com'

// Ensure DB directory exists
async function ensureDbExists() {
  try {
    await fs.access(DB_DIR)
  } catch {
    await fs.mkdir(DB_DIR, { recursive: true })
  }
}

// Read users from file
export async function getAllUsers() {
  try {
    await ensureDbExists()
    const data = await fs.readFile(USERS_FILE, 'utf8')
    return JSON.parse(data)
  } catch (error) {
    if (error.code === 'ENOENT') {
      return []
    }
    throw error
  }
}

// Save users to file
export async function saveUsers(users) {
  await ensureDbExists()
  await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2))
}

// Find user by email or mobile
export async function findUser(email, mobile) {
  const users = await getAllUsers()
  return users.find(u => 
    (email && u.email === email) || 
    (mobile && u.mobile === mobile)
  )
}

// Find user by ID
export async function findUserById(userId) {
  const users = await getAllUsers()
  return users.find(u => u.id === userId)
}

// Create new user
export async function createUser(userData) {
  const users = await getAllUsers()
  const newUser = {
    id: Date.now().toString(),
    ...userData,
    createdAt: new Date().toISOString(),
    lastLogin: new Date().toISOString()
  }
  users.push(newUser)
  await saveUsers(users)
  
  // Send notification to admin about new user (you can implement email service)
  console.log(`📧 New user registered: ${newUser.name} (${newUser.email || newUser.mobile})`)
  
  return newUser
}

// Update user's last login
export async function updateLastLogin(userId) {
  const users = await getAllUsers()
  const userIndex = users.findIndex(u => u.id === userId)
  if (userIndex !== -1) {
    users[userIndex].lastLogin = new Date().toISOString()
    await saveUsers(users)
  }
}

// Progress data management
export async function getAllProgress() {
  try {
    await ensureDbExists()
    const data = await fs.readFile(PROGRESS_FILE, 'utf8')
    return JSON.parse(data)
  } catch (error) {
    if (error.code === 'ENOENT') {
      return []
    }
    throw error
  }
}

export async function saveProgress(progressData) {
  await ensureDbExists()
  await fs.writeFile(PROGRESS_FILE, JSON.stringify(progressData, null, 2))
}

export async function getUserProgress(userId) {
  const allProgress = await getAllProgress()
  return allProgress.filter(p => p.userId === userId)
}

export async function addProgressEntry(userId, progressEntry) {
  const allProgress = await getAllProgress()
  const newEntry = {
    id: Date.now().toString(),
    userId,
    timestamp: new Date().toISOString(),
    ...progressEntry
  }
  allProgress.push(newEntry)
  await saveProgress(allProgress)
  
  // Log for admin monitoring
  console.log(`📊 Progress entry added for user ${userId}: ${progressEntry.type}`)
  
  return newEntry
}

// Get admin statistics
export async function getAdminStats() {
  const users = await getAllUsers()
  const progress = await getAllProgress()
  
  return {
    totalUsers: users.length,
    totalProgressEntries: progress.length,
    recentUsers: users.slice(-10).reverse(),
    recentProgress: progress.slice(-20).reverse()
  }
}
