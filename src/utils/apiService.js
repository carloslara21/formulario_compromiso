// Servicio para sincronización remota de datos
// Si no hay API_URL configurada, solo se guarda localmente

const API_URL = import.meta.env.VITE_API_URL || ''
const API_KEY = import.meta.env.VITE_API_KEY || ''

// Detectar si es Supabase
const isSupabase = API_URL.includes('supabase.co')

// Función para guardar datos en el servidor
export async function saveDataToServer(data) {
  // Si no hay URL configurada, solo devolver éxito (guardado local)
  if (!API_URL) {
    console.log('📦 No hay API_URL configurada, solo guardado local')
    return { success: true, localOnly: true }
  }

  console.log('🔄 Intentando guardar en servidor...', { url: API_URL, isSupabase })

  try {
    let response
    let requestUrl
    let requestBody

    if (isSupabase) {
      // Formato para Supabase REST API
      requestUrl = `${API_URL}/rest/v1/app_data`
      requestBody = {
        id: 1, // ID único para el documento
        data: data,
        timestamp: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      // Supabase usa upsert (INSERT ... ON CONFLICT DO UPDATE)
      response = await fetch(requestUrl + '?id=eq.1', {
        method: 'PATCH', // Usar PATCH para actualizar
        headers: {
          'Content-Type': 'application/json',
          'apikey': API_KEY,
          'Authorization': `Bearer ${API_KEY}`,
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(requestBody)
      })

      // Si no existe, crear con POST
      if (response.status === 404 || response.status === 406) {
        response = await fetch(requestUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': API_KEY,
            'Authorization': `Bearer ${API_KEY}`,
            'Prefer': 'return=representation'
          },
          body: JSON.stringify(requestBody)
        })
      }
    } else {
      // Formato genérico para otras APIs
      requestUrl = `${API_URL}/api/data`
      requestBody = {
        timestamp: new Date().toISOString(),
        data: data
      }
      
      response = await fetch(requestUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(API_KEY && { 'Authorization': `Bearer ${API_KEY}` })
        },
        body: JSON.stringify(requestBody)
      })
    }

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Error del servidor:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      })
      throw new Error(`Error del servidor: ${response.status} - ${errorText}`)
    }

    const result = await response.json()
    console.log('✅ Datos guardados exitosamente en el servidor', result)
    return { success: true, localOnly: false, data: result }
  } catch (error) {
    console.error('❌ Error al guardar en servidor:', error)
    // No fallar completamente, solo registrar el error
    return { success: false, error: error.message, localOnly: false }
  }
}

// Función para cargar datos del servidor
export async function loadDataFromServer() {
  // Si no hay URL configurada, devolver null (usar datos locales)
  if (!API_URL) {
    console.log('📦 No hay API_URL configurada, usando datos locales')
    return null
  }

  console.log('🔄 Intentando cargar desde servidor...', { url: API_URL, isSupabase })

  try {
    let response
    let requestUrl

    if (isSupabase) {
      // Formato para Supabase REST API
      requestUrl = `${API_URL}/rest/v1/app_data?id=eq.1&select=*`
      response = await fetch(requestUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'apikey': API_KEY,
          'Authorization': `Bearer ${API_KEY}`
        }
      })
    } else {
      // Formato genérico para otras APIs
      requestUrl = `${API_URL}/api/data`
      response = await fetch(requestUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(API_KEY && { 'Authorization': `Bearer ${API_KEY}` })
        }
      })
    }

    if (!response.ok) {
      if (response.status === 404) {
        console.log('ℹ️ No hay datos en el servidor, usando locales')
        return null
      }
      throw new Error(`Error del servidor: ${response.status}`)
    }

    const result = await response.json()
    
    if (isSupabase && Array.isArray(result) && result.length > 0) {
      console.log('✅ Datos cargados desde Supabase')
      return result[0].data || null
    } else if (!isSupabase) {
      console.log('✅ Datos cargados desde servidor')
      return result.data || null
    }
    
    return null
  } catch (error) {
    console.error('❌ Error al cargar del servidor:', error)
    // Si falla, usar datos locales
    return null
  }
}

// Función para sincronizar datos (combinar locales y remotos)
export async function syncData(localData) {
  const serverData = await loadDataFromServer()
  
  if (!serverData) {
    // No hay datos en servidor, subir los locales
    await saveDataToServer(localData)
    return localData
  }

  // Comparar timestamps y usar los más recientes
  // Por ahora, preferir datos locales si son diferentes
  // En producción podrías implementar un merge más sofisticado
  return localData
}

