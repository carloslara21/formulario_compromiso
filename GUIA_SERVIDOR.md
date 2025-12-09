# Guía para Configurar el Servidor Remoto

## Opción 1: Sin Servidor (Recomendado para empezar) ⭐

**No necesitas hacer nada**. La aplicación funcionará perfectamente guardando los datos solo en el navegador (localStorage). Los datos se mantendrán aunque cierres el navegador.

- ✅ No requiere configuración
- ✅ Funciona completamente offline
- ✅ Datos privados y seguros en tu navegador
- ❌ Los datos solo están en ese navegador/dispositivo

## Opción 2: Servicios Gratuitos (Sin crear servidor)

### A) JSONBin.io (Muy Simple)

1. Ve a [https://jsonbin.io](https://jsonbin.io)
2. Crea una cuenta gratuita
3. Crea un nuevo "Bin"
4. Copia tu API Key y Bin ID
5. Crea archivo `.env`:
```env
VITE_API_URL=https://api.jsonbin.io/v3/b
VITE_API_KEY=tu-api-key-aqui
```

**Nota:** Necesitarás adaptar el código para usar el formato de JSONBin.

### B) Firebase (Google)

1. Ve a [https://firebase.google.com](https://firebase.google.com)
2. Crea un proyecto
3. Habilita Firestore Database
4. Obtén las credenciales de configuración
5. Crea archivo `.env`:
```env
VITE_API_URL=https://tu-proyecto-default-rtdb.firebaseio.com
VITE_API_KEY=tu-api-key-firebase
```

### C) Supabase (PostgreSQL Gratuito)

1. Ve a [https://supabase.com](https://supabase.com)
2. Crea un proyecto gratuito
3. Obtén la URL de la API y la clave anónima
4. Crea archivo `.env`:
```env
VITE_API_URL=https://tu-proyecto.supabase.co/rest/v1
VITE_API_KEY=tu-clave-anonima-supabase
```

## Opción 3: Crear Tu Propio Servidor

### Opción A: Backend Simple con Node.js/Express

Crea un servidor básico que guarde los datos en un archivo JSON o base de datos:

**Ejemplo mínimo con Express:**

```javascript
// server.js
const express = require('express');
const fs = require('fs');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// Guardar datos
app.post('/api/data', (req, res) => {
  const data = req.body;
  fs.writeFileSync('data.json', JSON.stringify(data, null, 2));
  res.json({ success: true });
});

// Cargar datos
app.get('/api/data', (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync('data.json', 'utf8'));
    res.json({ data });
  } catch (e) {
    res.status(404).json({ error: 'No data found' });
  }
});

app.listen(3000, () => {
  console.log('Servidor corriendo en http://localhost:3000');
});
```

Luego en `.env`:
```env
VITE_API_URL=http://localhost:3000
VITE_API_KEY=
```

### Opción B: Usar servicios de hosting gratuitos

- **Vercel** - [vercel.com](https://vercel.com)
- **Netlify Functions** - [netlify.com](https://netlify.com)
- **Railway** - [railway.app](https://railway.app)
- **Render** - [render.com](https://render.com)

## Cómo Crear el Archivo .env

1. En la raíz de tu proyecto (donde está `package.json`)
2. Crea un archivo llamado `.env` (sin extensión)
3. Agrega las variables:

```env
VITE_API_URL=https://tu-api.com
VITE_API_KEY=tu-clave-si-la-necesitas
```

4. **Reinicia el servidor de desarrollo** después de crear/modificar `.env`

## Importante ⚠️

- El archivo `.env` NO debe subirse a Git (ya debería estar en `.gitignore`)
- Las variables que empiezan con `VITE_` son públicas (se incluyen en el código del frontend)
- Para claves secretas reales, usa variables de entorno del servidor, no en el frontend

## ¿Cuál Opción Elegir?

- **Solo probando/desarrollo personal:** Opción 1 (sin servidor)
- **Necesitas compartir datos entre dispositivos:** Opción 2 (servicios gratuitos)
- **Tienes experiencia con servidores:** Opción 3 (tu propio servidor)

