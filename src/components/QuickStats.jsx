import { useState, useEffect } from 'react'
import './QuickStats.css'

function QuickStats() {
  const [stats, setStats] = useState({
    totalWorkouts: 0,
    currentStreak: 0,
    totalPRs: 0,
    workoutsThisWeek: 0,
    totalMeals: 0
  })

  useEffect(() => {
    calculateStats()
  }, [])

  const calculateStats = () => {
    try {
      // Get progress data
      const progressData = JSON.parse(localStorage.getItem('workoutProgress') || '[]')
      
      // Get PR data
      const prData = JSON.parse(localStorage.getItem('personalRecords') || '[]')
      
      // Get meal plans
      const mealPlans = JSON.parse(localStorage.getItem('mealPlans') || '[]')
      
      // Calculate total workouts
      const totalWorkouts = progressData.length
      
      // Calculate current streak
      const streak = calculateStreak(progressData)
      
      // Calculate workouts this week
      const workoutsThisWeek = calculateWeeklyWorkouts(progressData)
      
      setStats({
        totalWorkouts,
        currentStreak: streak,
        totalPRs: prData.length,
        workoutsThisWeek,
        totalMeals: mealPlans.length
      })
    } catch (error) {
      console.error('Error calculating stats:', error)
    }
  }

  const calculateStreak = (progressData) => {
    if (progressData.length === 0) return 0
    
    const sortedDates = progressData
      .map(p => new Date(p.date))
      .sort((a, b) => b - a)
    
    let streak = 1
    let currentDate = sortedDates[0]
    
    for (let i = 1; i < sortedDates.length; i++) {
      const dayDiff = Math.floor((currentDate - sortedDates[i]) / (1000 * 60 * 60 * 24))
      if (dayDiff === 1) {
        streak++
        currentDate = sortedDates[i]
      } else if (dayDiff > 1) {
        break
      }
    }
    
    return streak
  }

  const calculateWeeklyWorkouts = (progressData) => {
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
    
    return progressData.filter(p => new Date(p.date) >= oneWeekAgo).length
  }

  return (
    <div className="quick-stats">
      <h3>📊 Quick Stats</h3>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">💪</div>
          <div className="stat-value">{stats.totalWorkouts}</div>
          <div className="stat-label">Total Workouts</div>
        </div>
        
        <div className="stat-card streak">
          <div className="stat-icon">🔥</div>
          <div className="stat-value">{stats.currentStreak}</div>
          <div className="stat-label">Day Streak</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">🏆</div>
          <div className="stat-value">{stats.totalPRs}</div>
          <div className="stat-label">Personal Records</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">📅</div>
          <div className="stat-value">{stats.workoutsThisWeek}</div>
          <div className="stat-label">This Week</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">🍽️</div>
          <div className="stat-value">{stats.totalMeals}</div>
          <div className="stat-label">Meal Plans</div>
        </div>
      </div>
    </div>
  )
}

export default QuickStats
