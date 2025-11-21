import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const DB_DIR = path.join(__dirname, '../db')

// Helper to format date
function formatDate(isoString) {
  return new Date(isoString).toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Kolkata'
  })
}

async function viewAllData() {
  try {
    // Read users
    const usersData = await fs.readFile(path.join(DB_DIR, 'users.json'), 'utf8')
    const users = JSON.parse(usersData)

    // Read progress
    const progressData = await fs.readFile(path.join(DB_DIR, 'progress.json'), 'utf8')
    const progress = JSON.parse(progressData)

    console.log('\n='.repeat(60))
    console.log('📊 MINAKSHI FITNESS - USER DATABASE VIEWER')
    console.log('='.repeat(60))

    console.log('\n👥 REGISTERED USERS:', users.length)
    console.log('-'.repeat(60))

    users.forEach((user, index) => {
      console.log(`\n${index + 1}. ${user.name}`)
      console.log(`   ID: ${user.id}`)
      console.log(`   Email: ${user.email || 'N/A'}`)
      console.log(`   Mobile: ${user.mobile || 'N/A'}`)
      console.log(`   Joined: ${formatDate(user.createdAt)}`)
      console.log(`   Last Login: ${formatDate(user.lastLogin)}`)
      
      // Count user's progress entries
      const userProgress = progress.filter(p => p.userId === user.id)
      console.log(`   Progress Entries: ${userProgress.length}`)
    })

    console.log('\n' + '='.repeat(60))
    console.log('📈 USER PROGRESS ENTRIES:', progress.length)
    console.log('-'.repeat(60))

    // Group by type
    const progressByType = progress.reduce((acc, entry) => {
      acc[entry.type] = (acc[entry.type] || 0) + 1
      return acc
    }, {})

    console.log('\nProgress by Type:')
    Object.entries(progressByType).forEach(([type, count]) => {
      console.log(`   ${type}: ${count} entries`)
    })

    console.log('\n' + '-'.repeat(60))
    console.log('RECENT ACTIVITY (Last 10):')
    console.log('-'.repeat(60))

    progress.slice(-10).reverse().forEach((entry, index) => {
      const user = users.find(u => u.id === entry.userId)
      console.log(`\n${index + 1}. ${entry.type.toUpperCase()} - ${user?.name || 'Unknown User'}`)
      console.log(`   Time: ${formatDate(entry.timestamp)}`)
      console.log(`   Data: ${JSON.stringify(entry.data).substring(0, 100)}...`)
    })

    console.log('\n' + '='.repeat(60))
    console.log('\n✅ Total Users:', users.length)
    console.log('✅ Total Progress Entries:', progress.length)
    console.log('✅ Database Location:', DB_DIR)
    console.log('\n' + '='.repeat(60) + '\n')

  } catch (error) {
    if (error.code === 'ENOENT') {
      console.log('\n❌ Database files not found. No users registered yet.')
    } else {
      console.error('Error reading database:', error)
    }
  }
}

// Run the viewer
viewAllData()
