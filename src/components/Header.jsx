import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import './Header.css'

function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { user, logout, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const toggleMenu = () => {
    setMenuOpen(!menuOpen)
  }

  const closeMenu = () => {
    setMenuOpen(false)
  }

  const handleLogout = () => {
    logout()
    closeMenu()
    window.location.href = '/login'
  }

  return (
    <header>
      <div className="container">
        <div className="logo">
          <Link to="/" onClick={closeMenu}>
            Minakshi Fitness <span>Club</span>
          </Link>
        </div>
        <button
          type="button"
          className={`ham-burger ${menuOpen ? 'active' : ''}`}
          aria-label="Toggle navigation menu"
          aria-expanded={menuOpen}
          onClick={toggleMenu}
        >
          <span></span>
          <span></span>
        </button>
        <nav className={`nav ${menuOpen ? 'open' : ''}`}>
          <ul>
            <li><Link to="/" onClick={closeMenu}>Home</Link></li>
            {isAuthenticated() ? (
              <>
                <li><Link to="/ai-features" onClick={closeMenu}>🤖 AI Features</Link></li>
                <li><Link to="/calorie" onClick={closeMenu}>Calorie Calculator</Link></li>
                <li><Link to="/bmi" onClick={closeMenu}>BMI Calculator</Link></li>
                <li><a href="#price" onClick={closeMenu}>Price</a></li>
                <li><a href="#contact" onClick={closeMenu}>Contact</a></li>
                <li style={{ color: '#ff6b35', fontWeight: 'bold' }}>👤 {user?.name}</li>
                <li><a onClick={handleLogout} style={{ cursor: 'pointer' }}>Logout</a></li>
              </>
            ) : (
              <>
                <li><a href="#price" onClick={closeMenu}>Price</a></li>
                <li><a href="#contact" onClick={closeMenu}>Contact</a></li>
                <li><Link to="/login" onClick={closeMenu}>Login</Link></li>
              </>
            )}
          </ul>
        </nav>
      </div>
    </header>
  )
}

export default Header
