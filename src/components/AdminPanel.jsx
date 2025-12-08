import { useState, useEffect } from 'react'
import './AdminPanel.css'

function AdminPanel({ data, onUpdate, onClose }) {
  const [activeTab, setActiveTab] = useState('servers')
  const [formData, setFormData] = useState({
    newServer: '',
    newProject: '',
    newRoom: '',
    newTeammate: '',
    newQuestion: '',
    serverForProject: '',
    serverForRoom: '',
    projectForRoom: '',
    serverForTeammate: '',
    projectForTeammate: '',
    roomForTeammate: ''
  })
  const [filterServer, setFilterServer] = useState('')
  const [filterProject, setFilterProject] = useState('')
  const [collapsedServers, setCollapsedServers] = useState({}) // { server: true/false }
  const [collapsedProjects, setCollapsedProjects] = useState({}) // { 'server|project': true/false }
  const [collapsedRooms, setCollapsedRooms] = useState({}) // { 'server|project|room': true/false }
  const [collapsedServersRooms, setCollapsedServersRooms] = useState({}) // { server: true/false } para salas
  const [collapsedProjectsRooms, setCollapsedProjectsRooms] = useState({}) // { 'server|project': true/false } para salas

  const handleAddServer = () => {
    if (!formData.newServer.trim()) return
    const newData = {
      ...data,
      servers: [...data.servers, formData.newServer.trim()]
    }
    onUpdate(newData)
    setFormData({ ...formData, newServer: '' })
  }

  const handleDeleteServer = (server) => {
    if (window.confirm(`¿Está seguro de eliminar el servidor "${server}"?`)) {
      const newServers = data.servers.filter(s => s !== server)
      const newProjects = { ...data.projects }
      delete newProjects[server]
      const newTeammates = { ...data.teammates }
      delete newTeammates[server]
      const newData = {
        ...data,
        servers: newServers,
        projects: newProjects,
        teammates: newTeammates
      }
      onUpdate(newData)
    }
  }

  const handleAddProject = () => {
    if (!formData.serverForProject || !formData.newProject.trim()) return
    const newData = {
      ...data,
      projects: {
        ...data.projects,
        [formData.serverForProject]: [
          ...(data.projects[formData.serverForProject] || []),
          formData.newProject.trim()
        ]
      }
    }
    onUpdate(newData)
    setFormData({ ...formData, newProject: '', serverForProject: '' })
  }

  const handleAddRoom = () => {
    if (!formData.serverForRoom || !formData.projectForRoom || !formData.newRoom.trim()) return
    const server = formData.serverForRoom
    const project = formData.projectForRoom
    const rooms = { ...(data.rooms || {}) }
    rooms[server] = { ...(rooms[server] || {}) }
    rooms[server][project] = [ ...(rooms[server][project] || []), formData.newRoom.trim() ]

    const newData = {
      ...data,
      rooms
    }
    onUpdate(newData)
    setFormData({ ...formData, newRoom: '', projectForRoom: '' })
  }

  const handleDeleteRoom = (server, project, room) => {
    if (window.confirm(`¿Está seguro de eliminar la sala "${room}"?`)) {
      const rooms = { ...(data.rooms || {}) }
      if (rooms[server] && rooms[server][project]) {
        rooms[server] = { ...rooms[server], [project]: rooms[server][project].filter(r => r !== room) }
        // Si el proyecto queda vacío, eliminar la clave del proyecto
        if (rooms[server][project].length === 0) {
          const { [project]: _, ...rest } = rooms[server]
          rooms[server] = rest
        }
        const newData = { ...data, rooms }
        onUpdate(newData)
      }
    }
  }

  const handleDeleteProject = (server, project) => {
    if (window.confirm(`¿Está seguro de eliminar el proyecto "${project}"?`)) {
      const newProjects = {
        ...data.projects,
        [server]: data.projects[server].filter(p => p !== project)
      }
      const newTeammates = { ...data.teammates }
      if (newTeammates[server]) {
        const newServerTeammates = { ...newTeammates[server] }
        delete newServerTeammates[project]
        newTeammates[server] = newServerTeammates
      }
      const newData = {
        ...data,
        projects: newProjects,
        teammates: newTeammates
      }
      onUpdate(newData)
    }
  }

  const handleAddTeammate = () => {
    if (!formData.serverForTeammate || !formData.projectForTeammate || !formData.roomForTeammate || !formData.newTeammate.trim()) return
    const server = formData.serverForTeammate
    const project = formData.projectForTeammate
    const room = formData.roomForTeammate
    
    const newData = {
      ...data,
      teammates: {
        ...data.teammates,
        [server]: {
          ...(data.teammates[server] || {}),
          [project]: {
            ...(data.teammates[server]?.[project] || {}),
            [room]: [
              ...(data.teammates[server]?.[project]?.[room] || []),
              formData.newTeammate.trim()
            ]
          }
        }
      }
    }
    onUpdate(newData)
    setFormData({ ...formData, newTeammate: '', roomForTeammate: '' })
  }

  const handleDeleteTeammate = (server, project, room, teammate) => {
    if (window.confirm(`¿Está seguro de eliminar al compañero "${teammate}"?`)) {
      const newData = {
        ...data,
        teammates: {
          ...data.teammates,
          [server]: {
            ...data.teammates[server],
            [project]: {
              ...data.teammates[server][project],
              [room]: data.teammates[server][project][room].filter(t => t !== teammate)
            }
          }
        }
      }
      onUpdate(newData)
    }
  }

  const toggleServerCollapse = (server) => {
    setCollapsedServers({ ...collapsedServers, [server]: !collapsedServers[server] })
  }

  const toggleProjectCollapse = (server, project) => {
    const key = `${server}|${project}`
    setCollapsedProjects({ ...collapsedProjects, [key]: !collapsedProjects[key] })
  }

  const toggleRoomCollapse = (server, project, room) => {
    const key = `${server}|${project}|${room}`
    setCollapsedRooms({ ...collapsedRooms, [key]: !collapsedRooms[key] })
  }

  const toggleServerRoomCollapse = (server) => {
    setCollapsedServersRooms({ ...collapsedServersRooms, [server]: !collapsedServersRooms[server] })
  }

  const toggleProjectRoomCollapse = (server, project) => {
    const key = `${server}|${project}`
    setCollapsedProjectsRooms({ ...collapsedProjectsRooms, [key]: !collapsedProjectsRooms[key] })
  }

  const handleAddQuestion = () => {
    if (!formData.newQuestion.trim()) return
    const newData = {
      ...data,
      questions: [...data.questions, formData.newQuestion.trim()]
    }
    onUpdate(newData)
    setFormData({ ...formData, newQuestion: '' })
  }

  const handleDeleteQuestion = (index) => {
    if (window.confirm('¿Está seguro de eliminar esta pregunta?')) {
      const newData = {
        ...data,
        questions: data.questions.filter((_, i) => i !== index)
      }
      onUpdate(newData)
    }
  }

  const getFilteredEvaluations = () => {
    return data.evaluations.filter(evaluation => {
      if (filterServer && evaluation.server !== filterServer) return false
      if (filterProject && evaluation.project !== filterProject) return false
      return true
    })
  }

  // Obtener proyectos filtrados por servidor
  const getFilteredProjects = () => {
    if (!filterServer) {
      // Si no hay servidor seleccionado, mostrar todos los proyectos
      const allProjects = []
      data.servers.forEach(server => {
        (data.projects[server] || []).forEach(project => {
          allProjects.push({ server, project })
        })
      })
      return allProjects
    }
    // Si hay servidor seleccionado, solo mostrar proyectos de ese servidor
    return (data.projects[filterServer] || []).map(project => ({
      server: filterServer,
      project
    }))
  }

  const handleExportCSV = () => {
    const evaluations = getFilteredEvaluations()
    if (evaluations.length === 0) {
      alert('No hay datos para exportar')
      return
    }

    // Crear CSV
    const headers = ['Fecha', 'Servidor', 'Proyecto', 'Compañero Evaluado', ...data.questions]
    const rows = evaluations.map(evaluation => {
      const date = new Date(evaluation.date).toLocaleString('es-ES')
      const answers = data.questions.map((_, index) => {
        return (evaluation.answers[index] || '').replace(/"/g, '""')
      })
      return [date, evaluation.server, evaluation.project, evaluation.teammate, ...answers]
    })

    const csvContent = [
      headers.map(h => `"${h}"`).join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `evaluaciones_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  const handleExportBackup = () => {
    // Crear backup completo de toda la data del admin
    const backupData = {
      timestamp: new Date().toISOString(),
      servers: data.servers,
      projects: data.projects,
      rooms: data.rooms,
      teammates: data.teammates,
      questions: data.questions,
      evaluations: data.evaluations
    }

    const jsonStr = JSON.stringify(backupData, null, 2)
    const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `backup_admin_${new Date().toISOString().split('T')[0]}.json`
    link.click()
  }

  // Obtener todos los proyectos para el selector de compañeros
  const getAllProjectsForTeammate = () => {
    const allProjects = []
    Object.keys(data.projects).forEach(server => {
      data.projects[server].forEach(project => {
        allProjects.push({ server, project, label: `${server} - ${project}` })
      })
    })
    return allProjects
  }

  return (
    <div className="admin-panel" onClick={onClose}>
      <div className="admin-content" onClick={(e) => e.stopPropagation()}>
        <h2>Panel de Administración</h2>
        <p className="admin-hint">Presiona ESC para cerrar</p>

        <div className="admin-tabs">
          <button
            className={`tab-btn ${activeTab === 'servers' ? 'active' : ''}`}
            onClick={() => setActiveTab('servers')}
          >
            Servidores
          </button>
          <button
            className={`tab-btn ${activeTab === 'projects' ? 'active' : ''}`}
            onClick={() => setActiveTab('projects')}
          >
            Proyectos
          </button>
          <button
            className={`tab-btn ${activeTab === 'rooms' ? 'active' : ''}`}
            onClick={() => setActiveTab('rooms')}
          >
            Salas
          </button>
          <button
            className={`tab-btn ${activeTab === 'teammates' ? 'active' : ''}`}
            onClick={() => setActiveTab('teammates')}
          >
            Compañeros
          </button>
          <button
            className={`tab-btn ${activeTab === 'questions' ? 'active' : ''}`}
            onClick={() => setActiveTab('questions')}
          >
            Preguntas
          </button>
          <button
            className={`tab-btn ${activeTab === 'data' ? 'active' : ''}`}
            onClick={() => setActiveTab('data')}
          >
            Ver Datos
          </button>
        </div>

        {/* Tab Servidores */}
        {activeTab === 'servers' && (
          <div className="tab-content active">
            <h3>Gestionar Servidores</h3>
            <div className="admin-form">
              <input
                type="text"
                className="form-control"
                placeholder="Nombre del servidor"
                value={formData.newServer}
                onChange={(e) => setFormData({ ...formData, newServer: e.target.value })}
                onKeyPress={(e) => e.key === 'Enter' && handleAddServer()}
              />
              <button className="btn btn-secondary" onClick={handleAddServer}>
                Agregar Servidor
              </button>
            </div>
            <ul className="admin-list">
              {data.servers.map((server, index) => (
                <li key={index}>
                  <span>{server}</span>
                  <button
                    className="delete-btn"
                    onClick={() => handleDeleteServer(server)}
                  >
                    Eliminar
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Tab Proyectos */}
        {activeTab === 'projects' && (
          <div className="tab-content active">
            <h3>Gestionar Proyectos</h3>
            <div className="admin-form">
              <select
                className="form-control"
                value={formData.serverForProject}
                onChange={(e) => setFormData({ ...formData, serverForProject: e.target.value })}
              >
                <option value="">Seleccionar servidor</option>
                {data.servers.map((server, index) => (
                  <option key={index} value={server}>
                    {server}
                  </option>
                ))}
              </select>
              <input
                type="text"
                className="form-control"
                placeholder="Nombre del proyecto"
                value={formData.newProject}
                onChange={(e) => setFormData({ ...formData, newProject: e.target.value })}
                onKeyPress={(e) => e.key === 'Enter' && handleAddProject()}
              />
              <button className="btn btn-secondary" onClick={handleAddProject}>
                Agregar Proyecto
              </button>
            </div>
            <div className="projects-by-server">
              {data.servers.map((server) => (
                data.projects[server] && data.projects[server].length > 0 && (
                  <div key={server} className="server-projects">
                    <h4>{server}</h4>
                    <ul className="admin-list">
                      {data.projects[server].map((project, index) => (
                        <li key={index}>
                          <span>{project}</span>
                          <button
                            className="delete-btn"
                            onClick={() => handleDeleteProject(server, project)}
                          >
                            Eliminar
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )
              ))}
            </div>
          </div>
        )}

        {/* Tab Salas */}
        {activeTab === 'rooms' && (
          <div className="tab-content active">
            <h3>Gestionar Salas</h3>
            <div className="admin-form">
              <select
                className="form-control"
                value={formData.serverForRoom}
                onChange={(e) => setFormData({ ...formData, serverForRoom: e.target.value, projectForRoom: '' })}
              >
                <option value="">Seleccionar servidor</option>
                {data.servers.map((server, index) => (
                  <option key={index} value={server}>
                    {server}
                  </option>
                ))}
              </select>
              <select
                className="form-control"
                value={formData.projectForRoom}
                onChange={(e) => setFormData({ ...formData, projectForRoom: e.target.value })}
                disabled={!formData.serverForRoom || !(data.projects[formData.serverForRoom] && data.projects[formData.serverForRoom].length)}
              >
                <option value="">Seleccionar proyecto</option>
                {(data.projects[formData.serverForRoom] || []).map((project, idx) => (
                  <option key={idx} value={project}>{project}</option>
                ))}
              </select>
              <input
                type="text"
                className="form-control"
                placeholder="Nombre de la sala"
                value={formData.newRoom}
                onChange={(e) => setFormData({ ...formData, newRoom: e.target.value })}
                onKeyPress={(e) => e.key === 'Enter' && handleAddRoom()}
              />
              <button className="btn btn-secondary" onClick={handleAddRoom}>
                Agregar Sala
              </button>
            </div>
            <div className="projects-by-server">
              {data.servers.map((server) => (
                data.rooms && data.rooms[server] && Object.keys(data.rooms[server]).length > 0 && (
                  <div key={server} className="server-projects">
                    <h4 onClick={() => toggleServerRoomCollapse(server)} style={{ cursor: 'pointer' }}>
                      {collapsedServersRooms[server] ? '▶ ' : '▼ '}{server}
                    </h4>
                    {!collapsedServersRooms[server] && (
                      <>
                        {Object.keys(data.rooms[server]).map((project) => (
                          data.rooms[server][project] && data.rooms[server][project].length > 0 && (
                            <div key={`${server}-${project}`} className="project-rooms" style={{ marginLeft: '20px' }}>
                              <h5 className="project-subtitle" onClick={() => toggleProjectRoomCollapse(server, project)} style={{ cursor: 'pointer' }}>
                                {collapsedProjectsRooms[`${server}|${project}`] ? '▶ ' : '▼ '}{project}
                              </h5>
                              {!collapsedProjectsRooms[`${server}|${project}`] && (
                                <ul className="admin-list" style={{ marginLeft: '20px' }}>
                                  {data.rooms[server][project].map((room, index) => (
                                    <li key={index}>
                                      <span>{room}</span>
                                      <button
                                        className="delete-btn"
                                        onClick={() => handleDeleteRoom(server, project, room)}
                                      >
                                        Eliminar
                                      </button>
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          )
                        ))}
                      </>
                    )}
                  </div>
                )
              ))}
            </div>
          </div>
        )}

        {/* Tab Compañeros */}
        {activeTab === 'teammates' && (
          <div className="tab-content active">
            <h3>Gestionar Compañeros</h3>
            <div className="admin-form">
              <select
                className="form-control"
                value={formData.serverForTeammate}
                onChange={(e) => setFormData({ ...formData, serverForTeammate: e.target.value, projectForTeammate: '', roomForTeammate: '' })}
              >
                <option value="">Seleccionar servidor</option>
                {data.servers.map((server, index) => (
                  <option key={index} value={server}>
                    {server}
                  </option>
                ))}
              </select>
              <select
                className="form-control"
                value={formData.projectForTeammate}
                onChange={(e) => setFormData({ ...formData, projectForTeammate: e.target.value, roomForTeammate: '' })}
                disabled={!formData.serverForTeammate || !(data.projects[formData.serverForTeammate] && data.projects[formData.serverForTeammate].length)}
              >
                <option value="">Seleccionar proyecto</option>
                {(data.projects[formData.serverForTeammate] || []).map((project, idx) => (
                  <option key={idx} value={project}>{project}</option>
                ))}
              </select>
              <select
                className="form-control"
                value={formData.roomForTeammate}
                onChange={(e) => setFormData({ ...formData, roomForTeammate: e.target.value })}
                disabled={!formData.serverForTeammate || !formData.projectForTeammate || !(data.rooms[formData.serverForTeammate]?.[formData.projectForTeammate] && data.rooms[formData.serverForTeammate][formData.projectForTeammate].length)}
              >
                <option value="">Seleccionar sala</option>
                {(data.rooms[formData.serverForTeammate]?.[formData.projectForTeammate] || []).map((room, idx) => (
                  <option key={idx} value={room}>{room}</option>
                ))}
              </select>
              <input
                type="text"
                className="form-control"
                placeholder="Nombre del compañero"
                value={formData.newTeammate}
                onChange={(e) => setFormData({ ...formData, newTeammate: e.target.value })}
                onKeyPress={(e) => e.key === 'Enter' && handleAddTeammate()}
              />
              <button className="btn btn-secondary" onClick={handleAddTeammate}>
                Agregar Compañero
              </button>
            </div>
            <div className="teammates-by-project">
              {data.servers.map((server) => (
                data.teammates[server] && Object.keys(data.teammates[server]).length > 0 && (
                  <div key={server} className="server-teammates">
                    <h4 onClick={() => toggleServerCollapse(server)} style={{ cursor: 'pointer' }}>
                      {collapsedServers[server] ? '▶ ' : '▼ '}{server}
                    </h4>
                    {!collapsedServers[server] && (
                      <>
                        {Object.keys(data.teammates[server]).map((project) => (
                          data.teammates[server][project] && Object.keys(data.teammates[server][project]).length > 0 && (
                            <div key={`${server}-${project}`} className="project-teammates" style={{ marginLeft: '20px' }}>
                              <h5 onClick={() => toggleProjectCollapse(server, project)} style={{ cursor: 'pointer' }}>
                                {collapsedProjects[`${server}|${project}`] ? '▶ ' : '▼ '}{project}
                              </h5>
                              {!collapsedProjects[`${server}|${project}`] && (
                                <>
                                  {Object.keys(data.teammates[server][project]).map((room) => (
                                    data.teammates[server][project][room] && data.teammates[server][project][room].length > 0 && (
                                      <div key={`${server}-${project}-${room}`} className="room-teammates" style={{ marginLeft: '40px' }}>
                                        <h6 onClick={() => toggleRoomCollapse(server, project, room)} style={{ cursor: 'pointer' }}>
                                          {collapsedRooms[`${server}|${project}|${room}`] ? '▶ ' : '▼ '}{room}
                                        </h6>
                                        {!collapsedRooms[`${server}|${project}|${room}`] && (
                                          <ul className="admin-list" style={{ marginLeft: '20px' }}>
                                            {data.teammates[server][project][room].map((teammate, index) => (
                                              <li key={index}>
                                                <span>{teammate}</span>
                                                <button
                                                  className="delete-btn"
                                                  onClick={() => handleDeleteTeammate(server, project, room, teammate)}
                                                >
                                                  Eliminar
                                                </button>
                                              </li>
                                            ))}
                                          </ul>
                                        )}
                                      </div>
                                    )
                                  ))}
                                </>
                              )}
                            </div>
                          )
                        ))}
                      </>
                    )}
                  </div>
                )
              ))}
            </div>
          </div>
        )}

        {/* Tab Preguntas */}
        {activeTab === 'questions' && (
          <div className="tab-content active">
            <h3>Gestionar Preguntas</h3>
            <div className="admin-form">
              <input
                type="text"
                className="form-control"
                placeholder="Nueva pregunta"
                value={formData.newQuestion}
                onChange={(e) => setFormData({ ...formData, newQuestion: e.target.value })}
                onKeyPress={(e) => e.key === 'Enter' && handleAddQuestion()}
              />
              <button className="btn btn-secondary" onClick={handleAddQuestion}>
                Agregar Pregunta
              </button>
            </div>
            <ul className="admin-list">
              {data.questions.map((question, index) => (
                <li key={index}>
                  <span>{index + 1}. {question}</span>
                  <button
                    className="delete-btn"
                    onClick={() => handleDeleteQuestion(index)}
                  >
                    Eliminar
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Tab Ver Datos */}
        {activeTab === 'data' && (
          <div className="tab-content active">
            <h3>Evaluaciones Enviadas</h3>
            <div className="data-filters">
              <select
                className="form-control"
                value={filterServer}
                onChange={(e) => {
                  setFilterServer(e.target.value)
                  setFilterProject('') // Limpiar filtro de proyecto al cambiar servidor
                }}
              >
                <option value="">Todos los servidores</option>
                {data.servers.map((server, index) => (
                  <option key={index} value={server}>
                    {server}
                  </option>
                ))}
              </select>
              <select
                className="form-control"
                value={filterProject}
                onChange={(e) => {
                  setFilterProject(e.target.value)
                  // Si se cambia el servidor, limpiar el filtro de proyecto
                }}
                disabled={filterServer && getFilteredProjects().length === 0}
              >
                <option value="">Todos los proyectos</option>
                {getFilteredProjects().map((item, index) => (
                  <option key={`${item.server}-${index}`} value={item.project}>
                    {filterServer ? item.project : `${item.server} - ${item.project}`}
                  </option>
                ))}
              </select>
              <button className="btn btn-secondary" onClick={handleExportCSV}>
                Exportar CSV
              </button>
              <button className="btn btn-secondary" onClick={handleExportBackup}>
                Descargar Backup
              </button>
            </div>
            <div className="data-display">
              {getFilteredEvaluations().length === 0 ? (
                <p>No hay evaluaciones para mostrar.</p>
              ) : (
                getFilteredEvaluations().map((evaluation, index) => (
                  <div key={index} className="data-item">
                    <h4>Evaluación #{index + 1}</h4>
                    <p><strong>Fecha:</strong> {new Date(evaluation.date).toLocaleString('es-ES')}</p>
                    <p><strong>Servidor:</strong> {evaluation.server}</p>
                    <p><strong>Proyecto:</strong> {evaluation.project}</p>
                    <p><strong>Compañero Evaluado:</strong> {evaluation.teammate}</p>
                    <div className="evaluation-answers">
                      <h5>Respuestas:</h5>
                      {data.questions.map((question, qIndex) => (
                        <div key={qIndex} className="answer-item">
                          <strong>{question}</strong>
                          <p>{evaluation.answers[qIndex] || 'Sin respuesta'}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        <button className="btn btn-close" onClick={onClose}>
          Cerrar Panel
        </button>
      </div>
    </div>
  )
}

export default AdminPanel

