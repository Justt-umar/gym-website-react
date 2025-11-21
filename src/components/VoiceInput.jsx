import { useState, useEffect } from 'react'
import './VoiceInput.css'

function VoiceInput({ onTranscript, placeholder = "Click mic to speak" }) {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [recognition, setRecognition] = useState(null)

  useEffect(() => {
    // Check if browser supports speech recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    
    if (!SpeechRecognition) {
      console.warn('Speech recognition not supported in this browser')
      return
    }

    const recognitionInstance = new SpeechRecognition()
    recognitionInstance.continuous = false
    recognitionInstance.interimResults = false
    recognitionInstance.lang = 'en-US'

    recognitionInstance.onresult = (event) => {
      const text = event.results[0][0].transcript
      setTranscript(text)
      onTranscript(text)
      setIsListening(false)
    }

    recognitionInstance.onerror = (event) => {
      console.error('Speech recognition error:', event.error)
      setIsListening(false)
    }

    recognitionInstance.onend = () => {
      setIsListening(false)
    }

    setRecognition(recognitionInstance)

    return () => {
      if (recognitionInstance) {
        recognitionInstance.stop()
      }
    }
  }, [onTranscript])

  const toggleListening = () => {
    if (!recognition) {
      alert('Voice input is not supported in your browser. Please use Chrome, Edge, or Safari.')
      return
    }

    if (isListening) {
      recognition.stop()
      setIsListening(false)
    } else {
      setTranscript('')
      recognition.start()
      setIsListening(true)
    }
  }

  return (
    <div className="voice-input-container">
      <button
        type="button"
        className={`voice-btn ${isListening ? 'listening' : ''}`}
        onClick={toggleListening}
        aria-label={isListening ? 'Stop recording' : 'Start voice input'}
      >
        {isListening ? '🔴' : '🎤'}
      </button>
      {isListening && <span className="listening-indicator">Listening...</span>}
      {transcript && !isListening && <span className="transcript-preview">{transcript}</span>}
    </div>
  )
}

export default VoiceInput
