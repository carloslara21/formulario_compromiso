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
      'RV3': ['Juan Pérez', 'María García', 'Carlos López'],
      'AV1': ['Ana Martínez', 'Pedro Rodríguez'],
      'API-REST-GHL': ['Laura Sánchez', 'Diego Torres'],
      'CRM-URBANY v1': ['Sofia Ramírez', 'Miguel González'],
      'CRM-URBANY v2': ['Elena Fernández', 'Javier Ruiz'],
      'PHP - INTEGRACION': ['Carmen Díaz', 'Roberto Morales'],
      'PROYECTO X': ['Isabel Jiménez', 'Fernando Castro']
    },
    '6TO PY INNOVACION': {
      'PROYECTO INNOVACION 1': ['Compañero 1', 'Compañero 2'],
      'PROYECTO INNOVACION 2': ['Compañero 3', 'Compañero 4']
    },
    'LABORATORIOS': {
      'LABORATORIO A': ['Investigador 1', 'Investigador 2'],
      'LABORATORIO B': ['Investigador 3', 'Investigador 4']
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
      // Normalizar 'rooms' para aceptar ambas formas (antigua: array por servidor, nueva: objeto por servidor->proyecto->salas)
      const mergedRooms = { ...initialData.rooms }
      if (parsed.rooms) {
        Object.keys(parsed.rooms).forEach(server => {
          const val = parsed.rooms[server]
          if (Array.isArray(val)) {
            // migrar array antiguo a proyecto 'GENERAL'
            mergedRooms[server] = { ...(mergedRooms[server] || {}), GENERAL: val }
          } else if (typeof val === 'object' && val !== null) {
            mergedRooms[server] = { ...(mergedRooms[server] || {}), ...val }
          }
        })
      }

      return {
        servers: parsed.servers || initialData.servers,
        projects: { ...initialData.projects, ...parsed.projects },
        rooms: mergedRooms,
        teammates: { ...initialData.teammates, ...parsed.teammates },
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

