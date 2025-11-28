# 🚀 AI Integration Setup Guide

## Quick Start - Get AI Features Working in 5 Minutes!

### Option 1: Use Google Gemini API (FREE & Recommended!)

**Step 1: Get Your FREE Gemini API Key**
1. Go to: https://makersuite.google.com/app/apikey
2. Sign in with your Google account
3. Click "Get API Key" or "Create API Key"
4. Copy the API key (starts with `AIza...`)

**Step 2: Add API Key to Your Project**
```bash
cd /Users/ojasnahta/Desktop/Gym-Website-React
nano .env
```

Paste this line:
```
VITE_GEMINI_API_KEY=AIza...your-actual-api-key-here
```

Save (Ctrl+O, Enter, Ctrl+X)

**Step 3: Restart Dev Server**
```bash
npm run dev
```

**That's it!** Your chatbot now uses Google Gemini Pro for intelligent responses!

---

### Option 2: Free Rule-Based Responses (No API Needed)

Your AI features work out of the box with smart rule-based responses!
- No API key required
- Completely free
- Works offline
- Instant responses

Just use it as-is! The chatbot will provide expert fitness advice using built-in knowledge.

---

## 🧪 Testing Your AI Features

### 1. Test the Chatbot
```
http://localhost:5173/ai-features
```
Click "AI Fitness Chatbot" and ask:
- "How much protein do I need to build muscle?"
- "Best workout routine for beginners?"
- "Should I do cardio before or after weights?"

**With Gemini API:** You'll get personalized, contextual responses
**Without API:** You'll get expert rule-based responses

### 2. Test Meal Planner
- Select calories: 2500
- Choose diet: Vegan
- Add allergies: dairy, nuts
- Click "Generate AI Meal Plan"

**With Gemini API:** Get completely customized meal plans
**Without API:** Get pre-built optimized meal plans

### 3. Test Form Analyzer (Demo Mode)
- Click "AI Form Analyzer"
- Click "Start Form Analysis"
- See demo feedback

**Coming Soon:** Real-time webcam analysis with TensorFlow.js!

---

## 💰 Google Gemini Pricing

### Gemini Pro (Recommended)
- **Cost:** 100% FREE! 🎉
- **No credit card required**
- **Generous rate limits:**
  - 60 requests per minute
  - 1,500 requests per day
  - Perfect for development and small-to-medium websites!

### Gemini Pro Vision (Images)
- Also FREE!
- Same rate limits

