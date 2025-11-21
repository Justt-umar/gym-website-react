import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'minakshi-fitness-secret-key-2025'
const JWT_EXPIRES_IN = '30d'

// Hash password
export async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10)
  return bcrypt.hash(password, salt)
}

// Compare password
export async function comparePassword(password, hashedPassword) {
  return bcrypt.compare(password, hashedPassword)
}

// Generate JWT token
export function generateToken(userId, email, name) {
  return jwt.sign(
    { userId, email, name },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  )
}

// Verify JWT token
export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (error) {
    return null
  }
}

// Middleware to authenticate requests
export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    return res.status(401).json({ error: 'Access token required' })
  }

  const decoded = verifyToken(token)
  if (!decoded) {
    return res.status(403).json({ error: 'Invalid or expired token' })
  }

  req.user = decoded
  next()
}
