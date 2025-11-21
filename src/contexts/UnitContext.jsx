import { createContext, useContext, useState, useEffect } from 'react'

const UnitContext = createContext()

export function useUnits() {
  const context = useContext(UnitContext)
  if (!context) {
    throw new Error('useUnits must be used within UnitProvider')
  }
  return context
}

export function UnitProvider({ children }) {
  const [weightUnit, setWeightUnit] = useState(() => {
    return localStorage.getItem('weightUnit') || 'kg'
  })
  
  const [heightUnit, setHeightUnit] = useState(() => {
    return localStorage.getItem('heightUnit') || 'cm'
  })

  useEffect(() => {
    localStorage.setItem('weightUnit', weightUnit)
  }, [weightUnit])

  useEffect(() => {
    localStorage.setItem('heightUnit', heightUnit)
  }, [heightUnit])

  const toggleWeightUnit = () => {
    setWeightUnit(prev => prev === 'kg' ? 'lbs' : 'kg')
  }

  const toggleHeightUnit = () => {
    setHeightUnit(prev => prev === 'cm' ? 'inches' : 'cm')
  }

  // Conversion functions
  const convertWeight = (value, fromUnit, toUnit) => {
    if (fromUnit === toUnit) return value
    if (fromUnit === 'kg' && toUnit === 'lbs') return value * 2.20462
    if (fromUnit === 'lbs' && toUnit === 'kg') return value / 2.20462
    return value
  }

  const convertHeight = (value, fromUnit, toUnit) => {
    if (fromUnit === toUnit) return value
    if (fromUnit === 'cm' && toUnit === 'inches') return value / 2.54
    if (fromUnit === 'inches' && toUnit === 'cm') return value * 2.54
    return value
  }

  return (
    <UnitContext.Provider value={{ 
      weightUnit, 
      heightUnit, 
      toggleWeightUnit, 
      toggleHeightUnit,
      convertWeight,
      convertHeight
    }}>
      {children}
    </UnitContext.Provider>
  )
}