### Why Gemini is Better:
- ✅ **Completely FREE** (vs OpenAI's paid API)
- ✅ **No credit card needed** (vs OpenAI requiring payment)
- ✅ **High quality responses** (comparable to GPT-3.5)
- ✅ **Generous free tier** (1,500 requests/day)
- ✅ **Made by Google** (reliable and fast)

### Real-World Usage
- 100 users/day × 5 questions = 500 chats
- **Cost per day: $0.00** 
- **Monthly cost: $0.00**

**Completely FREE forever!**

---

## 🔒 Security Best Practices

### ⚠️ NEVER Do This:
```javascript
// DON'T hardcode API keys in code!
const apiKey = 'AIza123...'  // ❌ WRONG!
```

### ✅ Always Do This:

**Development (Local):**
```bash
# .env file
VITE_GEMINI_API_KEY=AIza...your-key
```

**Production (Recommended Approach):**

Create a backend API proxy:

```javascript
// backend/server.js (Node.js + Express)
const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const app = express();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post('/api/chat', async (req, res) => {
  const { message } = req.body;
  
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
  const result = await model.generateContent(message);
  const response = await result.response;
  
  res.json({ response: response.text() });
});

app.listen(3000);
```

Then update `.env`:
```
VITE_API_PROXY=https://your-backend-api.com
```

---

## 🌐 Deployment Options

### Option A: Vercel (Easiest)

**1. Create Backend API:**
```bash
# In Gym-Website-React folder
mkdir api
```

Create `api/chat.js`:
```javascript
import { GoogleGenerativeAI } from '@google/generative-ai';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

  const { message } = req.body;

  const result = await model.generateContent(message);
  const response = await result.response;

  res.json({ response: response.text() });
}
```

**2. Deploy:**
```bash
npm install -g vercel
vercel
```

**3. Set Environment Variable:**
- Go to vercel.com → Your Project → Settings → Environment Variables
- Add: `GEMINI_API_KEY` = your key

**4. Update `.env`:**
```
VITE_API_PROXY=https://your-project.vercel.app
```

Done! Your API is secure and scalable.

### Option B: Netlify Functions

Similar to Vercel but uses `netlify/functions/` folder.

### Option C: Your Own Server

Deploy Node.js backend on:
- Railway.app (free tier)
- Render.com (free tier)
- DigitalOcean ($5/month)
- AWS Lambda (pay per use)

---

## 📊 Monitoring & Analytics

### Track API Usage

Create `src/utils/analytics.js`:
```javascript
let chatCount = 0;

export function trackChatMessage() {
  chatCount++;
  localStorage.setItem('ai_chat_count', chatCount);
  
  // Optional: Send to analytics
  if (window.gtag) {
    gtag('event', 'ai_chat', {
      'event_category': 'engagement',
      'event_label': 'chat_message'
    });
  }
}

export function getChatCount() {
  return parseInt(localStorage.getItem('ai_chat_count') || '0');
}
```

### Monitor Gemini Usage

Check your usage at:
- https://makersuite.google.com/app/apikey
- View request counts
- Monitor daily limits (1,500/day free)
- Upgrade if needed (but probably won't need to!)

---

## 🔧 Advanced Customization

### 1. Customize AI Personality

Edit `src/utils/aiServices.js`:
```javascript
const systemPrompt = `You are Ojas, the head trainer at Minakshi Fitness Club in Rath.
You're energetic, motivational, and focus on achievable goals.
Use emojis occasionally 💪 and keep responses under 100 words.
Always mention Minakshi Fitness Club when relevant.`
```

### 2. Add Memory/Context

Save chat history to localStorage:
```javascript
const saveChatHistory = (messages) => {
  localStorage.setItem('ai_chat_history', JSON.stringify(messages));
};

const loadChatHistory = () => {
  const saved = localStorage.getItem('ai_chat_history');
  return saved ? JSON.parse(saved) : [];
};
```

### 3. Add Voice Input

```bash
npm install react-speech-recognition
```

```javascript
import SpeechRecognition from 'react-speech-recognition';

const { transcript, listening, resetTranscript } = useSpeechRecognition();

<button onClick={SpeechRecognition.startListening}>
  🎤 Speak
</button>
```

### 4. Rate Limiting

Prevent spam and control costs:
```javascript
const rateLimiter = {
  messages: [],
  maxPerHour: 20,
  
  canSend() {
    const now = Date.now();
    const oneHourAgo = now - 3600000;
    
    this.messages = this.messages.filter(t => t > oneHourAgo);
    
    if (this.messages.length >= this.maxPerHour) {
      return false;
    }
    
    this.messages.push(now);
    return true;
  }
};

// In handleChatSubmit:
if (!rateLimiter.canSend()) {
  alert('Please wait before sending more messages');
  return;
}
```

---

## 🐛 Troubleshooting

### Issue: "API Key Invalid"
**Solution:**
- Check `.env` file has correct key
- Key must start with `AIza`
- Restart dev server after changing `.env`
- Make sure no spaces around the key
- Get new key at: https://makersuite.google.com/app/apikey

### Issue: "CORS Error"
**Solution:**
- Use backend proxy (recommended)
- Gemini API works directly from browser (no CORS issues!)

### Issue: "Module not found: @google/generative-ai"
**Solution:**
```bash
cd /Users/ojasnahta/Desktop/Gym-Website-React
npm install @google/generative-ai
```

### Issue: Chatbot responds slowly
**Solution:**
- Gemini API usually takes 1-2 seconds (normal)
- Slower than GPT but still very fast
- Free tier may have slight delays during peak times

### Issue: Rate limit exceeded
**Solutions:**
1. Free tier: 60 requests/minute, 1,500/day
2. Implement rate limiting in your code
3. Cache common responses
4. Use rule-based for simple questions
5. Upgrade to paid tier if needed (still very cheap!)

---

## 📈 Next Steps

### Short Term (This Week)
- [x] Install Google Gemini package
- [ ] Get Gemini API key (FREE!)
- [ ] Test chatbot with real AI
- [ ] Test meal planner
- [ ] Deploy to production

### Medium Term (This Month)
- [ ] Add TensorFlow.js for form analysis
- [ ] Implement user authentication
- [ ] Add chat history saving
- [ ] Create backend API proxy
- [ ] Add analytics tracking

### Long Term (Next 3 Months)
- [ ] Real-time pose detection
- [ ] Voice coach feature
- [ ] Progress tracking database
- [ ] Mobile app (React Native)
- [ ] Premium subscription model

---

## 💡 Alternative AI Services

### Other Free Options:

**1. Google Gemini** (You're using this! ✅)
- 100% FREE
- No credit card needed
- 1,500 requests/day
- https://makersuite.google.com

**2. Hugging Face Inference API**
- Free tier available
- Many open-source models
- https://huggingface.co/inference-api

**3. Anthropic Claude**
- Similar to ChatGPT
- Sometimes faster
- Paid but affordable
- https://console.anthropic.com

**4. Cohere**
- Good for embeddings
- Free tier available
- https://cohere.com

**5. OpenAI GPT**
- Requires credit card
- $0.002 per 1K tokens
- https://platform.openai.com

---

## 📞 Support

**Questions? Issues?**
- Email: umarroyal.rath@gmail.com
- Phone: +91 6306019048

**Helpful Resources:**
- Google Gemini Docs: https://ai.google.dev/docs
- React Docs: https://react.dev
- TensorFlow.js: https://tensorflow.org/js
- Gemini API Key: https://makersuite.google.com/app/apikey

---

## 🎯 Success Checklist

- [ ] Google Gemini API key obtained (FREE!)
- [ ] `.env` file configured
- [ ] Chatbot tested and working
- [ ] Meal planner generating plans
- [ ] Form analyzer demo working
- [ ] Code committed to Git
- [ ] `.env` added to `.gitignore`
- [ ] Backend proxy planned for production
- [ ] Rate limiting implemented (optional)
- [ ] Celebrating because it's FREE! 🎉

---

**Ready to go? Start testing at:**
```
http://localhost:5173/ai-features
```

**Happy coding! 🚀💪**
