import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const DB_DIR = path.join(__dirname, '../db')
const EXPORT_DIR = path.join(__dirname, '../exports')

async function exportToCSV() {
  try {
    // Ensure export directory exists
    await fs.mkdir(EXPORT_DIR, { recursive: true })

    // Read users
    const usersData = await fs.readFile(path.join(DB_DIR, 'users.json'), 'utf8')
    const users = JSON.parse(usersData)

    // Read progress
    const progressData = await fs.readFile(path.join(DB_DIR, 'progress.json'), 'utf8')
    const progress = JSON.parse(progressData)

    // Export Users CSV
    let usersCSV = 'ID,Name,Email,Mobile,Created At,Last Login\n'
    users.forEach(user => {
      usersCSV += `"${user.id}","${user.name}","${user.email || ''}","${user.mobile || ''}","${user.createdAt}","${user.lastLogin}"\n`
    })
    
    const usersFile = path.join(EXPORT_DIR, `users_${Date.now()}.csv`)
    await fs.writeFile(usersFile, usersCSV)
    console.log('✅ Users exported to:', usersFile)

    // Export Progress CSV
    let progressCSV = 'ID,User ID,User Name,Type,Timestamp,Data\n'
    progress.forEach(entry => {
      const user = users.find(u => u.id === entry.userId)
      const dataStr = JSON.stringify(entry.data).replace(/"/g, '""')
      progressCSV += `"${entry.id}","${entry.userId}","${user?.name || 'Unknown'}","${entry.type}","${entry.timestamp}","${dataStr}"\n`
    })
    
    const progressFile = path.join(EXPORT_DIR, `progress_${Date.now()}.csv`)
    await fs.writeFile(progressFile, progressCSV)
    console.log('✅ Progress exported to:', progressFile)

    console.log('\n📊 Export Summary:')
    console.log(`   Total Users: ${users.length}`)
    console.log(`   Total Progress Entries: ${progress.length}`)
    console.log(`   Export Directory: ${EXPORT_DIR}`)

  } catch (error) {
    console.error('Export error:', error)
  }
}

exportToCSV()
