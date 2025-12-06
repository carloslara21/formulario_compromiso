import { useState, useEffect } from 'react'
import EmailInput from './components/EmailInput'
import ServerSelection from './components/ServerSelection'
import ProjectSelection from './components/ProjectSelection'
import TeammateSelection from './components/TeammateSelection'
import EvaluationForm from './components/EvaluationForm'
import NavigationButtons from './components/NavigationButtons'
import AdminPanel from './components/AdminPanel'
import SuccessMessage from './components/SuccessMessage'
import { loadData, saveData } from './utils/dataUtils'
import './App.css'

function App() {
  const [data, setData] = useState(loadData())
  const [step, setStep] = useState(0) // 0: Email, 1: Server, 2: Project, 3: Room, 4: Teammate, 5: Evaluation
  const [email, setEmail] = useState('')
  const [selectedServer, setSelectedServer] = useState('')
  const [selectedProject, setSelectedProject] = useState('')
  const [selectedRoom, setSelectedRoom] = useState('')
  const [selectedTeammate, setSelectedTeammate] = useState('')
  const [evaluationAnswers, setEvaluationAnswers] = useState({})
  const [showAdmin, setShowAdmin] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [errors, setErrors] = useState({})

  // Atajo de teclado para panel de administración
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.altKey && e.key.toLowerCase() === 'a') {
        e.preventDefault()
        setShowAdmin(true)
      }
      // ESC para cerrar panel
      if (e.key === 'Escape' && showAdmin) {
        setShowAdmin(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [showAdmin])

  // Guardar datos cuando cambien
  useEffect(() => {
    saveData(data)
  }, [data])

  const validateEmail = (emailValue) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(emailValue)
  }

  const validateCurrentStep = () => {
    const newErrors = {}

    if (step === 0) {
      if (!email || email.trim() === '') {
        newErrors.email = 'El correo electrónico es obligatorio.'
      } else if (!validateEmail(email)) {
        newErrors.email = 'Por favor, ingrese un correo electrónico válido.'
      }
    } else if (step === 1) {
      if (!selectedServer) {
        newErrors.server = 'Esta pregunta es obligatoria.'
      }
    } else if (step === 2) {
      if (!selectedProject) {
        newErrors.project = 'Esta pregunta es obligatoria.'
      }
    } else if (step === 3) {
      if (!selectedRoom) {
        newErrors.room = 'Esta pregunta es obligatoria.'
      }
    } else if (step === 4) {
      if (!selectedTeammate) {
        newErrors.teammate = 'Esta pregunta es obligatoria.'
      }
    } else if (step === 5) {
      data.questions.forEach((_, index) => {
        if (!evaluationAnswers[index] || evaluationAnswers[index].trim() === '') {
          newErrors[`question_${index}`] = 'Esta pregunta es obligatoria.'
        }
      })
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateCurrentStep()) {
      setStep(step + 1)
      setErrors({})
    }
  }

  const handleBack = () => {
    setStep(step - 1)
    setErrors({})
  }

  const handleEmailChange = (value) => {
    setEmail(value)
    if (errors.email) {
      setErrors({ ...errors, email: '' })
    }
  }

  const handleServerSelect = (server) => {
    setSelectedServer(server)
    setSelectedProject('')
    setSelectedRoom('')
    setSelectedTeammate('')
    if (errors.server) {
      setErrors({ ...errors, server: '' })
    }
  }

  const handleProjectSelect = (project) => {
    setSelectedProject(project)
    setSelectedRoom('')
    setSelectedTeammate('')
    if (errors.project) {
      setErrors({ ...errors, project: '' })
    }
  }

  const handleRoomSelect = (room) => {
    setSelectedRoom(room)
    setSelectedTeammate('')
    if (errors.room) {
      setErrors({ ...errors, room: '' })
    }
  }

  const handleTeammateSelect = (teammate) => {
    setSelectedTeammate(teammate)
    if (errors.teammate) {
      setErrors({ ...errors, teammate: '' })
    }
  }

  const handleAnswerChange = (questionIndex, answer) => {
    setEvaluationAnswers({
      ...evaluationAnswers,
      [questionIndex]: answer
    })
    if (errors[`question_${questionIndex}`]) {
      const newErrors = { ...errors }
      delete newErrors[`question_${questionIndex}`]
      setErrors(newErrors)
    }
  }

  const handleSubmit = () => {
    if (!validateCurrentStep()) {
      return
    }

    // Guardar evaluación
    const evaluation = {
      id: Date.now(),
      email: email,
      server: selectedServer,
      project: selectedProject,
      room: selectedRoom,
      teammate: selectedTeammate,
      answers: evaluationAnswers,
      date: new Date().toISOString()
    }

    const newData = {
      ...data,
      evaluations: [...data.evaluations, evaluation]
    }

    setData(newData)
    saveData(newData)

    // Reset form
    setStep(0)
    setEmail('')
    setSelectedServer('')
    setSelectedProject('')
    setSelectedRoom('')
    setSelectedTeammate('')
    setEvaluationAnswers({})
    setErrors({})
    setShowSuccess(true)

    setTimeout(() => {
      setShowSuccess(false)
    }, 5000)
  }

  const updateData = (newData) => {
    setData(newData)
    saveData(newData)
  }

  const totalSteps = 6 // 0-5

  return (
    <div className="app">
      <header className="header">
        <h1>EVALUACIÓN 360</h1>
        <p className="subtitle">360-V3-6TO PROYECTO INNOVACIÓN</p>
      </header>

      <div className="container">
        {showSuccess && <SuccessMessage />}

        {/* Paso 0: Email */}
        {step === 0 && (
          <>
            <EmailInput
              email={email}
              onEmailChange={handleEmailChange}
              error={errors.email}
            />
            <NavigationButtons
              currentStep={step}
              totalSteps={totalSteps}
              onNext={handleNext}
              canGoBack={false}
              canGoNext={true}
            />
          </>
        )}

        {/* Paso 1: Servidor */}
        {step === 1 && (
          <>
            <ServerSelection
              servers={data.servers}
              selectedServer={selectedServer}
              onSelect={handleServerSelect}
              error={errors.server}
              show={true}
            />
            <NavigationButtons
              currentStep={step}
              totalSteps={totalSteps}
              onBack={handleBack}
              onNext={handleNext}
              canGoBack={true}
              canGoNext={true}
            />
          </>
        )}

        {/* Paso 2: Proyecto */}
        {step === 2 && (
          <>
            <ProjectSelection
              projects={data.projects[selectedServer] || []}
              server={selectedServer}
              selectedProject={selectedProject}
              onSelect={handleProjectSelect}
              error={errors.project}
              show={true}
            />
            <NavigationButtons
              currentStep={step}
              totalSteps={totalSteps}
              onBack={handleBack}
              onNext={handleNext}
              canGoBack={true}
              canGoNext={true}
            />
          </>
        )}

        {/* Paso 3: Sala */}
        {step === 3 && (
          <>
            <ProjectSelection
              projects={data.rooms[selectedServer]?.[selectedProject] || []}
              server={selectedServer}
              selectedProject={selectedRoom}
              onSelect={handleRoomSelect}
              error={errors.room}
              show={true}
              title="Selecciona una Sala"
              subtitle="¿En qué sala se encuentra?"
            />
            <NavigationButtons
              currentStep={step}
              totalSteps={totalSteps}
              onBack={handleBack}
              onNext={handleNext}
              canGoBack={true}
              canGoNext={true}
            />
          </>
        )}

        {/* Paso 4: Compañero */}
        {step === 4 && (
          <>
            <TeammateSelection
              teammates={data.teammates[selectedServer]?.[selectedProject]?.[selectedRoom] || []}
              selectedTeammate={selectedTeammate}
              onSelect={handleTeammateSelect}
              error={errors.teammate}
              show={true}
            />
            <NavigationButtons
              currentStep={step}
              totalSteps={totalSteps}
              onBack={handleBack}
              onNext={handleNext}
              canGoBack={true}
              canGoNext={true}
            />
          </>
        )}

        {/* Paso 5: Evaluación */}
        {step === 5 && (
          <>
            <EvaluationForm
              questions={data.questions}
              answers={evaluationAnswers}
              onAnswerChange={handleAnswerChange}
              errors={errors}
            />
            <NavigationButtons
              currentStep={step}
              totalSteps={totalSteps}
              onBack={handleBack}
              onNext={handleSubmit}
              canGoBack={true}
              canGoNext={true}
              nextLabel="Enviar Evaluación"
            />
          </>
        )}
      </div>

      {showAdmin && (
        <AdminPanel
          data={data}
          onUpdate={updateData}
          onClose={() => setShowAdmin(false)}
        />
      )}
    </div>
  )
}

export default App
