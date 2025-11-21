# Authentication & User Progress Tracking System

## 🔐 Overview

Your gym website now has a complete authentication system with:
- User signup/login with email OR mobile number
- Password encryption (bcrypt)
- JWT-based authentication
- User progress tracking
- Admin monitoring capabilities

## 🚀 How It Works

### 1. **User Registration & Login**

#### Signup Process:
- Users can signup with:
  - Full Name (required)
  - Email OR Mobile Number (at least one required)
  - Password (required)
- Passwords are securely hashed using bcrypt
- Each user gets a unique JWT token upon signup
- User data is stored in `backend/db/users.json`

#### Login Process:
- Users can login with:
  - Email OR Mobile Number
  - Password
- System validates credentials and issues a JWT token
- Token is stored in browser's localStorage

### 2. **Protected Routes**

The following pages now require authentication:
- ✅ BMI Calculator
- ✅ Calorie Calculator
- ✅ Diet Plan
- ✅ Workout Plan
- ✅ AI Features

If a user tries to access these pages without logging in, they will be redirected to the login page.

### 3. **Progress Tracking**

All user activities are automatically saved to the backend:

#### What Gets Tracked:
- **BMI Calculations**: height, weight, BMI result, category
- **Calorie Calculations**: gender, age, weight, height, activity level, BMR, TDEE
- **Meal Plans**: preferences, generated meal plan
- **AI Interactions**: (can be extended)

#### Where It's Saved:
- User-specific data: `backend/db/progress.json`
- Each entry includes:
  - User ID (linked to their account)
  - Type of activity (bmi, calorie, meal_plan, etc.)
  - Timestamp
  - Full data of the activity

### 4. **Admin Monitoring**

As the admin, you can view all user data:

#### View All Users & Progress:
Visit: `http://localhost:3001/api/admin/stats`

This shows:
- Total number of users
- Total progress entries
- Recent users (last 10)
- Recent progress activities (last 20)

#### User Database Files:
- **Users**: `/backend/db/users.json`
  - Contains all registered users
  - Email/mobile contact info
  - Account creation & last login timestamps
  
- **Progress**: `/backend/db/progress.json`
  - All user activities
  - Linked to user IDs
  - Timestamped entries

## 📋 API Endpoints

### Authentication
```
POST /api/auth/signup
- Body: { name, email?, mobile?, password }
- Returns: { token, user }

POST /api/auth/login
- Body: { email?, mobile?, password }
- Returns: { token, user }
```

### Progress Tracking
```
GET /api/progress
- Headers: Authorization: Bearer <token>
- Returns: User's progress history

POST /api/progress
- Headers: Authorization: Bearer <token>
- Body: { type, data }
- Returns: Saved progress entry
```

### Admin
```
GET /api/admin/stats
- Returns: All users and progress statistics
```

## 🔒 Security Features

1. **Password Hashing**: All passwords are hashed with bcrypt (10 salt rounds)
2. **JWT Tokens**: Secure token-based authentication (30-day expiry)
3. **Protected Routes**: Frontend routes require valid authentication
4. **API Protection**: Progress endpoints require valid JWT token

## 📧 Email Notifications

The backend logs in the console when:
- ✅ New user signs up
- 🔓 User logs in
- 📊 Progress is saved

You can extend this to send email notifications by integrating with the existing email service.

## 🎯 User Flow

1. **First Visit**:
   - User visits the home page (public)
   - Clicks on any feature (BMI, Calorie, etc.)
   - Gets redirected to `/login`

2. **Signup**:
   - User enters name, email/mobile, password
   - Account is created
   - Automatically logged in
   - Redirected to AI Features page

3. **Using Features**:
   - User calculates BMI → Saved to their account
   - User generates meal plan → Saved to their account
   - All progress linked to their user ID

4. **Return Visit**:
   - User logs in with email/mobile + password
   - All their previous progress is available
   - Can continue where they left off

5. **Logout**:
   - Click logout button in header
   - Token removed from localStorage
   - Redirected to login page

## 📱 Mobile Number Format

When users signup/login with mobile:
- Accepts 10-15 digits
- Can include country code (e.g., +91XXXXXXXXXX)
- System validates format before saving

## 🛠️ Files Modified/Created

### Frontend:
- ✨ `src/contexts/AuthContext.jsx` - Authentication state management
- ✨ `src/components/ProtectedRoute.jsx` - Route protection
- ✨ `src/utils/progressService.js` - Progress tracking utility
- ✏️ `src/App.jsx` - Added protected routes
- ✏️ `src/pages/Login.jsx` - Enhanced with mobile support
- ✏️ `src/components/Header.jsx` - Shows user name, login/logout
- ✏️ `src/pages/BMICalculator.jsx` - Saves progress
- ✏️ `src/pages/CalorieCalculator.jsx` - Saves progress
- ✏️ `src/pages/AIFeatures.jsx` - Saves meal plans

### Backend:
- ✨ `backend/utils/auth.js` - Authentication utilities
- ✨ `backend/utils/database.js` - Database operations
- ✨ `backend/db/users.json` - User storage
- ✨ `backend/db/progress.json` - Progress storage
- ✏️ `backend/server.js` - Added auth & progress endpoints

## 🎉 Testing

1. **Start both servers**:
   ```bash
   # Terminal 1 - Backend
   cd backend && node server.js

   # Terminal 2 - Frontend
   npm run dev
   ```

2. **Test Signup**:
   - Visit http://localhost:5173
   - Click on any feature
   - Click "Sign up"
   - Enter details and create account

3. **Test Login**:
   - Logout
   - Login with your credentials

4. **Test Progress Tracking**:
   - Calculate BMI
   - Check `backend/db/progress.json` to see saved data

5. **View Admin Stats**:
   - Visit http://localhost:3001/api/admin/stats

## 💡 Tips

- The header now shows the logged-in user's name
- All user data is stored locally in JSON files
- You can manually check the database files to see user info
- For production, consider migrating to a real database (MongoDB, PostgreSQL)
- Add email notifications by integrating with existing email service

## 🔐 Environment Variables

Make sure your `.env` file in the backend has:
```
JWT_SECRET=minakshi-fitness-secret-key-2025
ADMIN_EMAIL=your-email@gmail.com
```

---

**Your gym website now has enterprise-level authentication and user tracking! 🎉**
