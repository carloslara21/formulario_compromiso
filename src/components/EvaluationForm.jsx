import { useState } from 'react'
import './FormSection.css'

function EvaluationForm({ questions, answers, onAnswerChange, errors }) {
  const handleInputChange = (index, value) => {
    onAnswerChange(index, value)
  }

  return (
    <section className="form-section">
      <div className="section-header">
        <h2>FORMULARIO DE EVALUACIÓN</h2>
      </div>
      <div className="form-content">
        {questions.map((question, index) => (
          <div key={index} className="question-item">
            <label htmlFor={`question-${index}`}>
              {question} <span className="required">*</span>
            </label>
            <input
              type="text"
              id={`question-${index}`}
              placeholder="Texto de respuesta breve"
              value={answers[index] || ''}
              onChange={(e) => handleInputChange(index, e.target.value)}
              className={errors[`question_${index}`] ? 'error-input' : ''}
            />
            {errors[`question_${index}`] && (
              <div className="error-message show">
                {errors[`question_${index}`]}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}

export default EvaluationForm

