import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { sendEmail, sendWorkoutEmail } from './services/emailService.js'
import { sendWhatsAppMessage } from './services/whatsappService.js'
import { hashPassword, comparePassword, generateToken, authenticateToken } from './utils/auth.js'
import { 
  findUser, 
  createUser, 
  updateLastLogin, 
  getUserProgress, 
  addProgressEntry,
  getAdminStats
} from './utils/database.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests from localhost, your local network, Vercel deployments, and no origin (mobile apps)
    const allowedOrigins = [
      'http://localhost:5173',
      'http://127.0.0.1:5173',
      /^http:\/\/.*:5173$/,  // Allow any IP on port 5173
      /^https:\/\/.*\.vercel\.app$/,  // Allow all Vercel deployments
      process.env.FRONTEND_URL
    ].filter(Boolean)
    
    if (!origin || allowedOrigins.some(allowed => 
      typeof allowed === 'string' ? allowed === origin : allowed.test(origin)
    )) {
      callback(null, true)
    } else {
      callback(null, true) // Allow all origins for now
    }
  },
  credentials: true
}))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Minakshi Fitness Backend is running!',
    timestamp: new Date().toISOString()
  })
})

// ============================================
// AUTHENTICATION ENDPOINTS
// ============================================

// Signup endpoint
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { name, email, mobile, password } = req.body

    // Validation
    if (!name || !password) {
      return res.status(400).json({ error: 'Name and password are required' })
    }

    if (!email && !mobile) {
      return res.status(400).json({ error: 'Either email or mobile number is required' })
    }

    // Check if user already exists
    const existingUser = await findUser(email, mobile)
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this email or mobile number' })
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Create user
    const newUser = await createUser({
      name,
      email: email || null,
      mobile: mobile || null,
      password: hashedPassword
    })

    // Generate token
    const token = generateToken(newUser.id, newUser.email || newUser.mobile, newUser.name)

    // Remove password from response
    const { password: _, ...userWithoutPassword } = newUser

    // Log for admin
    console.log(`✅ New user signup: ${name} - ${email || mobile}`)

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      token,
      user: userWithoutPassword
    })
  } catch (error) {
    console.error('Signup error:', error)
    res.status(500).json({ error: 'Failed to create user' })
  }
})

// Login endpoint
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, mobile, password } = req.body

    // Validation
    if ((!email && !mobile) || !password) {
      return res.status(400).json({ error: 'Email/mobile and password are required' })
    }

    // Find user
    const user = await findUser(email, mobile)
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    // Check password
    const isValidPassword = await comparePassword(password, user.password)
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    // Update last login
    await updateLastLogin(user.id)

    // Generate token
    const token = generateToken(user.id, user.email || user.mobile, user.name)

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user

    // Log for admin
    console.log(`🔓 User login: ${user.name} - ${email || mobile}`)

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: userWithoutPassword
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ error: 'Login failed' })
  }
})

// ============================================
// PROGRESS TRACKING ENDPOINTS
// ============================================

// Get user's progress data
app.get('/api/progress', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId
    const progressData = await getUserProgress(userId)
    
    res.json({
      success: true,
      progress: progressData
    })
  } catch (error) {
    console.error('Get progress error:', error)
    res.status(500).json({ error: 'Failed to fetch progress data' })
  }
})

// Save progress entry
app.post('/api/progress', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId
    const { type, data } = req.body

    if (!type || !data) {
      return res.status(400).json({ error: 'Type and data are required' })
    }

    const progressEntry = await addProgressEntry(userId, { type, data })

    // Log for admin monitoring
    console.log(`📊 Progress saved - User: ${req.user.name}, Type: ${type}`)

    res.status(201).json({
      success: true,
      message: 'Progress saved successfully',
      entry: progressEntry
    })
  } catch (error) {
    console.error('Save progress error:', error)
    res.status(500).json({ error: 'Failed to save progress' })
  }
})

// Admin endpoint to view all stats (you can add authentication for this)
app.get('/api/admin/stats', async (req, res) => {
  try {
    // You should add admin authentication here
    const stats = await getAdminStats()
    res.json({
      success: true,
      stats
    })
  } catch (error) {
    console.error('Admin stats error:', error)
    res.status(500).json({ error: 'Failed to fetch stats' })
  }
})

// Send Email endpoint
app.post('/api/send-email', async (req, res) => {
  try {
    const { clientEmail, mealPlan, preferences } = req.body

    if (!clientEmail || !mealPlan || !preferences) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: clientEmail, mealPlan, preferences' 
      })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(clientEmail)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid email format' 
      })
    }

    const result = await sendEmail(clientEmail, mealPlan, preferences)
    
    res.json({ 
      success: true, 
      message: 'Email sent successfully!',
      messageId: result.messageId
    })
  } catch (error) {
    console.error('Email sending error:', error)
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to send email' 
    })
  }
})

// Send WhatsApp message endpoint
app.post('/api/send-whatsapp', async (req, res) => {
  try {
    const { phoneNumber, mealPlan, preferences } = req.body

    if (!phoneNumber || !mealPlan || !preferences) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: phoneNumber, mealPlan, preferences' 
      })
    }

    // Validate phone number (basic validation)
    const cleanNumber = phoneNumber.replace(/[\s\-+]/g, '')
    if (!/^\d{10,15}$/.test(cleanNumber)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid phone number format. Use 10-15 digits with country code.' 
      })
    }

    const result = await sendWhatsAppMessage(cleanNumber, mealPlan, preferences)
    
    res.json({ 
      success: true, 
      message: 'WhatsApp message sent successfully!',
      messageId: result.messageId
    })
  } catch (error) {
    console.error('WhatsApp sending error:', error)
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to send WhatsApp message' 
    })
  }
})

// Send workout plan email endpoint
app.post('/api/send-workout-email', async (req, res) => {
  try {
    const { clientEmail, workoutPlan, preferences } = req.body

    if (!clientEmail || !workoutPlan || !preferences) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: clientEmail, workoutPlan, preferences' 
      })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(clientEmail)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid email format' 
      })
    }

    const result = await sendWorkoutEmail(clientEmail, workoutPlan, preferences)
    
    res.json({ 
      success: true, 
      message: 'Workout plan email sent successfully!',
      messageId: result.messageId
    })
  } catch (error) {
    console.error('Workout email sending error:', error)
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to send workout email' 
    })
  }
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err)
  res.status(500).json({ 
    success: false, 
    error: 'Internal server error' 
  })
})

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀 Minakshi Fitness Backend Server`)
  console.log(`🔐 Authentication: ✅ Enabled`)
  console.log(`📧 Email Service: ${process.env.GMAIL_USER ? '✅ Configured' : '❌ Not configured'}`)
  console.log(`📱 WhatsApp Service: ${process.env.WHATSAPP_ACCESS_TOKEN || process.env.TWILIO_ACCOUNT_SID ? '✅ Configured' : '❌ Not configured'}`)
  console.log(`🌐 Server running on: http://0.0.0.0:${PORT}`)
  console.log(`🔗 Local: http://localhost:${PORT}/api/health`)
  console.log(`🔗 Network: http://10.16.97.63:${PORT}/api/health`)
  console.log(`📊 Admin stats: http://localhost:${PORT}/api/admin/stats\n`)
})

export default app
