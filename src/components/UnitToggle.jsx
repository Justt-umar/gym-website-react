import { useUnits } from '../contexts/UnitContext'
import './UnitToggle.css'

function UnitToggle() {
  const { weightUnit, heightUnit, toggleWeightUnit, toggleHeightUnit } = useUnits()

  return (
    <div className="unit-toggle-container">
      <div className="unit-toggle">
        <span className="unit-label">Weight:</span>
        <button 
          className={`unit-btn ${weightUnit === 'kg' ? 'active' : ''}`}
          onClick={toggleWeightUnit}
        >
          KG
        </button>
        <button 
          className={`unit-btn ${weightUnit === 'lbs' ? 'active' : ''}`}
          onClick={toggleWeightUnit}
        >
          LBS
        </button>
      </div>
      <div className="unit-toggle">
        <span className="unit-label">Height:</span>
        <button 
          className={`unit-btn ${heightUnit === 'cm' ? 'active' : ''}`}
          onClick={toggleHeightUnit}
        >
          CM
        </button>
        <button 
          className={`unit-btn ${heightUnit === 'inches' ? 'active' : ''}`}
          onClick={toggleHeightUnit}
        >
          IN
        </button>
      </div>
    </div>
  )
}

export default UnitToggle
