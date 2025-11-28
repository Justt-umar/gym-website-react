import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import './Login.css'

function Login() {
  const navigate = useNavigate()
  const { login, isAuthenticated } = useAuth()
  const [isSignup, setIsSignup] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    password: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)

  // Redirect if already logged in, load saved credentials
  useEffect(() => {
    if (isAuthenticated()) {
      navigate('/ai-features')
    }
    
    // Load saved credentials if Remember Me was checked
    const savedEmail = localStorage.getItem('rememberedEmail')
    const savedMobile = localStorage.getItem('rememberedMobile')
    if (savedEmail || savedMobile) {
      setFormData(prev => ({
        ...prev,
        email: savedEmail || '',
        mobile: savedMobile || ''
      }))
      setRememberMe(true)
    }
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const backendUrl = 'http://localhost:3001'

      if (isSignup) {
        // Signup validation
        if (!formData.name || (!formData.email && !formData.mobile) || !formData.password) {
          setError('Please fill in name, email or mobile, and password')
          setLoading(false)
          return
        }

        // Validate mobile number if provided
        if (formData.mobile) {
          const cleanMobile = formData.mobile.replace(/[\s\-+]/g, '')
          if (!/^\d{10,15}$/.test(cleanMobile)) {
            setError('Invalid mobile number. Use 10-15 digits with country code.')
            setLoading(false)
            return
          }
        }

        // Validate email if provided
        if (formData.email) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
          if (!emailRegex.test(formData.email)) {
            setError('Invalid email format')
            setLoading(false)
            return
          }
        }

        // Signup API call
        const response = await fetch(`${backendUrl}/api/auth/signup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        })

        const data = await response.json()

        if (!response.ok) {
          setError(data.error || 'Signup failed')
          setLoading(false)
          return
        }

        // Store user data and update context
        login(data.user, data.token)

        // Redirect after successful signup (don't set loading to false)
        window.location.href = '/ai-features'
        return // Prevent finally block from executing
      } else {
        // Login validation
        if ((!formData.email && !formData.mobile) || !formData.password) {
          setError('Please enter email/mobile and password')
          setLoading(false)
          return
        }

        // Login API call
        const response = await fetch(`${backendUrl}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: formData.email,
            mobile: formData.mobile,
            password: formData.password
          })
        })

        const data = await response.json()

        if (!response.ok) {
          setError(data.error || 'Login failed')
          setLoading(false)
          return
        }

        // Store user data and update context
        login(data.user, data.token)

        // Save credentials if Remember Me is checked
        if (rememberMe) {
          if (formData.email) localStorage.setItem('rememberedEmail', formData.email)
          if (formData.mobile) localStorage.setItem('rememberedMobile', formData.mobile)
        } else {
          localStorage.removeItem('rememberedEmail')
          localStorage.removeItem('rememberedMobile')
        }

        // Redirect after successful login (don't set loading to false)
        window.location.href = '/ai-features'
        return // Prevent finally block from executing
      }
    } catch (error) {
      console.error('Auth error:', error)
      setError('Connection error. Please make sure the backend server is running.')
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <div className="gym-logo">💪</div>
          <h1>{isSignup ? 'Create Your Account' : 'Welcome Back'}</h1>
          <p>{isSignup ? 'Join our fitness community today' : 'Login to track your progress'}</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {isSignup && (
            <div className="form-field">
              <label>Full Name *</label>
              <input
                type="text"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
              />
            </div>
          )}

          <div className="form-field">
            <label>Email Address {isSignup ? '(Optional)' : '*'}</label>
            <input
              type="email"
              placeholder="your.email@example.com"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required={!isSignup && !formData.mobile}
            />
          </div>

          <div className="form-field">
            <label>Mobile Number {isSignup ? '(Optional)' : '*'}</label>
            <input
              type="tel"
              placeholder="+91XXXXXXXXXX or 10-digit number"
              value={formData.mobile}
              onChange={(e) => setFormData({...formData, mobile: e.target.value})}
              required={!isSignup && !formData.email}
            />
            <small style={{color: '#888', fontSize: '12px', marginTop: '4px', display: 'block'}}>
              {isSignup ? 'Provide at least email or mobile number' : 'Use email or mobile to login'}
            </small>
          </div>

          <div className="form-field">
            <label>Password *</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              required
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          {!isSignup && (
            <div className="remember-me">
              <label>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span>Remember me</span>
              </label>
            </div>
          )}

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? '⏳ Please wait...' : (isSignup ? '🚀 Create Account' : '🔓 Login')}
          </button>

          <div className="toggle-mode">
            {isSignup ? (
              <p>
                Already have an account?{' '}
                <button type="button" onClick={() => {
                  setIsSignup(false)
                  setError('')
                  setFormData({name: '', email: '', mobile: '', password: ''})
                }}>
                  Login here
                </button>
              </p>
            ) : (
              <p>
                Don't have an account?{' '}
                <button type="button" onClick={() => {
                  setIsSignup(true)
                  setError('')
                  setFormData({name: '', email: '', mobile: '', password: ''})
                }}>
                  Sign up
                </button>
              </p>
            )}
          </div>
        </form>

        <div className="login-features">
          <div className="feature-item">
            <span className="feature-icon">📊</span>
            <span>Track Your Progress</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">🍽️</span>
            <span>Personalized Meal Plans</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">💬</span>
            <span>AI Fitness Coach</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
