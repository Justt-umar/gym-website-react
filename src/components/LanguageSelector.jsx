import { useLanguage } from '../contexts/LanguageContext'
import './LanguageSelector.css'

function LanguageSelector() {
  const { language, setLanguage, languages, getLanguageFlag } = useLanguage()

  return (
    <div className="language-selector">
      <label htmlFor="language-select">
        <span className="current-flag">{getLanguageFlag(language)}</span>
      </label>
      <select 
        id="language-select"
        value={language} 
        onChange={(e) => setLanguage(e.target.value)}
        className="language-dropdown"
      >
        {languages.map(lang => (
          <option key={lang.code} value={lang.code}>
            {lang.flag} {lang.name}
          </option>
        ))}
      </select>
    </div>
  )
}

export default LanguageSelector
