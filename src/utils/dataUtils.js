// Datos iniciales de la aplicación (nunca se modifican)
const initialData = {
  servers: ['RPSOFT', '6TO PY INNOVACION', 'LABORATORIOS'],
  projects: {
    'RPSOFT': ['RV3', 'AV1', 'API-REST-GHL', 'CRM-URBANY v1', 'CRM-URBANY v2', 'PHP - INTEGRACION', 'PROYECTO X'],
    '6TO PY INNOVACION': ['PROYECTO INNOVACION 1', 'PROYECTO INNOVACION 2'],
    'LABORATORIOS': ['LABORATORIO A', 'LABORATORIO B']
  },
  rooms: {
    'RPSOFT': {
      'GENERAL': ['SALA GENERAL']
    },
    '6TO PY INNOVACION': {},
    'LABORATORIOS': {}
  },
  teammates: {
    'RPSOFT': {
      'RV3': {
        'SALA GENERAL': ['Juan Pérez', 'María García', 'Carlos López']
      },
      'AV1': {
        'SALA GENERAL': ['Ana Martínez', 'Pedro Rodríguez']
      },
      'API-REST-GHL': {
        'SALA GENERAL': ['Laura Sánchez', 'Diego Torres']
      },
      'CRM-URBANY v1': {
        'SALA GENERAL': ['Sofia Ramírez', 'Miguel González']
      },
      'CRM-URBANY v2': {
        'SALA GENERAL': ['Elena Fernández', 'Javier Ruiz']
      },
      'PHP - INTEGRACION': {
        'SALA GENERAL': ['Carmen Díaz', 'Roberto Morales']
      },
      'PROYECTO X': {
        'SALA GENERAL': ['Isabel Jiménez', 'Fernando Castro']
      }
    },
    '6TO PY INNOVACION': {
      'PROYECTO INNOVACION 1': {},
      'PROYECTO INNOVACION 2': {}
    },
    'LABORATORIOS': {
      'LABORATORIO A': {},
      'LABORATORIO B': {}
    }
  },
  questions: [
    '¿Con qué frecuencia llega a tiempo a reuniones o dailys?',
    '¿Avisa con anticipación cuando falta?',
    '¿Se refiere a compañeros de forma respetuosa?',
    '¿Participa activamente (micrófono/chat)?',
    '¿Explica ideas de manera comprensible?',
    '¿Entrega tareas en plazo?',
    '¿Mantiene calidad constante?',
    '¿Comunica retrasos o bloqueos?',
    '¿Interactúa en Discord/canales?',
    '¿Se muestra comprometido?',
    '¿Ayuda a compañeros?'
  ],
  evaluations: []
}

// Estructura de deltas (solo cambios del usuario)
const emptyDeltas = {
  addedServers: [],
  deletedServers: [],
  addedProjects: {}, // { server: [projects] }
  deletedProjects: {}, // { server: [projects] }
  addedRooms: {}, // { server: { project: [rooms] } }
  deletedRooms: {}, // { server: { project: [rooms] } }
  addedTeammates: {}, // { server: { project: { room: [teammates] } } }
  deletedTeammates: {}, // { server: { project: { room: [teammates] } } }
  customQuestions: [],
  evaluations: []
}

// Cargar solo los deltas del usuario
function loadDeltas() {
  const savedDeltas = localStorage.getItem('formularioCompromisoDeltas')
  if (savedDeltas) {
    try {
      return JSON.parse(savedDeltas)
    } catch (e) {
      console.error('Error al cargar deltas:', e)
      return { ...emptyDeltas }
    }
  }
  return { ...emptyDeltas }
}

// Guardar solo los deltas del usuario
function saveDeltas(deltas) {
  try {
    localStorage.setItem('formularioCompromisoDeltas', JSON.stringify(deltas))
    return true
  } catch (e) {
    console.error('Error al guardar deltas:', e)
    return false
  }
}

