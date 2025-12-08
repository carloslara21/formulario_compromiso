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
  const [step, setStep] = useState(0) // 0: Username, 1: Email, 2: Server, 3: Project, 4: Room, 5: Teammate, 6: Evaluation
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [selectedServer, setSelectedServer] = useState('')
  const [selectedProject, setSelectedProject] = useState('')
  const [selectedRoom, setSelectedRoom] = useState('')
  const [selectedTeammate, setSelectedTeammate] = useState('')
  const [evaluatedTeammates, setEvaluatedTeammates] = useState([]) // Lista de compañeros ya evaluados
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
      if (!username || username.trim() === '') {
        newErrors.username = 'El nombre de usuario es obligatorio.'
      }
    } else if (step === 1) {
      if (!email || email.trim() === '') {
        newErrors.email = 'El correo electrónico es obligatorio.'
      } else if (!validateEmail(email)) {
        newErrors.email = 'Por favor, ingrese un correo electrónico válido.'
      }
    } else if (step === 2) {
      if (!selectedServer) {
        newErrors.server = 'Esta pregunta es obligatoria.'
      }
    } else if (step === 3) {
      if (!selectedProject) {
        newErrors.project = 'Esta pregunta es obligatoria.'
      }
    } else if (step === 4) {
      if (!selectedRoom) {
        newErrors.room = 'Esta pregunta es obligatoria.'
      }
    } else if (step === 5) {
      if (!selectedTeammate) {
        newErrors.teammate = 'Esta pregunta es obligatoria.'
      }
    } else if (step === 6) {
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

  const handleUsernameChange = (value) => {
    setUsername(value)
    if (errors.username) {
      setErrors({ ...errors, username: '' })
    }
  }

  const handleEmailChange = (value) => {
    setEmail(value)
    if (errors.email) {
      setErrors({ ...errors, email: '' })
    }
  }

  // Buscar si el usuario existe en la BD de compañeros (case-insensitive)
  const findUserInDatabase = (name) => {
    const nameLower = name.toLowerCase().trim()
    for (const server of Object.keys(data.teammates)) {
      for (const project of Object.keys(data.teammates[server])) {
        for (const room of Object.keys(data.teammates[server][project])) {
          const teammate = data.teammates[server][project][room].find(
            t => t.toLowerCase() === nameLower
          )
          if (teammate) {
            return { server, project, room, teammate }
          }
        }
      }
    }
    return null
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

  // Obtener lista de compañeros excluyendo al usuario actual
  const getAvailableTeammates = () => {
    const teammates = data.teammates[selectedServer]?.[selectedProject]?.[selectedRoom] || []
    // Excluir al usuario actual (case-insensitive)
    const usernameLower = username.toLowerCase().trim()
    return teammates.filter(t => {
      // Excluir usuario actual
      if (t.toLowerCase() === usernameLower) return false
      // Excluir ya evaluados
      if (evaluatedTeammates.includes(t)) return false
      return true
    })
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
      username: username,
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

    // Agregar compañero a la lista de evaluados
    const newEvaluated = [...evaluatedTeammates, selectedTeammate]
    setEvaluatedTeammates(newEvaluated)

    // Obtener compañeros disponibles (excluyen usuario actual y ya evaluados)
    const allTeammates = data.teammates[selectedServer]?.[selectedProject]?.[selectedRoom] || []
    const usernameLower = username.toLowerCase().trim()
    const remaining = allTeammates.filter(t => 
      t.toLowerCase() !== usernameLower && !newEvaluated.includes(t)
    )

    // Si hay más compañeros por evaluar, volver al paso 5 (selección de compañero)
    if (remaining.length > 0) {
      setStep(5)
      setSelectedTeammate('')
      setEvaluationAnswers({})
      setErrors({})
    } else {
      // Si no hay más, mostrar éxito y resetear
      setStep(0)
      setUsername('')
      setEmail('')
      setSelectedServer('')
      setSelectedProject('')
      setSelectedRoom('')
      setSelectedTeammate('')
      setEvaluatedTeammates([])
      setEvaluationAnswers({})
      setErrors({})
      setShowSuccess(true)

      setTimeout(() => {
        setShowSuccess(false)
      }, 5000)
    }
  }

  const updateData = (newData) => {
    setData(newData)
    saveData(newData)
  }

  const totalSteps = 7 // 0-6 (Username, Email, Server, Project, Room, Teammate, Evaluation)

  return (
    <div className="app">
      <header className="header">
        <h1>EVALUACIÓN 360</h1>
        <p className="subtitle">360-V3-6TO PROYECTO INNOVACIÓN</p>
      </header>

      <div className="container">
        {showSuccess && <SuccessMessage />}

        {/* Paso 0: Nombre de Usuario */}
        {step === 0 && (
          <>
            <div style={{ padding: '20px', backgroundColor: '#f5f5f5', borderRadius: '8px', marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>
                Nombre de Usuario *
              </label>
              <input
                type="text"
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '4px',
                  border: '1px solid #ddd',
                  fontSize: '16px',
                  boxSizing: 'border-box'
                }}
                placeholder="Ingresa tu nombre de usuario"
                value={username}
                onChange={(e) => handleUsernameChange(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleNext()}
              />
              {errors.username && <p style={{ color: '#d32f2f', marginTop: '5px' }}>{errors.username}</p>}
            </div>
            <NavigationButtons
              currentStep={step}
              totalSteps={totalSteps}
              onNext={handleNext}
              canGoBack={false}
              canGoNext={true}
            />
          </>
        )}

        {/* Paso 1: Email */}
        {step === 1 && (
          <>
            <EmailInput
              email={email}
              onEmailChange={handleEmailChange}
              error={errors.email}
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

        {/* Paso 2: Servidor */}
        {step === 2 && (
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

        {/* Paso 3: Proyecto */}
        {step === 3 && (
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

        {/* Paso 4: Sala */}
        {step === 4 && (
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

        {/* Paso 5: Compañero */}
        {step === 5 && (
          <>
            <TeammateSelection
              teammates={getAvailableTeammates()}
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

        {/* Paso 6: Evaluación */}
        {step === 6 && (
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
