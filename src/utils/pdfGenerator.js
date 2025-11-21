import jsPDF from 'jspdf'

export function generateMealPlanPDF(mealPlan, preferences) {
  const doc = new jsPDF()
  
  // Color scheme matching index page
  const primaryColor = [220, 38, 38] // Red color from your design
  const secondaryColor = [17, 24, 39] // Dark gray
  const accentColor = [249, 115, 22] // Orange accent
  const lightBg = [249, 250, 251]
  
  let yPosition = 20
  const pageWidth = doc.internal.pageSize.width
  const pageHeight = doc.internal.pageSize.height
  const margin = 20
  const contentWidth = pageWidth - (2 * margin)
  
  // Header Background - Red gradient effect
  doc.setFillColor(220, 38, 38)
  doc.rect(0, 0, pageWidth, 50, 'F')
  
  // Gym Logo/Title
  doc.setFontSize(28)
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.text('MINAKSHI FITNESS CLUB', pageWidth / 2, 25, { align: 'center' })
  
  doc.setFontSize(14)
  doc.setFont('helvetica', 'normal')
  doc.text('AI-Powered Meal Plan', pageWidth / 2, 38, { align: 'center' })
  
  // Decorative line
  doc.setDrawColor(255, 255, 255)
  doc.setLineWidth(0.5)
  doc.line(60, 42, pageWidth - 60, 42)
  
  yPosition = 60
  
  // Plan Details Box
  doc.setFillColor(249, 250, 251)
  doc.rect(margin, yPosition, contentWidth, 30, 'F')
  
  doc.setTextColor(17, 24, 39)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  
  // Plan info in a clean layout
  const detailsY = yPosition + 10
  doc.text(`Calories: ${preferences.calories}`, margin + 10, detailsY)
  doc.text(`Diet Type: ${preferences.dietType.toUpperCase()}`, margin + 10, detailsY + 8)
  
  if (preferences.allergies) {
    doc.text(`Allergies: ${preferences.allergies}`, margin + 10, detailsY + 16)
  }
  
  // Date and variation info
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(107, 114, 128)
  const dateStr = new Date().toLocaleDateString('en-IN', { 
    day: 'numeric', 
    month: 'short', 
    year: 'numeric' 
  })
  doc.text(`Generated: ${dateStr}`, pageWidth - margin - 10, detailsY, { align: 'right' })
  
  if (preferences.variation > 0) {
    doc.text(`Variation #${preferences.variation}`, pageWidth - margin - 10, detailsY + 8, { align: 'right' })
  }
  
  yPosition += 40
  
  // Meal sections
  const meals = [
    { key: 'breakfast', title: 'BREAKFAST', icon: '[1]' },
    { key: 'mid-morning', title: 'MID-MORNING SNACK', icon: '[2]' },
    { key: 'lunch', title: 'LUNCH', icon: '[3]' },
    { key: 'evening-snack', title: 'EVENING SNACK', icon: '[4]' },
    { key: 'dinner', title: 'DINNER', icon: '[5]' },
    { key: 'before-bed', title: 'BEFORE BED', icon: '[6]' }
  ]
  
  meals.forEach((meal, index) => {
    const items = mealPlan[meal.key]
    if (!items || items.length === 0) return
    
    // Check if we need a new page
    if (yPosition > pageHeight - 60) {
      doc.addPage()
      yPosition = 20
    }
    
    // Meal header with icon and background
    doc.setFillColor(220, 38, 38)
    doc.rect(margin, yPosition, contentWidth, 12, 'F')
    
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(255, 255, 255)
    doc.text(`${meal.icon} ${meal.title}`, margin + 5, yPosition + 8)
    
    yPosition += 18
    
    // Meal items
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(31, 41, 55)
    
    items.forEach((item, idx) => {
      // Check page break
      if (yPosition > pageHeight - 20) {
        doc.addPage()
        yPosition = 20
      }
      
      // Bullet point
      doc.setFillColor(220, 38, 38)
      doc.circle(margin + 3, yPosition - 1.5, 1.5, 'F')
      
      // Wrap text if too long
      const lines = doc.splitTextToSize(item, contentWidth - 15)
      doc.text(lines, margin + 10, yPosition)
      yPosition += lines.length * 5
    })
    
    yPosition += 5
  })
  
  // Footer section
  if (yPosition > pageHeight - 50) {
    doc.addPage()
    yPosition = 20
  }
  
  yPosition = pageHeight - 40
  
  // Footer box
  doc.setFillColor(17, 24, 39)
  doc.rect(0, yPosition, pageWidth, 40, 'F')
  
  yPosition += 12
  
  // Contact info
  doc.setFontSize(9)
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'normal')
  doc.text('Location: Orai Road Near Naher Bypass, Rath, UP', pageWidth / 2, yPosition, { align: 'center' })
  
  yPosition += 6
  doc.text('Phone: +91 6306019048  |  Email: umarroyal.rath@gmail.com', pageWidth / 2, yPosition, { align: 'center' })
  
  yPosition += 8
  doc.setFont('helvetica', 'italic')
  doc.setFontSize(8)
  doc.setTextColor(156, 163, 175)
  doc.text('Transform Your Body • Elevate Your Life', pageWidth / 2, yPosition, { align: 'center' })
  
  // Add page numbers on all pages
  const pageCount = doc.internal.pages.length - 1
  doc.setFontSize(8)
  doc.setTextColor(107, 114, 128)
  
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.text(`Page ${i} of ${pageCount}`, pageWidth / 2, pageHeight - 10, { align: 'center' })
  }
  
  // Save the PDF
  const fileName = `Minakshi_Fitness_Meal_Plan_${preferences.dietType}_${dateStr.replace(/\s/g, '_')}.pdf`
  doc.save(fileName)
}

