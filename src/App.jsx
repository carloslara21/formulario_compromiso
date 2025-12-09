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
import { saveDataToServer } from './utils/apiService'
import './App.css'

function App() {
  const [data, setData] = useState(loadData())
  const [step, setStep] = useState(0)
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [selectedServer, setSelectedServer] = useState('')
  const [selectedProject, setSelectedProject] = useState('')
  const [selectedRoom, setSelectedRoom] = useState('')
  const [selectedTeammate, setSelectedTeammate] = useState('')
  const [evaluatedTeammates, setEvaluatedTeammates] = useState([])
  const [evaluationAnswers, setEvaluationAnswers] = useState({})
  const [showAdmin, setShowAdmin] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.altKey && e.key.toLowerCase() === 'a') {
        e.preventDefault()
        setShowAdmin(true)
      }
      if (e.key === 'Escape' && showAdmin) {
        setShowAdmin(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [showAdmin])

  useEffect(() => {
    saveData(data)
    // También guardar en servidor si está configurado
    saveDataToServer(data).catch(err => {
      console.warn('Error al sincronizar con servidor:', err)
    })
  }, [data])

  const validateEmail = (emailValue) => {
    const emailRegex = /^[^\s@]+@senati\.pe$/
    return emailRegex.test(emailValue)
  }

  const validateCurrentStep = () => {
    const newErrors = {}

    if (step === 0) {
      if (!username || username.trim() === '') {
        newErrors.username = 'El nombre de usuario es obligatorio.'
      }

      if (!email || email.trim() === '') {
        newErrors.email = 'El correo electrónico es obligatorio.'
      } else if (!validateEmail(email)) {
        newErrors.email = 'Por favor, ingrese un correo que termine en @senati.pe'
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

  const handleUsernameChange = (value) => {
    setUsername(value)
    if (errors.username) setErrors({ ...errors, username: '' })
  }

  const handleEmailChange = (value) => {
    setEmail(value)
    if (errors.email) setErrors({ ...errors, email: '' })
  }

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
    if (errors.server) setErrors({ ...errors, server: '' })
  }

  const handleProjectSelect = (project) => {
    setSelectedProject(project)
    setSelectedRoom('')
    setSelectedTeammate('')
    if (errors.project) setErrors({ ...errors, project: '' })
  }

  const handleRoomSelect = (room) => {
    setSelectedRoom(room)
    setSelectedTeammate('')
    if (errors.room) setErrors({ ...errors, room: '' })
  }

  const handleTeammateSelect = (teammate) => {
    setSelectedTeammate(teammate)
    if (errors.teammate) setErrors({ ...errors, teammate: '' })
  }

  const getAvailableTeammates = () => {
    const teammates = data.teammates[selectedServer]?.[selectedProject]?.[selectedRoom] || []
    const usernameLower = username.toLowerCase().trim()

    return teammates.filter(t => {
      if (t.toLowerCase() === usernameLower) return false
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
    if (!validateCurrentStep()) return

    const evaluation = {
      id: Date.now(),
      username,
      email,
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

    const newEvaluated = [...evaluatedTeammates, selectedTeammate]
    setEvaluatedTeammates(newEvaluated)

    const allTeammates = data.teammates[selectedServer]?.[selectedProject]?.[selectedRoom] || []
    const usernameLower = username.toLowerCase().trim()
    const remaining = allTeammates.filter(
      t => t.toLowerCase() !== usernameLower && !newEvaluated.includes(t)
    )

    if (remaining.length > 0) {
      setStep(4)
      setSelectedTeammate('')
      setEvaluationAnswers({})
      setErrors({})
    } else {
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

      setTimeout(() => setShowSuccess(false), 5000)
    }
  }

  const updateData = (newData) => {
    setData(newData)
    saveData(newData)
  }

  const totalSteps = 6

  return (
    <div className="app">
      <header className="header">
        <h1>EVALUACIÓN 360</h1>
        <p className="subtitle">360-V3-6TO PROYECTO INNOVACIÓN</p>
      </header>

      <div className="container">
        {showSuccess && <SuccessMessage />}

        {/* Paso 0: Email + Username */}
        {step === 0 && (
          <>
            <div style={{ padding: '30px 20px', backgroundColor: '#fff', borderRadius: '8px', marginBottom: '20px' }}>
              <div style={{ padding: '20px', backgroundColor: '#f5f5f5', borderRadius: '8px', marginBottom: '20px' }}>
                <h3 style={{ marginTop: 0, color: '#333' }}>Estimado/a participante:</h3>
                <p style={{ color: '#555', lineHeight: '1.6' }}>
                  Esta evaluación forma parte del proceso de análisis y mejora continua de los proyectos desarrollados
                  por los practicantes del SENATI en la empresa RP SOFT. El propósito de esta evaluación es recopilar
                  información sobre el desempeño, avances, retos y resultados de cada proyecto, con fines
                  exclusivamente académicos y formativos.
                </p>
              </div>

              <div style={{ 
                borderLeft: '4px solid #d32f2f',
                paddingLeft: '15px',
                marginBottom: '20px',
                backgroundColor: '#fff3f3',
                padding: '15px',
                borderRadius: '4px'
              }}>
                <p style={{ color: '#d32f2f', fontWeight: 'bold', margin: '0' }}>
                  USA TU CORREO INSTITUCIONAL DEL SENATI, NO EL PERSONAL, NO TE PASES DE QUIOSPE.
                </p>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333' }}>
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
                />
                {errors.username && <p style={{ color: '#d32f2f', marginTop: '5px', fontSize: '14px' }}>{errors.username}</p>}
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333' }}>
                  Correo electrónico *
                </label>
                <input
                  type="email"
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '4px',
                    border: '1px solid #ddd',
                    fontSize: '16px',
                    boxSizing: 'border-box'
                  }}
                  placeholder="tu.correo@senati.pe"
                  value={email}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleNext()}
                />
                {errors.email && <p style={{ color: '#d32f2f', marginTop: '5px', fontSize: '14px' }}>{errors.email}</p>}
                <p style={{ color: '#999', fontSize: '12px', marginTop: '5px' }}>* Indica que la pregunta es obligatoria</p>
              </div>
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

        {/* Paso 5: Evaluación */}
        {step === 5 && (
          <>
            <EvaluationForm
              questions={data.questions}
              answers={evaluationAnswers}
              onAnswerChange={handleAnswerChange}
              errors={errors}
              onProceed={handleSubmit}
              onBackToRoom={() => {
                setStep(3)
                setSelectedRoom('')
                setSelectedTeammate('')
                setEvaluatedTeammates([])
                setEvaluationAnswers({})
                setErrors({})
              }}
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