// Función para cargar datos: inicial + deltas
export function loadData() {
  const deltas = loadDeltas()
  
  // Comenzar con datos iniciales
  let result = {
    servers: [...initialData.servers, ...deltas.addedServers],
    projects: {},
    rooms: {},
    teammates: {},
    questions: [...initialData.questions, ...deltas.customQuestions],
    evaluations: [...deltas.evaluations]
  }
  
  // Copiar proyectos iniciales
  Object.keys(initialData.projects).forEach(server => {
    result.projects[server] = [...initialData.projects[server]]
  })
  
  // Agregar proyectos deletados del usuario
  Object.keys(deltas.deletedProjects).forEach(server => {
    if (!result.projects[server]) result.projects[server] = []
    result.projects[server] = result.projects[server].filter(p => !deltas.deletedProjects[server].includes(p))
  })
  
  // Agregar nuevos proyectos del usuario
  Object.keys(deltas.addedProjects).forEach(server => {
    if (!result.projects[server]) result.projects[server] = []
    deltas.addedProjects[server].forEach(project => {
      if (!result.projects[server].includes(project)) {
        result.projects[server].push(project)
      }
    })
  })
  
  // Copiar salas iniciales
  Object.keys(initialData.rooms).forEach(server => {
    result.rooms[server] = {}
    Object.keys(initialData.rooms[server]).forEach(project => {
      result.rooms[server][project] = [...initialData.rooms[server][project]]
    })
  })
  
  // Eliminar salas deletadas del usuario
  Object.keys(deltas.deletedRooms).forEach(server => {
    if (result.rooms[server]) {
      Object.keys(deltas.deletedRooms[server]).forEach(project => {
        if (result.rooms[server][project]) {
          result.rooms[server][project] = result.rooms[server][project].filter(
            r => !deltas.deletedRooms[server][project].includes(r)
          )
        }
      })
    }
  })
  
  // Agregar nuevas salas del usuario
  Object.keys(deltas.addedRooms).forEach(server => {
    if (!result.rooms[server]) result.rooms[server] = {}
    Object.keys(deltas.addedRooms[server]).forEach(project => {
      result.rooms[server][project] = result.rooms[server][project] || []
      deltas.addedRooms[server][project].forEach(room => {
        if (!result.rooms[server][project].includes(room)) {
          result.rooms[server][project].push(room)
        }
      })
    })
  })
  
  // Copiar compañeros iniciales
  Object.keys(initialData.teammates).forEach(server => {
    result.teammates[server] = {}
    Object.keys(initialData.teammates[server]).forEach(project => {
      result.teammates[server][project] = {}
      Object.keys(initialData.teammates[server][project]).forEach(room => {
        result.teammates[server][project][room] = [...initialData.teammates[server][project][room]]
      })
    })
  })
  
  // Eliminar compañeros deletados del usuario
  Object.keys(deltas.deletedTeammates).forEach(server => {
    if (result.teammates[server]) {
      Object.keys(deltas.deletedTeammates[server]).forEach(project => {
        if (result.teammates[server][project]) {
          Object.keys(deltas.deletedTeammates[server][project]).forEach(room => {
            if (result.teammates[server][project][room]) {
              result.teammates[server][project][room] = result.teammates[server][project][room].filter(
                t => !deltas.deletedTeammates[server][project][room].includes(t)
              )
            }
          })
        }
      })
    }
  })
  
  // Agregar nuevos compañeros del usuario
  Object.keys(deltas.addedTeammates).forEach(server => {
    if (!result.teammates[server]) result.teammates[server] = {}
    Object.keys(deltas.addedTeammates[server]).forEach(project => {
      if (!result.teammates[server][project]) result.teammates[server][project] = {}
      Object.keys(deltas.addedTeammates[server][project]).forEach(room => {
        result.teammates[server][project][room] = result.teammates[server][project][room] || []
        deltas.addedTeammates[server][project][room].forEach(teammate => {
          if (!result.teammates[server][project][room].includes(teammate)) {
            result.teammates[server][project][room].push(teammate)
          }
        })
      })
    })
  })
  
  return result
}

// Función para guardar datos: extrae deltas y guarda
export function saveData(data) {
  const deltas = extractDeltas(data)
  return saveDeltas(deltas)
}

// Función para extraer deltas (cambios del usuario)
function extractDeltas(data) {
  const deltas = { ...emptyDeltas }
  
  // Servidores
  deltas.addedServers = data.servers.filter(s => !initialData.servers.includes(s))
  deltas.deletedServers = initialData.servers.filter(s => !data.servers.includes(s))
  
  // Proyectos
  Object.keys(data.projects).forEach(server => {
    const initialProjects = initialData.projects[server] || []
    const currentProjects = data.projects[server] || []
    
    const added = currentProjects.filter(p => !initialProjects.includes(p))
    const deleted = initialProjects.filter(p => !currentProjects.includes(p))
    
    if (added.length > 0) {
      deltas.addedProjects[server] = added
    }
    if (deleted.length > 0) {
      deltas.deletedProjects[server] = deleted
    }
  })
  
  // Salas
  Object.keys(data.rooms).forEach(server => {
    const initialRooms = initialData.rooms[server] || {}
    const currentRooms = data.rooms[server] || {}
    
    Object.keys(currentRooms).forEach(project => {
      const initialSalas = initialRooms[project] || []
      const currentSalas = currentRooms[project] || []
      
      const added = currentSalas.filter(r => !initialSalas.includes(r))
      const deleted = initialSalas.filter(r => !currentSalas.includes(r))
      
      if (added.length > 0) {
        if (!deltas.addedRooms[server]) deltas.addedRooms[server] = {}
        deltas.addedRooms[server][project] = added
      }
      if (deleted.length > 0) {
        if (!deltas.deletedRooms[server]) deltas.deletedRooms[server] = {}
        deltas.deletedRooms[server][project] = deleted
      }
    })
  })
  
  // Compañeros
  Object.keys(data.teammates).forEach(server => {
    const initialTeammates = initialData.teammates[server] || {}
    const currentTeammates = data.teammates[server] || {}
    
    Object.keys(currentTeammates).forEach(project => {
      const initialRooms = initialTeammates[project] || {}
      const currentRooms = currentTeammates[project] || {}
      
      Object.keys(currentRooms).forEach(room => {
        const initialCompañeros = initialRooms[room] || []
        const currentCompañeros = currentRooms[room] || []
        
        const added = currentCompañeros.filter(t => !initialCompañeros.includes(t))
        const deleted = initialCompañeros.filter(t => !currentCompañeros.includes(t))
        
        if (added.length > 0) {
          if (!deltas.addedTeammates[server]) deltas.addedTeammates[server] = {}
          if (!deltas.addedTeammates[server][project]) deltas.addedTeammates[server][project] = {}
          deltas.addedTeammates[server][project][room] = added
        }
        if (deleted.length > 0) {
          if (!deltas.deletedTeammates[server]) deltas.deletedTeammates[server] = {}
          if (!deltas.deletedTeammates[server][project]) deltas.deletedTeammates[server][project] = {}
          deltas.deletedTeammates[server][project][room] = deleted
        }
      })
    })
  })
  
  // Preguntas (solo customizadas)
  deltas.customQuestions = data.questions.filter(q => !initialData.questions.includes(q))
  
  // Evaluaciones (todas se guardan)
  deltas.evaluations = data.evaluations || []
  
  return deltas
}

export { initialData, emptyDeltas }

