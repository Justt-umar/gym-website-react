import { createContext, useContext, useState, useEffect } from 'react'

const LanguageContext = createContext()

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider')
  }
  return context
}

const languages = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'hi', name: 'हिंदी', flag: '🇮🇳' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' }
]

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('preferredLanguage') || 'en'
  })

  useEffect(() => {
    localStorage.setItem('preferredLanguage', language)
  }, [language])

  const getLanguageName = (code) => {
    return languages.find(l => l.code === code)?.name || 'English'
  }

  const getLanguageFlag = (code) => {
    return languages.find(l => l.code === code)?.flag || '🇬🇧'
  }

  const getAIPromptSuffix = () => {
    if (language === 'en') return ''
    
    const langName = getLanguageName(language)
    return `\n\nIMPORTANT: Please respond in ${langName} language.`
  }

  return (
    <LanguageContext.Provider value={{ 
      language, 
      setLanguage, 
      languages,
      getLanguageName,
      getLanguageFlag,
      getAIPromptSuffix
    }}>
      {children}
    </LanguageContext.Provider>
  )
}
