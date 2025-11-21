import { useState } from 'react'
import { saveUserProgress } from '../utils/progressService'
import './BMICalculator.css'

function BMICalculator() {
  const [height, setHeight] = useState('')
  const [weight, setWeight] = useState('')
  const [result, setResult] = useState(null)

  const calculateBMI = async () => {
    const h = parseFloat(height)
    const w = parseFloat(weight)

    if (isNaN(h) || isNaN(w) || h <= 0 || w <= 0) {
      setResult({ error: 'Please enter valid height and weight values.' })
      return
    }

    if (h < 50 || h > 300) {
      setResult({ error: 'Height must be between 50 and 300 cm.' })
      return
    }

    if (w < 20 || w > 300) {
      setResult({ error: 'Weight must be between 20 and 300 kg.' })
      return
    }

    const bmi = w / ((h / 100) ** 2)
    let category = ''
    let categoryClass = ''
    let healthAdvice = ''

    if (bmi < 18.5) {
      category = 'Underweight'
      categoryClass = 'underweight'
      healthAdvice = 'Consider consulting a nutritionist to gain healthy weight.'
    } else if (bmi < 25) {
      category = 'Normal weight'
      categoryClass = 'normal'
      healthAdvice = 'Great! Maintain your healthy lifestyle.'
    } else if (bmi < 30) {
      category = 'Overweight'
      categoryClass = 'overweight'
      healthAdvice = 'Consider a balanced diet and regular exercise.'
    } else {
      category = 'Obese'
      categoryClass = 'obese'
      healthAdvice = 'We recommend consulting a healthcare professional.'
    }

    const resultData = {
      bmi: bmi.toFixed(1),
      category,
      categoryClass,
      healthAdvice
    }

    setResult(resultData)

    // Save to backend
    await saveUserProgress('bmi', {
      height: h,
      weight: w,
      bmi: bmi.toFixed(1),
      category,
      calculatedAt: new Date().toISOString()
    })
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      calculateBMI()
    }
  }

  return (
    <div className="calculator-page">
      <div className="container">
        <h1>BMI Calculator</h1>
        <p className="subtitle">Calculate your Body Mass Index</p>
        
        <div className="input-container">
          <label htmlFor="height">Height (cm):</label>
          <input
            type="number"
            id="height"
            placeholder="Height (cm)"
            min="50"
            max="300"
            value={height}
            onChange={(e) => setHeight(e.target.value)}
            onKeyPress={handleKeyPress}
            required
          />
        </div>

        <div className="input-container">
          <label htmlFor="weight">Weight (kg):</label>
          <input
            type="number"
            id="weight"
            placeholder="Weight (kg)"
            min="20"
            max="300"
            step="0.1"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            onKeyPress={handleKeyPress}
            required
          />
        </div>

        <button onClick={calculateBMI} aria-label="Calculate your BMI">
          Calculate BMI
        </button>

        {result && (
          <div id="result" className={result.categoryClass || ''} role="status" aria-live="polite">
            {result.error ? (
              <div style={{ color: '#d32f2f' }}>{result.error}</div>
            ) : (
              <>
                <div><strong>Your BMI:</strong> {result.bmi}</div>
                <div style={{ marginTop: '10px' }}><strong>Category:</strong> {result.category}</div>
                <div style={{ marginTop: '10px', fontSize: '16px', fontWeight: 'normal' }}>
                  {result.healthAdvice}
                </div>
              </>
            )}
          </div>
        )}

        <div className="bmi-chart">
          <h3>BMI Categories:</h3>
          <ul>
            <li><strong>Underweight:</strong> BMI less than 18.5</li>
            <li><strong>Normal weight:</strong> BMI 18.5-24.9</li>
            <li><strong>Overweight:</strong> BMI 25-29.9</li>
            <li><strong>Obese:</strong> BMI 30 or greater</li>
          </ul>
        </div>

        <a href="/" className="back-link">← Back to Home</a>
      </div>
    </div>
  )
}

export default BMICalculator
