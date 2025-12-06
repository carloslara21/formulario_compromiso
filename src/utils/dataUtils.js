// Datos iniciales de la aplicación
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

// Función para cargar datos del localStorage o usar datos iniciales
export function loadData() {
  const savedData = localStorage.getItem('formularioCompromisoData')
  if (savedData) {
    try {
      const parsed = JSON.parse(savedData)
      // Fusionar con datos iniciales para asegurar estructura completa
      // Normalizar 'teammates' para aceptar la forma antigua (server->project->[teammates]) y migrar a nueva (server->project->room->[teammates])
      const mergedTeammates = {}
      Object.keys(initialData.teammates).forEach(server => {
        mergedTeammates[server] = {}
        Object.keys(initialData.teammates[server]).forEach(project => {
          mergedTeammates[server][project] = { ...initialData.teammates[server][project] }
        })
      })
      if (parsed.teammates) {
        Object.keys(parsed.teammates).forEach(server => {
          mergedTeammates[server] = mergedTeammates[server] || {}
          Object.keys(parsed.teammates[server]).forEach(project => {
            const val = parsed.teammates[server][project]
            if (Array.isArray(val)) {
              // migrar array antiguo a sala 'SALA GENERAL'
              mergedTeammates[server][project] = { ...(mergedTeammates[server][project] || {}), 'SALA GENERAL': val }
            } else if (typeof val === 'object' && val !== null) {
              mergedTeammates[server][project] = { ...(mergedTeammates[server][project] || {}), ...val }
            }
          })
        })
      }

      return {
        servers: parsed.servers || initialData.servers,
        projects: { ...initialData.projects, ...parsed.projects },
        rooms: mergedRooms,
        teammates: mergedTeammates,
        questions: parsed.questions || initialData.questions,
        evaluations: parsed.evaluations || []
      }
    } catch (e) {
      console.error('Error al cargar datos:', e)
      return initialData
    }
  }
  return initialData
}

// Función para guardar datos en localStorage
export function saveData(data) {
  try {
    localStorage.setItem('formularioCompromisoData', JSON.stringify(data))
    return true
  } catch (e) {
    console.error('Error al guardar datos:', e)
    return false
  }
}

export { initialData }