export function generateWorkoutPlanPDF(workoutPlan, preferences) {
  const doc = new jsPDF()
  
  const primaryColor = [220, 38, 38]
  const secondaryColor = [17, 24, 39]
  const accentColor = [249, 115, 22]
  const lightBg = [249, 250, 251]
  
  let yPosition = 20
  const pageWidth = doc.internal.pageSize.width
  const pageHeight = doc.internal.pageSize.height
  const margin = 20
  const contentWidth = pageWidth - (2 * margin)
  
  // Header Background
  doc.setFillColor(220, 38, 38)
  doc.rect(0, 0, pageWidth, 50, 'F')
  
  // Title
  doc.setFontSize(28)
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.text('MINAKSHI FITNESS CLUB', pageWidth / 2, 25, { align: 'center' })
  
  doc.setFontSize(14)
  doc.setFont('helvetica', 'normal')
  doc.text('AI-Powered Workout Plan', pageWidth / 2, 38, { align: 'center' })
  
  doc.setDrawColor(255, 255, 255)
  doc.setLineWidth(0.5)
  doc.line(60, 42, pageWidth - 60, 42)
  
  yPosition = 60
  
  // Plan Details Box
  doc.setFillColor(249, 250, 251)
  doc.rect(margin, yPosition, contentWidth, 35, 'F')
  
  doc.setTextColor(17, 24, 39)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  
  const detailsY = yPosition + 10
  doc.text(`Goal: ${preferences.goal.replace('-', ' ').toUpperCase()}`, margin + 10, detailsY)
  doc.text(`Level: ${preferences.level.toUpperCase()}`, margin + 10, detailsY + 8)
  doc.text(`Frequency: ${preferences.days} days/week`, margin + 10, detailsY + 16)
  doc.text(`Duration: ${preferences.duration} minutes`, margin + 10, detailsY + 24)
  
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(107, 114, 128)
  const dateStr = new Date().toLocaleDateString('en-IN', { 
    day: 'numeric', 
    month: 'short', 
    year: 'numeric' 
  })
  doc.text(`Generated: ${dateStr}`, pageWidth - margin - 10, detailsY, { align: 'right' })
  doc.text(`Equipment: ${preferences.equipment}`, pageWidth - margin - 10, detailsY + 8, { align: 'right' })
  
  yPosition += 45
  
  // Parse workout plan
  const lines = workoutPlan.split('\n')
  
  lines.forEach((line) => {
    if (yPosition > pageHeight - 30) {
      doc.addPage()
      yPosition = 20
    }
    
    const trimmedLine = line.trim()
    if (!trimmedLine) {
      yPosition += 3
      return
    }
    
    // Day headers (DAY 1, DAY 2, etc.)
    if (trimmedLine.match(/^DAY\s+\d+/i)) {
      if (yPosition > 60) yPosition += 5
      
      doc.setFillColor(220, 38, 38)
      doc.rect(margin, yPosition, contentWidth, 12, 'F')
      
      doc.setFontSize(13)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(255, 255, 255)
      doc.text(trimmedLine.toUpperCase(), margin + 5, yPosition + 8)
      yPosition += 18
    }
    // Section headers (Warm-up, Cool-down, Exercise, etc.)
    else if (trimmedLine.match(/^(warm-?up|cool-?down|exercise|rest day)/i)) {
      doc.setFillColor(249, 115, 22)
      doc.rect(margin, yPosition, contentWidth, 10, 'F')
      
      doc.setFontSize(11)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(255, 255, 255)
      doc.text(trimmedLine, margin + 5, yPosition + 7)
      yPosition += 14
    }
    // Bullet points or exercise details
    else if (trimmedLine.match(/^[-•*]/)) {
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(31, 41, 55)
      
      doc.setFillColor(220, 38, 38)
      doc.circle(margin + 3, yPosition - 1.5, 1.5, 'F')
      
      const text = trimmedLine.replace(/^[-•*]\s*/, '')
      const lines = doc.splitTextToSize(text, contentWidth - 15)
      doc.text(lines, margin + 10, yPosition)
      yPosition += lines.length * 5 + 2
    }
    // Regular text
    else {
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(55, 65, 81)
      
      const lines = doc.splitTextToSize(trimmedLine, contentWidth - 10)
      doc.text(lines, margin + 5, yPosition)
      yPosition += lines.length * 5 + 1
    }
  })
  
  // Footer
  const footerY = pageHeight - 40
  doc.setFillColor(17, 24, 39)
  doc.rect(0, footerY, pageWidth, 40, 'F')
  
  doc.setFontSize(9)
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'normal')
  doc.text('Location: Orai Road Near Naher Bypass, Rath, UP', pageWidth / 2, footerY + 12, { align: 'center' })
  doc.text('Phone: +91 6306019048  |  Email: umarroyal.rath@gmail.com', pageWidth / 2, footerY + 18, { align: 'center' })
  
  doc.setFont('helvetica', 'italic')
  doc.setFontSize(8)
  doc.setTextColor(156, 163, 175)
  doc.text('Transform Your Body • Elevate Your Life', pageWidth / 2, footerY + 26, { align: 'center' })
  
  // Page numbers
  const pageCount = doc.internal.pages.length - 1
  doc.setFontSize(8)
  doc.setTextColor(107, 114, 128)
  
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.text(`Page ${i} of ${pageCount}`, pageWidth / 2, pageHeight - 10, { align: 'center' })
  }
  
  const fileName = `Minakshi_Fitness_Workout_${preferences.goal}_${dateStr.replace(/\s/g, '_')}.pdf`
  doc.save(fileName)
}

