import { createContext, useState, useContext, useEffect } from 'react'

export const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in on mount
    const token = localStorage.getItem('authToken')
    const savedUser = localStorage.getItem('currentUser')
    
    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser))
      } catch (error) {
        console.error('Error parsing user data:', error)
        localStorage.removeItem('authToken')
        localStorage.removeItem('currentUser')
      }
    }
    setLoading(false)
  }, [])

  const login = (userData, token) => {
    localStorage.setItem('authToken', token)
    localStorage.setItem('currentUser', JSON.stringify(userData))
    setUser(userData)
  }

  const logout = () => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('currentUser')
    setUser(null)
  }

  const updateUser = (updatedData) => {
    const updatedUser = { ...user, ...updatedData }
    localStorage.setItem('currentUser', JSON.stringify(updatedUser))
    setUser(updatedUser)
  }

  const isAuthenticated = () => {
    return !!user && !!localStorage.getItem('authToken')
  }

  const value = {
    user,
    login,
    logout,
    updateUser,
    isAuthenticated,
    loading
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
