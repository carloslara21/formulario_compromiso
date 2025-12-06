import './FormSection.css'

function TeammateSelection({ teammates, selectedTeammate, onSelect, error, show }) {
  const handleChange = (e) => {
    onSelect(e.target.value)
  }

  if (!show) return null

  return (
    <section className={`form-section ${error ? 'error' : ''}`}>
      <div className="section-header">
        <h2>EVALUACIÓN DE COMPAÑERO</h2>
      </div>
      <div className="form-content">
        <label htmlFor="teammate-select">
          Seleccione el compañero a evaluar <span className="required">*</span>
        </label>
        <select
          id="teammate-select"
          className="form-control"
          value={selectedTeammate}
          onChange={handleChange}
          required
        >
          <option value="">Elegir</option>
          {teammates.map((teammate, index) => (
            <option key={index} value={teammate}>
              {teammate}
            </option>
          ))}
        </select>
        {error && (
          <div className="error-message show">
            {error}
          </div>
        )}
      </div>
    </section>
  )
}

export default TeammateSelection

