# 🎯 Quick Start: Google Gemini AI Integration

## ⚡ Get AI Working in 60 Seconds

### Step 1: Get FREE API Key
```
👉 Go to: https://makersuite.google.com/app/apikey
👉 Sign in with Google
👉 Click "Get API Key"
👉 Copy the key (starts with "AIza...")
```

### Step 2: Add to .env
```bash
cd /Users/ojasnahta/Desktop/Gym-Website-React
nano .env
```

Paste:
```
VITE_GEMINI_API_KEY=AIza...your-actual-key-here
```

Save: `Ctrl+O` → `Enter` → `Ctrl+X`

### Step 3: Start Server
```bash
npm run dev
```

### Step 4: Test It!
```
Open: http://localhost:5173/ai-features
Ask: "How much protein do I need to build muscle?"
Watch AI magic! ✨
```

---

## 🎁 What You Get (100% FREE!)

✅ **Intelligent Fitness Chatbot**
- Powered by Google Gemini Pro
- Answers workout, nutrition, form questions
- Learns from conversation context
- 24/7 availability

✅ **AI Meal Planner**
- Personalized to your calories
- Supports all diet types (vegan, keto, etc.)
- Handles allergies and restrictions
- Daily meal breakdowns

✅ **Form Analyzer** (Coming Soon)
- Real-time pose detection
- TensorFlow.js integration
- Webcam-based analysis

---

## 💰 Pricing: $0 Forever!

| Feature | Cost |
|---------|------|
| API Key | FREE |
| Setup | FREE |
| Monthly | FREE |
| Per Request | FREE |
| Credit Card | NOT NEEDED |
| **TOTAL** | **$0.00** 🎉 |

**Free Tier Includes:**
- 60 requests per minute
- 1,500 requests per day
- 45,000 requests per month
- Perfect for most websites!

---

## 🚀 Features

### 1. AI Fitness Chatbot
Ask anything about:
- Workout routines
- Exercise form & technique
- Nutrition & meal planning
- Supplements
- Weight loss/gain
- Recovery & rest days
- Beginner programs

**Example Questions:**
- "Best workout routine for beginners?"
- "Should I do cardio before or after weights?"
- "How much protein do I need daily?"

### 2. AI Meal Planner
Get personalized meal plans based on:
- Daily calorie target
- Diet type (regular, vegan, keto, paleo)
- Food allergies
- Macro preferences

**Generates:**
- Breakfast
- Mid-morning snack
- Lunch
- Evening snack
- Dinner
- Before bed meal

### 3. Progress Tracking (Coming Soon)
- Body measurements
- Workout logs
- Photo comparisons
- AI-powered insights

---

## 📖 Full Documentation

- **Setup Guide**: `AI_SETUP_GUIDE.md`
- **Gemini vs OpenAI**: `GEMINI_VS_OPENAI.md`
- **API Reference**: See code in `src/utils/aiServices.js`

---

## 🛠️ Tech Stack

- **Frontend**: React 18.3.1 + Vite
- **AI**: Google Gemini Pro (FREE!)
- **ML**: TensorFlow.js
- **Styling**: Custom CSS
- **Routing**: React Router 6

---

## 🔒 Security

✅ API key in environment variables
✅ `.env` in `.gitignore`
✅ Never committed to Git
✅ Backend proxy ready (optional)

**For Production:**
Use backend proxy to hide API key:
```javascript
// Instead of calling Gemini directly
// Use your backend: /api/chat
```

See `AI_SETUP_GUIDE.md` for details.

---

## 📱 Works Offline!

Even without API key, you get:
- Rule-based chatbot responses
- Pre-built meal plans
- Full UI functionality

**Fallback System:**
- Answers 10+ fitness topics
- Instant responses
- No network required

---

## 🎯 Usage Examples

### Chatbot
```javascript
import { getAIChatResponse } from './utils/aiServices'

const response = await getAIChatResponse(
  "How do I build muscle?",
  chatHistory
)
// Returns: AI-generated fitness advice
```

### Meal Planner
```javascript
import { generateAIMealPlan } from './utils/aiServices'

const plan = await generateAIMealPlan({
  calories: 2500,
  dietType: 'vegan',
  allergies: 'nuts, soy'
})
// Returns: Personalized meal plan
```

---

## 🐛 Troubleshooting

**"API Key Invalid"**
- Check key starts with `AIza`
- No spaces in `.env` file
- Restart dev server

**"Rate Limit Exceeded"**
- Free tier: 1,500/day
- Implement caching
- Use fallback system

**"Module not found"**
```bash
npm install @google/generative-ai
```

---

## 📈 Performance

**Average Response Times:**
- Gemini API: 1-2 seconds
- Fallback: Instant
- Meal Planner: 2-3 seconds

**Rate Limits:**
- 60 requests/minute
- 1,500 requests/day
- More than enough for most sites!

---

## 🎓 Learning Resources

**Google Gemini:**
- Docs: https://ai.google.dev/docs
- API Key: https://makersuite.google.com/app/apikey
- Community: https://ai.google.dev/community

**React:**
- Docs: https://react.dev
- Router: https://reactrouter.com

**TensorFlow.js:**
- Docs: https://tensorflow.org/js
- Models: https://github.com/tensorflow/tfjs-models

---

## 📞 Support

**Questions?**
- Email: ojasnahta2004@gmail.com
- Phone: +91 6306019048

**Found a bug?**
Open an issue or submit a PR!

---

## 🚀 Deployment

### Vercel (Recommended)
```bash
npm install -g vercel
vercel
```

Add environment variable:
- `GEMINI_API_KEY` = your key

### Other Platforms
- Netlify: Works great
- Railway: Perfect for backend
- DigitalOcean: Classic choice

---

## 📝 License

MIT License - Use freely!

---

## 🎉 You're All Set!

1. Get API key: https://makersuite.google.com/app/apikey
2. Add to `.env`
3. Run `npm run dev`
4. Open `/ai-features`
5. Enjoy FREE AI! 🚀

**Questions? Check `AI_SETUP_GUIDE.md`**

Happy coding! 💪✨
