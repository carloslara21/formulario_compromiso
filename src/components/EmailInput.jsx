import './FormSection.css'

function EmailInput({ email, onEmailChange, error }) {
  return (
    <section className={`form-section ${error ? 'error' : ''}`}>
      <div className="intro-text">
        <p><strong>Estimado/a participante:</strong></p>
        <p>
          Esta evaluación forma parte del proceso de análisis y mejora continua de los proyectos 
          desarrollados por los practicantes del SENATI en la empresa RP SOFT. El propósito de esta 
          evaluación es recopilar información sobre el desempeño, avances, retos y resultados de cada 
          proyecto, con fines exclusivamente académicos y formativos.
        </p>
        <p className="warning-text">
          <strong>USA TU CORREO INSTITUCIONAL DEL SENATI, NO EL PERSONAL, NO TE PASES DE QUISPE.</strong>
        </p>
      </div>
      <div className="form-content">
        <label htmlFor="email-input">
          Correo electrónico <span className="required">*</span>
        </label>
        <input
          type="email"
          id="email-input"
          className="form-control"
          placeholder="Tu dirección de correo electrónico"
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          required
        />
        {error && (
          <div className="error-message show">
            {error}
          </div>
        )}
        <p className="required-indicator">
          * Indica que la pregunta es obligatoria
        </p>
      </div>
    </section>
  )
}

export default EmailInput

