import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import QuickStats from '../components/QuickStats'
import UnitToggle from '../components/UnitToggle'
import { getAIChatResponse, generateAIMealPlan, generateAIWorkoutPlan } from '../utils/aiServices'
import { downloadMealPlanPDF, downloadWorkoutPlanPDF } from '../utils/pdfGenerator'
import { emailMealPlan } from '../utils/shareUtils'
import { saveUserProgress, getUserProgressHistory } from '../utils/progressService'
import * as poseDetection from '@tensorflow-models/pose-detection'
import * as tf from '@tensorflow/tfjs'
import './AIFeatures.css'

function AIFeatures() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [activeFeature, setActiveFeature] = useState(null)
  const [chatMessages, setChatMessages] = useState([])
  const [chatInput, setChatInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Load user's previous progress on component mount
  useEffect(() => {
    const loadUserProgress = async () => {
      try {
        const response = await getUserProgressHistory()
        if (response.success && response.progress) {
          // Load chat history
          const chatHistory = response.progress
            .filter(p => p.type === 'ai_chat')
            .slice(-10) // Get last 10 chat messages
            .map(p => [
              { role: 'user', content: p.data.userMessage },
              { role: 'assistant', content: p.data.aiResponse }
            ])
            .flat()
          
          if (chatHistory.length > 0) {
            setChatMessages(chatHistory)
          }

          // Load workout progress (cardio and weight training)
          const workoutProgress = response.progress
            .filter(p => p.type === 'cardio_workout' || p.type === 'weight_training')
            .reduce((acc, entry) => {
              const date = entry.data.date
              const existingDay = acc.find(d => d.date === date)
              
              const exercise = {
                type: entry.type === 'cardio_workout' ? 'cardio' : 'weight',
                ...entry.data,
                id: entry.id,
                timestamp: entry.timestamp
              }

              if (existingDay) {
                existingDay.exercises.push(exercise)
              } else {
                acc.push({
                  date: date,
                  weight: entry.data.weight || null,
                  exercises: [exercise],
                  id: entry.id
                })
              }
              return acc
            }, [])
            .sort((a, b) => new Date(b.date) - new Date(a.date))

          if (workoutProgress.length > 0) {
            setProgressData(workoutProgress)
          }
        }
      } catch (error) {
        console.error('Error loading progress:', error)
      }
    }
    
    loadUserProgress()
  }, [])

  // Get current user
  const getCurrentUser = () => {
    const user = localStorage.getItem('currentUser')
    return user ? JSON.parse(user) : null
  }

  const updateUserProgress = (progressData) => {
    const currentUser = getCurrentUser()
    if (!currentUser) return

    // Update user's progress data
    const users = JSON.parse(localStorage.getItem('gymUsers') || '[]')
    const userIndex = users.findIndex(u => u.id === currentUser.id)
    
    if (userIndex !== -1) {
      users[userIndex].progressData = progressData
      localStorage.setItem('gymUsers', JSON.stringify(users))
      
      // Update current user in localStorage
      currentUser.progressData = progressData
      localStorage.setItem('currentUser', JSON.stringify(currentUser))
    }
  }

  // Progress Tracker State
  const [progressData, setProgressData] = useState(() => {
    const currentUser = getCurrentUser()
    return currentUser?.progressData || []
  })

  // Update setProgressData to also update user data
  const updateProgressData = (newData) => {
    setProgressData(newData)
    updateUserProgress(newData)
  }

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      logout()
      window.location.href = '/login'
    }
  }

  const currentUser = user || getCurrentUser()
  
  const [workoutType, setWorkoutType] = useState('cardio') // 'cardio' or 'weight'

  // Cardio entry state
  const [cardioEntry, setCardioEntry] = useState({
    date: new Date().toISOString().split('T')[0],
    weight: '',
    workout: '',
    duration: '',
    calories: '',
    notes: ''
  })

  // Weight training entry state
  const [weightEntry, setWeightEntry] = useState({
    date: new Date().toISOString().split('T')[0],
    bodyPart: '',
    exercise: '',
    numSets: '',
    sets: [],
    notes: ''
  })

  // Expanded exercise database by body part
  const exerciseDatabase = {
    'Chest': [
      'Bench Press', 'Incline Bench Press', 'Decline Bench Press', 'Dumbbell Flyes', 
      'Cable Crossover', 'Push-ups', 'Chest Dips', 'Dumbbell Bench Press', 
      'Incline Dumbbell Press', 'Decline Dumbbell Press', 'Machine Chest Press', 
      'Pec Deck Machine', 'Chest Press Machine', 'Wide Grip Push-ups', 
      'Decline Push-ups', 'Cable Flyes', 'Low Cable Crossover', 'High Cable Crossover',
      'Custom Exercise'
    ],
    'Back': [
      'Deadlift', 'Pull-ups', 'Barbell Rows', 'Lat Pulldown', 'Seated Cable Rows', 
      'T-Bar Rows', 'Face Pulls', 'Chin-ups', 'Wide Grip Pull-ups', 
      'Close Grip Pull-ups', 'Dumbbell Rows', 'Single Arm Dumbbell Row', 
      'Bent Over Rows', 'Pendlay Rows', 'Inverted Rows', 'Straight Arm Pulldown', 
      'Hyperextensions', 'Good Mornings', 'Rack Pulls', 'Meadows Rows',
      'Custom Exercise'
    ],
    'Shoulders': [
      'Overhead Press', 'Lateral Raises', 'Front Raises', 'Rear Delt Flyes', 
      'Arnold Press', 'Upright Rows', 'Shrugs', 'Military Press', 
      'Seated Dumbbell Press', 'Standing Dumbbell Press', 'Machine Shoulder Press',
      'Cable Lateral Raises', 'Dumbbell Lateral Raises', 'Reverse Pec Deck',
      'Bent Over Reverse Flyes', 'Face Pulls', 'Barbell Shrugs', 'Dumbbell Shrugs',
      'Front Plate Raise', 'Pike Push-ups', 'Handstand Push-ups',
      'Custom Exercise'
    ],
    'Biceps': [
      'Barbell Curls', 'Dumbbell Curls', 'Hammer Curls', 'Concentration Curls', 
      'Cable Curls', 'Preacher Curls', 'EZ Bar Curls', 'Incline Dumbbell Curls',
      'Spider Curls', 'Zottman Curls', '21s Curls', 'Reverse Curls',
      'Cable Hammer Curls', 'Machine Curls', 'Drag Curls', 'Chin-ups for Biceps',
      'Custom Exercise'
    ],
    'Triceps': [
      'Close-Grip Bench Press', 'Tricep Dips', 'Overhead Extension', 'Rope Pushdown', 
      'Skull Crushers', 'Diamond Push-ups', 'Dumbbell Kickbacks', 'Cable Kickbacks',
      'Overhead Cable Extension', 'French Press', 'JM Press', 'Tate Press',
      'Single Arm Cable Extension', 'Close Grip Push-ups', 'Bench Dips',
      'Machine Tricep Extension', 'V-Bar Pushdown',
      'Custom Exercise'
    ],
    'Legs': [
      'Squats', 'Leg Press', 'Romanian Deadlift', 'Lunges', 'Leg Curls', 
      'Leg Extensions', 'Calf Raises', 'Front Squats', 'Back Squats', 
      'Bulgarian Split Squats', 'Hack Squats', 'Goblet Squats', 'Sumo Squats',
      'Walking Lunges', 'Reverse Lunges', 'Step-ups', 'Box Jumps', 
      'Hamstring Curls', 'Seated Calf Raises', 'Standing Calf Raises',
      'Leg Press Calf Raises', 'Hip Thrusts', 'Glute Bridges', 'Stiff Leg Deadlift',
      'Custom Exercise'
    ],
    'Core': [
      'Planks', 'Crunches', 'Russian Twists', 'Leg Raises', 'Cable Crunches', 
      'Ab Wheel Rollouts', 'Mountain Climbers', 'Side Planks', 'Bicycle Crunches',
      'Reverse Crunches', 'Hanging Leg Raises', 'Hanging Knee Raises', 
      'Flutter Kicks', 'Scissor Kicks', 'Dead Bug', 'Bird Dog', 'V-Ups',
      'Toe Touches', 'Plank Jacks', 'Dragon Flags', 'Windshield Wipers',
      'Custom Exercise'
    ]
  }

  const [customExercise, setCustomExercise] = useState('')
  const [expandedDays, setExpandedDays] = useState({})

  // Voice Coach State
  const [isVoiceActive, setIsVoiceActive] = useState(false)
  const [voiceWorkout, setVoiceWorkout] = useState({
    exercise: '',
    sets: 3,
    reps: 10,
    restTime: 60
  })
  const [currentSet, setCurrentSet] = useState(0)
  const [currentRep, setCurrentRep] = useState(0)
  const [workoutPhase, setWorkoutPhase] = useState('idle') // idle, exercising, resting
  const [timer, setTimer] = useState(0)

  // Text-to-Speech function
  const speak = (text, pitch = 1, rate = 1) => {
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel()
      
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.pitch = pitch
      utterance.rate = rate
      utterance.volume = 1
      
      // Use a more energetic voice if available
      const voices = window.speechSynthesis.getVoices()
      const preferredVoice = voices.find(voice => 
        voice.name.includes('Google') || voice.name.includes('Samantha')
      )
      if (preferredVoice) {
        utterance.voice = preferredVoice
      }
      
      window.speechSynthesis.speak(utterance)
    }
  }

  // Start Voice-Guided Workout
  const startVoiceWorkout = () => {
    if (!voiceWorkout.exercise) {
      alert('Please enter an exercise name')
      return
    }
    
    setIsVoiceActive(true)
    setCurrentSet(1)
    setCurrentRep(0)
    setWorkoutPhase('exercising')
    
    speak(`Let's begin! Starting ${voiceWorkout.exercise}. Set 1 of ${voiceWorkout.sets}. Ready? Go!`, 1.2, 1.1)
    
    // Start rep counting
    const repInterval = setInterval(() => {
      setCurrentRep(prev => {
        const newRep = prev + 1
        if (newRep <= voiceWorkout.reps) {
          // Count every rep
          speak(`${newRep}`, 1, 1.3)
          
          // Motivation at halfway
          if (newRep === Math.floor(voiceWorkout.reps / 2)) {
            setTimeout(() => speak('Halfway there! Keep pushing!', 1.1, 1.1), 500)
          }
          
          // Final reps motivation
          if (newRep === voiceWorkout.reps - 2) {
            setTimeout(() => speak('Last three! Give it your all!', 1.2, 1.1), 500)
          }
          
          return newRep
        } else {
          clearInterval(repInterval)
          completeSet()
          return prev
        }
      })
    }, 2500) // Count every 2.5 seconds
    
    // Store interval ID
    voiceWorkout.intervalId = repInterval
  }

  // Complete current set
  const completeSet = () => {
    if (currentSet < voiceWorkout.sets) {
      setWorkoutPhase('resting')
      speak(`Great work! Set ${currentSet} complete. Rest for ${voiceWorkout.restTime} seconds.`, 1.1, 1)
      
      // Rest timer
      let restRemaining = voiceWorkout.restTime
      setTimer(restRemaining)
      
      const restInterval = setInterval(() => {
        restRemaining -= 1
        setTimer(restRemaining)
        
        // Countdown alerts
        if (restRemaining === 10) {
          speak('10 seconds remaining', 1, 1.1)
        } else if (restRemaining === 5) {
          speak('5 seconds', 1, 1.2)
        } else if (restRemaining === 3) {
          speak('3', 1.2, 1.2)
        } else if (restRemaining === 2) {
          speak('2', 1.2, 1.2)
        } else if (restRemaining === 1) {
          speak('1', 1.2, 1.2)
        } else if (restRemaining <= 0) {
          clearInterval(restInterval)
          startNextSet()
        }
      }, 1000)
    } else {
      finishWorkout()
    }
  }

  // Start next set
  const startNextSet = () => {
    const nextSet = currentSet + 1
    setCurrentSet(nextSet)
    setCurrentRep(0)
    setWorkoutPhase('exercising')
    
    speak(`Set ${nextSet} of ${voiceWorkout.sets}. Let's go!`, 1.2, 1.1)
    
    // Start rep counting for new set
    const repInterval = setInterval(() => {
      setCurrentRep(prev => {
        const newRep = prev + 1
        if (newRep <= voiceWorkout.reps) {
          speak(`${newRep}`, 1, 1.3)
          
          if (newRep === Math.floor(voiceWorkout.reps / 2)) {
            setTimeout(() => speak('Keep going! Looking strong!', 1.1, 1.1), 500)
          }
          
          if (newRep === voiceWorkout.reps - 2) {
            setTimeout(() => speak('Final reps! Push through!', 1.2, 1.1), 500)
          }
          
          return newRep
        } else {
          clearInterval(repInterval)
          completeSet()
          return prev
        }
      })
    }, 2500)
  }

  // Finish workout
  const finishWorkout = () => {
    setWorkoutPhase('idle')
    setIsVoiceActive(false)
    speak(`Awesome job! You completed all ${voiceWorkout.sets} sets of ${voiceWorkout.exercise}! Great work today!`, 1.2, 1)
    
    // Save workout to progress
    saveUserProgress('voice_workout', {
      exercise: voiceWorkout.exercise,
      sets: voiceWorkout.sets,
      reps: voiceWorkout.reps,
      completedAt: new Date().toISOString()
    })
  }

  // Stop workout
  const stopVoiceWorkout = () => {
    window.speechSynthesis.cancel()
    setIsVoiceActive(false)
    setWorkoutPhase('idle')
    setCurrentSet(0)
    setCurrentRep(0)
    setTimer(0)
    speak('Workout stopped. Great effort!', 1, 1)
  }

  // AI Chatbot Feature - Now using real AI!
  const handleChatSubmit = async (e) => {
    e.preventDefault()
    if (!chatInput.trim()) return

    const userMessage = { role: 'user', content: chatInput }
    const newMessages = [...chatMessages, userMessage]
    setChatMessages(newMessages)
    setChatInput('')
    setIsLoading(true)

    try {
      // Call AI service (uses OpenAI API if configured, else fallback)
      const aiResponse = await getAIChatResponse(chatInput, chatMessages)
      const assistantMessage = { role: 'assistant', content: aiResponse }
      setChatMessages(prev => [...prev, assistantMessage])
      
      // Save chat conversation to backend
      await saveUserProgress('ai_chat', {
        userMessage: chatInput,
        aiResponse: aiResponse,
        timestamp: new Date().toISOString()
      })
    } catch (error) {
      console.error('Chat error:', error)
      setChatMessages(prev => [...prev, { 
        role: 'assistant', 
        content: '❌ Sorry, I encountered an error. Please try again or check your API configuration.' 
      }])
    } finally {
      setIsLoading(false)
    }
  }

  // AI Meal Planner - Enhanced with AI
  const [mealPreferences, setMealPreferences] = useState({
    calories: 2500,
    dietType: 'veg',
    allergies: ''
  })
  const [generatedMeals, setGeneratedMeals] = useState(null)
  const [mealVariationCount, setMealVariationCount] = useState(0)

  const generateMealPlan = async (isVariation = false) => {
    setIsLoading(true)
    try {
      // Add variation request to preferences
      const preferencesWithVariation = {
        ...mealPreferences,
        variation: isVariation ? mealVariationCount + 1 : 0,
        requestType: isVariation ? 'variation' : 'new'
      }
      
      const meals = await generateAIMealPlan(preferencesWithVariation)
      setGeneratedMeals(meals)
      
      if (isVariation) {
        setMealVariationCount(prev => prev + 1)
      } else {
        setMealVariationCount(0)
      }

      // Save to backend
      await saveUserProgress('meal_plan', {
        preferences: preferencesWithVariation,
        mealPlan: meals,
        generatedAt: new Date().toISOString()
      })
    } catch (error) {
      console.error('Meal plan error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // AI Form Analyzer with Real Camera and Continuous Analysis
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [formFeedback, setFormFeedback] = useState(null)
  const [cameraActive, setCameraActive] = useState(false)
  const [selectedExercise, setSelectedExercise] = useState('squat')
  const [videoStream, setVideoStream] = useState(null)
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const [capturedFrame, setCapturedFrame] = useState(null)
  const [recordedVideo, setRecordedVideo] = useState(null)
  const [isRecording, setIsRecording] = useState(false)
  const [recordingDuration, setRecordingDuration] = useState(0)
  const [liveFormIssues, setLiveFormIssues] = useState([])
  const mediaRecorderRef = useRef(null)
  const recordingTimerRef = useRef(null)
  const analysisIntervalRef = useRef(null)
  const detectorRef = useRef(null)
  const [poseDetectorLoaded, setPoseDetectorLoaded] = useState(false)
  const previousPoseRef = useRef(null)
  const issueCounterRef = useRef({})
  const [showSkeleton, setShowSkeleton] = useState(true)
  const [poseDetected, setPoseDetected] = useState(false)
  const poseDetectedDuringRecordingRef = useRef(false)

  // PR Tracker State - User Specific
  const [personalRecords, setPersonalRecords] = useState(() => {
    if (!user) return []
    const saved = localStorage.getItem(`personalRecords_${user.id}`)
    return saved ? JSON.parse(saved) : []
  })
  const [newPR, setNewPR] = useState({
    exercise: '',
    weight: '',
    reps: '',
    date: new Date().toISOString().split('T')[0]
  })
  const [prFilter, setPrFilter] = useState('all')

  // Body Transformation Tracker State - User Specific
  const [transformationPhotos, setTransformationPhotos] = useState(() => {
    if (!user) return []
    const saved = localStorage.getItem(`transformationPhotos_${user.id}`)
    return saved ? JSON.parse(saved) : []
  })
  const [measurements, setMeasurements] = useState(() => {
    if (!user) return []
    const saved = localStorage.getItem(`bodyMeasurements_${user.id}`)
    return saved ? JSON.parse(saved) : []
  })
  const [newMeasurement, setNewMeasurement] = useState({
    date: new Date().toISOString().split('T')[0],
    weight: '',
    bodyFat: '',
    chest: '',
    waist: '',
    hips: '',
    biceps: '',
    thighs: '',
    notes: ''
  })
  const [photoUploadType, setPhotoUploadType] = useState('front')
  const [selectedComparePhotos, setSelectedComparePhotos] = useState({ before: null, after: null })

  // Workout Generator States
  const [workoutGoal, setWorkoutGoal] = useState('muscle-building')
  const [fitnessLevel, setFitnessLevel] = useState('beginner')
  const [workoutDays, setWorkoutDays] = useState('3')
  const [workoutDuration, setWorkoutDuration] = useState('45')
  const [equipment, setEquipment] = useState('full-gym')
  const [generatedWorkout, setGeneratedWorkout] = useState(null)
  const [generatingWorkout, setGeneratingWorkout] = useState(false)

  // Load user-specific data when user changes
  useEffect(() => {
    if (user) {
      const savedPRs = localStorage.getItem(`personalRecords_${user.id}`)
      setPersonalRecords(savedPRs ? JSON.parse(savedPRs) : [])

      const savedPhotos = localStorage.getItem(`transformationPhotos_${user.id}`)
      setTransformationPhotos(savedPhotos ? JSON.parse(savedPhotos) : [])

      const savedMeasurements = localStorage.getItem(`bodyMeasurements_${user.id}`)
      setMeasurements(savedMeasurements ? JSON.parse(savedMeasurements) : [])
    } else {
      setPersonalRecords([])
      setTransformationPhotos([])
      setMeasurements([])
    }
  }, [user])

  // Load pose detection model
  useEffect(() => {
    const loadPoseDetector = async () => {
      try {
        await tf.ready()
        const detectorConfig = {
          modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
          enableSmoothing: true,
          minPoseScore: 0.3
        }
        const detector = await poseDetection.createDetector(
          poseDetection.SupportedModels.MoveNet,
          detectorConfig
        )
        detectorRef.current = detector
        setPoseDetectorLoaded(true)
        console.log('Pose detector loaded successfully')
      } catch (error) {
        console.error('Failed to load pose detector:', error)
      }
    }
    loadPoseDetector()
  }, [])

  // Ensure video stream is properly connected when camera activates
  useEffect(() => {
    if (videoStream && videoRef.current && cameraActive) {
      videoRef.current.srcObject = videoStream
    }
  }, [videoStream, cameraActive])

  // Start camera
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: 1280, 
          height: 720,
          facingMode: 'user'
        } 
      })
      setVideoStream(stream)
      setCameraActive(true)
      
      speak('Camera activated. Start recording when you are ready to perform your exercise.', 1, 1)
    } catch (err) {
      alert('Camera access denied. Please allow camera access to use form analysis.')
      console.error('Camera error:', err)
    }
  }

  // Stop camera
  const stopCamera = () => {
    if (isRecording) {
      stopRecording()
    }
    if (videoStream) {
      videoStream.getTracks().forEach(track => track.stop())
      setVideoStream(null)
    }
    setCameraActive(false)
    setLiveFormIssues([])
  }

  // Start recording and real-time analysis
  const startRecording = () => {
    if (!cameraActive || !videoStream) {
      alert('Please start the camera first')
      return
    }

    setIsRecording(true)
    setRecordingDuration(0)
    setLiveFormIssues([])
    setFormFeedback(null)
    previousPoseRef.current = null
    issueCounterRef.current = {}
    poseDetectedDuringRecordingRef.current = false
    
    // Setup MediaRecorder to record the video
    const mediaRecorder = new MediaRecorder(videoStream, {
      mimeType: 'video/webm'
    })
    mediaRecorderRef.current = mediaRecorder
    
    const chunks = []
    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        chunks.push(e.data)
      }
    }
    
    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' })
      const videoUrl = URL.createObjectURL(blob)
      setRecordedVideo(videoUrl)
    }
    
    mediaRecorder.start()
    
    // Start duration timer
    recordingTimerRef.current = setInterval(() => {
      setRecordingDuration(prev => prev + 1)
    }, 1000)
    
    // Start real-time frame analysis (analyze every 500ms)
    analysisIntervalRef.current = setInterval(() => {
      analyzeCurrentFrame()
    }, 500)
    
    speak(`Recording started. Perform your ${selectedExercise.replace('-', ' ')} now.`, 1.1, 1)
  }

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current)
      }
      
      if (analysisIntervalRef.current) {
        clearInterval(analysisIntervalRef.current)
      }
      
      // Generate final analysis
      generateFinalAnalysis()
      
      speak('Recording stopped. Generating your detailed form analysis.', 1, 1)
    }
  }

  // Analyze current frame in real-time using pose detection
  const analyzeCurrentFrame = async () => {
    if (!videoRef.current || !detectorRef.current || !isRecording) return
    
    try {
      const poses = await detectorRef.current.estimatePoses(videoRef.current)
      
      if (poses.length > 0) {
        const pose = poses[0]
        const keypoints = pose.keypoints
        
        // Draw skeleton on canvas if enabled
        if (showSkeleton && canvasRef.current) {
          drawSkeleton(keypoints)
        }
        
        // Only analyze if person is detected with good confidence
        const avgConfidence = keypoints.reduce((sum, kp) => sum + kp.score, 0) / keypoints.length
        
        if (avgConfidence > 0.4) {
          setPoseDetected(true)
          poseDetectedDuringRecordingRef.current = true
          poseDetectedDuringRecordingRef.current = true
          
          // Check for movement (compare with previous pose)
          if (previousPoseRef.current) {
            const movement = calculateMovement(previousPoseRef.current, keypoints)
            // Only analyze if there's significant movement (person is actually exercising)
            if (movement > 5) {
              const issues = analyzeFormWithPose(keypoints, selectedExercise, recordingDuration)
              if (issues.length > 0) {
                // Avoid duplicate issues within 2 seconds
                const newIssues = issues.filter(issue => {
                  const issueKey = issue.split('[')[0]
                  const lastTime = issueCounterRef.current[issueKey] || 0
                  if (recordingDuration - lastTime >= 2) {
                    issueCounterRef.current[issueKey] = recordingDuration
                    return true
                  }
                  return false
                })
                if (newIssues.length > 0) {
                  setLiveFormIssues(prev => [...prev, ...newIssues])
                }
              }
            }
          }
          
          previousPoseRef.current = keypoints
        } else {
          setPoseDetected(false)
        }
      } else {
        setPoseDetected(false)
      }
    } catch (error) {
      console.error('Pose detection error:', error)
    }
  }

  // Draw skeleton overlay on canvas
  const drawSkeleton = (keypoints) => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    canvas.width = videoRef.current.videoWidth
    canvas.height = videoRef.current.videoHeight
    
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    
    // Draw keypoints
    keypoints.forEach(keypoint => {
      if (keypoint.score > 0.3) {
        ctx.beginPath()
        ctx.arc(keypoint.x, keypoint.y, 5, 0, 2 * Math.PI)
        ctx.fillStyle = '#00ff00'
        ctx.fill()
        ctx.strokeStyle = '#ffffff'
        ctx.lineWidth = 2
        ctx.stroke()
      }
    })
    
    // Draw skeleton connections
    const connections = [
      ['left_shoulder', 'right_shoulder'],
      ['left_shoulder', 'left_elbow'],
      ['left_elbow', 'left_wrist'],
      ['right_shoulder', 'right_elbow'],
      ['right_elbow', 'right_wrist'],
      ['left_shoulder', 'left_hip'],
      ['right_shoulder', 'right_hip'],
      ['left_hip', 'right_hip'],
      ['left_hip', 'left_knee'],
      ['left_knee', 'left_ankle'],
      ['right_hip', 'right_knee'],
      ['right_knee', 'right_ankle']
    ]
    
    ctx.strokeStyle = '#00ff00'
    ctx.lineWidth = 3
    
    connections.forEach(([start, end]) => {
      const startPoint = keypoints.find(kp => kp.name === start)
      const endPoint = keypoints.find(kp => kp.name === end)
      
      if (startPoint?.score > 0.3 && endPoint?.score > 0.3) {
        ctx.beginPath()
        ctx.moveTo(startPoint.x, startPoint.y)
        ctx.lineTo(endPoint.x, endPoint.y)
        ctx.stroke()
      }
    })
  }

  // Calculate movement between two poses
  const calculateMovement = (prevKeypoints, currentKeypoints) => {
    let totalMovement = 0
    const importantPoints = ['left_hip', 'right_hip', 'left_knee', 'right_knee', 'left_shoulder', 'right_shoulder']
    
    importantPoints.forEach(pointName => {
      const prev = prevKeypoints.find(kp => kp.name === pointName)
      const curr = currentKeypoints.find(kp => kp.name === pointName)
      if (prev && curr && prev.score > 0.3 && curr.score > 0.3) {
        const dx = curr.x - prev.x
        const dy = curr.y - prev.y
        totalMovement += Math.sqrt(dx * dx + dy * dy)
      }
    })
    
    return totalMovement
  }

  // Analyze form with actual pose keypoints
  const analyzeFormWithPose = (keypoints, exercise, timestamp) => {
    const issues = []
    
    // Helper function to get keypoint by name
    const getKeypoint = (name) => keypoints.find(kp => kp.name === name)
    
    // Helper to calculate angle between three points
    const calculateAngle = (p1, p2, p3) => {
      const radians = Math.atan2(p3.y - p2.y, p3.x - p2.x) - Math.atan2(p1.y - p2.y, p1.x - p2.x)
      let angle = Math.abs((radians * 180.0) / Math.PI)
      if (angle > 180) angle = 360 - angle
      return angle
    }

    // Get key body points
    const leftShoulder = getKeypoint('left_shoulder')
    const rightShoulder = getKeypoint('right_shoulder')
    const leftHip = getKeypoint('left_hip')
    const rightHip = getKeypoint('right_hip')
    const leftKnee = getKeypoint('left_knee')
    const rightKnee = getKeypoint('right_knee')
    const leftAnkle = getKeypoint('left_ankle')
    const rightAnkle = getKeypoint('right_ankle')
    const leftElbow = getKeypoint('left_elbow')
    const rightElbow = getKeypoint('right_elbow')
    const leftWrist = getKeypoint('left_wrist')
    const rightWrist = getKeypoint('right_wrist')

    // Higher confidence threshold for more accurate detection
    const minConfidence = 0.5

    if (exercise === 'squat') {
      // Check knee valgus (knees caving in) - more precise calculation
      if (leftKnee?.score > minConfidence && leftAnkle?.score > minConfidence && leftHip?.score > minConfidence) {
        const kneeAnkleDistance = Math.abs(leftKnee.x - leftAnkle.x)
        const hipKneeDistance = Math.abs(leftHip.x - leftKnee.x)
        
        // Knee should be roughly aligned with ankle, not past it
        if (kneeAnkleDistance > hipKneeDistance * 0.6) {
          issues.push(`⚠️ [${timestamp}s] Left knee tracking inward - push knees out`)
        }
      }
      
      if (rightKnee?.score > minConfidence && rightAnkle?.score > minConfidence && rightHip?.score > minConfidence) {
        const kneeAnkleDistance = Math.abs(rightKnee.x - rightAnkle.x)
        const hipKneeDistance = Math.abs(rightHip.x - rightKnee.x)
        
        if (kneeAnkleDistance > hipKneeDistance * 0.6) {
          issues.push(`⚠️ [${timestamp}s] Right knee tracking inward - push knees out`)
        }
      }

      // Check squat depth with better precision
      if (leftHip?.score > minConfidence && leftKnee?.score > minConfidence && leftAnkle?.score > minConfidence) {
        const hipKneeAngle = calculateAngle(leftHip, leftKnee, leftAnkle)
        
        // Parallel squat is around 90 degrees, anything above 110 is too shallow
        if (hipKneeAngle > 110 && hipKneeAngle < 160) {
          issues.push(`⚠️ [${timestamp}s] Squat depth too shallow - go lower for parallel`)
        }
      }

      // Check forward lean (torso angle)
      if (leftShoulder?.score > minConfidence && leftHip?.score > minConfidence && leftKnee?.score > minConfidence) {
        const torsoAngle = calculateAngle(leftKnee, leftHip, leftShoulder)
        
        // If torso leans too far forward (angle too acute)
        if (torsoAngle < 45) {
          issues.push(`⚠️ [${timestamp}s] Excessive forward lean - keep chest up`)
        }
      }
    }

    if (exercise === 'pushup') {
      // Check body alignment (plank position)
      if (leftShoulder?.score > minConfidence && leftHip?.score > minConfidence && leftAnkle?.score > minConfidence) {
        const shoulderHipDiff = Math.abs(leftShoulder.y - leftHip.y)
        const hipAnkleDiff = Math.abs(leftHip.y - leftAnkle.y)
        
        // Body should form relatively straight line
        const alignment = Math.abs(shoulderHipDiff - hipAnkleDiff)
        
        if (shoulderHipDiff > 60) {
          issues.push(`⚠️ [${timestamp}s] Hips sagging - tighten your core`)
        } else if (hipAnkleDiff > 60) {
          issues.push(`⚠️ [${timestamp}s] Hips piking up - lower them`)
        }
      }

      // Check range of motion (elbow bend)
      if (leftShoulder?.score > minConfidence && leftElbow?.score > minConfidence && leftWrist?.score > minConfidence) {
        const elbowAngle = calculateAngle(leftShoulder, leftElbow, leftWrist)
        
        // Proper pushup: elbow should bend to about 90 degrees at bottom
        if (elbowAngle > 140 && elbowAngle < 170) {
          issues.push(`⚠️ [${timestamp}s] Not going deep enough - lower chest`)
        }
      }
    }

    if (exercise === 'plank') {
      // Check body alignment - should be straight line
      if (leftShoulder?.score > minConfidence && leftHip?.score > minConfidence && leftAnkle?.score > minConfidence) {
        const shoulderY = leftShoulder.y
        const hipY = leftHip.y
        const ankleY = leftAnkle.y
        
        // Calculate deviation from straight line
        const expectedHipY = (shoulderY + ankleY) / 2
        const deviation = Math.abs(hipY - expectedHipY)
        
        if (deviation > 30) {
          if (hipY > expectedHipY + 20) {
            issues.push(`⚠️ [${timestamp}s] Hips sagging - engage core and squeeze glutes`)
          } else if (hipY < expectedHipY - 20) {
            issues.push(`⚠️ [${timestamp}s] Hips too high - lower to form straight line`)
          }
        }
      }
    }

    if (exercise === 'deadlift') {
      // Check back position (should be neutral, not rounded)
      if (leftShoulder?.score > minConfidence && leftHip?.score > minConfidence && leftKnee?.score > minConfidence) {
        const backAngle = calculateAngle(leftKnee, leftHip, leftShoulder)
        
        // Back should maintain angle, if too curved it's rounding
        if (backAngle < 140) {
          issues.push(`⚠️ [${timestamp}s] Lower back rounding - keep neutral spine`)
        }
      }
      
      // Check if hips rise too fast
      if (leftHip?.score > minConfidence && leftShoulder?.score > minConfidence) {
        const hipShoulderRatio = Math.abs(leftHip.y - leftShoulder.y)
        
        if (hipShoulderRatio < 50) {
          issues.push(`⚠️ [${timestamp}s] Hips rising too fast - maintain back angle`)
        }
      }
    }

    return issues
  }

  // Generate final comprehensive analysis
  const generateFinalAnalysis = () => {
    setIsAnalyzing(true)
    
    // Capture final frame
    const video = videoRef.current
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')
    ctx.drawImage(video, 0, 0)
    const frameData = canvas.toDataURL('image/jpeg')
    setCapturedFrame(frameData)
    
    setTimeout(() => {
      // If no pose was ever detected, don't analyze
      if (!poseDetectedDuringRecordingRef.current) {
        setFormFeedback({
          exercise: selectedExercise.replace('-', ' ').toUpperCase(),
          score: 0,
          feedback: [
            '❌ No body detected during recording',
            '⚠️ Make sure you are in frame and well-lit',
            '💡 Step back from camera so full body is visible',
            '💡 Try recording again with better positioning'
          ],
          duration: recordingDuration
        })
        setIsAnalyzing(false)
        speak('No body was detected during recording. Please ensure you are fully visible in the frame and try again.', 1, 1)
        return
      }
      
      const uniqueIssues = [...new Set(liveFormIssues)]
      const issueCount = uniqueIssues.length
      
      // Calculate score based on detected issues and duration
      let baseScore = 95
      const deduction = Math.min(issueCount * 4, 30)
      const finalScore = Math.max(baseScore - deduction, 60)
      
      // Build feedback dynamically based on what was actually detected
      const feedback = []
      
      // Add rep count if movement was detected
      if (recordingDuration >= 3) {
        const estimatedReps = selectedExercise === 'plank' 
          ? null 
          : Math.floor(recordingDuration / (selectedExercise === 'deadlift' ? 4 : 3))
        
        if (estimatedReps) {
          feedback.push(`📊 Estimated reps: ${estimatedReps}`)
        } else {
          feedback.push(`📊 Hold duration: ${recordingDuration} seconds`)
        }
      } else {
        feedback.push(`⏱️ Recording too short - record at least 3-5 reps for accurate analysis`)
      }
      
      // Add issue summary
      if (issueCount === 0) {
        feedback.push(`✅ No major form issues detected!`)
        feedback.push(`✓ Good form maintained throughout the movement`)
      } else {
        feedback.push(`⚠️ Form issues detected: ${issueCount}`)
        // Add the actual detected issues
        uniqueIssues.forEach(issue => {
          feedback.push(issue)
        })
      }
      
      // Add exercise-specific tips only if relevant
      if (issueCount === 0) {
        const tips = {
          squat: [
            '💡 Excellent! Keep this form and gradually increase weight',
            '💡 Remember to brace your core before each rep'
          ],
          deadlift: [
            '💡 Great form! Focus on bar speed consistency',
            '💡 Keep pulling the slack out before each lift'
          ],
          'bench-press': [
            '💡 Solid technique! Maintain shoulder retraction',
            '💡 Drive through your feet for more power'
          ],
          pushup: [
            '💡 Perfect form! Try elevating feet for more challenge',
            '💡 Control both the descent and ascent phases'
          ],
          plank: [
            '💡 Strong hold! Try increasing duration gradually',
            '💡 Focus on maintaining this alignment under fatigue'
          ]
        }
        feedback.push(...(tips[selectedExercise] || tips.squat))
      } else {
        // Add corrective tips based on detected issues
        const corrections = {
          squat: '💡 Next session: Focus on depth and knee tracking',
          deadlift: '💡 Next session: Work on maintaining neutral spine',
          'bench-press': '💡 Next session: Practice shoulder blade retraction',
          pushup: '💡 Next session: Film from side for better depth check',
          plank: '💡 Next session: Use a mirror to check alignment'
        }
        feedback.push(corrections[selectedExercise] || corrections.squat)
      }
      
      setFormFeedback({
        exercise: selectedExercise.replace('-', ' ').toUpperCase(),
        score: finalScore,
        feedback: feedback,
        duration: recordingDuration
      })
      
      setIsAnalyzing(false)
      
      const scoreMessage = finalScore >= 85 ? 'Excellent work!' : finalScore >= 70 ? 'Good form with room for improvement' : 'Focus on the corrections provided'
      speak(`Analysis complete. Your form score is ${finalScore} out of 100. ${scoreMessage}`, 1, 1)
      
      // Save to backend
      if (user) {
        saveUserProgress({
          type: 'form_analysis',
          exercise: selectedExercise,
          score: finalScore,
          duration: recordingDuration,
          issues: issueCount
        })
      }
    }, 2000)
  }

  // Reset form analyzer
  const resetFormAnalysis = () => {
    setFormFeedback(null)
    setCapturedFrame(null)
    setRecordedVideo(null)
    setRecordingDuration(0)
    setLiveFormIssues([])
  }

  // PR Tracker Functions
  const addPersonalRecord = () => {
    if (!newPR.exercise || !newPR.weight || !newPR.reps) {
      alert('Please fill in all PR fields')
      return
    }

    const pr = {
      id: Date.now(),
      ...newPR,
      weight: parseFloat(newPR.weight),
      reps: parseInt(newPR.reps),
      oneRepMax: calculateOneRepMax(parseFloat(newPR.weight), parseInt(newPR.reps))
    }

    const updated = [pr, ...personalRecords]
    setPersonalRecords(updated)
    if (user) {
      localStorage.setItem(`personalRecords_${user.id}`, JSON.stringify(updated))
    }
    
    setNewPR({
      exercise: '',
      weight: '',
      reps: '',
      date: new Date().toISOString().split('T')[0]
    })

    speak(`New personal record added! ${newPR.exercise}: ${newPR.weight} kg for ${newPR.reps} reps!`, 1.1, 1)
    
    // Save to backend
    if (user) {
      saveUserProgress({
        type: 'personal_record',
        exercise: newPR.exercise,
        weight: parseFloat(newPR.weight),
        reps: parseInt(newPR.reps),
        oneRepMax: pr.oneRepMax
      })
    }
  }

  const calculateOneRepMax = (weight, reps) => {
    if (reps === 1) return weight
    // Brzycki formula
    return Math.round(weight * (36 / (37 - reps)) * 10) / 10
  }

  const deletePersonalRecord = (id) => {
    if (confirm('Delete this personal record?')) {
      const updated = personalRecords.filter(pr => pr.id !== id)
      setPersonalRecords(updated)
      if (user) {
        localStorage.setItem(`personalRecords_${user.id}`, JSON.stringify(updated))
      }
    }
  }

  const getExerciseBest = (exercise) => {
    const exercisePRs = personalRecords.filter(pr => pr.exercise === exercise)
    if (exercisePRs.length === 0) return null
    return exercisePRs.reduce((best, current) => 
      current.oneRepMax > best.oneRepMax ? current : best
    )
  }

  const getAllExercises = () => {
    return [...new Set(personalRecords.map(pr => pr.exercise))]
  }

  // Body Transformation Functions
  const addTransformationPhoto = (event) => {
    const file = event.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const photo = {
        id: Date.now(),
        url: e.target.result,
        type: photoUploadType,
        date: new Date().toISOString().split('T')[0],
        timestamp: Date.now()
      }

      const updated = [photo, ...transformationPhotos]
      setTransformationPhotos(updated)
      if (user) {
        localStorage.setItem(`transformationPhotos_${user.id}`, JSON.stringify(updated))
      }
      
      speak(`${photoUploadType} photo added to your transformation gallery`, 1, 1)
    }
    reader.readAsDataURL(file)
  }

  const deleteTransformationPhoto = (id) => {
    if (confirm('Delete this photo?')) {
      const updated = transformationPhotos.filter(photo => photo.id !== id)
      setTransformationPhotos(updated)
      if (user) {
        localStorage.setItem(`transformationPhotos_${user.id}`, JSON.stringify(updated))
      }
    }
  }

  const addMeasurement = () => {
    if (!newMeasurement.weight) {
      alert('Please enter at least your weight')
      return
    }

    const measurement = {
      id: Date.now(),
      ...newMeasurement,
      weight: parseFloat(newMeasurement.weight),
      bodyFat: newMeasurement.bodyFat ? parseFloat(newMeasurement.bodyFat) : null,
      chest: newMeasurement.chest ? parseFloat(newMeasurement.chest) : null,
      waist: newMeasurement.waist ? parseFloat(newMeasurement.waist) : null,
      hips: newMeasurement.hips ? parseFloat(newMeasurement.hips) : null,
      biceps: newMeasurement.biceps ? parseFloat(newMeasurement.biceps) : null,
      thighs: newMeasurement.thighs ? parseFloat(newMeasurement.thighs) : null
    }

    const updated = [measurement, ...measurements]
    setMeasurements(updated)
    if (user) {
      localStorage.setItem(`bodyMeasurements_${user.id}`, JSON.stringify(updated))
    }
    
    setNewMeasurement({
      date: new Date().toISOString().split('T')[0],
      weight: '',
      bodyFat: '',
      chest: '',
      waist: '',
      hips: '',
      biceps: '',
      thighs: '',
      notes: ''
    })

    speak('Body measurement recorded successfully', 1, 1)
    
    // Save to backend
    if (user) {
      saveUserProgress({
        type: 'body_measurement',
        ...measurement
      })
    }
  }

  const deleteMeasurement = (id) => {
    if (confirm('Delete this measurement?')) {
      const updated = measurements.filter(m => m.id !== id)
      setMeasurements(updated)
      if (user) {
        localStorage.setItem(`bodyMeasurements_${user.id}`, JSON.stringify(updated))
      }
    }
  }

  const getMeasurementProgress = () => {
    if (measurements.length < 2) return null
    
    const latest = measurements[0]
    const oldest = measurements[measurements.length - 1]
    
    return {
      weight: {
        current: latest.weight,
        start: oldest.weight,
        change: latest.weight - oldest.weight
      },
      bodyFat: latest.bodyFat && oldest.bodyFat ? {
        current: latest.bodyFat,
        start: oldest.bodyFat,
        change: latest.bodyFat - oldest.bodyFat
      } : null,
      chest: latest.chest && oldest.chest ? {
        current: latest.chest,
        start: oldest.chest,
        change: latest.chest - oldest.chest
      } : null,
      waist: latest.waist && oldest.waist ? {
        current: latest.waist,
        start: oldest.waist,
        change: latest.waist - oldest.waist
      } : null
    }
  }

  // AI Workout Generator Function
  const generateWorkoutPlan = async () => {
    setGeneratingWorkout(true)
    setGeneratedWorkout(null)

    try {
      const response = await generateAIWorkoutPlan({
        goal: workoutGoal,
        level: fitnessLevel,
        days: workoutDays,
        duration: workoutDuration,
        equipment: equipment
      })
      setGeneratedWorkout(response)
    } catch (error) {
      console.error('Error generating workout:', error)
      setGeneratedWorkout('Sorry, I couldn\'t generate a workout plan right now. Please try again.')
    } finally {
      setGeneratingWorkout(false)
    }
  }


  return (
    <div className="ai-features-page">
      <div className="container">
        <div className="user-profile-header">
          <div className="user-info">
            <div className="user-avatar">{currentUser?.name?.charAt(0).toUpperCase() || '👤'}</div>
            <div className="user-details">
              <h3>Welcome, {currentUser?.name || 'Guest'}!</h3>
              <p>{currentUser?.email || ''}</p>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            🚪 Logout
          </button>
        </div>

        {/* Quick Stats Widget */}
        <QuickStats />

        {/* Unit Toggle */}
        <UnitToggle />

        <h1>🤖 AI-Powered Fitness Features</h1>
        <p className="subtitle">Next-generation training powered by artificial intelligence</p>

        {/* Feature Cards */}
        <div className="ai-features-grid">
          <div className="ai-feature-card" onClick={() => setActiveFeature('chatbot')}>
            <div className="feature-icon">💬</div>
            <h3>AI Fitness Chatbot</h3>
            <p>Get instant answers to your fitness questions 24/7</p>
          </div>

          <div className="ai-feature-card" onClick={() => setActiveFeature('meal-planner')}>
            <div className="feature-icon">🍽️</div>
            <h3>AI Meal Planner</h3>
            <p>Generate personalized meal plans based on your goals</p>
          </div>

          <div className="ai-feature-card" onClick={() => setActiveFeature('workout-generator')}>
            <div className="feature-icon">🏋️</div>
            <h3>AI Workout Generator</h3>
            <p>Generate personalized workout plans based on your goals</p>
          </div>

          <div className="ai-feature-card" onClick={() => setActiveFeature('form-analyzer')}>
            <div className="feature-icon">📹</div>
            <h3>AI Form Analyzer</h3>
            <p>Real-time exercise form correction using computer vision</p>
          </div>

          <div className="ai-feature-card" onClick={() => setActiveFeature('progress')}>
            <div className="feature-icon">📊</div>
            <h3>AI Progress Tracker</h3>
            <p>Smart analytics and predictions for your fitness journey</p>
          </div>

          <div className="ai-feature-card" onClick={() => setActiveFeature('voice-coach')}>
            <div className="feature-icon">🎙️</div>
            <h3>AI Voice Coach</h3>
            <p>Voice-guided workouts with real-time motivation</p>
          </div>

          <div className="ai-feature-card" onClick={() => setActiveFeature('pr-tracker')}>
            <div className="feature-icon">📈</div>
            <h3>PR Tracker</h3>
            <p>Track personal records and predict your next milestone</p>
          </div>

          <div className="ai-feature-card" onClick={() => setActiveFeature('transformation')}>
            <div className="feature-icon">📸</div>
            <h3>Body Transformation</h3>
            <p>Track progress with photos and measurements</p>
          </div>
        </div>

        {/* AI Chatbot Section */}
        {activeFeature === 'chatbot' && (
          <div className="ai-section active">
            <div className="section-header">
              <h2>💬 AI Fitness Chatbot</h2>
              <button onClick={() => setActiveFeature(null)} className="close-btn">×</button>
            </div>
            <div className="chatbot-container">
              <div className="chat-messages">
                {chatMessages.length === 0 && (
                  <div className="welcome-message">
                    <p>👋 Hi! I'm your AI fitness assistant. Ask me anything about:</p>
                    <ul>
                      <li>Workout routines and exercises</li>
                      <li>Nutrition and meal planning</li>
                      <li>Weight loss or muscle gain</li>
                      <li>Form tips and technique</li>
                      <li>Supplements and recovery</li>
                    </ul>
                    <div className="example-questions">
                      <strong>Try asking (English/Hindi/Hinglish):</strong>
                      <button onClick={() => setChatInput("How much protein do I need to build muscle?")}>
                        How much protein do I need?
                      </button>
                      <button onClick={() => setChatInput("Mujhe muscle banana hai, kya karna chahiye?")}>
                        Mujhe muscle banana hai, kya karna chahiye?
                      </button>
                      <button onClick={() => setChatInput("वजन कम करने के लिए क्या करना चाहिए?")}>
                        वजन कम करने के लिए क्या करना चाहिए?
                      </button>
                      <button onClick={() => setChatInput("Best workout routine for beginners batao")}>
                        Best workout routine for beginners batao
                      </button>
                      <button onClick={() => setChatInput("Should I do cardio before or after weights?")}>
                        Cardio before or after weights?
                      </button>
                      <button onClick={() => setChatInput("Protein powder lena chahiye ya nahi?")}>
                        Protein powder lena chahiye ya nahi?
                      </button>
                    </div>
                  </div>
                )}
                {chatMessages.map((msg, idx) => (
                  <div key={idx} className={`chat-message ${msg.role}`}>
                    <div className="message-avatar">
                      {msg.role === 'user' ? '👤' : '🤖'}
                    </div>
                    <div className="message-content">{msg.content}</div>
                  </div>
                ))}
                {isLoading && (
                  <div className="chat-message assistant">
                    <div className="message-avatar">🤖</div>
                    <div className="message-content typing">
                      <span className="typing-indicator">
                        <span></span><span></span><span></span>
                      </span>
                      Thinking...
                    </div>
                  </div>
                )}
              </div>
              <form onSubmit={handleChatSubmit} className="chat-input-form">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask in English, Hindi, or Hinglish... (e.g., Mujhe protein kitna chahiye?)"
                  disabled={isLoading}
                />
                <button type="submit" disabled={isLoading || !chatInput.trim()}>
                  {isLoading ? '...' : 'Send'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* AI Meal Planner Section */}
        {activeFeature === 'meal-planner' && (
          <div className="ai-section active">
            <div className="section-header">
              <h2>🍽️ AI Meal Planner</h2>
              <button onClick={() => setActiveFeature(null)} className="close-btn">×</button>
            </div>
            <div className="meal-planner-container">
              <div className="meal-preferences">
                <h3>Set Your Preferences</h3>
                <div className="preference-group">
                  <label>Daily Calories:</label>
                  <input
                    type="number"
                    value={mealPreferences.calories}
                    onChange={(e) => setMealPreferences({...mealPreferences, calories: e.target.value})}
                  />
                </div>
                <div className="preference-group">
                  <label>Diet Type:</label>
                  <select
                    value={mealPreferences.dietType}
                    onChange={(e) => setMealPreferences({...mealPreferences, dietType: e.target.value})}
                  >
                    <option value="veg">🥗 Vegetarian (Pure Veg)</option>
                    <option value="non-veg">🍗 Non-Vegetarian (All types)</option>
                    <option value="non-veg-chicken-only">🐔 Non-Veg (Chicken Only)</option>
                    <option value="eggetarian">🥚 Eggetarian (Veg + Eggs)</option>
                    <option value="high-protein">💪 High Protein</option>
                    <option value="weight-loss">⚖️ Weight Loss</option>
                  </select>
                </div>
                <div className="preference-group">
                  <label>Allergies/Restrictions:</label>
                  <input
                    type="text"
                    value={mealPreferences.allergies}
                    onChange={(e) => setMealPreferences({...mealPreferences, allergies: e.target.value})}
                    placeholder="e.g., dairy, peanuts, gluten, jain food"
                  />
                </div>
                <button onClick={() => generateMealPlan(false)} className="generate-btn" disabled={isLoading}>
                  {isLoading ? '🤖 Generating with AI...' : '✨ Generate AI Meal Plan'}
                </button>
              </div>

              {generatedMeals && (
                <div className="generated-meals">
                  <h3>🇮🇳 Your Indian Meal Plan ({mealPreferences.calories} calories - {mealPreferences.dietType})</h3>
                  {mealVariationCount > 0 && (
                    <p className="variation-badge">Variation #{mealVariationCount}</p>
                  )}
                  <div className="meals-grid">
                    {Object.entries(generatedMeals).map(([mealName, items]) => (
                      <div key={mealName} className="meal-box">
                        <h4>{mealName.charAt(0).toUpperCase() + mealName.slice(1).replace('-', ' ')}</h4>
                        <ul>
                          {items.map((item, idx) => (
                            <li key={idx}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                  <div className="meal-actions">
                    <button className="btn-variation" onClick={() => generateMealPlan(true)} disabled={isLoading}>
                      🔄 Generate Different Variation
                    </button>
                    <button className="btn-secondary" onClick={() => downloadMealPlanPDF(generatedMeals, mealPreferences)}>📄 Download PDF</button>
                    <button className="btn-primary" onClick={() => emailMealPlan(generatedMeals, mealPreferences)}>📧 Email Plan</button>
                    <button className="btn-secondary" onClick={() => {
                      setGeneratedMeals(null)
                      setMealVariationCount(0)
                    }}>
                      ❌ Close
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* AI Form Analyzer Section */}
        {activeFeature === 'form-analyzer' && (
          <div className="ai-section active">
            <div className="section-header">
              <h2>📹 AI Form Analyzer</h2>
              <button onClick={() => {
                setActiveFeature(null)
                stopCamera()
              }} className="close-btn">×</button>
            </div>
            <div className="form-analyzer-container">
              {!formFeedback ? (
                <div className="camera-section">
                  <div className="exercise-selector" style={{marginBottom: '20px'}}>
                    <label style={{fontWeight: 'bold', marginRight: '15px', fontSize: '16px'}}>
                      Select Exercise:
                    </label>
                    <select 
                      value={selectedExercise}
                      onChange={(e) => setSelectedExercise(e.target.value)}
                      style={{
                        padding: '10px 15px',
                        fontSize: '16px',
                        borderRadius: '8px',
                        border: '2px solid #ddd',
                        outline: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      <option value="squat">Squat</option>
                      <option value="deadlift">Deadlift</option>
                      <option value="bench-press">Bench Press</option>
                      <option value="pushup">Push-up</option>
                      <option value="plank">Plank</option>
                    </select>
                  </div>

                  <div className="camera-preview" style={{
                    background: '#000',
                    borderRadius: '15px',
                    overflow: 'hidden',
                    position: 'relative',
                    minHeight: '400px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {!cameraActive && !isAnalyzing && (
                      <div className="camera-placeholder" style={{textAlign: 'center', color: 'white'}}>
                        <div className="camera-icon" style={{fontSize: '80px', marginBottom: '20px'}}>📹</div>
                        <h3 style={{marginBottom: '15px'}}>Camera Not Active</h3>
                        <p style={{marginBottom: '30px', color: '#ccc'}}>
                          AI-powered pose detection for real-time form analysis
                        </p>
                        {!poseDetectorLoaded && (
                          <div style={{marginBottom: '20px', color: '#ffd700'}}>
                            ⏳ Loading AI pose detection model...
                          </div>
                        )}
                        {poseDetectorLoaded && (
                          <div style={{marginBottom: '20px', color: '#4CAF50'}}>
                            ✅ AI model ready
                          </div>
                        )}
                        <button 
                          onClick={startCamera} 
                          disabled={!poseDetectorLoaded}
                          style={{
                            padding: '15px 40px',
                            fontSize: '18px',
                            background: poseDetectorLoaded ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#999',
                            color: 'white',
                            border: 'none',
                            borderRadius: '10px',
                            cursor: poseDetectorLoaded ? 'pointer' : 'not-allowed',
                            fontWeight: 'bold',
                            opacity: poseDetectorLoaded ? 1 : 0.6
                          }}
                        >
                          📹 Start Camera
                        </button>
                      </div>
                    )}

                    {cameraActive && !isAnalyzing && (
                      <div style={{width: '100%', position: 'relative'}}>
                        <video 
                          ref={videoRef}
                          autoPlay 
                          playsInline
                          muted
                          style={{
                            width: '100%',
                            height: 'auto',
                            display: 'block',
                            transform: 'scaleX(-1)'
                          }}
                        />
                        
                        <canvas
                          ref={canvasRef}
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            transform: 'scaleX(-1)',
                            pointerEvents: 'none'
                          }}
                        />
                        
                        {!isRecording && (
                          <>
                            <div style={{
                              position: 'absolute',
                              top: '20px',
                              left: '20px',
                              background: 'rgba(0,0,0,0.7)',
                              padding: '10px 20px',
                              borderRadius: '8px',
                              color: 'white'
                            }}>
                              <div style={{fontSize: '12px', color: '#4CAF50', marginBottom: '5px'}}>● READY</div>
                              <div style={{fontSize: '14px', fontWeight: 'bold'}}>
                                {selectedExercise.replace('-', ' ').toUpperCase()}
                              </div>
                            </div>
                            <div style={{
                              position: 'absolute',
                              bottom: '20px',
                              left: '20px',
                              background: 'rgba(0,0,0,0.8)',
                              padding: '12px 20px',
                              borderRadius: '8px',
                              color: 'white',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '10px'
                            }}>
                              <div style={{
                                width: '10px',
                                height: '10px',
                                borderRadius: '50%',
                                background: poseDetected ? '#4CAF50' : '#ff5252',
                                animation: poseDetected ? 'pulse 2s infinite' : 'none'
                              }}></div>
                              <span style={{fontSize: '13px'}}>
                                {poseDetected ? '✓ Body detected - Ready to record' : '⚠ No body detected - Step into frame'}
                              </span>
                            </div>
                          </>
                        )}

                        {isRecording && (
                          <>
                            <div style={{
                              position: 'absolute',
                              top: '20px',
                              left: '20px',
                              background: 'rgba(255,0,0,0.9)',
                              padding: '10px 20px',
                              borderRadius: '8px',
                              color: 'white',
                              animation: 'pulse 1.5s infinite'
                            }}>
                              <div style={{fontSize: '12px', fontWeight: 'bold', marginBottom: '5px'}}>🔴 RECORDING</div>
                              <div style={{fontSize: '18px', fontWeight: 'bold'}}>
                                {Math.floor(recordingDuration / 60)}:{(recordingDuration % 60).toString().padStart(2, '0')}
                              </div>
                            </div>
                            <div style={{
                              position: 'absolute',
                              top: '20px',
                              right: '20px',
                              background: 'rgba(0,0,0,0.7)',
                              padding: '10px 20px',
                              borderRadius: '8px',
                              color: 'white'
                            }}>
                              <div style={{fontSize: '14px', fontWeight: 'bold'}}>
                                {selectedExercise.replace('-', ' ').toUpperCase()}
                              </div>
                              <div style={{fontSize: '11px', marginTop: '5px', display: 'flex', alignItems: 'center', gap: '5px'}}>
                                <div style={{
                                  width: '8px',
                                  height: '8px',
                                  borderRadius: '50%',
                                  background: poseDetected ? '#4CAF50' : '#ff5252'
                                }}></div>
                                {poseDetected ? 'Tracking' : 'Not detected'}
                              </div>
                            </div>
                            {liveFormIssues.length > 0 && (
                              <div style={{
                                position: 'absolute',
                                bottom: '20px',
                                left: '20px',
                                right: '20px',
                                background: 'rgba(255,152,0,0.95)',
                                padding: '15px',
                                borderRadius: '8px',
                                color: 'white',
                                maxHeight: '150px',
                                overflowY: 'auto'
                              }}>
                                <div style={{fontSize: '12px', fontWeight: 'bold', marginBottom: '8px'}}>
                                  ⚠️ LIVE FORM ALERTS ({liveFormIssues.length})
                                </div>
                                <div style={{fontSize: '13px'}}>
                                  {liveFormIssues.slice(-3).map((issue, idx) => (
                                    <div key={idx} style={{marginBottom: '5px'}}>{issue}</div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    )}

                    {isAnalyzing && (
                      <div className="analyzing-state" style={{textAlign: 'center', color: 'white'}}>
                        <div className="spinner" style={{
                          width: '60px',
                          height: '60px',
                          border: '4px solid rgba(255,255,255,0.3)',
                          borderTop: '4px solid white',
                          borderRadius: '50%',
                          animation: 'spin 1s linear infinite',
                          margin: '0 auto 20px'
                        }}></div>
                        <h3>🤖 Analyzing Your Form...</h3>
                        <p style={{color: '#ccc', marginTop: '10px'}}>
                          AI is detecting body keypoints and analyzing movement patterns
                        </p>
                      </div>
                    )}
                  </div>

                  {cameraActive && !isAnalyzing && !isRecording && (
                    <div style={{marginTop: '20px', display: 'flex', gap: '15px', justifyContent: 'center'}}>
                      <button 
                        onClick={startRecording}
                        style={{
                          padding: '15px 40px',
                          fontSize: '18px',
                          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '10px',
                          cursor: 'pointer',
                          fontWeight: 'bold'
                        }}
                      >
                        🔴 Start Recording & Analysis
                      </button>
                      <button 
                        onClick={stopCamera}
                        style={{
                          padding: '15px 40px',
                          fontSize: '18px',
                          background: '#666',
                          color: 'white',
                          border: 'none',
                          borderRadius: '10px',
                          cursor: 'pointer',
                          fontWeight: 'bold'
                        }}
                      >
                        ⏹️ Stop Camera
                      </button>
                    </div>
                  )}

                  {isRecording && (
                    <div style={{marginTop: '20px', display: 'flex', gap: '15px', justifyContent: 'center', alignItems: 'center'}}>
                      <div style={{
                        padding: '15px 30px',
                        background: 'rgba(255,0,0,0.1)',
                        borderRadius: '10px',
                        border: '2px solid #ff5252',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        color: '#d32f2f'
                      }}>
                        🔴 Recording in progress... Perform your exercise now!
                      </div>
                      <button 
                        onClick={stopRecording}
                        style={{
                          padding: '15px 40px',
                          fontSize: '18px',
                          background: 'linear-gradient(135deg, #ff6b6b 0%, #c92a2a 100%)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '10px',
                          cursor: 'pointer',
                          fontWeight: 'bold',
                          boxShadow: '0 4px 15px rgba(201,42,42,0.4)'
                        }}
                      >
                        ⏹️ Stop & Analyze
                      </button>
                    </div>
                  )}

                  <div style={{marginTop: '30px', padding: '20px', background: '#f5f5f5', borderRadius: '10px'}}>
                    <h4 style={{marginBottom: '15px'}}>📌 How Real-Time Analysis Works:</h4>
                    <ul style={{listStyle: 'none', padding: 0}}>
                      <li style={{padding: '8px 0'}}>1️⃣ Select your exercise from the dropdown</li>
                      <li style={{padding: '8px 0'}}>2️⃣ Click "Start Camera" and position yourself in full frame</li>
                      <li style={{padding: '8px 0'}}>3️⃣ Click "Start Recording" and begin performing your exercise</li>
                      <li style={{padding: '8px 0'}}>4️⃣ AI analyzes every 0.5 seconds showing live form alerts</li>
                      <li style={{padding: '8px 0'}}>5️⃣ Click "Stop & Analyze" when done to get detailed report</li>
                      <li style={{padding: '8px 0'}}>6️⃣ Review your recorded video, score, and all detected issues</li>
                    </ul>
                    <div style={{
                      marginTop: '15px',
                      padding: '15px',
                      background: '#e3f2fd',
                      borderRadius: '8px',
                      borderLeft: '4px solid #2196F3'
                    }}>
                      <strong>💡 Pro Tip:</strong> Record 3-5 reps for comprehensive analysis. The AI detects form breaks in real-time and provides a detailed breakdown at the end.
                    </div>
                  </div>
                </div>
              ) : (
                <div className="feedback-results">
                  {recordedVideo && (
                    <div style={{marginBottom: '20px', borderRadius: '15px', overflow: 'hidden', background: '#000'}}>
                      <video 
                        src={recordedVideo} 
                        controls
                        style={{
                          width: '100%',
                          height: 'auto',
                          display: 'block',
                          transform: 'scaleX(-1)'
                        }}
                      />
                      <div style={{
                        padding: '15px',
                        background: 'rgba(0,0,0,0.8)',
                        color: 'white',
                        textAlign: 'center'
                      }}>
                        <strong>📹 Your Recorded Workout</strong> - Duration: {formFeedback.duration}s
                      </div>
                    </div>
                  )}
                  
                  <div className="score-display" style={{
                    textAlign: 'center',
                    padding: '30px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    borderRadius: '15px',
                    color: 'white',
                    marginBottom: '30px'
                  }}>
                    <div style={{
                      width: '150px',
                      height: '150px',
                      margin: '0 auto 20px',
                      borderRadius: '50%',
                      background: 'white',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
                    }}>
                      <span style={{fontSize: '48px', fontWeight: 'bold', color: '#667eea'}}>
                        {formFeedback.score}
                      </span>
                      <span style={{fontSize: '18px', color: '#999'}}>/100</span>
                    </div>
                    <h3 style={{fontSize: '24px', marginBottom: '10px'}}>{formFeedback.exercise} Form Analysis</h3>
                    <p style={{opacity: 0.9}}>
                      {formFeedback.score >= 85 ? 'Excellent form! 💪' : 
                       formFeedback.score >= 70 ? 'Good form with room for improvement 👍' : 
                       'Work on these corrections 🎯'}
                    </p>
                  </div>

                  <div style={{background: 'white', padding: '25px', borderRadius: '15px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)'}}>
                    <h4 style={{marginBottom: '20px', fontSize: '20px', color: '#333'}}>📋 Detailed Feedback:</h4>
                    <div className="feedback-list">
                      {formFeedback.feedback.map((item, idx) => (
                        <div 
                          key={idx} 
                          style={{
                            padding: '15px',
                            marginBottom: '10px',
                            background: item.includes('✓') ? '#e8f5e9' : 
                                       item.includes('⚠') ? '#fff3e0' : '#e3f2fd',
                            borderLeft: `4px solid ${item.includes('✓') ? '#4CAF50' : 
                                                     item.includes('⚠') ? '#ff9800' : '#2196F3'}`,
                            borderRadius: '8px',
                            fontSize: '16px'
                          }}
                        >
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={{marginTop: '30px', display: 'flex', gap: '15px', justifyContent: 'center'}}>
                    <button 
                      onClick={resetFormAnalysis}
                      style={{
                        padding: '15px 40px',
                        fontSize: '18px',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        fontWeight: 'bold'
                      }}
                    >
                      🔄 Analyze Another Exercise
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* AI Progress Tracker */}
        {activeFeature === 'progress' && (
          <div className="ai-section active">
            <div className="section-header">
              <h2>📊 AI Progress Tracker</h2>
              <button onClick={() => setActiveFeature(null)} className="close-btn">×</button>
            </div>

            <div className="progress-tracker">
              {/* Workout Type Tabs */}
              <div className="workout-tabs">
                <button 
                  className={`tab-btn ${workoutType === 'cardio' ? 'active' : ''}`}
                  onClick={() => setWorkoutType('cardio')}
                >
                  🏃 Cardio Workout
                </button>
                <button 
                  className={`tab-btn ${workoutType === 'weight' ? 'active' : ''}`}
                  onClick={() => setWorkoutType('weight')}
                >
                  🏋️ Weight Training
                </button>
              </div>

              {/* Cardio Entry Form */}
              {workoutType === 'cardio' && (
                <div className="add-entry-form">
                  <h3>🏃 Log Cardio Workout</h3>
                  <form onSubmit={async (e) => {
                    e.preventDefault()
                    if (!cardioEntry.date) {
                      alert('Please fill in the date')
                      return
                    }

                    const entry = {
                      ...cardioEntry,
                      type: 'cardio',
                      id: Date.now(),
                      timestamp: new Date().toISOString()
                    }

                    // Find or create day
                    const existingDayIndex = progressData.findIndex(day => day.date === cardioEntry.date)
                    let updatedData

                    if (existingDayIndex >= 0) {
                      // Add to existing day
                      updatedData = [...progressData]
                      if (!updatedData[existingDayIndex].exercises) {
                        updatedData[existingDayIndex].exercises = []
                      }
                      updatedData[existingDayIndex].exercises.push(entry)
                      // Update weight if provided
                      if (cardioEntry.weight) {
                        updatedData[existingDayIndex].weight = cardioEntry.weight
                      }
                    } else {
                      // Create new day
                      const newDay = {
                        date: cardioEntry.date,
                        weight: cardioEntry.weight || null,
                        exercises: [entry],
                        id: Date.now()
                      }
                      updatedData = [newDay, ...progressData].sort((a, b) => new Date(b.date) - new Date(a.date))
                    }

                    updateProgressData(updatedData)
                    
                    // Save to backend
                    await saveUserProgress('cardio_workout', {
                      date: cardioEntry.date,
                      weight: cardioEntry.weight,
                      workout: cardioEntry.workout,
                      duration: cardioEntry.duration,
                      calories: cardioEntry.calories,
                      notes: cardioEntry.notes,
                      timestamp: new Date().toISOString()
                    })
                    
                    setCardioEntry({
                      date: new Date().toISOString().split('T')[0],
                      weight: '',
                      workout: '',
                      duration: '',
                      calories: '',
                      notes: ''
                    })
                    alert('✅ Cardio workout logged successfully!')
                  }}>
                    <div className="form-grid">
                      <div className="form-group">
                        <label>Date *</label>
                        <input
                          type="date"
                          value={cardioEntry.date}
                          onChange={(e) => setCardioEntry({...cardioEntry, date: e.target.value})}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Weight (kg)</label>
                        <input
                          type="number"
                          step="0.1"
                          placeholder="75.5"
                          value={cardioEntry.weight}
                          onChange={(e) => setCardioEntry({...cardioEntry, weight: e.target.value})}
                        />
                      </div>
                      <div className="form-group">
                        <label>Cardio Type</label>
                        <input
                          type="text"
                          placeholder="Running, Cycling, Swimming..."
                          value={cardioEntry.workout}
                          onChange={(e) => setCardioEntry({...cardioEntry, workout: e.target.value})}
                        />
                      </div>
                      <div className="form-group">
                        <label>Duration (min)</label>
                        <input
                          type="number"
                          placeholder="30"
                          value={cardioEntry.duration}
                          onChange={(e) => setCardioEntry({...cardioEntry, duration: e.target.value})}
                        />
                      </div>
                      <div className="form-group">
                        <label>Calories Burned</label>
                        <input
                          type="number"
                          placeholder="300"
                          value={cardioEntry.calories}
                          onChange={(e) => setCardioEntry({...cardioEntry, calories: e.target.value})}
                        />
                      </div>
                      <div className="form-group full-width">
                        <label>Notes</label>
                        <textarea
                          placeholder="Felt great today, maintained good pace..."
                          value={cardioEntry.notes}
                          onChange={(e) => setCardioEntry({...cardioEntry, notes: e.target.value})}
                          rows="2"
                        />
                      </div>
                    </div>
                    <button type="submit" className="btn-primary">
                      ➕ Log Cardio Workout
                    </button>
                  </form>
                </div>
              )}

              {/* Weight Training Entry Form */}
              {workoutType === 'weight' && (
                <div className="add-entry-form">
                  <h3>🏋️ Log Weight Training</h3>
                  <form onSubmit={async (e) => {
                    e.preventDefault()
                    
                    const finalExercise = weightEntry.exercise === 'Custom Exercise' ? customExercise : weightEntry.exercise
                    
                    if (!weightEntry.date || !weightEntry.bodyPart || !finalExercise || weightEntry.sets.length === 0) {
                      alert('Please fill in all required fields and complete all sets')
                      return
                    }

                    const allSetsComplete = weightEntry.sets.every(set => set.weight && set.reps)
                    if (!allSetsComplete) {
                      alert('Please complete all sets (weight and reps)')
                      return
                    }

                    const entry = {
                      ...weightEntry,
                      exercise: finalExercise,
                      type: 'weight',
                      id: Date.now(),
                      timestamp: new Date().toISOString()
                    }

                    // Find or create day
                    const existingDayIndex = progressData.findIndex(day => day.date === weightEntry.date)
                    let updatedData

                    if (existingDayIndex >= 0) {
                      // Add to existing day
                      updatedData = [...progressData]
                      if (!updatedData[existingDayIndex].exercises) {
                        updatedData[existingDayIndex].exercises = []
                      }
                      updatedData[existingDayIndex].exercises.push(entry)
                    } else {
                      // Create new day
                      const newDay = {
                        date: weightEntry.date,
                        weight: null,
                        exercises: [entry],
                        id: Date.now()
                      }
                      updatedData = [newDay, ...progressData].sort((a, b) => new Date(b.date) - new Date(a.date))
                    }

                    updateProgressData(updatedData)
                    
                    // Save to backend
                    await saveUserProgress('weight_training', {
                      date: weightEntry.date,
                      bodyPart: weightEntry.bodyPart,
                      exercise: finalExercise,
                      sets: weightEntry.sets,
                      notes: weightEntry.notes,
                      timestamp: new Date().toISOString()
                    })
                    
                    setWeightEntry({
                      date: new Date().toISOString().split('T')[0],
                      bodyPart: '',
                      exercise: '',
                      numSets: '',
                      sets: [],
                      notes: ''
                    })
                    setCustomExercise('')
                    alert('✅ Weight training logged successfully!')
                  }}>
                    <div className="form-grid">
                      <div className="form-group">
                        <label>Date *</label>
                        <input
                          type="date"
                          value={weightEntry.date}
                          onChange={(e) => setWeightEntry({...weightEntry, date: e.target.value})}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Body Part *</label>
                        <select
                          value={weightEntry.bodyPart}
                          onChange={(e) => {
                            setWeightEntry({
                              ...weightEntry, 
                              bodyPart: e.target.value,
                              exercise: '',
                              sets: []
                            })
                          }}
                          required
                        >
                          <option value="">Select Body Part</option>
                          {Object.keys(exerciseDatabase).map(part => (
                            <option key={part} value={part}>{part}</option>
                          ))}
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Exercise *</label>
                        <select
                          value={weightEntry.exercise}
                          onChange={(e) => {
                            setWeightEntry({...weightEntry, exercise: e.target.value})
                            if (e.target.value !== 'Custom Exercise') {
                              setCustomExercise('')
                            }
                          }}
                          disabled={!weightEntry.bodyPart}
                          required
                        >
                          <option value="">Select Exercise</option>
                          {weightEntry.bodyPart && exerciseDatabase[weightEntry.bodyPart].map(ex => (
                            <option key={ex} value={ex}>{ex}</option>
                          ))}
                        </select>
                      </div>
                      {weightEntry.exercise === 'Custom Exercise' && (
                        <div className="form-group">
                          <label>Custom Exercise Name *</label>
                          <input
                            type="text"
                            placeholder="Enter exercise name..."
                            value={customExercise}
                            onChange={(e) => setCustomExercise(e.target.value)}
                            required
                          />
                        </div>
                      )}
                      <div className="form-group">
                        <label>Number of Sets *</label>
                        <input
                          type="number"
                          min="1"
                          max="10"
                          placeholder="3"
                          value={weightEntry.numSets}
                          onChange={(e) => {
                            const num = parseInt(e.target.value) || 0
                            const newSets = Array(num).fill(null).map((_, i) => ({
                              setNumber: i + 1,
                              weight: '',
                              reps: ''
                            }))
                            setWeightEntry({ ...weightEntry, numSets: e.target.value, sets: newSets })
                          }}
                          required
                        />
                      </div>
                    </div>

                    {/* Dynamic Set Inputs */}
                    {weightEntry.sets.length > 0 && (
                      <div className="sets-container">
                        <h4>📝 Enter Details for Each Set:</h4>
                        <div className="sets-grid">
                          {weightEntry.sets.map((set, index) => (
                            <div key={index} className="set-input-group">
                              <div className="set-number">Set {set.setNumber}</div>
                              <div className="set-inputs">
                                <div className="set-field">
                                  <label>Weight (kg)</label>
                                  <input
                                    type="number"
                                    step="0.5"
                                    placeholder="60"
                                    value={set.weight}
                                    onChange={(e) => {
                                      const updatedSets = [...weightEntry.sets]
                                      updatedSets[index] = { ...updatedSets[index], weight: e.target.value }
                                      setWeightEntry({ ...weightEntry, sets: updatedSets })
                                    }}
                                    required
                                  />
                                </div>
                                <div className="set-field">
                                  <label>Reps</label>
                                  <input
                                    type="number"
                                    placeholder="10"
                                    value={set.reps}
                                    onChange={(e) => {
                                      const updatedSets = [...weightEntry.sets]
                                      updatedSets[index] = { ...updatedSets[index], reps: e.target.value }
                                      setWeightEntry({ ...weightEntry, sets: updatedSets })
                                    }}
                                    required
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="form-group full-width">
                      <label>Notes</label>
                      <textarea
                        placeholder="Good pump today, felt strong on the last set..."
                        value={weightEntry.notes}
                        onChange={(e) => setWeightEntry({...weightEntry, notes: e.target.value})}
                        rows="2"
                      />
                    </div>

                    <button type="submit" className="btn-primary">
                      ➕ Log Weight Training
                    </button>
                  </form>
                </div>
              )}

              {/* Progress Stats */}
              {progressData.length > 0 && (
                <div className="progress-stats">
                  <h3>📈 Your Progress</h3>
                  <div className="stats-grid">
                    <div className="stat-card">
                      <div className="stat-icon">📅</div>
                      <div className="stat-label">Days Logged</div>
                      <div className="stat-value">{progressData.length}</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-icon">🏃</div>
                      <div className="stat-label">Cardio Sessions</div>
                      <div className="stat-value">
                        {progressData.reduce((sum, day) => sum + (day.exercises?.filter(e => e.type === 'cardio').length || 0), 0)}
                      </div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-icon">🏋️</div>
                      <div className="stat-label">Weight Sessions</div>
                      <div className="stat-value">
                        {progressData.reduce((sum, day) => sum + (day.exercises?.filter(e => e.type === 'weight').length || 0), 0)}
                      </div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-icon">🔥</div>
                      <div className="stat-label">Total Calories</div>
                      <div className="stat-value">
                        {progressData.reduce((sum, day) => sum + (day.exercises?.reduce((s, e) => s + (parseInt(e.calories) || 0), 0) || 0), 0)}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Progress History */}
              {progressData.length > 0 && (
                <div className="progress-history">
                  <h3>📋 Workout History</h3>
                  <div className="history-list">
                    {progressData.map((day, dayIndex) => (
                      <div key={day.id || dayIndex} className="daily-log">
                        <div 
                          className="daily-header"
                          onClick={() => setExpandedDays(prev => ({...prev, [day.date]: !prev[day.date]}))}
                        >
                          <div className="daily-header-left">
                            <span className="expand-icon">{expandedDays[day.date] ? '▼' : '▶'}</span>
                            <span className="daily-date">
                              📅 {new Date(day.date).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>
                            <span className="exercise-count">
                              ({day.exercises?.length || 0} exercise{(day.exercises?.length || 0) !== 1 ? 's' : ''})
                            </span>
                          </div>
                          <div className="daily-header-right">
                            {day.weight && <span className="daily-weight">⚖️ {day.weight} kg</span>}
                            <button 
                              className="delete-btn"
                              onClick={(e) => {
                                e.stopPropagation()
                                if (confirm(`Delete all exercises for ${new Date(day.date).toLocaleDateString('en-IN')}?`)) {
                                  const updatedData = progressData.filter(d => d.id !== day.id)
                                  updateProgressData(updatedData)
                                }
                              }}
                            >
                              🗑️
                            </button>
                          </div>
                        </div>

                        {expandedDays[day.date] && (
                          <div className="daily-exercises">
                            {day.exercises && day.exercises.map((exercise, exIndex) => (
                              <div key={exercise.id || exIndex} className={`exercise-card ${exercise.type}-card`}>
                                <div className="exercise-header">
                                  <span className="exercise-type-icon">
                                    {exercise.type === 'cardio' ? '🏃' : '🏋️'}
                                  </span>
                                  <span className="exercise-title">
                                    {exercise.type === 'cardio' 
                                      ? (exercise.workout || 'Cardio Workout')
                                      : `${exercise.bodyPart} - ${exercise.exercise}`
                                    }
                                  </span>
                                  <button
                                    className="delete-exercise-btn"
                                    onClick={() => {
                                      const updatedData = [...progressData]
                                      updatedData[dayIndex].exercises = updatedData[dayIndex].exercises.filter(e => e.id !== exercise.id)
                                      if (updatedData[dayIndex].exercises.length === 0) {
                                        updatedData.splice(dayIndex, 1)
                                      }
                                      updateProgressData(updatedData)
                                    }}
                                  >
                                    ×
                                  </button>
                                </div>

                                {exercise.type === 'cardio' ? (
                                  <div className="exercise-details">
                                    {exercise.duration && <span>⏱️ {exercise.duration} min</span>}
                                    {exercise.calories && <span>🔥 {exercise.calories} cal</span>}
                                  </div>
                                ) : (
                                  <div className="sets-summary">
                                    {exercise.sets && exercise.sets.map((set, setIdx) => (
                                      <div key={setIdx} className="set-summary">
                                        <span className="set-label">Set {set.setNumber}:</span>
                                        <span className="set-data">{set.weight}kg × {set.reps} reps</span>
                                      </div>
                                    ))}
                                  </div>
                                )}

                                {exercise.notes && (
                                  <div className="exercise-notes">💭 {exercise.notes}</div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {progressData.length === 0 && (
                <div className="empty-state">
                  <div className="empty-icon">📊</div>
                  <h3>No Workout Data Yet</h3>
                  <p>Start logging your {workoutType === 'cardio' ? 'cardio workouts' : 'weight training sessions'} to track your fitness journey!</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Other AI Features - Coming Soon */}
        {/* Voice Coach Section */}
        {activeFeature === 'voice-coach' && (
          <div className="ai-section active">
            <div className="section-header">
              <h2>🎙️ AI Voice Coach</h2>
              <button onClick={() => setActiveFeature(null)} className="close-btn">×</button>
            </div>
            
            <div className="voice-coach-container">
              <div className="voice-intro">
                <h3>🏋️ Voice-Guided Workout Assistant</h3>
                <p>Get real-time voice coaching with rep counting, set tracking, and motivational cues!</p>
              </div>

              {!isVoiceActive ? (
                <div className="voice-setup">
                  <div className="form-grid" style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '20px'}}>
                    <div className="form-group" style={{display: 'flex', flexDirection: 'column'}}>
                      <label style={{marginBottom: '8px', fontWeight: 'bold', color: '#333'}}>Exercise Name *</label>
                      <input
                        type="text"
                        placeholder="e.g., Push-ups, Squats, Bench Press"
                        value={voiceWorkout.exercise}
                        onChange={(e) => setVoiceWorkout({...voiceWorkout, exercise: e.target.value})}
                        style={{
                          padding: '12px',
                          fontSize: '16px',
                          border: '2px solid #ddd',
                          borderRadius: '8px',
                          outline: 'none'
                        }}
                      />
                    </div>
                    
                    <div className="form-group" style={{display: 'flex', flexDirection: 'column'}}>
                      <label style={{marginBottom: '8px', fontWeight: 'bold', color: '#333'}}>Number of Sets</label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={voiceWorkout.sets}
                        onChange={(e) => setVoiceWorkout({...voiceWorkout, sets: parseInt(e.target.value)})}
                        style={{
                          padding: '12px',
                          fontSize: '16px',
                          border: '2px solid #ddd',
                          borderRadius: '8px',
                          outline: 'none'
                        }}
                      />
                    </div>
                    
                    <div className="form-group" style={{display: 'flex', flexDirection: 'column'}}>
                      <label style={{marginBottom: '8px', fontWeight: 'bold', color: '#333'}}>Reps per Set</label>
                      <input
                        type="number"
                        min="1"
                        max="50"
                        value={voiceWorkout.reps}
                        onChange={(e) => setVoiceWorkout({...voiceWorkout, reps: parseInt(e.target.value)})}
                        style={{
                          padding: '12px',
                          fontSize: '16px',
                          border: '2px solid #ddd',
                          borderRadius: '8px',
                          outline: 'none'
                        }}
                      />
                    </div>
                    
                    <div className="form-group" style={{display: 'flex', flexDirection: 'column'}}>
                      <label style={{marginBottom: '8px', fontWeight: 'bold', color: '#333'}}>Rest Time (seconds)</label>
                      <input
                        type="number"
                        min="10"
                        max="300"
                        value={voiceWorkout.restTime}
                        onChange={(e) => setVoiceWorkout({...voiceWorkout, restTime: parseInt(e.target.value)})}
                        style={{
                          padding: '12px',
                          fontSize: '16px',
                          border: '2px solid #ddd',
                          borderRadius: '8px',
                          outline: 'none'
                        }}
                      />
                    </div>
                  </div>

                  <button 
                    className="start-voice-btn"
                    onClick={startVoiceWorkout}
                    style={{
                      marginTop: '20px',
                      padding: '15px 40px',
                      fontSize: '18px',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      width: '100%'
                    }}
                  >
                    🎙️ Start Voice-Guided Workout
                  </button>

                  <div className="voice-features" style={{marginTop: '30px', padding: '20px', background: '#f5f5f5', borderRadius: '10px'}}>
                    <h4 style={{marginBottom: '15px'}}>✨ Features:</h4>
                    <ul style={{listStyle: 'none', padding: 0}}>
                      <li style={{padding: '8px 0'}}>🎙️ Voice-guided rep counting</li>
                      <li style={{padding: '8px 0'}}>⏱️ Automatic rest timer between sets</li>
                      <li style={{padding: '8px 0'}}>💪 Motivational coaching during workout</li>
                      <li style={{padding: '8px 0'}}>🔊 Audio countdown alerts</li>
                      <li style={{padding: '8px 0'}}>📊 Progress tracking</li>
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="voice-active">
                  <div className="workout-status" style={{
                    background: workoutPhase === 'exercising' 
                      ? 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
                      : 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                    color: 'white',
                    padding: '40px',
                    borderRadius: '20px',
                    textAlign: 'center',
                    marginBottom: '30px'
                  }}>
                    <h2 style={{fontSize: '2.5em', marginBottom: '20px'}}>
                      {workoutPhase === 'exercising' ? '💪 WORKING OUT' : '😌 RESTING'}
                    </h2>
                    <h3 style={{fontSize: '1.8em', marginBottom: '10px'}}>{voiceWorkout.exercise}</h3>
                    <div style={{fontSize: '3em', fontWeight: 'bold', margin: '20px 0'}}>
                      Set {currentSet} / {voiceWorkout.sets}
                    </div>
                    {workoutPhase === 'exercising' ? (
                      <div style={{fontSize: '4em', fontWeight: 'bold'}}>
                        Rep: {currentRep} / {voiceWorkout.reps}
                      </div>
                    ) : (
                      <div style={{fontSize: '4em', fontWeight: 'bold'}}>
                        Rest: {timer}s
                      </div>
                    )}
                  </div>

                  <div className="voice-controls" style={{display: 'flex', gap: '20px', justifyContent: 'center'}}>
                    <button 
                      onClick={stopVoiceWorkout}
                      style={{
                        padding: '15px 40px',
                        fontSize: '18px',
                        background: '#ff4757',
                        color: 'white',
                        border: 'none',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        fontWeight: 'bold'
                      }}
                    >
                      ⏹️ Stop Workout
                    </button>
                  </div>

                  <div className="workout-progress" style={{marginTop: '30px', padding: '20px', background: '#f5f5f5', borderRadius: '10px'}}>
                    <h4>Progress:</h4>
                    <div style={{display: 'flex', gap: '20px', marginTop: '15px', flexWrap: 'wrap'}}>
                      {[...Array(voiceWorkout.sets)].map((_, i) => (
                        <div 
                          key={i}
                          style={{
                            padding: '10px 20px',
                            borderRadius: '8px',
                            background: i < currentSet ? '#4caf50' : i === currentSet - 1 ? '#ff9800' : '#ddd',
                            color: i < currentSet || i === currentSet - 1 ? 'white' : '#666',
                            fontWeight: 'bold'
                          }}
                        >
                          Set {i + 1} {i < currentSet ? '✓' : ''}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* PR Tracker Section */}
        {activeFeature === 'pr-tracker' && (
          <div className="ai-section active">
            <div className="section-header">
              <h2>📈 Personal Records Tracker</h2>
              <button onClick={() => setActiveFeature(null)} className="close-btn">×</button>
            </div>

            <div className="pr-tracker-container">
              {/* Add New PR */}
              <div className="pr-input-section">
                <h3>💪 Log New Personal Record</h3>
                <div className="pr-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label>Exercise</label>
                      <select
                        value={newPR.exercise}
                        onChange={(e) => setNewPR({...newPR, exercise: e.target.value})}
                        className="form-control"
                      >
                        <option value="">Select Exercise</option>
                        <option value="Squat">Squat</option>
                        <option value="Deadlift">Deadlift</option>
                        <option value="Bench Press">Bench Press</option>
                        <option value="Overhead Press">Overhead Press</option>
                        <option value="Barbell Row">Barbell Row</option>
                        <option value="Pull-ups">Pull-ups</option>
                        <option value="Dips">Dips</option>
                        <option value="Leg Press">Leg Press</option>
                        <option value="Romanian Deadlift">Romanian Deadlift</option>
                        <option value="Front Squat">Front Squat</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Weight (kg)</label>
                      <input
                        type="number"
                        value={newPR.weight}
                        onChange={(e) => setNewPR({...newPR, weight: e.target.value})}
                        placeholder="Enter weight"
                        className="form-control"
                      />
                    </div>
                    <div className="form-group">
                      <label>Reps</label>
                      <input
                        type="number"
                        value={newPR.reps}
                        onChange={(e) => setNewPR({...newPR, reps: e.target.value})}
                        placeholder="Reps"
                        className="form-control"
                      />
                    </div>
                    <div className="form-group">
                      <label>Date</label>
                      <input
                        type="date"
                        value={newPR.date}
                        onChange={(e) => setNewPR({...newPR, date: e.target.value})}
                        className="form-control"
                      />
                    </div>
                  </div>
                  <button onClick={addPersonalRecord} className="add-pr-btn">
                    ➕ Add Personal Record
                  </button>
                </div>
              </div>

              {/* PR List and Stats */}
              {personalRecords.length > 0 ? (
                <>
                  {/* Exercise Filter */}
                  <div className="pr-filter">
                    <button 
                      className={prFilter === 'all' ? 'active' : ''}
                      onClick={() => setPrFilter('all')}
                    >
                      All Exercises
                    </button>
                    {getAllExercises().map(exercise => (
                      <button
                        key={exercise}
                        className={prFilter === exercise ? 'active' : ''}
                        onClick={() => setPrFilter(exercise)}
                      >
                        {exercise}
                      </button>
                    ))}
                  </div>

                  {/* Best Lifts Summary */}
                  <div className="pr-summary-grid">
                    {getAllExercises().map(exercise => {
                      const best = getExerciseBest(exercise)
                      if (!best) return null
                      return (
                        <div key={exercise} className="pr-summary-card">
                          <h4>{exercise}</h4>
                          <div className="pr-best">
                            <span className="pr-weight">{best.weight} kg</span>
                            <span className="pr-reps">× {best.reps}</span>
                          </div>
                          <div className="pr-1rm">
                            Est. 1RM: <strong>{best.oneRepMax} kg</strong>
                          </div>
                          <div className="pr-date">{new Date(best.date).toLocaleDateString()}</div>
                        </div>
                      )
                    })}
                  </div>

                  {/* PR History */}
                  <div className="pr-history">
                    <h3>📜 PR History</h3>
                    <div className="pr-list">
                      {personalRecords
                        .filter(pr => prFilter === 'all' || pr.exercise === prFilter)
                        .map(pr => (
                          <div key={pr.id} className="pr-item">
                            <div className="pr-details">
                              <div className="pr-exercise">{pr.exercise}</div>
                              <div className="pr-stats">
                                <span className="pr-weight">{pr.weight} kg</span>
                                <span>×</span>
                                <span className="pr-reps">{pr.reps} reps</span>
                                <span className="pr-divider">|</span>
                                <span className="pr-1rm">1RM: {pr.oneRepMax} kg</span>
                              </div>
                              <div className="pr-date">{new Date(pr.date).toLocaleDateString()}</div>
                            </div>
                            <button 
                              onClick={() => deletePersonalRecord(pr.id)}
                              className="delete-pr-btn"
                            >
                              🗑️
                            </button>
                          </div>
                        ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="empty-state">
                  <div className="empty-icon">📈</div>
                  <h3>No Personal Records Yet</h3>
                  <p>Start tracking your PRs to see your strength progress over time!</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Body Transformation Tracker Section */}
        {activeFeature === 'transformation' && (
          <div className="ai-section active">
            <div className="section-header">
              <h2>📸 Body Transformation Tracker</h2>
              <button onClick={() => setActiveFeature(null)} className="close-btn">×</button>
            </div>

            <div className="transformation-container">
              <div className="transformation-tabs">
                <div className="tab-buttons">
                  <button 
                    className={photoUploadType === 'photos' ? 'active' : ''}
                    onClick={() => setPhotoUploadType('photos')}
                  >
                    📸 Photos
                  </button>
                  <button 
                    className={photoUploadType === 'measurements' ? 'active' : ''}
                    onClick={() => setPhotoUploadType('measurements')}
                  >
                    📏 Measurements
                  </button>
                </div>
              </div>

              {/* Photos Tab */}
              {photoUploadType === 'photos' && (
                <div className="photos-section">
                  <div className="upload-section">
                    <h3>📤 Upload Progress Photo</h3>
                    <div className="upload-controls">
                      <select
                        value={photoUploadType}
                        onChange={(e) => setPhotoUploadType(e.target.value)}
                        className="photo-type-select"
                      >
                        <option value="front">Front</option>
                        <option value="side">Side</option>
                        <option value="back">Back</option>
                      </select>
                      <label className="upload-btn">
                        📷 Choose Photo
                        <input
                          type="file"
                          accept="image/*"
                          onChange={addTransformationPhoto}
                          style={{display: 'none'}}
                        />
                      </label>
                    </div>
                  </div>

                  {transformationPhotos.length > 0 ? (
                    <div className="photo-gallery">
                      {transformationPhotos.map(photo => (
                        <div key={photo.id} className="photo-card">
                          <img src={photo.url} alt={`${photo.type} view`} />
                          <div className="photo-info">
                            <span className="photo-type">{photo.type.toUpperCase()}</span>
                            <span className="photo-date">{new Date(photo.date).toLocaleDateString()}</span>
                          </div>
                          <button
                            onClick={() => deleteTransformationPhoto(photo.id)}
                            className="delete-photo-btn"
                          >
                            🗑️
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="empty-state">
                      <div className="empty-icon">📸</div>
                      <h3>No Photos Yet</h3>
                      <p>Start documenting your transformation journey!</p>
                    </div>
                  )}
                </div>
              )}

              {/* Measurements Tab */}
              {photoUploadType === 'measurements' && (
                <div className="measurements-section">
                  <div className="measurement-form">
                    <h3>📏 Log Body Measurements</h3>
                    <div className="form-grid">
                      <div className="form-group">
                        <label>Date</label>
                        <input
                          type="date"
                          value={newMeasurement.date}
                          onChange={(e) => setNewMeasurement({...newMeasurement, date: e.target.value})}
                          className="form-control"
                        />
                      </div>
                      <div className="form-group">
                        <label>Weight (kg) *</label>
                        <input
                          type="number"
                          step="0.1"
                          value={newMeasurement.weight}
                          onChange={(e) => setNewMeasurement({...newMeasurement, weight: e.target.value})}
                          placeholder="70.5"
                          className="form-control"
                        />
                      </div>
                      <div className="form-group">
                        <label>Body Fat %</label>
                        <input
                          type="number"
                          step="0.1"
                          value={newMeasurement.bodyFat}
                          onChange={(e) => setNewMeasurement({...newMeasurement, bodyFat: e.target.value})}
                          placeholder="15.0"
                          className="form-control"
                        />
                      </div>
                      <div className="form-group">
                        <label>Chest (cm)</label>
                        <input
                          type="number"
                          step="0.1"
                          value={newMeasurement.chest}
                          onChange={(e) => setNewMeasurement({...newMeasurement, chest: e.target.value})}
                          placeholder="100"
                          className="form-control"
                        />
                      </div>
                      <div className="form-group">
                        <label>Waist (cm)</label>
                        <input
                          type="number"
                          step="0.1"
                          value={newMeasurement.waist}
                          onChange={(e) => setNewMeasurement({...newMeasurement, waist: e.target.value})}
                          placeholder="80"
                          className="form-control"
                        />
                      </div>
                      <div className="form-group">
                        <label>Hips (cm)</label>
                        <input
                          type="number"
                          step="0.1"
                          value={newMeasurement.hips}
                          onChange={(e) => setNewMeasurement({...newMeasurement, hips: e.target.value})}
                          placeholder="95"
                          className="form-control"
                        />
                      </div>
                      <div className="form-group">
                        <label>Biceps (cm)</label>
                        <input
                          type="number"
                          step="0.1"
                          value={newMeasurement.biceps}
                          onChange={(e) => setNewMeasurement({...newMeasurement, biceps: e.target.value})}
                          placeholder="35"
                          className="form-control"
                        />
                      </div>
                      <div className="form-group">
                        <label>Thighs (cm)</label>
                        <input
                          type="number"
                          step="0.1"
                          value={newMeasurement.thighs}
                          onChange={(e) => setNewMeasurement({...newMeasurement, thighs: e.target.value})}
                          placeholder="55"
                          className="form-control"
                        />
                      </div>
                    </div>
                    <div className="form-group full-width">
                      <label>Notes</label>
                      <textarea
                        value={newMeasurement.notes}
                        onChange={(e) => setNewMeasurement({...newMeasurement, notes: e.target.value})}
                        placeholder="How are you feeling? Any observations?"
                        className="form-control"
                        rows="3"
                      />
                    </div>
                    <button onClick={addMeasurement} className="add-measurement-btn">
                      ➕ Log Measurement
                    </button>
                  </div>

                  {/* Progress Overview */}
                  {measurements.length > 1 && (
                    <div className="progress-overview">
                      <h3>📊 Progress Overview</h3>
                      {(() => {
                        const progress = getMeasurementProgress()
                        return (
                          <div className="progress-stats">
                            <div className="progress-stat">
                              <div className="stat-label">Weight</div>
                              <div className="stat-value">{progress.weight.current} kg</div>
                              <div className={`stat-change ${progress.weight.change < 0 ? 'negative' : 'positive'}`}>
                                {progress.weight.change > 0 ? '+' : ''}{progress.weight.change.toFixed(1)} kg
                              </div>
                            </div>
                            {progress.bodyFat && (
                              <div className="progress-stat">
                                <div className="stat-label">Body Fat</div>
                                <div className="stat-value">{progress.bodyFat.current}%</div>
                                <div className={`stat-change ${progress.bodyFat.change < 0 ? 'positive' : 'negative'}`}>
                                  {progress.bodyFat.change > 0 ? '+' : ''}{progress.bodyFat.change.toFixed(1)}%
                                </div>
                              </div>
                            )}
                            {progress.chest && (
                              <div className="progress-stat">
                                <div className="stat-label">Chest</div>
                                <div className="stat-value">{progress.chest.current} cm</div>
                                <div className={`stat-change ${progress.chest.change > 0 ? 'positive' : 'negative'}`}>
                                  {progress.chest.change > 0 ? '+' : ''}{progress.chest.change.toFixed(1)} cm
                                </div>
                              </div>
                            )}
                            {progress.waist && (
                              <div className="progress-stat">
                                <div className="stat-label">Waist</div>
                                <div className="stat-value">{progress.waist.current} cm</div>
                                <div className={`stat-change ${progress.waist.change < 0 ? 'positive' : 'negative'}`}>
                                  {progress.waist.change > 0 ? '+' : ''}{progress.waist.change.toFixed(1)} cm
                                </div>
                              </div>
                            )}
                          </div>
                        )
                      })()}
                    </div>
                  )}

                  {/* Measurement History */}
                  {measurements.length > 0 && (
                    <div className="measurement-history">
                      <h3>📜 Measurement History</h3>
                      <div className="measurement-list">
                        {measurements.map(m => (
                          <div key={m.id} className="measurement-item">
                            <div className="measurement-date">{new Date(m.date).toLocaleDateString()}</div>
                            <div className="measurement-data">
                              <span>Weight: <strong>{m.weight} kg</strong></span>
                              {m.bodyFat && <span>BF: <strong>{m.bodyFat}%</strong></span>}
                              {m.chest && <span>Chest: <strong>{m.chest} cm</strong></span>}
                              {m.waist && <span>Waist: <strong>{m.waist} cm</strong></span>}
                              {m.biceps && <span>Biceps: <strong>{m.biceps} cm</strong></span>}
                            </div>
                            {m.notes && <div className="measurement-notes">{m.notes}</div>}
                            <button
                              onClick={() => deleteMeasurement(m.id)}
                              className="delete-measurement-btn"
                            >
                              🗑️
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {measurements.length === 0 && (
                    <div className="empty-state">
                      <div className="empty-icon">📏</div>
                      <h3>No Measurements Yet</h3>
                      <p>Start tracking your body measurements to see your progress!</p>
                    </div>
                  )}
                </div>
              )}


            </div>
          </div>
        )}

        {/* AI Workout Generator Section */}
        {activeFeature === 'workout-generator' && (
          <div className="ai-section active">
            <div className="section-header">
              <h2>🏋️ AI Workout Plan Generator</h2>
              <button onClick={() => setActiveFeature(null)} className="close-btn">×</button>
            </div>

            <div className="workout-generator-container">
              <div className="generator-form">
                <h3>🎯 Your Fitness Goals</h3>
                <p className="form-subtitle">Tell us about your fitness goals and we'll create a personalized workout plan</p>

                <div className="form-grid">
                  <div className="form-group">
                    <label>Primary Goal</label>
                    <select 
                      value={workoutGoal} 
                      onChange={(e) => setWorkoutGoal(e.target.value)}
                      className="form-control"
                    >
                      <option value="muscle-building">Muscle Building</option>
                      <option value="weight-loss">Weight Loss</option>
                      <option value="strength">Strength Training</option>
                      <option value="endurance">Endurance & Cardio</option>
                      <option value="general-fitness">General Fitness</option>
                      <option value="athletic-performance">Athletic Performance</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Fitness Level</label>
                    <select 
                      value={fitnessLevel} 
                      onChange={(e) => setFitnessLevel(e.target.value)}
                      className="form-control"
                    >
                      <option value="beginner">Beginner (0-6 months)</option>
                      <option value="intermediate">Intermediate (6-24 months)</option>
                      <option value="advanced">Advanced (2+ years)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Workout Days Per Week</label>
                    <select 
                      value={workoutDays} 
                      onChange={(e) => setWorkoutDays(e.target.value)}
                      className="form-control"
                    >
                      <option value="3">3 Days</option>
                      <option value="4">4 Days</option>
                      <option value="5">5 Days</option>
                      <option value="6">6 Days</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Workout Duration (minutes)</label>
                    <select 
                      value={workoutDuration} 
                      onChange={(e) => setWorkoutDuration(e.target.value)}
                      className="form-control"
                    >
                      <option value="30">30 minutes</option>
                      <option value="45">45 minutes</option>
                      <option value="60">60 minutes</option>
                      <option value="90">90 minutes</option>
                    </select>
                  </div>

                  <div className="form-group full-width">
                    <label>Available Equipment</label>
                    <select 
                      value={equipment} 
                      onChange={(e) => setEquipment(e.target.value)}
                      className="form-control"
                    >
                      <option value="full-gym">Full Gym Access</option>
                      <option value="home-basic">Home (Dumbbells & Bands)</option>
                      <option value="bodyweight">Bodyweight Only</option>
                      <option value="minimal">Minimal Equipment</option>
                    </select>
                  </div>
                </div>

                <button 
                  onClick={generateWorkoutPlan} 
                  disabled={generatingWorkout}
                  className="generate-btn"
                >
                  {generatingWorkout ? (
                    <>
                      <span className="spinner"></span>
                      Generating Your Custom Plan...
                    </>
                  ) : (
                    <>
                      ✨ Generate Workout Plan
                    </>
                  )}
                </button>
              </div>

              {generatedWorkout && (
                <div className="generated-workout">
                  <div className="workout-header">
                    <h3>🎉 Your Personalized Workout Plan</h3>
                    <div className="workout-meta">
                      <span className="badge">{workoutGoal.replace('-', ' ')}</span>
                      <span className="badge">{fitnessLevel}</span>
                      <span className="badge">{workoutDays} days/week</span>
                      <span className="badge">{workoutDuration} min sessions</span>
                    </div>
                  </div>
                  
                  <div className="workout-content formatted">
                    {generatedWorkout.split('\n').map((line, index) => {
                      const trimmedLine = line.trim()
                      
                      // Skip empty lines
                      if (!trimmedLine) return <div key={index} style={{ height: '8px' }}></div>
                      
                      // Day headers (DAY 1, DAY 2, etc.)
                      if (trimmedLine.match(/^DAY\s+\d+/i)) {
                        return (
                          <div key={index} className="workout-day-header">
                            {trimmedLine}
                          </div>
                        )
                      }
                      
                      // Section headers (Warm-up, Cool-down, Exercise names)
                      if (trimmedLine.match(/^(warm-?up|cool-?down|exercise|rest day)/i)) {
                        return (
                          <div key={index} className="workout-section-header">
                            {trimmedLine}
                          </div>
                        )
                      }
                      
                      // Bullet points
                      if (trimmedLine.match(/^[-•*]/)) {
                        return (
                          <div key={index} className="workout-list-item">
                            <span className="bullet">●</span>
                            <span>{trimmedLine.replace(/^[-•*]\s*/, '')}</span>
                          </div>
                        )
                      }
                      
                      // Regular text
                      return (
                        <div key={index} className="workout-text">
                          {trimmedLine}
                        </div>
                      )
                    })}
                  </div>
                  
                  {!generatedWorkout.includes('Sorry') && !generatedWorkout.includes('couldn\'t') && (
                    <div className="workout-actions">
                      <button onClick={() => {
                        downloadWorkoutPlanPDF(generatedWorkout, {
                          goal: workoutGoal,
                          level: fitnessLevel,
                          days: workoutDays,
                          duration: workoutDuration,
                          equipment: equipment
                        })
                      }} className="download-btn">
                        📥 Download PDF
                      </button>
                    </div>
                  )}
                </div>
              )}

              {!generatedWorkout && !generatingWorkout && (
                <div className="workout-tips">
                  <h3>💡 Tips for Best Results</h3>
                  <ul>
                    <li>🎯 Be specific about your goals for better customization</li>
                    <li>⏱️ Choose a realistic workout duration you can commit to</li>
                    <li>📅 Consistency is more important than intensity</li>
                    <li>🍎 Combine your workout plan with proper nutrition</li>
                    <li>😴 Get adequate rest and recovery between sessions</li>
                    <li>📈 Track your progress and adjust as needed</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        <a href="/" className="back-link">← Back to Home</a>
      </div>
    </div>
  )
}

export default AIFeatures
