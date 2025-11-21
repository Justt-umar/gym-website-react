import './WorkoutPlan.css'

function WorkoutPlan() {
  const workoutPlans = [
    {
      day: 'Monday',
      focus: 'Chest & Triceps',
      exercises: [
        { name: 'Bench Press', sets: '4', reps: '8-10' },
        { name: 'Incline Dumbbell Press', sets: '3', reps: '10-12' },
        { name: 'Cable Flyes', sets: '3', reps: '12-15' },
        { name: 'Tricep Dips', sets: '3', reps: '10-12' },
        { name: 'Tricep Pushdowns', sets: '3', reps: '12-15' },
        { name: 'Overhead Tricep Extension', sets: '3', reps: '10-12' }
      ]
    },
    {
      day: 'Tuesday',
      focus: 'Back & Biceps',
      exercises: [
        { name: 'Deadlifts', sets: '4', reps: '6-8' },
        { name: 'Pull-ups/Lat Pulldowns', sets: '4', reps: '8-10' },
        { name: 'Barbell Rows', sets: '3', reps: '8-10' },
        { name: 'Seated Cable Rows', sets: '3', reps: '10-12' },
        { name: 'Barbell Bicep Curls', sets: '3', reps: '10-12' },
        { name: 'Hammer Curls', sets: '3', reps: '10-12' }
      ]
    },
    {
      day: 'Wednesday',
      focus: 'Rest or Cardio',
      exercises: [
        { name: '30-45 min moderate cardio (optional)', sets: '-', reps: '-' },
        { name: 'Stretching & Mobility work', sets: '-', reps: '-' },
        { name: 'Active recovery', sets: '-', reps: '-' }
      ]
    },
    {
      day: 'Thursday',
      focus: 'Shoulders & Abs',
      exercises: [
        { name: 'Military Press', sets: '4', reps: '8-10' },
        { name: 'Lateral Raises', sets: '3', reps: '12-15' },
        { name: 'Front Raises', sets: '3', reps: '12-15' },
        { name: 'Rear Delt Flyes', sets: '3', reps: '12-15' },
        { name: 'Plank', sets: '3', reps: '60 sec' },
        { name: 'Hanging Leg Raises', sets: '3', reps: '12-15' },
        { name: 'Cable Crunches', sets: '3', reps: '15-20' }
      ]
    },
    {
      day: 'Friday',
      focus: 'Legs',
      exercises: [
        { name: 'Squats', sets: '4', reps: '8-10' },
        { name: 'Leg Press', sets: '3', reps: '10-12' },
        { name: 'Romanian Deadlifts', sets: '3', reps: '10-12' },
        { name: 'Leg Curls', sets: '3', reps: '12-15' },
        { name: 'Leg Extensions', sets: '3', reps: '12-15' },
        { name: 'Calf Raises', sets: '4', reps: '15-20' }
      ]
    },
    {
      day: 'Saturday',
      focus: 'Full Body or Weak Points',
      exercises: [
        { name: 'Light full body circuit', sets: '3', reps: '12-15' },
        { name: 'Focus on lagging muscle groups', sets: '-', reps: '-' },
        { name: 'Functional training', sets: '-', reps: '-' }
      ]
    },
    {
      day: 'Sunday',
      focus: 'Rest',
      exercises: [
        { name: 'Complete rest', sets: '-', reps: '-' },
        { name: 'Meal prep for the week', sets: '-', reps: '-' },
        { name: 'Recovery & sleep', sets: '-', reps: '-' }
      ]
    }
  ]

  return (
    <div className="workout-plan-page">
      <div className="container">
        <h1>Weekly Workout Plan</h1>
        <p className="subtitle">Progressive strength training program</p>

        <div className="workout-grid">
          {workoutPlans.map((day) => (
            <div key={day.day} className="workout-card">
              <div className="workout-header">
                <h2>{day.day}</h2>
                <h3>{day.focus}</h3>
              </div>
              <div className="exercise-list">
                {day.exercises.map((exercise, index) => (
                  <div key={index} className="exercise-item">
                    <span className="exercise-name">{exercise.name}</span>
                    <span className="exercise-details">
                      {exercise.sets !== '-' && `${exercise.sets} × ${exercise.reps}`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="workout-notes">
          <h3>Training Guidelines:</h3>
          <ul>
            <li><strong>Warm-up:</strong> 5-10 minutes light cardio + dynamic stretching before each workout</li>
            <li><strong>Rest between sets:</strong> 60-90 seconds for isolation, 2-3 minutes for compound movements</li>
            <li><strong>Progressive overload:</strong> Increase weight when you can complete all sets with good form</li>
            <li><strong>Form over weight:</strong> Always prioritize proper technique to prevent injury</li>
            <li><strong>Cool-down:</strong> 5-10 minutes stretching after each workout</li>
            <li><strong>Hydration:</strong> Drink water before, during, and after training</li>
            <li><strong>Recovery:</strong> Get 7-9 hours of sleep for optimal muscle growth</li>
          </ul>
        </div>

        <a href="/" className="back-link">← Back to Home</a>
      </div>
    </div>
  )
}

export default WorkoutPlan
