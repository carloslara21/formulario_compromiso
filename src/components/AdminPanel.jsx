import { useState, useEffect, useRef } from 'react'
import './AdminPanel.css'
import { saveDataToServer } from '../utils/apiService'

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
  
  // Estado para edición inline (evaluaciones)
  const [editingField, setEditingField] = useState(null) // { evaluationId, field }
  const [editValue, setEditValue] = useState('')
  
  // Estado para edición inline de compañeros
  const [editingTeammate, setEditingTeammate] = useState(null) // { server, project, room, oldName }
  const [editTeammateValue, setEditTeammateValue] = useState('')
  
  // Referencias para los inputs de archivo
  const csvInputRef = useRef(null)
  const backupInputRef = useRef(null)
  
  // Función wrapper para onUpdate que también guarda en servidor
  const handleUpdate = async (newData) => {
    onUpdate(newData)
    // Intentar guardar en servidor
    const result = await saveDataToServer(newData)
    if (!result.success && !result.localOnly) {
      console.warn('No se pudo guardar en servidor, pero se guardó localmente')
    }
  }

  const handleAddServer = () => {
    if (!formData.newServer.trim()) return
    const newData = {
      ...data,
      servers: [...data.servers, formData.newServer.trim()]
    }
    handleUpdate(newData)
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
      handleUpdate(newData)
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
    handleUpdate(newData)
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
    handleUpdate(newData)
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
        handleUpdate(newData)
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
      handleUpdate(newData)
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
    handleUpdate(newData)
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
      handleUpdate(newData)
    }
  }

  // Funciones para edición inline de compañeros
  const startEditingTeammate = (server, project, room, oldName) => {
    setEditingTeammate({ server, project, room, oldName })
    setEditTeammateValue(oldName)
  }

  const cancelEditingTeammate = () => {
    setEditingTeammate(null)
    setEditTeammateValue('')
  }

  const saveEditingTeammate = () => {
    if (!editingTeammate || !editTeammateValue.trim()) {
      cancelEditingTeammate()
      return
    }

    const { server, project, room, oldName } = editingTeammate
    const newName = editTeammateValue.trim()

    // Verificar que el nuevo nombre no exista ya
    const currentTeammates = data.teammates[server]?.[project]?.[room] || []
    if (newName !== oldName && currentTeammates.includes(newName)) {
      alert('Ya existe un compañero con ese nombre en esta sala')
      return
    }

    const newData = {
      ...data,
      teammates: {
        ...data.teammates,
        [server]: {
          ...data.teammates[server],
          [project]: {
            ...data.teammates[server][project],
            [room]: data.teammates[server][project][room].map(t => 
              t === oldName ? newName : t
            )
          }
        }
      }
    }

    handleUpdate(newData)
    cancelEditingTeammate()
  }

  const handleTeammateKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      saveEditingTeammate()
    } else if (e.key === 'Escape') {
      cancelEditingTeammate()
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
    handleUpdate(newData)
    setFormData({ ...formData, newQuestion: '' })
  }

  const handleDeleteQuestion = (index) => {
    if (window.confirm('¿Está seguro de eliminar esta pregunta?')) {
      const newData = {
        ...data,
        questions: data.questions.filter((_, i) => i !== index)
      }
      handleUpdate(newData)
    }
  }

  const getFilteredEvaluations = () => {
    return data.evaluations.filter(evaluation => {
      if (filterServer && evaluation.server !== filterServer) return false
      if (filterProject && evaluation.project !== filterProject) return false
      return true
    })
  }

  const handleDeleteEvaluation = (evaluationId) => {
    if (window.confirm('¿Está seguro de eliminar esta evaluación?\n\nEsta acción no se puede deshacer.')) {
      const newData = {
        ...data,
        evaluations: data.evaluations.filter(evaluation => evaluation.id !== evaluationId)
      }
      handleUpdate(newData)
    }
  }

  // Funciones para edición inline
  const startEditing = (evaluationId, field, currentValue) => {
    setEditingField({ evaluationId, field })
    setEditValue(currentValue || '')
  }

  const cancelEditing = () => {
    setEditingField(null)
    setEditValue('')
  }

  const saveEditing = () => {
    if (!editingField) return

    const { evaluationId, field } = editingField
    const newData = {
      ...data,
      evaluations: data.evaluations.map(evaluation => {
        if (evaluation.id === evaluationId) {
          return {
            ...evaluation,
            [field]: editValue.trim()
          }
        }
        return evaluation
      })
    }
    
    handleUpdate(newData)
    cancelEditing()
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      saveEditing()
    } else if (e.key === 'Escape') {
      cancelEditing()
    }
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

  // Función para parsear CSV
  const parseCSV = (csvText) => {
    const lines = csvText.split('\n').filter(line => line.trim())
    if (lines.length < 2) {
      throw new Error('El archivo CSV debe tener al menos una fila de encabezados y una fila de datos')
    }

    // Parsear encabezados (removiendo comillas y BOM si existe)
    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, '').replace(/\ufeff/g, ''))
    
    // Verificar que los primeros 4 headers sean los esperados
    if (headers.length < 4) {
      throw new Error('El formato del CSV no es válido. Debe tener al menos: Fecha, Servidor, Proyecto, Compañero Evaluado')
    }

    const evaluations = []
    
    // Procesar cada fila de datos
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i]
      if (!line.trim()) continue

      // Parsear CSV manualmente (soporta comillas)
      const values = []
      let current = ''
      let inQuotes = false
      
      for (let j = 0; j < line.length; j++) {
        const char = line[j]
        if (char === '"') {
          if (inQuotes && line[j + 1] === '"') {
            current += '"'
            j++
          } else {
            inQuotes = !inQuotes
          }
        } else if (char === ',' && !inQuotes) {
          values.push(current.trim())
          current = ''
        } else {
          current += char
        }
      }
      values.push(current.trim())

      if (values.length < 4) continue

      // Construir objeto de evaluación
      const dateStr = values[0].replace(/^"|"$/g, '')
      const server = values[1].replace(/^"|"$/g, '')
      const project = values[2].replace(/^"|"$/g, '')
      const teammate = values[3].replace(/^"|"$/g, '')
      
      // Las respuestas comienzan desde el índice 4
      const answers = {}
      headers.slice(4).forEach((header, index) => {
        const answerValue = values[4 + index] || ''
        answers[index] = answerValue.replace(/^"|"$/g, '').replace(/""/g, '"')
      })

      // Intentar parsear la fecha
      let date
      try {
        date = new Date(dateStr).toISOString()
        if (isNaN(new Date(date).getTime())) {
          date = new Date().toISOString()
        }
      } catch (e) {
        date = new Date().toISOString()
      }

      evaluations.push({
        id: Date.now() + i,
        username: '',
        email: '',
        server,
        project,
        room: '',
        teammate,
        answers,
        date
      })
    }

    return evaluations
  }

  const handleImportCSV = () => {
    csvInputRef.current?.click()
  }

  const handleCSVFileChange = (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.name.endsWith('.csv')) {
      alert('Por favor, selecciona un archivo CSV válido')
      event.target.value = ''
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const csvText = e.target.result
        const importedEvaluations = parseCSV(csvText)

        if (importedEvaluations.length === 0) {
          alert('No se encontraron evaluaciones válidas en el archivo CSV')
          event.target.value = ''
          return
        }

        if (window.confirm(`¿Deseas importar ${importedEvaluations.length} evaluación(es) del CSV?\n\nEsto agregará las evaluaciones a las existentes.`)) {
          const newData = {
            ...data,
            evaluations: [...data.evaluations, ...importedEvaluations]
          }
          handleUpdate(newData)
          alert(`Se importaron ${importedEvaluations.length} evaluación(es) correctamente`)
        }
      } catch (error) {
        alert(`Error al importar CSV: ${error.message}`)
        console.error('Error al importar CSV:', error)
      }
      event.target.value = ''
    }

    reader.onerror = () => {
      alert('Error al leer el archivo CSV')
      event.target.value = ''
    }

    reader.readAsText(file, 'UTF-8')
  }

  const handleImportBackup = () => {
    backupInputRef.current?.click()
  }

  const handleBackupFileChange = (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.name.endsWith('.json')) {
      alert('Por favor, selecciona un archivo JSON válido')
      event.target.value = ''
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const jsonText = e.target.result
        const backupData = JSON.parse(jsonText)

        // Validar estructura del backup
        if (!backupData.servers || !Array.isArray(backupData.servers)) {
          throw new Error('El archivo de backup no tiene una estructura válida (servers)')
        }
        if (!backupData.projects || typeof backupData.projects !== 'object') {
          throw new Error('El archivo de backup no tiene una estructura válida (projects)')
        }
        if (!backupData.questions || !Array.isArray(backupData.questions)) {
          throw new Error('El archivo de backup no tiene una estructura válida (questions)')
        }
        if (!backupData.evaluations || !Array.isArray(backupData.evaluations)) {
          throw new Error('El archivo de backup no tiene una estructura válida (evaluations)')
        }

        const warnings = []
        if (!backupData.rooms) {
          warnings.push('No se encontraron salas en el backup')
          backupData.rooms = {}
        }
        if (!backupData.teammates) {
          warnings.push('No se encontraron compañeros en el backup')
          backupData.teammates = {}
        }

        const warningMsg = warnings.length > 0 ? `\n\nAdvertencias:\n${warnings.join('\n')}` : ''

        if (window.confirm(`¿Estás seguro de importar este backup?\n\nEsto reemplazará TODOS los datos actuales (servidores, proyectos, salas, compañeros, preguntas y evaluaciones).\n\nEsta acción no se puede deshacer.${warningMsg}`)) {
          const newData = {
            servers: backupData.servers,
            projects: backupData.projects || {},
            rooms: backupData.rooms || {},
            teammates: backupData.teammates || {},
            questions: backupData.questions,
            evaluations: backupData.evaluations
          }
          handleUpdate(newData)
          alert('Backup importado correctamente')
        }
      } catch (error) {
        alert(`Error al importar backup: ${error.message}`)
        console.error('Error al importar backup:', error)
      }
      event.target.value = ''
    }

    reader.onerror = () => {
      alert('Error al leer el archivo de backup')
      event.target.value = ''
    }

    reader.readAsText(file, 'UTF-8')
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
                                            {data.teammates[server][project][room].map((teammate, index) => {
                                              const isEditing = editingTeammate?.server === server && 
                                                                editingTeammate?.project === project && 
                                                                editingTeammate?.room === room && 
                                                                editingTeammate?.oldName === teammate
                                              
                                              return (
                                                <li key={index}>
                                                  {isEditing ? (
                                                    <input
                                                      type="text"
                                                      value={editTeammateValue}
                                                      onChange={(e) => setEditTeammateValue(e.target.value)}
                                                      onBlur={saveEditingTeammate}
                                                      onKeyDown={handleTeammateKeyPress}
                                                      autoFocus
                                                      style={{
                                                        padding: '5px 10px',
                                                        border: '1px solid #6b46c1',
                                                        borderRadius: '5px',
                                                        fontSize: '14px',
                                                        flex: 1,
                                                        marginRight: '10px'
                                                      }}
                                                    />
                                                  ) : (
                                                    <span
                                                      onClick={() => startEditingTeammate(server, project, room, teammate)}
                                                      style={{
                                                        cursor: 'pointer',
                                                        textDecoration: 'underline',
                                                        color: '#6b46c1',
                                                        flex: 1
                                                      }}
                                                      title="Click para editar nombre"
                                                    >
                                                      {teammate}
                                                    </span>
                                                  )}
                                                  {!isEditing && (
                                                    <button
                                                      className="delete-btn"
                                                      onClick={() => handleDeleteTeammate(server, project, room, teammate)}
                                                    >
                                                      Eliminar
                                                    </button>
                                                  )}
                                                </li>
                                              )
                                            })}
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
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', width: '100%' }}>
                <button className="btn btn-secondary" onClick={handleExportCSV}>
                  Exportar CSV
                </button>
                <button className="btn btn-secondary" onClick={handleImportCSV}>
                  Importar CSV
                </button>
                <button className="btn btn-secondary" onClick={handleExportBackup}>
                  Descargar Backup
                </button>
                <button className="btn btn-secondary" onClick={handleImportBackup}>
                  Importar Backup
                </button>
              </div>
              {/* Inputs ocultos para importación */}
              <input
                type="file"
                ref={csvInputRef}
                accept=".csv"
                style={{ display: 'none' }}
                onChange={handleCSVFileChange}
              />
              <input
                type="file"
                ref={backupInputRef}
                accept=".json"
                style={{ display: 'none' }}
                onChange={handleBackupFileChange}
              />
            </div>
            <div className="data-display">
              {getFilteredEvaluations().length === 0 ? (
                <p>No hay evaluaciones para mostrar.</p>
              ) : (
                getFilteredEvaluations().map((evaluation, index) => {
                  const isEditing = editingField?.evaluationId === evaluation.id
                  const isEditingField = (field) => isEditing && editingField?.field === field
                  
                  return (
                    <div key={evaluation.id || index} className="data-item">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                        <h4 style={{ margin: 0 }}>Evaluación #{index + 1}</h4>
                        <button
                          className="delete-btn"
                          onClick={() => handleDeleteEvaluation(evaluation.id)}
                          title="Eliminar evaluación"
                        >
                          Eliminar
                        </button>
                      </div>
                      <p><strong>Fecha:</strong> {new Date(evaluation.date).toLocaleString('es-ES')}</p>
                      
                      <p>
                        <strong>Servidor:</strong>{' '}
                        {isEditingField('server') ? (
                          <input
                            type="text"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onBlur={saveEditing}
                            onKeyDown={handleKeyPress}
                            autoFocus
                            style={{ marginLeft: '5px', padding: '3px 5px', border: '1px solid #6b46c1', borderRadius: '3px' }}
                          />
                        ) : (
                          <span
                            onClick={() => startEditing(evaluation.id, 'server', evaluation.server)}
                            style={{ cursor: 'pointer', textDecoration: 'underline', color: '#6b46c1' }}
                            title="Click para editar"
                          >
                            {evaluation.server}
                          </span>
                        )}
                      </p>
                      
                      <p>
                        <strong>Proyecto:</strong>{' '}
                        {isEditingField('project') ? (
                          <input
                            type="text"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onBlur={saveEditing}
                            onKeyDown={handleKeyPress}
                            autoFocus
                            style={{ marginLeft: '5px', padding: '3px 5px', border: '1px solid #6b46c1', borderRadius: '3px' }}
                          />
                        ) : (
                          <span
                            onClick={() => startEditing(evaluation.id, 'project', evaluation.project)}
                            style={{ cursor: 'pointer', textDecoration: 'underline', color: '#6b46c1' }}
                            title="Click para editar"
                          >
                            {evaluation.project}
                          </span>
                        )}
                      </p>
                      
                      {evaluation.room && (
                        <p>
                          <strong>Sala:</strong>{' '}
                          {isEditingField('room') ? (
                            <input
                              type="text"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onBlur={saveEditing}
                              onKeyDown={handleKeyPress}
                              autoFocus
                              style={{ marginLeft: '5px', padding: '3px 5px', border: '1px solid #6b46c1', borderRadius: '3px' }}
                            />
                          ) : (
                            <span
                              onClick={() => startEditing(evaluation.id, 'room', evaluation.room)}
                              style={{ cursor: 'pointer', textDecoration: 'underline', color: '#6b46c1' }}
                              title="Click para editar"
                            >
                              {evaluation.room}
                            </span>
                          )}
                        </p>
                      )}
                      
                      <p>
                        <strong>Compañero Evaluado:</strong>{' '}
                        {isEditingField('teammate') ? (
                          <input
                            type="text"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onBlur={saveEditing}
                            onKeyDown={handleKeyPress}
                            autoFocus
                            style={{ marginLeft: '5px', padding: '3px 5px', border: '1px solid #6b46c1', borderRadius: '3px' }}
                          />
                        ) : (
                          <span
                            onClick={() => startEditing(evaluation.id, 'teammate', evaluation.teammate)}
                            style={{ cursor: 'pointer', textDecoration: 'underline', color: '#6b46c1' }}
                            title="Click para editar"
                          >
                            {evaluation.teammate}
                          </span>
                        )}
                      </p>
                      
                      {evaluation.username && (
                        <p>
                          <strong>Evaluador:</strong>{' '}
                          {isEditingField('username') ? (
                            <input
                              type="text"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onBlur={saveEditing}
                              onKeyDown={handleKeyPress}
                              autoFocus
                              style={{ marginLeft: '5px', padding: '3px 5px', border: '1px solid #6b46c1', borderRadius: '3px' }}
                            />
                          ) : (
                            <span
                              onClick={() => startEditing(evaluation.id, 'username', evaluation.username)}
                              style={{ cursor: 'pointer', textDecoration: 'underline', color: '#6b46c1' }}
                              title="Click para editar"
                            >
                              {evaluation.username}
                            </span>
                          )}
                        </p>
                      )}
                      
                      {evaluation.email && (
                        <p>
                          <strong>Email:</strong>{' '}
                          {isEditingField('email') ? (
                            <input
                              type="email"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onBlur={saveEditing}
                              onKeyDown={handleKeyPress}
                              autoFocus
                              style={{ marginLeft: '5px', padding: '3px 5px', border: '1px solid #6b46c1', borderRadius: '3px' }}
                            />
                          ) : (
                            <span
                              onClick={() => startEditing(evaluation.id, 'email', evaluation.email)}
                              style={{ cursor: 'pointer', textDecoration: 'underline', color: '#6b46c1' }}
                              title="Click para editar"
                            >
                              {evaluation.email}
                            </span>
                          )}
                        </p>
                      )}
                    <div className="evaluation-answers">
                      <h5>Respuestas:</h5>
                      {data.questions.map((question, qIndex) => {
                        const answerKey = `answer_${qIndex}`
                        const isEditingAnswer = isEditing && editingField?.field === answerKey
                        
                        return (
                          <div key={qIndex} className="answer-item">
                            <strong>{question}</strong>
                            {isEditingAnswer ? (
                              <textarea
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                onBlur={() => {
                                  const newData = {
                                    ...data,
                                    evaluations: data.evaluations.map(evaluationItem => {
                                      if (evaluationItem.id === evaluation.id) {
                                        return {
                                          ...evaluationItem,
                                          answers: {
                                            ...evaluationItem.answers,
                                            [qIndex]: editValue.trim()
                                          }
                                        }
                                      }
                                      return evaluationItem
                                    })
                                  }
                                  handleUpdate(newData)
                                  cancelEditing()
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === 'Escape') cancelEditing()
                                  if (e.key === 'Enter' && e.ctrlKey) {
                                    e.preventDefault()
                                    const newData = {
                                      ...data,
                                      evaluations: data.evaluations.map(evaluationItem => {
                                        if (evaluationItem.id === evaluation.id) {
                                          return {
                                            ...evaluationItem,
                                            answers: {
                                              ...evaluationItem.answers,
                                              [qIndex]: editValue.trim()
                                            }
                                          }
                                        }
                                        return evaluationItem
                                      })
                                    }
                                    handleUpdate(newData)
                                    cancelEditing()
                                  }
                                }}
                                autoFocus
                                style={{ 
                                  width: '100%', 
                                  minHeight: '60px', 
                                  padding: '5px', 
                                  border: '1px solid #6b46c1', 
                                  borderRadius: '3px',
                                  marginTop: '5px',
                                  fontFamily: 'inherit',
                                  fontSize: '14px'
                                }}
                              />
                            ) : (
                              <p
                                onClick={() => startEditing(evaluation.id, answerKey, evaluation.answers[qIndex] || '')}
                                style={{ 
                                  cursor: 'pointer', 
                                  padding: '5px',
                                  border: '1px dashed transparent',
                                  borderRadius: '3px'
                                }}
                                onMouseEnter={(e) => e.target.style.borderColor = '#6b46c1'}
                                onMouseLeave={(e) => e.target.style.borderColor = 'transparent'}
                                title="Click para editar"
                              >
                                {evaluation.answers[qIndex] || 'Sin respuesta (click para agregar)'}
                              </p>
                            )}
                          </div>
                        )
                      })}
                    </div>
                    </div>
                  )
                })
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

