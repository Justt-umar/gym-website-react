// Backend API configuration
const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'

// Format meal plan as text message
function formatMealPlanText(mealPlan, preferences) {
  const meals = [
    { key: 'breakfast', title: 'BREAKFAST', icon: '☀️' },
    { key: 'mid-morning', title: 'MID-MORNING SNACK', icon: '🥤' },
    { key: 'lunch', title: 'LUNCH', icon: '🍽️' },
    { key: 'evening-snack', title: 'EVENING SNACK', icon: '☕' },
    { key: 'dinner', title: 'DINNER', icon: '🌙' },
    { key: 'before-bed', title: 'BEFORE BED', icon: '🌟' }
  ]

  let text = `🏋️ MINAKSHI FITNESS CLUB - AI Meal Plan\n\n`
  text += `📊 Plan Details:\n`
  text += `Calories: ${preferences.calories}\n`
  text += `Diet Type: ${preferences.dietType.toUpperCase()}\n`
  if (preferences.allergies) {
    text += `Allergies: ${preferences.allergies}\n`
  }
  text += `Generated: ${new Date().toLocaleDateString('en-IN')}\n\n`
  
  if (preferences.variation > 0) {
    text += `Variation #${preferences.variation}\n\n`
  }

  text += `═══════════════════════════════\n\n`

  meals.forEach((meal) => {
    const items = mealPlan[meal.key]
    if (!items || items.length === 0) return

    text += `${meal.title}\n`
    text += `${'─'.repeat(meal.title.length)}\n`
    items.forEach((item) => {
      text += `• ${item}\n`
    })
    text += `\n`
  })

  text += `═══════════════════════════════\n\n`
  text += `📍 Orai Road Near Naher Bypass, Rath, UP\n`
  text += `📞 +91 9826030890\n`
  text += `✉️ ojasnahta2004@gmail.com\n\n`
  text += `Transform Your Body • Elevate Your Life`

  return text
}

export async function emailMealPlan(mealPlan, preferences) {
  try {
    if (!mealPlan) {
      alert('No meal plan data available. Please generate a meal plan first.')
      return false
    }

    const clientEmail = prompt('Enter client email address to receive the meal plan:')
    if (!clientEmail) return false

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(clientEmail)) {
      alert('Please enter a valid email address.')
      return false
    }

    // Call backend API
    const response = await fetch(`${API_URL}/api/send-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        clientEmail,
        mealPlan,
        preferences
      })
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Failed to send email')
    }

    alert(`✅ Email sent successfully to ${clientEmail}!`)
    return true

  } catch (error) {
    console.error('Error sending email:', error)
    
    // If backend is not running, fall back to Gmail web compose
    if (error.message.includes('fetch') || error.message.includes('Failed to fetch')) {
      alert('⚠️ Backend server not running. Opening Gmail compose instead...\n\nTo enable automatic sending, start the backend server.')
      const subject = encodeURIComponent('Your Personalized Meal Plan - Minakshi Fitness Club')
      const body = encodeURIComponent(formatMealPlanText(mealPlan, preferences))
      const gmailURL = `https://mail.google.com/mail/?view=cm&fs=1&to=${clientEmail}&su=${subject}&body=${body}`
      window.open(gmailURL, '_blank')
    } else {
      alert(`❌ Error: ${error.message}`)
    }
    return false
  }
}

export async function sendToWhatsApp(mealPlan, preferences) {
  try {
    if (!mealPlan) {
      alert('No meal plan data available. Please generate a meal plan first.')
      return false
    }

    let phoneNumber = prompt('Enter client WhatsApp number (10 digits):')
    if (!phoneNumber) return false

    // Remove any spaces, dashes, or plus signs
    phoneNumber = phoneNumber.replace(/[\s\-+]/g, '')

    // Validate phone number (10 digits for India)
    if (!/^\d{10}$/.test(phoneNumber)) {
      alert('Please enter a valid 10-digit mobile number.')
      return false
    }

    // Add India country code
    phoneNumber = '91' + phoneNumber

    // Call backend API
    const response = await fetch(`${API_URL}/api/send-whatsapp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        phoneNumber,
        mealPlan,
        preferences
      })
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Failed to send WhatsApp message')
    }

    alert(`✅ WhatsApp message sent successfully to +${phoneNumber}!`)
    return true

  } catch (error) {
    console.error('Error sending WhatsApp:', error)
    
    // If backend is not running, fall back to WhatsApp Web
    if (error.message.includes('fetch') || error.message.includes('Failed to fetch')) {
      alert('⚠️ Backend server not running. Opening WhatsApp Web instead...\n\nTo enable automatic sending, start the backend server.')
      const message = encodeURIComponent(formatMealPlanText(mealPlan, preferences))
      const whatsappURL = `https://wa.me/${phoneNumber}?text=${message}`
      window.open(whatsappURL, '_blank')
    } else {
      alert(`❌ Error: ${error.message}`)
    }
    return false
  }
}
