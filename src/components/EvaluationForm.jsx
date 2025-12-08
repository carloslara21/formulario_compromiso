import { useState } from 'react'
import './FormSection.css'

function EvaluationForm({ questions, answers, onAnswerChange, errors, onProceed, onBackToRoom }) {
  const [currentPage, setCurrentPage] = useState(0) // 0: preguntas 0-5, 1: preguntas 6-11
  
  // Preguntas numéricas (0-10) y preguntas de texto (11)
  const numericQuestions = 11 // primeras 11 preguntas (índices 0-10)
  
  const handleNumericChange = (index, value) => {
    // Solo permitir números 0-20
    if (value === '') {
      onAnswerChange(index, '')
      return
    }
    
    const numValue = parseInt(value, 10)
    if (!isNaN(numValue) && numValue >= 0 && numValue <= 20) {
      onAnswerChange(index, value)
    }
  }

  const handleTextChange = (index, value) => {
    // Para la pregunta adicional (texto libre)
    onAnswerChange(index, value)
  }

  const questionsPage0 = questions.slice(0, 6)
  const questionsPage1 = questions.slice(6)

  return (
    <section className="form-section">
      <div className="section-header">
        <h2>FORMULARIO DE EVALUACIÓN</h2>
      </div>

      {/* Página 0: Preguntas 1-6 */}
      {currentPage === 0 && (
        <div className="form-content">
          {questionsPage0.map((question, index) => (
            <div key={index} className="question-item">
              <label htmlFor={`question-${index}`}>
                {question} <span className="required">*</span>
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', position: 'relative' }}>
                <input
                  type="number"
                  id={`question-${index}`}
                  placeholder="0-20"
                  value={answers[index] || ''}
                  onChange={(e) => handleNumericChange(index, e.target.value)}
                  min="0"
                  max="20"
                  className={errors[`question_${index}`] ? 'error-input' : ''}
                  style={{
                    flex: 1,
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '16px'
                  }}
                />
                <span style={{ fontSize: '12px', color: '#666' }}>0-20</span>
              </div>
              {errors[`question_${index}`] && (
                <div className="error-message show">
                  {errors[`question_${index}`]}
                </div>
              )}
            </div>
          ))}

          {/* Botón para siguiente página */}
          <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'space-between' }}>
            <button
              onClick={() => onBackToRoom?.()}
              style={{
                padding: '10px 30px',
                backgroundColor: '#999',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: 'bold'
              }}
            >
              ← Volver
            </button>
            <button
              onClick={() => setCurrentPage(1)}
              style={{
                padding: '10px 30px',
                backgroundColor: '#6B46C1',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: 'bold'
              }}
            >
              Siguiente →
            </button>
          </div>
        </div>
      )}

      {/* Página 1: Preguntas 7-11 + pregunta adicional */}
      {currentPage === 1 && (
        <div className="form-content">
          {questionsPage1.map((question, index) => {
            const globalIndex = 6 + index // índice real en el array
            const isTextQuestion = globalIndex >= numericQuestions // pregunta adicional
            
            return (
              <div key={globalIndex} className="question-item">
                <label htmlFor={`question-${globalIndex}`}>
                  {question} <span className="required">*</span>
                </label>
                
                {isTextQuestion ? (
                  // Pregunta de texto libre (pregunta 12)
                  <textarea
                    id={`question-${globalIndex}`}
                    placeholder="Escribe tu respuesta aquí..."
                    value={answers[globalIndex] || ''}
                    onChange={(e) => handleTextChange(globalIndex, e.target.value)}
                    className={errors[`question_${globalIndex}`] ? 'error-input' : ''}
                    rows="4"
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '16px',
                      fontFamily: 'inherit',
                      boxSizing: 'border-box'
                    }}
                  />
                ) : (
                  // Preguntas numéricas (7-11)
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <input
                      type="number"
                      id={`question-${globalIndex}`}
                      placeholder="0-20"
                      value={answers[globalIndex] || ''}
                      onChange={(e) => handleNumericChange(globalIndex, e.target.value)}
                      min="0"
                      max="20"
                      className={errors[`question_${globalIndex}`] ? 'error-input' : ''}
                      style={{
                        flex: 1,
                        padding: '10px',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        fontSize: '16px'
                      }}
                    />
                    <span style={{ fontSize: '12px', color: '#666' }}>0-20</span>
                  </div>
                )}
                
                {errors[`question_${globalIndex}`] && (
                  <div className="error-message show">
                    {errors[`question_${globalIndex}`]}
                  </div>
                )}
              </div>
            )
          })}

          {/* Botones: Anterior y Enviar */}
          <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
            <button
              onClick={() => setCurrentPage(0)}
              style={{
                padding: '10px 30px',
                backgroundColor: '#999',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: 'bold'
              }}
            >
              ← Anterior
            </button>
            <button
              onClick={onProceed}
              style={{
                padding: '10px 30px',
                backgroundColor: '#6B46C1',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: 'bold'
              }}
            >
              Enviar Evaluación
            </button>
          </div>
        </div>
      )}
    </section>
  )
}

export default EvaluationForm
