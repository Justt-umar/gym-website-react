import { GoogleGenerativeAI } from '@google/generative-ai'

// API Configuration and Helper Functions

const API_CONFIG = {
  // Set this to your Google Gemini API key
  // IMPORTANT: In production, use environment variables and a backend server
  GEMINI_API_KEY: import.meta.env.VITE_GEMINI_API_KEY || '',
  
  // Alternative: Use a backend proxy endpoint
  PROXY_ENDPOINT: import.meta.env.VITE_API_PROXY || ''
}

/**
 * Call Google Gemini API for intelligent chatbot responses
 * @param {string} userMessage - User's question
 * @param {Array} chatHistory - Previous conversation history
 * @returns {Promise<string>} AI response
 */
export async function getAIChatResponse(userMessage, chatHistory = []) {
  // If using backend proxy (recommended for production)
  if (API_CONFIG.PROXY_ENDPOINT) {
    try {
      const response = await fetch(`${API_CONFIG.PROXY_ENDPOINT}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: userMessage,
          history: chatHistory
        })
      })
      
      const data = await response.json()
      return data.response
    } catch (error) {
      console.error('Proxy API error:', error)
      return getFallbackResponse(userMessage)
    }
  }
  
  // If using direct Gemini API (not recommended for production - exposes API key)
  if (API_CONFIG.GEMINI_API_KEY) {
    try {
      const genAI = new GoogleGenerativeAI(API_CONFIG.GEMINI_API_KEY)
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

      const systemPrompt = `You are an expert certified fitness trainer and nutritionist at Minakshi Fitness Club in Rath, India. 
      
      IMPORTANT LANGUAGE INSTRUCTIONS:
      - You can communicate in English, Hindi, and Hinglish (mix of Hindi-English)
      - Detect the user's language from their question and respond in the SAME language
      - If user asks in Hindi, reply in Hindi (Devanagari script)
      - If user asks in Hinglish (Hindi words in Roman script like "mujhe protein kitna chahiye"), reply in Hinglish
      - If user asks in English, reply in English
      - Be natural and conversational in the chosen language
      
      You provide professional, accurate, and motivating fitness advice. 
      Keep responses concise (3-5 sentences) but informative and helpful.
      Focus on: workout routines, exercise form, nutrition, supplements, weight loss, muscle gain, and recovery.
      Always prioritize safety and recommend consulting professionals for medical issues.
      Be friendly, motivational, and encouraging like a personal trainer.`

      // Build conversation with chat history
      const messages = [
        { role: 'user', parts: [{ text: systemPrompt }] }
      ]
      
      // Add chat history
      chatHistory.forEach(msg => {
        messages.push({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.content }]
        })
      })
      
      // Add current message
      messages.push({
        role: 'user',
        parts: [{ text: userMessage }]
      })

      const chat = model.startChat({
        history: messages.slice(0, -1),
        generationConfig: {
          maxOutputTokens: 500,
          temperature: 0.7,
        }
      })

      const result = await chat.sendMessage(userMessage)
      const response = await result.response
      return response.text()
    } catch (error) {
      console.error('Gemini API error:', error)
      return getFallbackResponse(userMessage)
    }
  }
  
  // Fallback to rule-based responses if no API configured
  return getFallbackResponse(userMessage)
}

/**
 * Fallback response system (rule-based) - Supports English, Hindi, and Hinglish
 */
function getFallbackResponse(question) {
  const lowerQ = question.toLowerCase()
  
  // Detect language
  const isHindi = /[\u0900-\u097F]/.test(question) // Devanagari script
  const isHinglish = /\b(mujhe|kaise|kitna|chahiye|karna|kya|hai|ke|liye|aur|ko|ka|ki|muscle|protein|gym|workout)\b/i.test(question)
  
  const responses = {
    protein: {
      english: "For muscle building, aim for 1.6-2.2g of protein per kg of body weight daily. Good sources include chicken, fish, eggs, Greek yogurt, and legumes. Distribute protein evenly across 4-5 meals for optimal muscle protein synthesis.",
      hindi: "मांसपेशी बनाने के लिए, प्रतिदिन 1.6-2.2 ग्राम प्रोटीन प्रति किलो शरीर के वजन का लक्ष्य रखें। अच्छे स्रोतों में चिकन, मछली, अंडे, ग्रीक दही और दालें शामिल हैं। प्रोटीन को दिन में 4-5 भोजन में समान रूप से बांटें।",
      hinglish: "Muscle building ke liye, daily 1.6-2.2g protein per kg body weight chahiye. Ache sources hai chicken, fish, eggs, Greek yogurt aur dal. Protein ko 4-5 meals mein equally distribute karo for best results."
    },
    
    weight_loss: {
      english: "For effective weight loss: 1) Create a 500-calorie deficit daily, 2) Combine strength training with cardio, 3) Prioritize protein (30% of calories) to preserve muscle, 4) Stay hydrated with 3-4L water daily, 5) Get 7-9 hours of sleep. Aim for 0.5-1kg loss per week for sustainable results.",
      hindi: "प्रभावी वजन घटाने के लिए: 1) दैनिक 500 कैलोरी की कमी बनाएं, 2) वेट ट्रेनिंग के साथ कार्डियो करें, 3) मांसपेशियों को बचाने के लिए प्रोटीन को प्राथमिकता दें (30% कैलोरी), 4) दैनिक 3-4 लीटर पानी पिएं, 5) 7-9 घंटे की नींद लें। स्थायी परिणामों के लिए प्रति सप्ताह 0.5-1 किलो वजन घटाने का लक्ष्य रखें।",
      hinglish: "Weight loss ke liye: 1) Daily 500 calorie deficit banao, 2) Weight training aur cardio combine karo, 3) Muscle preserve karne ke liye protein priority do (30% calories), 4) Daily 3-4L pani piyo, 5) 7-9 hours sleep lo. Sustainable results ke liye weekly 0.5-1kg loss target karo."
    },
    
    muscle_gain: {
      english: "To build muscle effectively: 1) Progressive overload - increase weight/reps weekly, 2) Caloric surplus of 300-500 calories daily, 3) 1.6-2.2g protein per kg bodyweight, 4) Focus on compound exercises (squats, deadlifts, bench press, rows), 5) 7-9 hours quality sleep for recovery.",
      hindi: "मांसपेशी बनाने के लिए: 1) प्रगतिशील अधिभार - साप्ताहिक वजन/दोहराव बढ़ाएं, 2) दैनिक 300-500 कैलोरी अधिक लें, 3) 1.6-2.2 ग्राम प्रोटीन प्रति किलो शरीर का वजन, 4) कंपाउंड व्यायामों पर ध्यान दें (स्क्वाट, डेडलिफ्ट, बेंच प्रेस), 5) रिकवरी के लिए 7-9 घंटे की गुणवत्तापूर्ण नींद।",
      hinglish: "Muscle banane ke liye: 1) Progressive overload - weekly weight/reps badhao, 2) Daily 300-500 calories surplus lo, 3) 1.6-2.2g protein per kg body weight, 4) Compound exercises pe focus karo (squats, deadlifts, bench press, rows), 5) Recovery ke liye 7-9 hours quality sleep lo."
    },
    
    workout: {
      english: "A balanced routine includes: 3-5 days of strength training, 2-3 days of cardio (HIIT or steady-state), flexibility work daily, and 1-2 rest days weekly. Focus on progressive overload, proper form over heavy weight, and listen to your body for recovery needs.",
      hindi: "संतुलित दिनचर्या में शामिल हैं: सप्ताह में 3-5 दिन स्ट्रेंथ ट्रेनिंग, 2-3 दिन कार्डियो (HIIT या स्थिर), दैनिक लचीलापन व्यायाम, और सप्ताह में 1-2 आराम के दिन। प्रगतिशील अधिभार, भारी वजन से अधिक उचित फॉर्म पर ध्यान दें, और रिकवरी के लिए अपने शरीर को सुनें।",
      hinglish: "Balanced routine mein chahiye: 3-5 days strength training, 2-3 days cardio (HIIT ya steady-state), daily flexibility work, aur weekly 1-2 rest days. Progressive overload pe focus karo, heavy weight se zyada proper form important hai, aur recovery ke liye apne body ko suno."
    },
    
    diet: {
      english: "A balanced diet for fitness should include: lean proteins (chicken, fish, eggs), complex carbs (brown rice, sweet potato, oats), healthy fats (avocado, nuts, olive oil), and plenty of vegetables. Aim for 4-6 meals spread throughout the day to maintain energy and support your training.",
      hindi: "फिटनेस के लिए संतुलित आहार में शामिल होना चाहिए: लीन प्रोटीन (चिकन, मछली, अंडे), कॉम्प्लेक्स कार्ब्स (ब्राउन राइस, शकरकंद, ओट्स), स्वस्थ वसा (एवोकाडो, नट्स, ऑलिव ऑयल), और भरपूर सब्जियां। ऊर्जा बनाए रखने और प्रशिक्षण का समर्थन करने के लिए दिन भर में 4-6 भोजन का लक्ष्य रखें।",
      hinglish: "Fitness ke liye balanced diet mein hona chahiye: lean proteins (chicken, fish, eggs), complex carbs (brown rice, sweet potato, oats), healthy fats (avocado, nuts, olive oil), aur bahut saari vegetables. Energy maintain karne aur training support karne ke liye din mein 4-6 meals lo."
    },
    
    cardio: {
      english: "Both cardio and weights are important! For weight loss: do weights first to preserve muscle, then cardio. For endurance: cardio first. Generally, strength training 3-4x/week plus 2-3 cardio sessions works well. HIIT (20-30min) is great for fat loss while preserving muscle.",
      hindi: "कार्डियो और वेट दोनों महत्वपूर्ण हैं! वजन घटाने के लिए: मांसपेशियों को बचाने के लिए पहले वेट करें, फिर कार्डियो। सहनशक्ति के लिए: पहले कार्डियो। आमतौर पर, सप्ताह में 3-4 बार स्ट्रेंथ ट्रेनिंग और 2-3 कार्डियो सत्र अच्छी तरह से काम करते हैं। HIIT (20-30 मिनट) मांसपेशियों को बचाते हुए वसा हानि के लिए बेहतरीन है।",
      hinglish: "Cardio aur weights dono important hai! Weight loss ke liye: pehle weights karo muscle preserve karne ke liye, phir cardio. Endurance ke liye: cardio pehle. Generally, 3-4x/week strength training plus 2-3 cardio sessions achha hai. HIIT (20-30min) fat loss ke liye best hai jab muscle preserve karna ho."
    },
    
    supplements: {
      english: "Essential supplements for most people: 1) Protein powder (whey or plant-based) for convenience, 2) Creatine monohydrate (5g daily) for strength and muscle, 3) Vitamin D3 if you lack sun exposure, 4) Omega-3 fish oil for inflammation. Food first, supplements second!",
      hindi: "अधिकांश लोगों के लिए आवश्यक सप्लीमेंट्स: 1) सुविधा के लिए प्रोटीन पाउडर (व्हे या प्लांट-बेस्ड), 2) शक्ति और मांसपेशियों के लिए क्रिएटिन मोनोहाइड्रेट (5 ग्राम दैनिक), 3) यदि धूप की कमी हो तो विटामिन D3, 4) सूजन के लिए ओमेगा-3 फिश ऑयल। पहले भोजन, फिर सप्लीमेंट्स!",
      hinglish: "Most people ke liye essential supplements: 1) Convenience ke liye protein powder (whey ya plant-based), 2) Strength aur muscle ke liye creatine monohydrate (5g daily), 3) Agar sun exposure kam ho to Vitamin D3, 4) Inflammation ke liye omega-3 fish oil. Pehle food, phir supplements!"
    },
    
    beginner: {
      english: "Welcome to your fitness journey! Start with: 1) Full-body workouts 3x/week (compound exercises), 2) Light weights focusing on form, 3) 20-30min cardio 2-3x/week, 4) Track your food to understand portions, 5) Consistency over intensity. Progress will come - be patient and enjoy the process!",
      hindi: "आपकी फिटनेस यात्रा में आपका स्वागत है! शुरुआत करें: 1) सप्ताह में 3 बार पूर्ण शरीर व्यायाम (कंपाउंड एक्सरसाइज), 2) फॉर्म पर ध्यान देते हुए हल्के वजन, 3) सप्ताह में 2-3 बार 20-30 मिनट कार्डियो, 4) भोजन को ट्रैक करें, 5) तीव्रता से अधिक निरंतरता। प्रगति आएगी - धैर्य रखें और प्रक्रिया का आनंद लें!",
      hinglish: "Aapki fitness journey mein welcome! Start karo: 1) Week mein 3x full-body workouts (compound exercises), 2) Form pe focus karte hue light weights, 3) 2-3x/week 20-30min cardio, 4) Food track karo portions samajhne ke liye, 5) Intensity se zyada consistency important hai. Progress aayegi - patient raho aur process enjoy karo!"
    },
    
    default: {
      english: "I'm your AI fitness assistant at Minakshi Fitness Club! I can help you with workout routines, nutrition advice, exercise form, supplements, weight loss/gain strategies, and recovery tips. Ask me specific questions about your fitness goals and I'll provide expert guidance!",
      hindi: "मैं मीनाक्षी फिटनेस क्लब में आपका AI फिटनेस सहायक हूं! मैं आपको व्यायाम दिनचर्या, पोषण सलाह, व्यायाम फॉर्म, सप्लीमेंट्स, वजन घटाने/बढ़ाने की रणनीतियों और रिकवरी टिप्स में मदद कर सकता हूं। अपने फिटनेस लक्ष्यों के बारे में मुझसे विशिष्ट प्रश्न पूछें और मैं विशेषज्ञ मार्गदर्शन प्रदान करूंगा!",
      hinglish: "Main Minakshi Fitness Club mein aapka AI fitness assistant hun! Main aapki help kar sakta hun workout routines, nutrition advice, exercise form, supplements, weight loss/gain strategies, aur recovery tips mein. Apne fitness goals ke bare mein mujhse specific questions pucho aur main expert guidance dunga!"
    }
  }
  
  // Determine which language to use for response
  const lang = isHindi ? 'hindi' : (isHinglish ? 'hinglish' : 'english')
  
  // Match question to response category
  if (lowerQ.includes('protein') || lowerQ.includes('प्रोटीन')) 
    return responses.protein[lang]
  if (lowerQ.includes('lose weight') || lowerQ.includes('fat loss') || lowerQ.includes('cutting') || 
      lowerQ.includes('वजन घटा') || lowerQ.includes('weight loss') || lowerQ.includes('वजन कम'))
    return responses.weight_loss[lang]
  if (lowerQ.includes('muscle') || lowerQ.includes('gain') || lowerQ.includes('bulk') || 
      lowerQ.includes('मांसपेशी') || lowerQ.includes('body banana'))
    return responses.muscle_gain[lang]
  if (lowerQ.includes('cardio') || lowerQ.includes('weights first') || lowerQ.includes('कार्डियो'))
    return responses.cardio[lang]
  if (lowerQ.includes('supplement') || lowerQ.includes('सप्लीमेंट'))
    return responses.supplements[lang]
  if (lowerQ.includes('workout') || lowerQ.includes('exercise') || lowerQ.includes('routine') || 
      lowerQ.includes('व्यायाम') || lowerQ.includes('कसरत'))
    return responses.workout[lang]
  if (lowerQ.includes('diet') || lowerQ.includes('meal') || lowerQ.includes('nutrition') || 
      lowerQ.includes('आहार') || lowerQ.includes('खाना'))
    return responses.diet[lang]
  if (lowerQ.includes('beginner') || lowerQ.includes('start') || lowerQ.includes('शुरुआत') || 
      lowerQ.includes('नया'))
    return responses.beginner[lang]
  
  return responses.default[lang]
}

/**
 * Generate AI meal plan based on preferences
 */
export async function generateAIMealPlan(preferences) {
  const { calories, dietType, allergies, variation, requestType } = preferences
  
  // This uses Gemini API for personalized Indian meal plans
  if (API_CONFIG.GEMINI_API_KEY) {
    try {
      const genAI = new GoogleGenerativeAI(API_CONFIG.GEMINI_API_KEY)
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

      // Different prompt based on request type
      let variationInstruction = ''
      if (requestType === 'variation') {
        variationInstruction = `
        IMPORTANT: This is VARIATION #${variation} of the meal plan.
        - Keep the SAME calorie target and diet type
        - Use DIFFERENT food items and dishes than typical plans
        - Try different combinations (e.g., if you used paneer before, use chole now)
        - Vary the breakfast items (dalia, poha, upma, paratha rotation)
        - Change curry types (rajma → chole → kadhi → different dals)
        - Use seasonal/regional variations
        - Make it interesting and diverse!
        `
      } else {
        variationInstruction = `
        Generate a fresh, balanced meal plan.
        Use common, everyday Indian foods that are easily accessible.
        `
      }

      const prompt = `Create a detailed ${calories}-calorie Indian ${dietType} meal plan for one day.
      This is for someone in India (Rath, UP), so use authentic Indian foods and cooking styles.
      Diet type: ${dietType}
      Dietary restrictions: ${allergies || 'none'}.
      
      ${variationInstruction}
      
      Provide meals for: Breakfast, Mid-Morning Snack, Lunch, Evening Snack, Dinner, and Before Bed.
      
      IMPORTANT Indian Food Guidelines:
      - Use Indian staples: roti, rice, dal, sabzi, curd, paneer
      - Include authentic Indian dishes like rajma, chole, aloo-gobi, palak paneer
      - For non-veg: chicken curry, chicken tikka, fish curry (no pork, halal options)
      - For eggetarian: include eggs in various Indian styles (boiled, bhurji, omelette)
      - Use Indian cooking methods: tadka, curry, sabzi, dal
      - Include Indian beverages: chai, lassi, nimbu pani, coconut water
      - Use desi ingredients: ghee, mustard oil, atta, besan, dalia
      - Mention portion sizes in Indian style (roti count, katori, glass, etc.)
      
      Format as JSON with meal names as keys and array of food items as values.
      Return ONLY the JSON object, no other text.
      
      Example format:
      {
        "breakfast": ["2 whole wheat roti with paneer bhurji", "1 glass milk", "1 banana"],
        "mid-morning": ["1 glass lassi", "Handful roasted chana"]
      }`

      const result = await model.generateContent(prompt)
      const response = await result.response
      const text = response.text()
      
      // Extract JSON from response (Gemini might include markdown code blocks)
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      }
      
      return getFallbackMealPlan(preferences)
    } catch (error) {
      console.error('AI meal plan error:', error)
      return getFallbackMealPlan(preferences)
    }
  }
  
  return getFallbackMealPlan(preferences)
}

function getFallbackMealPlan(preferences) {
  const { calories, dietType, variation = 0 } = preferences
  
  // Indian meal plans based on diet type
  const mealPlans = {
    'veg': [
      // Variation 1
      {
        breakfast: [
          '3 whole wheat roti with mixed veg sabzi',
          '1 katori paneer bhurji',
          '1 glass milk',
          'Chai (without sugar or with jaggery)'
        ],
        'mid-morning': [
          '1 glass lassi or buttermilk',
          'Handful of roasted chana (chickpeas)',
          '1 banana or seasonal fruit'
        ],
        lunch: [
          '2 roti or 1 bowl rice (brown rice preferred)',
          '1 katori dal (masoor, moong, or mixed dal)',
          '1 katori sabzi (aloo-gobi, bhindi, baingan)',
          '1 katori curd',
          'Green salad (cucumber, tomato, onion)'
        ],
        'evening-snack': [
          'Sprouts chaat (moong or chana sprouts)',
          '1 cup green tea',
          'Roasted makhana (fox nuts) or nuts',
          '1 fruit'
        ],
        dinner: [
          '2 roti',
          '1 katori rajma or chole curry',
          '1 katori palak paneer or mix veg',
          'Cucumber raita',
          'Green salad'
        ],
        'before-bed': [
          '1 glass warm milk with turmeric',
          '4-5 soaked almonds and walnuts'
        ]
      },
      // Variation 2
      {
        breakfast: [
          '1 bowl dalia (broken wheat) with vegetables',
          '1 glass milk',
          'Handful of almonds',
          'Green tea'
        ],
        'mid-morning': [
          'Fruit salad (apple, banana, pomegranate)',
          'Roasted peanuts',
          '1 glass coconut water'
        ],
        lunch: [
          '2 roti',
          '1 katori kadhi (yogurt curry)',
          '1 katori aloo-beans sabzi',
          'Rice (1 small katori)',
          'Green salad with lemon'
        ],
        'evening-snack': [
          'Vegetable poha or upma',
          'Chai',
          '1 orange'
        ],
        dinner: [
          '3 roti',
          '1 katori chole (chickpea curry)',
          '1 katori bhindi (okra) sabzi',
          'Boondi raita',
          'Sliced cucumber and carrots'
        ],
        'before-bed': [
          '1 glass warm milk',
          'Soaked walnuts (4-5)'
        ]
      },
      // Variation 3
      {
        breakfast: [
          '2 stuffed paratha (aloo or paneer)',
          '1 katori curd',
          'Mixed pickle (small portion)',
          'Chai'
        ],
        'mid-morning': [
          '1 glass mango lassi or buttermilk',
          'Roasted chana',
          '1 apple'
        ],
        lunch: [
          '2 roti',
          '1 katori dal fry (toor or moong)',
          '1 katori matar-paneer',
          'Jeera rice (small portion)',
          'Onion salad'
        ],
        'evening-snack': [
          'Mixed sprouts salad',
          'Green tea',
          'Roasted makhana',
          '1 banana'
        ],
        dinner: [
          '2 roti',
          '1 katori dal makhani',
          '1 katori aloo-gobi',
          'Mint raita',
          'Green salad'
        ],
        'before-bed': [
          '1 glass haldi doodh (turmeric milk)',
          'Soaked almonds and raisins'
        ]
      }
    ],
    
    'non-veg': [
      // Variation 1
      {
        breakfast: [
          '3 whole wheat roti with chicken keema',
          '2 boiled eggs or egg bhurji',
          '1 glass milk',
          'Chai'
        ],
        'mid-morning': [
          'Protein shake or 1 glass lassi',
          'Handful roasted chana or peanuts',
          '1 banana'
        ],
        lunch: [
          '2 roti or 1 bowl rice',
          '150g chicken curry (breast preferred)',
          '1 katori dal',
          '1 katori sabzi',
          'Green salad',
          '1 katori curd'
        ],
        'evening-snack': [
          'Boiled chicken (100g) or 2 boiled eggs',
          'Sprouts chaat',
          '1 cup green tea',
          '1 fruit'
        ],
        dinner: [
          '2 roti',
          '150g grilled/tandoori chicken or fish curry',
          '1 katori dal or sabzi',
          'Cucumber raita',
          'Green salad'
        ],
        'before-bed': [
          '1 glass warm milk',
          'Handful of soaked almonds and walnuts'
        ]
      },
      // Variation 2
      {
        breakfast: [
          '3 roti',
          'Egg omelette (3 eggs) with veggies',
          'Chicken sausage or grilled chicken (50g)',
          'Chai'
        ],
        'mid-morning': [
          '1 glass buttermilk',
          'Mixed nuts',
          '1 apple or pear'
        ],
        lunch: [
          'Brown rice (1 bowl)',
          '150g fish curry (rohu or pomfret)',
          '1 katori dal',
          'Stir-fry vegetables',
          'Curd and salad'
        ],
        'evening-snack': [
          'Chicken tikka or grilled chicken (100g)',
          'Sprouts',
          'Green tea',
          '1 banana'
        ],
        dinner: [
          '2-3 roti',
          '150g butter chicken or chicken masala',
          '1 katori mixed dal',
          'Sautéed spinach',
          'Raita'
        ],
        'before-bed': [
          '1 glass milk with honey',
          'Cashews and almonds (soaked)'
        ]
      }
    ],
    
    // Similar variations for other diet types...
    'non-veg-chicken-only': [
      {
        breakfast: [
          '3 whole wheat roti',
          '1 katori chicken keema or boiled chicken (100g)',
          '2 boiled eggs',
          '1 glass milk',
          'Chai'
        ],
        'mid-morning': [
          'Protein shake (whey or chicken-based)',
          '1 banana',
          'Handful roasted chana'
        ],
        lunch: [
          '2 roti or 1 bowl rice',
          '150-200g chicken curry (home-style)',
          '1 katori dal',
          '1 katori sabzi (seasonal)',
          'Curd and salad'
        ],
        'evening-snack': [
          'Grilled/boiled chicken breast (100g)',
          'Sprouts',
          '1 apple or orange',
          'Green tea'
        ],
        dinner: [
          '2 roti',
          '150g tandoori chicken or chicken tikka',
          '1 katori dal makhani or rajma',
          'Mixed veg sabzi',
          'Raita and salad'
        ],
        'before-bed': [
          '1 glass warm milk with turmeric',
          '4-5 soaked almonds'
        ]
      }
    ],
    
    'eggetarian': [
      {
        breakfast: [
          '3 whole wheat roti or 2 brown bread',
          '3-4 egg bhurji or omelette with veggies',
          '1 glass milk',
          'Chai'
        ],
        'mid-morning': [
          '2 boiled eggs',
          '1 glass lassi or buttermilk',
          '1 banana',
          'Handful nuts'
        ],
        lunch: [
          '2 roti or 1 bowl rice',
          '1 katori dal (any variety)',
          '1 katori mixed veg sabzi',
          'Egg curry (2 eggs)',
          'Curd and green salad'
        ],
        'evening-snack': [
          '2 boiled eggs or egg white omelette',
          'Sprouts chaat',
          '1 fruit',
          'Green tea'
        ],
        dinner: [
          '2-3 roti',
          '1 katori rajma or chole',
          'Egg curry or paneer sabzi',
          '1 katori seasonal sabzi',
          'Raita and salad'
        ],
        'before-bed': [
          '1 glass warm milk',
          'Handful of soaked almonds and walnuts'
        ]
      }
    ],
    
    'high-protein': [
      {
        breakfast: [
          '3 whole wheat roti',
          '1 katori paneer bhurji or 4 egg whites',
          '1 glass whey protein shake or milk',
          'Handful soaked almonds'
        ],
        'mid-morning': [
          'Protein shake (30g protein)',
          'Roasted chana (1 katori)',
          '1 banana'
        ],
        lunch: [
          '2 roti or 1 bowl brown rice',
          '200g grilled chicken/paneer',
          '1 katori dal',
          '1 katori sabzi',
          '1 katori Greek curd or hung curd',
          'Green salad'
        ],
        'evening-snack': [
          '100g boiled chicken/paneer/eggs',
          'Sprouts chaat with lemon',
          'Protein bar or roasted makhana',
          'Green tea'
        ],
        dinner: [
          '3 roti',
          '150g grilled fish/chicken/paneer',
          '1 katori dal or rajma',
          'Mixed veg sabzi',
          'Raita',
          'Green salad'
        ],
        'before-bed': [
          'Casein protein shake or 1 glass milk',
          'Handful almonds and walnuts'
        ]
      }
    ],
    
    'weight-loss': [
      {
        breakfast: [
          '2 roti or dalia (1 bowl)',
          '1 katori vegetable poha or upma',
          'Green tea',
          '1 small fruit'
        ],
        'mid-morning': [
          'Buttermilk (1 glass)',
          'Roasted chana (small portion)',
          '1 apple or orange'
        ],
        lunch: [
          '1 roti or 1 small bowl brown rice',
          '1 katori dal',
          '2 katori mixed veg sabzi (less oil)',
          'Green salad (unlimited)',
          '1 small katori low-fat curd'
        ],
        'evening-snack': [
          'Sprouts salad with lemon',
          'Boiled eggs (whites only) or 50g paneer',
          'Green tea',
          'Cucumber/carrots'
        ],
        dinner: [
          '1-2 roti',
          '1 katori dal or clear chicken soup',
          '2 katori sabzi (steamed/less oil)',
          'Green salad (unlimited)',
          'Raita (low-fat)'
        ],
        'before-bed': [
          '1 glass warm water with lemon',
          '2-3 soaked almonds'
        ]
      }
    ]
  }
  
  // Map diet types to meal plans
  let selectedPlans
  switch(dietType.toLowerCase()) {
    case 'veg':
    case 'vegetarian':
      selectedPlans = mealPlans['veg']
      break
    case 'non-veg':
    case 'non-vegetarian':
      selectedPlans = mealPlans['non-veg']
      break
    case 'non-veg-chicken-only':
    case 'chicken-only':
      selectedPlans = mealPlans['non-veg-chicken-only']
      break
    case 'eggetarian':
    case 'eggitarian':
      selectedPlans = mealPlans['eggetarian']
      break
    case 'high-protein':
      selectedPlans = mealPlans['high-protein']
      break
    case 'weight-loss':
    case 'fat-loss':
      selectedPlans = mealPlans['weight-loss']
      break
    default:
      selectedPlans = mealPlans['veg'] // Default to veg
  }
  
  // Select variation based on variation number (cycle through available plans)
  const planIndex = variation % selectedPlans.length
  return selectedPlans[planIndex]
}

/**
 * Generate AI workout plan based on user preferences
 */
export async function generateAIWorkoutPlan(preferences) {
  const { goal, level, days, duration, equipment } = preferences
  
  console.log('🔑 API Key available:', !!API_CONFIG.GEMINI_API_KEY)
  console.log('📋 Workout preferences:', preferences)
  
  if (API_CONFIG.GEMINI_API_KEY) {
    try {
      const genAI = new GoogleGenerativeAI(API_CONFIG.GEMINI_API_KEY)
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

      const prompt = `Create a detailed ${days}-day per week workout plan for a ${level} level person with the goal of ${goal}. 
      Each workout should be around ${duration} minutes. 
      Available equipment: ${equipment}.
      
      IMPORTANT Guidelines:
      - Provide a structured weekly plan with clear day-by-day breakdown
      - Include exercise names with specific sets and reps
      - Add rest periods between sets
      - Include warm-up and cool-down
      - Provide form tips and safety notes
      - Make it practical and achievable for ${level} level
      - Focus on ${goal} as the primary objective
      
      Format the response clearly with:
      
      DAY 1: [Workout Focus]
      Warm-up: [5-10 minutes]
      
      Exercise 1: [Name]
      - Sets x Reps: 
      - Rest: 
      - Tips: 
      
      [Continue for all exercises]
      
      Cool-down: [5-10 minutes]
      
      Provide this for all ${days} days.`

      console.log('🚀 Calling Gemini API...')
      const result = await model.generateContent(prompt)
      const response = await result.response
      const text = response.text()
      console.log('✅ Workout plan generated successfully')
      return text
    } catch (error) {
      console.error('❌ AI workout plan error:', error)
      console.error('Error details:', error.message, error.stack)
      throw error
    }
  }
  
  const errorMsg = 'Gemini API key not configured'
  console.error('❌', errorMsg)
  throw new Error(errorMsg)
}

export default API_CONFIG
