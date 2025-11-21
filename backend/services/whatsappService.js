import axios from 'axios'

// Format meal plan as text message
function formatMealPlanText(mealPlan, preferences) {
  const meals = [
    { key: 'breakfast', title: 'BREAKFAST', icon: '☀️' },
    { key: 'mid-morning', title: 'MID-MORNING', icon: '🥤' },
    { key: 'lunch', title: 'LUNCH', icon: '🍽️' },
    { key: 'evening-snack', title: 'EVENING', icon: '☕' },
    { key: 'dinner', title: 'DINNER', icon: '🌙' },
    { key: 'before-bed', title: 'BEFORE BED', icon: '🌟' }
  ]

  let text = `*🏋️ MINAKSHI FITNESS CLUB*\n`
  text += `_Your AI Meal Plan_\n\n`
  
  text += `📊 *Plan Details*\n`
  text += `• Calories: ${preferences.calories}\n`
  text += `• Diet: ${preferences.dietType.toUpperCase()}\n`
  if (preferences.allergies) {
    text += `• Allergies: ${preferences.allergies}\n`
  }
  if (preferences.variation > 0) {
    text += `• Variation #${preferences.variation}\n`
  }
  text += `\n${'─'.repeat(30)}\n\n`

  meals.forEach((meal) => {
    const items = mealPlan[meal.key]
    if (!items || items.length === 0) return

    text += `*${meal.icon} ${meal.title}*\n`
    items.forEach((item) => {
      text += `• ${item}\n`
    })
    text += `\n`
  })

  text += `${'─'.repeat(30)}\n\n`
  text += `📍 Orai Road, Rath, UP\n`
  text += `📞 +91 6306019048\n`
  text += `✉️ umarroyal.rath@gmail.com\n\n`
  text += `_Transform Your Body • Elevate Your Life_`

  return text
}

// WhatsApp Business API (Official)
async function sendViaWhatsAppBusinessAPI(phoneNumber, message) {
  const url = `https://graph.facebook.com/v18.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`
  
  const data = {
    messaging_product: 'whatsapp',
    to: phoneNumber,
    type: 'text',
    text: { body: message }
  }

  const response = await axios.post(url, data, {
    headers: {
      'Authorization': `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
      'Content-Type': 'application/json'
    }
  })

  return response.data
}

// Twilio WhatsApp API (Alternative - Easier Setup)
async function sendViaTwilio(phoneNumber, message) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID
  const authToken = process.env.TWILIO_AUTH_TOKEN
  const fromNumber = process.env.TWILIO_WHATSAPP_NUMBER
  
  const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`
  
  const params = new URLSearchParams()
  params.append('From', fromNumber)
  params.append('To', `whatsapp:+${phoneNumber}`)
  params.append('Body', message)

  const response = await axios.post(url, params, {
    auth: {
      username: accountSid,
      password: authToken
    },
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  })

  return response.data
}

// Main WhatsApp send function
export async function sendWhatsAppMessage(phoneNumber, mealPlan, preferences) {
  try {
    const message = formatMealPlanText(mealPlan, preferences)
    let result

    // Try WhatsApp Business API first, fallback to Twilio
    if (process.env.WHATSAPP_ACCESS_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID) {
      console.log('Sending via WhatsApp Business API...')
      result = await sendViaWhatsAppBusinessAPI(phoneNumber, message)
    } else if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
      console.log('Sending via Twilio WhatsApp...')
      result = await sendViaTwilio(phoneNumber, message)
    } else {
      throw new Error('No WhatsApp service configured. Please set up WhatsApp Business API or Twilio credentials.')
    }

    console.log('WhatsApp message sent successfully:', result)
    
    return {
      success: true,
      messageId: result.messages?.[0]?.id || result.sid || 'unknown'
    }
  } catch (error) {
    console.error('WhatsApp service error:', error.response?.data || error.message)
    throw new Error(`Failed to send WhatsApp message: ${error.response?.data?.error?.message || error.message}`)
  }
}
