# 🎉 Quick Start Guide - Authentication System

## ✅ What's Been Implemented

Your gym website now has **complete authentication and user tracking**!

### Features:
1. ✅ Login/Signup with Email OR Mobile Number
2. ✅ Secure password encryption (bcrypt)
3. ✅ Protected routes (requires login to access features)
4. ✅ Automatic progress tracking (BMI, Calories, Meal Plans)
5. ✅ User data storage (all info saved to JSON database)
6. ✅ Admin dashboard to view all users and their data

---

## 🚀 How to Run

### Start Backend Server:
```bash
cd backend
node server.js
```
Server runs on: http://localhost:3001

### Start Frontend:
```bash
npm run dev
```
Frontend runs on: http://localhost:5173

---

## 👤 User Journey

### For New Users:
1. Visit http://localhost:5173
2. Click on any feature (BMI Calculator, AI Features, etc.)
3. Get redirected to `/login`
4. Click "Sign up"
5. Enter:
   - Name
   - Email OR Mobile Number (at least one required)
   - Password
6. Click "Create Account"
7. Automatically logged in!

### For Returning Users:
1. Visit http://localhost:5173/login
2. Enter Email/Mobile + Password
3. Click "Login"
4. All their previous progress is restored!

---

## 📊 View User Data (As Admin)

### Option 1: View in Terminal
```bash
cd backend
npm run view-users
```
This shows:
- All registered users
- Their contact info
- Progress entries count
- Recent activity

### Option 2: View in Browser
Visit: http://localhost:3001/api/admin/stats

Shows JSON with:
- Total users
- Total progress entries
- Recent users
- Recent progress

### Option 3: Export to CSV
```bash
cd backend
npm run export-data
```
Creates CSV files in `backend/exports/`:
- `users_[timestamp].csv` - All users
- `progress_[timestamp].csv` - All progress data

### Option 4: View Database Files Directly
Open these files in VS Code:
- `backend/db/users.json` - All user accounts
- `backend/db/progress.json` - All user activities

---

## 📧 User Data You'll Receive

### When Someone Signs Up:
**Saved in `users.json`:**
- User ID (unique)
- Name
- Email (if provided)
- Mobile Number (if provided)
- Encrypted Password
- Account Creation Date
- Last Login Date

**Console Log:**
```
✅ New user signup: John Doe - john@example.com
```

### When User Uses Features:
**Saved in `progress.json`:**

**BMI Calculator:**
```json
{
  "id": "1234567890",
  "userId": "user_id_here",
  "type": "bmi",
  "timestamp": "2025-11-21T10:30:00.000Z",
  "data": {
    "height": 175,
    "weight": 70,
    "bmi": "22.9",
    "category": "Normal weight"
  }
}
```

**Calorie Calculator:**
```json
{
  "id": "1234567891",
  "userId": "user_id_here",
  "type": "calorie",
  "timestamp": "2025-11-21T10:35:00.000Z",
  "data": {
    "gender": "male",
    "age": 25,
    "weight": 70,
    "height": 175,
    "activity": "moderate",
    "bmr": 1650,
    "tdee": 2558
  }
}
```

**Meal Plan:**
```json
{
  "id": "1234567892",
  "userId": "user_id_here",
  "type": "meal_plan",
  "timestamp": "2025-11-21T10:40:00.000Z",
  "data": {
    "preferences": {
      "goal": "muscle gain",
      "dietType": "vegetarian",
      "calories": 2500
    },
    "mealPlan": [...]
  }
}
```

---

## 🔐 Security

- ✅ Passwords are hashed with bcrypt (cannot be reversed)
- ✅ JWT tokens expire after 30 days
- ✅ Protected API endpoints require valid token
- ✅ Frontend routes redirect to login if not authenticated

---

## 💡 Important Notes

1. **Database Files**: All data is stored in JSON files at `backend/db/`
   - Easy to view and backup
   - For production, consider migrating to MongoDB or PostgreSQL

2. **User Privacy**: 
   - Passwords are encrypted
   - Each user can only see their own progress
   - Admin can view all data via scripts/endpoints

3. **Mobile Number Format**:
   - Accepts: `1234567890` or `+911234567890`
   - Must be 10-15 digits

4. **Email or Mobile**:
   - Users can signup with EITHER email OR mobile
   - They can provide both if they want
   - Login works with whichever they used for signup

---

## 🎯 Testing the System

1. **Create a Test User:**
   ```
   Name: Test User
   Email: test@example.com
   Password: test123
   ```

2. **Login:**
   - Use email: `test@example.com`
   - Password: `test123`

3. **Test Progress Tracking:**
   - Calculate BMI
   - Generate meal plan
   - Check `backend/db/progress.json`

4. **View User Data:**
   ```bash
   cd backend
   npm run view-users
   ```

---

## 📱 Admin Commands

```bash
# View all users and their activity
npm run view-users

# Export data to CSV files
npm run export-data

# View stats in browser
# Visit: http://localhost:3001/api/admin/stats
```

---

## ✨ What Happens Behind the Scenes

1. **User Signs Up** → Password encrypted → Saved to `users.json` → JWT token created
2. **User Logs In** → Credentials verified → JWT token issued → Stored in browser
3. **User Accesses Feature** → Token validated → Access granted
4. **User Calculates BMI** → Result saved to `progress.json` → Linked to user ID
5. **Admin Views Data** → Can see all users and their complete progress

---

## 🚨 Troubleshooting

**If login doesn't work:**
- Make sure backend is running on port 3001
- Check browser console for errors
- Verify the user exists in `backend/db/users.json`

**If progress isn't saving:**
- Check if user is logged in (token in localStorage)
- Verify backend is running
- Look at backend console for error messages

**If you can't see user data:**
- Run `npm run view-users` in backend folder
- Check `backend/db/users.json` and `backend/db/progress.json`

---

## 📖 Documentation Files

- `AUTHENTICATION_GUIDE.md` - Detailed technical documentation
- `QUICK_START.md` - This file (quick reference)

---

**Everything is set up and ready to go! 🎉**

Users can now signup, login, and all their data will be automatically saved and accessible to you!
