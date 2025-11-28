# Minakshi Fitness Club - React App

Modern React-based fitness website built with Vite, React Router, and responsive design.

## 🚀 Features

- **Modern React Architecture**: Built with React 18 and Vite for blazing-fast performance
- **Client-Side Routing**: Seamless navigation using React Router v6
- **BMI Calculator**: Calculate your Body Mass Index with health categories
- **Calorie Calculator**: Determine daily calorie needs based on activity level
- **Diet Plans**: Comprehensive meal plans for 2500, 3000, and 3700 calories
- **Workout Plans**: Weekly training schedules with exercise details
- **Responsive Design**: Mobile-first approach for all screen sizes
- **Contact Form**: Integrated with Formspree for easy contact submissions

## 📦 Tech Stack

- **React** 18.3.1 - UI library
- **React Router DOM** 6.26.0 - Client-side routing
- **Vite** 5.4.1 - Build tool and dev server
- **CSS3** - Styling with modern features

## 🛠️ Installation

1. **Clone the repository** (or you already have the folder)
   ```bash
   cd /Users/ojasnahta/Desktop/Gym-Website-React
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   ```
   http://localhost:5173
   ```

## 📁 Project Structure

```
Gym-Website-React/
├── public/
│   └── images/           # All website images
├── src/
│   ├── components/
│   │   ├── Header.jsx    # Navigation header
│   │   └── Header.css
│   ├── pages/
│   │   ├── Home.jsx      # Homepage with all sections
│   │   ├── Home.css
│   │   ├── BMICalculator.jsx
│   │   ├── BMICalculator.css
│   │   ├── CalorieCalculator.jsx
│   │   ├── CalorieCalculator.css
│   │   ├── DietPlan.jsx
│   │   ├── DietPlan.css
│   │   ├── WorkoutPlan.jsx
│   │   └── WorkoutPlan.css
│   ├── App.jsx           # Main app component with routes
│   ├── App.css
│   ├── main.jsx          # React entry point
│   └── index.css         # Global styles
├── index.html
├── vite.config.js
└── package.json
```

## 🌐 Deployment

### Deploy to Vercel (Recommended)

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```

4. **Production deployment**
   ```bash
   vercel --prod
   ```

### Deploy to Netlify

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Install Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

3. **Deploy**
   ```bash
   netlify deploy
   ```

4. **Production deployment**
   ```bash
   netlify deploy --prod
   ```

   Build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`

### Deploy to GitHub Pages

1. **Install gh-pages**
   ```bash
   npm install --save-dev gh-pages
   ```

2. **Update vite.config.js**
   ```js
   export default {
     base: '/Gym-Website-React/'
   }
   ```

3. **Add to package.json**
   ```json
   "scripts": {
     "predeploy": "npm run build",
     "deploy": "gh-pages -d dist"
   }
   ```

4. **Deploy**
   ```bash
   npm run deploy
   ```

## 🎨 Customization

### Colors
The primary color scheme uses gym red (#c11325). To change:
- Edit color values in CSS files
- Main brand color: `#c11325`
- Hover color: `#a00f1d`
- Background: `#f5f5f5`

### Contact Form
The contact form uses Formspree. To use your own:
1. Go to [https://formspree.io](https://formspree.io)
2. Create a new form
3. Replace the form action URL in `Home.jsx`:
   ```jsx
   fetch('https://formspree.io/f/YOUR_FORM_ID', {
   ```

### Images
All images are in `public/images/`. Replace them with your own:
- Logo images
- Gallery photos
- Service images
- Pricing package images

## 📝 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally

## 🌟 Features Breakdown

### BMI Calculator
- Input validation (height 50-300cm, weight 20-300kg)
- Color-coded results (underweight, normal, overweight, obese)
- Health advice based on category
- Enter key support

### Calorie Calculator
- Gender selection
- Age, weight, height inputs with validation
- 5 activity level options
- Displays BMR, TDEE, and calorie goals for weight loss/gain

### Diet Plans
- 3 comprehensive meal plans
- Detailed meal breakdowns
- Nutritional guidelines
- Responsive card layout

### Workout Plans
- 7-day weekly schedule
- Exercise sets and reps
- Rest days included
- Training guidelines and tips

## 🐛 Troubleshooting

### Images not loading
- Ensure images are in `public/images/`
- Check image paths start with `/images/`

### Build fails
- Run `npm install` to ensure all dependencies are installed
- Check for any console errors

### Styling issues
- Clear browser cache
- Check if CSS files are properly imported

## 📱 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 👨‍💻 Developer

**Ojas Nahta**
- Email: ojasnahta2004@gmail.com
- Phone: +91 9826030890

## 📄 License

This project is created for Minakshi Fitness Club, Rath.

---

**Live URL**: http://localhost:5173 (Development)

For production deployment, follow the deployment instructions above.
