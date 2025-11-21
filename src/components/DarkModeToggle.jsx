import { useDarkMode } from '../contexts/DarkModeContext'
import './DarkModeToggle.css'

function DarkModeToggle() {
  const { isDarkMode, toggleDarkMode } = useDarkMode()

  return (
    <button 
      className="dark-mode-toggle" 
      onClick={toggleDarkMode}
      aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDarkMode ? '☀️' : '🌙'}
    </button>
  )
}

export default DarkModeToggle
