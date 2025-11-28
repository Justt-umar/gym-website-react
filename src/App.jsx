import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { DarkModeProvider } from './contexts/DarkModeContext'
import { UnitProvider } from './contexts/UnitContext'
import { LanguageProvider } from './contexts/LanguageContext'
import ProtectedRoute from './components/ProtectedRoute'
import Header from './components/Header'
import DarkModeToggle from './components/DarkModeToggle'
import Home from './pages/Home'
import Login from './pages/Login'
import BMICalculator from './pages/BMICalculator'
import CalorieCalculator from './pages/CalorieCalculator'
import DietPlan from './pages/DietPlan'
import WorkoutPlan from './pages/WorkoutPlan'
import AIFeatures from './pages/AIFeatures'
import './App.css'

function App() {
  return (
    <Router>
      <AuthProvider>
        <DarkModeProvider>
          <UnitProvider>
            <LanguageProvider>
              <div className="App">
                <Header />
                <DarkModeToggle />
                <Routes>
                  {/* Public routes */}
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  
                  {/* Protected routes - require authentication */}
                  <Route path="/bmi" element={
                    <ProtectedRoute>
                      <BMICalculator />
                    </ProtectedRoute>
                  } />
                  <Route path="/calorie" element={
                    <ProtectedRoute>
                      <CalorieCalculator />
                    </ProtectedRoute>
                  } />
                  <Route path="/diet" element={
                    <ProtectedRoute>
                      <DietPlan />
                    </ProtectedRoute>
                  } />
                  <Route path="/workout" element={
                    <ProtectedRoute>
                      <WorkoutPlan />
                    </ProtectedRoute>
                  } />
                  <Route path="/ai-features" element={
                    <ProtectedRoute>
                      <AIFeatures />
                    </ProtectedRoute>
                  } />

                  {/* Catch all - redirect to home */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </div>
            </LanguageProvider>
          </UnitProvider>
        </DarkModeProvider>
      </AuthProvider>
    </Router>
  )
}

export default App
