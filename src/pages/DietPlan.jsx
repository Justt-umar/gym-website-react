import './DietPlan.css'

function DietPlan() {
  const dietPlans = [
    {
      calories: 2500,
      meals: [
        {
          name: 'Breakfast',
          items: ['3 Egg whites + 1 whole egg', '2 slices whole wheat toast', '1 cup oatmeal', '1 banana']
        },
        {
          name: 'Mid-Morning Snack',
          items: ['Protein shake (25g protein)', 'Handful of almonds']
        },
        {
          name: 'Lunch',
          items: ['150g grilled chicken breast', '1 cup brown rice', 'Mixed vegetables', 'Salad with olive oil']
        },
        {
          name: 'Evening Snack',
          items: ['Greek yogurt (200g)', '1 apple', 'Protein bar']
        },
        {
          name: 'Dinner',
          items: ['180g salmon/chicken', 'Sweet potato (200g)', 'Steamed broccoli', 'Mixed salad']
        },
        {
          name: 'Before Bed',
          items: ['Casein protein shake', '1 tablespoon peanut butter']
        }
      ]
    },
    {
      calories: 3000,
      meals: [
        {
          name: 'Breakfast',
          items: ['4 whole eggs', '3 slices whole wheat toast', '1.5 cups oatmeal', '1 banana', 'Glass of milk']
        },
        {
          name: 'Mid-Morning Snack',
          items: ['Protein shake (30g protein)', 'Handful of almonds', '1 apple']
        },
        {
          name: 'Lunch',
          items: ['200g grilled chicken breast', '1.5 cups brown rice', 'Mixed vegetables', 'Large salad with olive oil', 'Avocado']
        },
        {
          name: 'Pre-Workout',
          items: ['Banana', 'Protein shake (25g)', 'Rice cakes with honey']
        },
        {
          name: 'Post-Workout',
          items: ['Protein shake (30g)', 'Quick carbs (dextrose/fruit)']
        },
        {
          name: 'Dinner',
          items: ['200g salmon/lean beef', 'Large sweet potato', 'Steamed vegetables', 'Quinoa salad']
        },
        {
          name: 'Before Bed',
          items: ['Casein protein shake', '2 tablespoons peanut butter', 'Greek yogurt']
        }
      ]
    },
    {
      calories: 3700,
      meals: [
        {
          name: 'Breakfast',
          items: ['5 whole eggs', '4 slices whole wheat toast', '2 cups oatmeal', '1 banana', 'Glass of whole milk', '1 tablespoon honey']
        },
        {
          name: 'Mid-Morning Snack',
          items: ['Protein shake (35g protein)', '2 handfuls mixed nuts', '2 bananas', 'Protein bar']
        },
        {
          name: 'Lunch',
          items: ['250g grilled chicken/turkey', '2 cups brown rice', 'Large portion mixed vegetables', 'Large salad with olive oil', 'Whole avocado']
        },
        {
          name: 'Pre-Workout',
          items: ['2 bananas', 'Protein shake (30g)', 'Rice cakes with almond butter', 'Energy drink']
        },
        {
          name: 'Post-Workout',
          items: ['Protein shake (40g)', 'Quick carbs (dextrose)', 'Creatine (5g)']
        },
        {
          name: 'Dinner',
          items: ['250g salmon/lean beef', 'Extra large sweet potato', 'Steamed broccoli & vegetables', 'Quinoa (1 cup)', 'Mixed salad']
        },
        {
          name: 'Evening Snack',
          items: ['Greek yogurt (300g)', 'Granola', 'Berries', 'Honey']
        },
        {
          name: 'Before Bed',
          items: ['Casein protein shake (40g)', '3 tablespoons peanut butter', 'Cottage cheese (200g)']
        }
      ]
    }
  ]

  return (
    <div className="diet-plan-page">
      <div className="container">
        <h1>Diet Plans</h1>
        <p className="subtitle">Choose a plan that matches your daily calorie needs</p>

        {dietPlans.map((plan) => (
          <div key={plan.calories} className="diet-plan-section">
            <h2>{plan.calories} Calorie Diet Plan</h2>
            <div className="meals-grid">
              {plan.meals.map((meal, index) => (
                <div key={index} className="meal-card">
                  <h3>{meal.name}</h3>
                  <ul>
                    {meal.items.map((item, itemIndex) => (
                      <li key={itemIndex}>{item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="diet-notes">
          <h3>Important Notes:</h3>
          <ul>
            <li>Drink at least 3-4 liters of water daily</li>
            <li>Adjust portion sizes based on your individual needs</li>
            <li>Include variety in your meals for balanced nutrition</li>
            <li>Consult a nutritionist for personalized meal planning</li>
            <li>Track your progress and adjust calories as needed</li>
          </ul>
        </div>

        <a href="/" className="back-link">← Back to Home</a>
      </div>
    </div>
  )
}

export default DietPlan
