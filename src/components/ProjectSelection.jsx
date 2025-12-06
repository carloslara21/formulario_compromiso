import './FormSection.css'

function ProjectSelection({ projects, server, selectedProject, onSelect, error, show }) {
  const handleChange = (e) => {
    onSelect(e.target.value)
  }

  if (!show) return null

  return (
    <section className={`form-section ${error ? 'error' : ''}`}>
      <div className="section-header">
        <h2>PROYECTOS DEL SERVIDOR {server}</h2>
      </div>
      <div className="form-content">
        <label htmlFor="project-select">
          Elije tu proyecto <span className="required">*</span>
        </label>
        <select
          id="project-select"
          className="form-control"
          value={selectedProject}
          onChange={handleChange}
          required
        >
          <option value="">Elegir</option>
          {projects.map((project, index) => (
            <option key={index} value={project}>
              {project}
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

export default ProjectSelection

