# Minakshi Fitness Club - Backend API

Backend service for automated email and WhatsApp meal plan delivery.

## Features
- ✉️ Automated email sending via Gmail API
- 📱 WhatsApp message automation
- 🔒 Secure credential management
- 🚀 RESTful API endpoints

## Quick Setup

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Configure Gmail (Required)

**Get Gmail App Password:**
1. Go to https://myaccount.google.com/apppasswords
2. Login with `umar.khan.prsnl@gmail.com`
3. Click "Generate App Password"
4. Copy the 16-digit code

### 3. Configure WhatsApp (Choose ONE)

**Option A: WhatsApp Business API (Official - Free Tier)**
1. Go to https://business.facebook.com/wa/manage/home/
2. Create WhatsApp Business Account
3. Add phone number: 6306019048
4. Get Phone Number ID and Access Token

**Option B: Twilio WhatsApp (Easier - $15 Free Credit)**
1. Go to https://www.twilio.com/console
2. Sign up for free trial
3. Enable WhatsApp in Messaging
4. Get Account SID and Auth Token

### 4. Setup Environment Variables
```bash
cp .env.example .env
# Edit .env and add your credentials
```

### 5. Start Server
```bash
npm run dev
```

Server runs on: http://localhost:3001

## API Endpoints

### Health Check
```
GET /api/health
```

### Send Email
```
POST /api/send-email
Content-Type: application/json

{
  "clientEmail": "client@example.com",
  "mealPlan": { ... },
  "preferences": { ... }
}
```

### Send WhatsApp
```
POST /api/send-whatsapp
Content-Type: application/json

{
  "phoneNumber": "919876543210",
  "mealPlan": { ... },
  "preferences": { ... }
}
```

## Frontend Integration

Update your frontend to call the backend API instead of direct sending.

## Security Notes
- Never commit `.env` file
- Keep Gmail App Password secure
- Use environment variables for all credentials
- Enable CORS only for your frontend domain in production
