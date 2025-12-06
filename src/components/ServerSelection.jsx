import './FormSection.css'

function ServerSelection({ servers, selectedServer, onSelect, error, show }) {
  const handleChange = (e) => {
    onSelect(e.target.value)
  }

  if (!show) return null

  return (
    <section className={`form-section ${error ? 'error' : ''}`}>
      <div className="section-header">
        <h2>SELECCIÓN DE SERVIDOR</h2>
      </div>
      <div className="form-content">
        <label htmlFor="server-select">
          Elija su servidor <span className="required">*</span>
        </label>
        <select
          id="server-select"
          className="form-control"
          value={selectedServer}
          onChange={handleChange}
          required
        >
          <option value="">Elegir</option>
          {servers.map((server, index) => (
            <option key={index} value={server}>
              {server}
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

export default ServerSelection

