# 🚀 BACKEND SETUP GUIDE

## Complete Automated Email & WhatsApp System

Your backend is ready! Follow these steps to enable automatic sending:

---

## 📋 Step 1: Install Backend Dependencies

```bash
cd backend
npm install
```

---

## 📧 Step 2: Setup Gmail (5 minutes)

### Get Gmail App Password:
1. Go to: **https://myaccount.google.com/apppasswords**
2. Login with **umar.khan.csgrad@gmail.com**
3. Click **"Select app"** → Choose **"Other"** → Type **"Minakshi Fitness"**
4. Click **"Generate"**
5. Copy the **16-digit code** (format: xxxx xxxx xxxx xxxx)

### Configure Backend:
1. Copy the example env file:
   ```bash
   cp .env.example .env
   ```

2. Open `.env` and add your Gmail credentials:
   ```
   GMAIL_USER=umar.khan.csgrad@gmail.com
   GMAIL_APP_PASSWORD=your-16-digit-code-here
   ```

---

## 📱 Step 3: Setup WhatsApp (Choose ONE Option)

### Option A: Twilio WhatsApp (Recommended - Easiest)

**Why Twilio?**
- ✅ $15 free credit (enough for thousands of messages)
- ✅ Quick 5-minute setup
- ✅ No business verification needed
- ✅ Works immediately

**Setup Steps:**
1. Go to: **https://www.twilio.com/try-twilio**
2. Sign up with your email
3. Verify your phone number
4. Go to **Console Dashboard**
5. Copy your credentials:
   - **Account SID** (starts with AC...)
   - **Auth Token** (click to reveal)
6. Enable WhatsApp:
   - Go to **Messaging** → **Try WhatsApp**
   - Click **"Get Started"**
   - Use the Sandbox number: **+1 (415) 523-8886**

7. Add to `.env`:
   ```
   TWILIO_ACCOUNT_SID=AC...your-sid-here
   TWILIO_AUTH_TOKEN=your-auth-token-here
   TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
   ```

**Note:** In production, you can get your own WhatsApp number verified.

---

### Option B: WhatsApp Business API (Advanced)

**For Production Use:**
1. Go to: **https://business.facebook.com/wa/manage/home/**
2. Create WhatsApp Business Account
3. Add Phone Number: **6306019048**
4. Complete verification
5. Get credentials:
   - Phone Number ID
   - Access Token

6. Add to `.env`:
   ```
   WHATSAPP_PHONE_NUMBER_ID=your-phone-id
   WHATSAPP_ACCESS_TOKEN=your-access-token
   ```

---

## 🎯 Step 4: Start Backend Server

```bash
npm run dev
```

You should see:
```
🚀 Minakshi Fitness Backend Server
📧 Email Service: ✅ Configured
📱 WhatsApp Service: ✅ Configured
🌐 Server running on: http://localhost:3001
```

---

## ✅ Step 5: Test the System

### Test Email:
1. Open your React app: **http://localhost:5173/ai-features**
2. Generate a meal plan
3. Click **"📧 Email Plan"**
4. Enter a test email address
5. Check inbox - email should arrive in seconds!

### Test WhatsApp:
1. Click **"📱 Send to WhatsApp"**
2. Enter phone number with country code (e.g., 919876543210)
3. Message should be sent automatically!

---

## 🔧 Troubleshooting

### Email not sending?
- Check Gmail App Password is correct
- Make sure 2FA is enabled on Gmail account
- Check backend logs for errors

### WhatsApp not working?
- **Twilio:** Make sure you joined the sandbox by sending "join <word>" to the Twilio number
- **WhatsApp API:** Verify your number is approved
- Check phone number format (include country code, no spaces/dashes)

### Backend not connecting?
- Make sure backend server is running on port 3001
- Check frontend .env has: `VITE_BACKEND_URL=http://localhost:3001`
- Restart frontend dev server after changing .env

---

## 🚀 Production Deployment

When deploying to production:

1. **Deploy Backend:**
   - Use services like Heroku, Railway, or Render
   - Set environment variables in hosting platform
   - Update CORS settings for your production domain

2. **Update Frontend:**
   - Change `VITE_BACKEND_URL` to your backend URL
   - Example: `VITE_BACKEND_URL=https://your-backend.herokuapp.com`

3. **WhatsApp Production:**
   - Get your own WhatsApp Business number verified
   - Update credentials in backend .env

---

## 📊 Cost Breakdown

- **Gmail API:** FREE (unlimited)
- **Twilio WhatsApp:** $15 free credit, then $0.005 per message
- **WhatsApp Business API:** FREE tier available (1000 conversations/month)
- **Total Monthly Cost:** $0 - $10 depending on usage

---

## 🎉 You're All Set!

Your automated messaging system is ready. Clients will receive:
- Professional HTML emails with meal plans
- WhatsApp messages with formatted meal plans
- All sent automatically from your accounts!

**Need help?** Check the logs in your backend terminal for detailed error messages.