export function downloadMealPlanPDF(generatedMeals, mealPreferences) {
  try {
    if (!generatedMeals) {
      console.error('No meal plan data to generate PDF')
      alert('No meal plan data available. Please generate a meal plan first.')
      return false
    }
    
    if (!mealPreferences) {
      console.error('No meal preferences data')
      alert('Missing meal preferences data.')
      return false
    }
    
    console.log('Generating PDF with data:', { generatedMeals, mealPreferences })
    generateMealPlanPDF(generatedMeals, mealPreferences)
    console.log('PDF generated successfully')
    return true
  } catch (error) {
    console.error('Error generating PDF:', error)
    alert(`Error generating PDF: ${error.message}`)
    return false
  }
}

export function downloadWorkoutPlanPDF(workoutPlan, preferences) {
  try {
    if (!workoutPlan) {
      console.error('No workout plan data')
      alert('No workout plan data available. Please generate a workout plan first.')
      return false
    }
    
    if (!preferences) {
      console.error('No preferences data')
      alert('Missing preferences data.')
      return false
    }
    
    console.log('Generating workout PDF...')
    generateWorkoutPlanPDF(workoutPlan, preferences)
    console.log('Workout PDF generated successfully')
    return true
  } catch (error) {
    console.error('Error generating workout PDF:', error)
    alert(`Error generating PDF: ${error.message}`)
    return false
  }
}
