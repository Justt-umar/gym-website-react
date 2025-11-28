// Utility function to save user progress to backend
export async function saveUserProgress(type, data) {
  try {
    const token = localStorage.getItem('authToken')
    if (!token) {
      console.log('No auth token found')
      return { success: false, error: 'Not authenticated' }
    }

    const backendUrl = 'http://localhost:3001'
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

    const backendUrl = 'http://localhost:3001'
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
