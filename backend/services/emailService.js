import nodemailer from 'nodemailer'

// Format meal plan as HTML email
function formatMealPlanHTML(mealPlan, preferences) {
  const meals = [
    { key: 'breakfast', title: 'BREAKFAST', icon: '☀️' },
    { key: 'mid-morning', title: 'MID-MORNING SNACK', icon: '🥤' },
    { key: 'lunch', title: 'LUNCH', icon: '🍽️' },
    { key: 'evening-snack', title: 'EVENING SNACK', icon: '☕' },
    { key: 'dinner', title: 'DINNER', icon: '🌙' },
    { key: 'before-bed', title: 'BEFORE BED', icon: '🌟' }
  ]

  let html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; }
        .header { background: #c11325; color: white; padding: 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; }
        .header p { margin: 10px 0 0 0; font-size: 14px; }
        .plan-details { background: #f9fafb; padding: 20px; margin: 20px 0; border-radius: 8px; }
        .plan-details h3 { margin-top: 0; color: #c11325; }
        .meal-section { margin: 20px 0; padding: 15px; background: white; border-left: 4px solid #c11325; }
        .meal-title { color: #c11325; font-size: 18px; font-weight: bold; margin-bottom: 10px; }
        .meal-items { list-style: none; padding: 0; }
        .meal-items li { padding: 5px 0; padding-left: 20px; position: relative; }
        .meal-items li:before { content: "•"; color: #c11325; font-weight: bold; position: absolute; left: 0; }
        .footer { background: #1f2937; color: white; padding: 20px; text-align: center; margin-top: 30px; }
        .footer p { margin: 5px 0; font-size: 14px; }
        .footer .tagline { font-style: italic; color: #9ca3af; margin-top: 10px; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>🏋️ MINAKSHI FITNESS CLUB</h1>
        <p>Your Personalized AI Meal Plan</p>
      </div>
      
      <div class="plan-details">
        <h3>📊 Plan Details</h3>
        <p><strong>Calories:</strong> ${preferences.calories}</p>
        <p><strong>Diet Type:</strong> ${preferences.dietType.toUpperCase()}</p>
        ${preferences.allergies ? `<p><strong>Allergies:</strong> ${preferences.allergies}</p>` : ''}
        <p><strong>Generated:</strong> ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
        ${preferences.variation > 0 ? `<p><strong>Variation:</strong> #${preferences.variation}</p>` : ''}
      </div>
  `

  meals.forEach((meal) => {
    const items = mealPlan[meal.key]
    if (!items || items.length === 0) return

    html += `
      <div class="meal-section">
        <div class="meal-title">${meal.icon} ${meal.title}</div>
        <ul class="meal-items">
          ${items.map(item => `<li>${item}</li>`).join('')}
        </ul>
      </div>
    `
  })

  html += `
      <div class="footer">
        <p>📍 Orai Road Near Naher Bypass, Rath, UP</p>
        <p>📞 +91 6306019048 | ✉️ umarroyal.rath@gmail.com</p>
        <p class="tagline">Transform Your Body • Elevate Your Life</p>
      </div>
    </body>
    </html>
  `

  return html
}

// Create email transporter
function createTransporter() {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD
    }
  })
}

// Send email function
export async function sendEmail(clientEmail, mealPlan, preferences) {
  try {
    const transporter = createTransporter()

    const mailOptions = {
      from: `Minakshi Fitness Club <${process.env.GMAIL_USER}>`,
      to: clientEmail,
      subject: 'Your Personalized Meal Plan - Minakshi Fitness Club',
      html: formatMealPlanHTML(mealPlan, preferences),
      text: formatMealPlanText(mealPlan, preferences) // Plain text fallback
    }

    const info = await transporter.sendMail(mailOptions)
    console.log('Email sent successfully:', info.messageId)
    
    return {
      success: true,
      messageId: info.messageId
    }
  } catch (error) {
    console.error('Email service error:', error)
    throw new Error(`Failed to send email: ${error.message}`)
  }
}

// Format as plain text (for fallback)
function formatMealPlanText(mealPlan, preferences) {
  const meals = [
    { key: 'breakfast', title: 'BREAKFAST' },
    { key: 'mid-morning', title: 'MID-MORNING SNACK' },
    { key: 'lunch', title: 'LUNCH' },
    { key: 'evening-snack', title: 'EVENING SNACK' },
    { key: 'dinner', title: 'DINNER' },
    { key: 'before-bed', title: 'BEFORE BED' }
  ]

  let text = `MINAKSHI FITNESS CLUB - AI Meal Plan\n\n`
  text += `Plan Details:\n`
  text += `Calories: ${preferences.calories}\n`
  text += `Diet Type: ${preferences.dietType.toUpperCase()}\n`
  if (preferences.allergies) {
    text += `Allergies: ${preferences.allergies}\n`
  }
  text += `Generated: ${new Date().toLocaleDateString('en-IN')}\n\n`
  
  if (preferences.variation > 0) {
    text += `Variation #${preferences.variation}\n\n`
  }

  text += `${'='.repeat(40)}\n\n`

  meals.forEach((meal) => {
    const items = mealPlan[meal.key]
    if (!items || items.length === 0) return

    text += `${meal.title}\n`
    text += `${'-'.repeat(meal.title.length)}\n`
    items.forEach((item) => {
      text += `• ${item}\n`
    })
    text += `\n`
  })

  text += `${'='.repeat(40)}\n\n`
  text += `Orai Road Near Naher Bypass, Rath, UP\n`
  text += `+91 6306019048\n`
  text += `umarroyal.rath@gmail.com\n\n`
  text += `Transform Your Body • Elevate Your Life`

  return text
}

// Format workout plan as HTML email
function formatWorkoutPlanHTML(workoutPlan, preferences) {
  let html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; }
        .header { background: linear-gradient(135deg, #c11325 0%, #e91e63 100%); color: white; padding: 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; }
        .header p { margin: 10px 0 0 0; font-size: 14px; }
        .plan-details { background: #f9fafb; padding: 20px; margin: 20px 0; border-radius: 8px; }
        .plan-details h3 { margin-top: 0; color: #c11325; }
        .workout-content { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; white-space: pre-wrap; }
        .day-header { background: linear-gradient(135deg, #c11325 0%, #e91e63 100%); color: white; padding: 12px; margin: 15px 0; border-radius: 8px; font-size: 18px; font-weight: bold; }
        .section-header { color: #667eea; font-size: 16px; font-weight: bold; margin: 12px 0; }
        .exercise-item { padding: 8px 0 8px 25px; position: relative; }
        .exercise-item:before { content: "●"; color: #c11325; position: absolute; left: 5px; font-weight: bold; }
        .footer { background: #1f2937; color: white; padding: 20px; text-align: center; margin-top: 30px; }
        .footer p { margin: 5px 0; font-size: 14px; }
        .footer .tagline { font-style: italic; color: #9ca3af; margin-top: 10px; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>💪 MINAKSHI FITNESS CLUB</h1>
        <p>Your Personalized AI Workout Plan</p>
      </div>
      
      <div class="plan-details">
        <h3>🎯 Plan Details</h3>
        <p><strong>Goal:</strong> ${preferences.goal}</p>
        <p><strong>Fitness Level:</strong> ${preferences.level}</p>
        <p><strong>Days per Week:</strong> ${preferences.days}</p>
        <p><strong>Duration:</strong> ${preferences.duration} minutes</p>
        <p><strong>Equipment:</strong> ${preferences.equipment}</p>
        <p><strong>Generated:</strong> ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
      </div>

      <div class="workout-content">
        ${formatWorkoutContentHTML(workoutPlan)}
      </div>
      
      <div class="footer">
        <p>📍 Orai Road Near Naher Bypass, Rath, UP</p>
        <p>📞 +91 6306019048 | ✉️ umarroyal.rath@gmail.com</p>
        <p class="tagline">Transform Your Body • Elevate Your Life</p>
      </div>
    </body>
    </html>
  `

  return html
}

function formatWorkoutContentHTML(workoutPlan) {
  const lines = workoutPlan.split('\n')
  let html = ''
  
  lines.forEach(line => {
    const trimmedLine = line.trim()
    if (!trimmedLine) {
      html += '<br>'
      return
    }
    
    // Day headers
    if (trimmedLine.match(/^DAY\s+\d+/i)) {
      html += `<div class="day-header">${trimmedLine}</div>`
    }
    // Section headers
    else if (trimmedLine.match(/^(warm-?up|cool-?down|exercise|rest day)/i)) {
      html += `<div class="section-header">${trimmedLine}</div>`
    }
    // Bullet points
    else if (trimmedLine.match(/^[-•*]/)) {
      html += `<div class="exercise-item">${trimmedLine.replace(/^[-•*]\s*/, '')}</div>`
    }
    // Regular text
    else {
      html += `<p>${trimmedLine}</p>`
    }
  })
  
  return html
}

// Send workout plan email
export async function sendWorkoutEmail(clientEmail, workoutPlan, preferences) {
  try {
    const transporter = createTransporter()

    const mailOptions = {
      from: `Minakshi Fitness Club <${process.env.GMAIL_USER}>`,
      to: clientEmail,
      subject: 'Your Personalized Workout Plan - Minakshi Fitness Club',
      html: formatWorkoutPlanHTML(workoutPlan, preferences),
      text: `MINAKSHI FITNESS CLUB - AI Workout Plan\n\n${workoutPlan}\n\n---\nOrai Road Near Naher Bypass, Rath, UP\n+91 6306019048\numarroyal.rath@gmail.com`
    }

    const info = await transporter.sendMail(mailOptions)
    console.log('Workout email sent successfully:', info.messageId)
    
    return {
      success: true,
      messageId: info.messageId
    }
  } catch (error) {
    console.error('Email service error:', error)
    throw new Error(`Failed to send email: ${error.message}`)
  }
}
