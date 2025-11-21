import { useState } from 'react'
import { saveUserProgress } from '../utils/progressService'
import './CalorieCalculator.css'

function CalorieCalculator() {
  const [gender, setGender] = useState('male')
  const [age, setAge] = useState('')
  const [weight, setWeight] = useState('')
  const [height, setHeight] = useState('')
  const [activity, setActivity] = useState('sedentary')
  const [result, setResult] = useState(null)

  const calculateCalories = async () => {
    const w = parseFloat(weight)
    const h = parseFloat(height)
    const a = parseInt(age)

    if (isNaN(w) || isNaN(h) || isNaN(a) || w <= 0 || h <= 0 || a <= 0) {
      setResult({ error: 'Please enter valid values for all fields.' })
      return
    }

    if (a < 15 || a > 80) {
      setResult({ error: 'Age must be between 15 and 80 years.' })
      return
    }

    if (h < 100 || h > 250) {
      setResult({ error: 'Height must be between 100 and 250 cm.' })
      return
    }

    if (w < 30 || w > 300) {
      setResult({ error: 'Weight must be between 30 and 300 kg.' })
      return
    }

    let bmr
    if (gender === 'male') {
      bmr = 10 * w + 6.25 * h - 5 * a + 5
    } else {
      bmr = 10 * w + 6.25 * h - 5 * a - 161
    }

    const activityFactors = {
      sedentary: { factor: 1.2, label: 'Sedentary (little or no exercise)' },
      light: { factor: 1.375, label: 'Lightly active (1-3 days/week)' },
      moderate: { factor: 1.55, label: 'Moderately active (3-5 days/week)' },
      active: { factor: 1.725, label: 'Very active (6-7 days/week)' },
      extra: { factor: 1.9, label: 'Extra active (athlete/physical job)' }
    }

    const tdee = bmr * activityFactors[activity].factor
    const weightLoss = tdee - 500
    const extremeLoss = tdee - 1000
    const weightGain = tdee + 500

    const resultData = {
      bmr: Math.round(bmr),
      maintenance: Math.round(tdee),
      weightLoss: Math.round(weightLoss),
      extremeLoss: Math.round(extremeLoss),
      weightGain: Math.round(weightGain),
      activityLabel: activityFactors[activity].label
    }

    setResult(resultData)

    // Save to backend
    await saveUserProgress('calorie', {
      gender,
      age: a,
      weight: w,
      height: h,
      activity,
      bmr: Math.round(bmr),
      tdee: Math.round(tdee),
      calculatedAt: new Date().toISOString()
    })
  }

  return (
    <div className="calculator-page">
      <div className="container">
        <h1>Calorie Calculator</h1>
        <p className="subtitle">Calculate your daily calorie needs</p>

        <div className="input-container">
          <label>Gender:</label>
          <select value={gender} onChange={(e) => setGender(e.target.value)}>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>

        <div className="input-container">
          <label htmlFor="age">Age (years):</label>
          <input
            type="number"
            id="age"
            placeholder="Age"
            min="15"
            max="80"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            required
          />
        </div>

        <div className="input-container">
          <label htmlFor="weight">Weight (kg):</label>
          <input
            type="number"
            id="weight"
            placeholder="Weight (kg)"
            min="30"
            max="300"
            step="0.1"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            required
          />
        </div>

        <div className="input-container">
          <label htmlFor="height">Height (cm):</label>
          <input
            type="number"
            id="height"
            placeholder="Height (cm)"
            min="100"
            max="250"
            value={height}
            onChange={(e) => setHeight(e.target.value)}
            required
          />
        </div>

        <div className="input-container">
          <label>Activity Level:</label>
          <select value={activity} onChange={(e) => setActivity(e.target.value)}>
            <option value="sedentary">Sedentary (little or no exercise)</option>
            <option value="light">Lightly active (1-3 days/week)</option>
            <option value="moderate">Moderately active (3-5 days/week)</option>
            <option value="active">Very active (6-7 days/week)</option>
            <option value="extra">Extra active (athlete/physical job)</option>
          </select>
        </div>

        <button onClick={calculateCalories}>Calculate Calories</button>

        {result && (
          <div id="result" role="status" aria-live="polite">
            {result.error ? (
              <div style={{ color: '#d32f2f' }}>{result.error}</div>
            ) : (
              <>
                <h3>Your Daily Calorie Needs:</h3>
                <div className="calorie-result">
                  <div className="result-item">
                    <strong>Basal Metabolic Rate (BMR):</strong>
                    <span>{result.bmr} calories/day</span>
                    <small>Calories burned at complete rest</small>
                  </div>
                  <div className="result-item highlight">
                    <strong>Maintenance Calories (TDEE):</strong>
                    <span>{result.maintenance} calories/day</span>
                    <small>Activity: {result.activityLabel}</small>
                  </div>
                  <div className="result-item">
                    <strong>Weight Loss (mild deficit):</strong>
                    <span>{result.weightLoss} calories/day</span>
                    <small>Lose ~0.5 kg per week</small>
                  </div>
                  <div className="result-item">
                    <strong>Weight Loss (aggressive):</strong>
                    <span>{result.extremeLoss} calories/day</span>
                    <small>Lose ~1 kg per week</small>
                  </div>
                  <div className="result-item">
                    <strong>Weight Gain (muscle building):</strong>
                    <span>{result.weightGain} calories/day</span>
                    <small>Gain ~0.5 kg per week</small>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        <a href="/" className="back-link">← Back to Home</a>
      </div>
    </div>
  )
}

export default CalorieCalculator
