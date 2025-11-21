// Utility function to save user progress to backend
export async function saveUserProgress(type, data) {
  try {
    const token = localStorage.getItem('authToken')
    if (!token) {
      console.log('No auth token found')
      return { success: false, error: 'Not authenticated' }
    }

    // Use dynamic backend URL that works on both desktop and mobile
    const hostname = window.location.hostname
    const backendUrl = `http://${hostname}:3001`
    const response = await fetch(`${backendUrl}/api/progress`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ type, data })
    })

    const result = await response.json()
    return result
  } catch (error) {
    console.error('Error saving progress:', error)
    return { success: false, error: error.message }
  }
}

// Utility function to get user's progress history
export async function getUserProgressHistory() {
  try {
    const token = localStorage.getItem('authToken')
    if (!token) {
      return { success: false, error: 'Not authenticated' }
    }

    // Use production backend or dynamic URL for development
    const backendUrl = import.meta.env.PROD 
      ? 'https://minakshi-fitness-backend.onrender.com'
      : `http://${window.location.hostname}:3001`
    const response = await fetch(`${backendUrl}/api/progress`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    const result = await response.json()
    return result
  } catch (error) {
    console.error('Error fetching progress:', error)
    return { success: false, error: error.message }
  }
}
