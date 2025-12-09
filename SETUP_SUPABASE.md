# Configuración de Supabase para esta Aplicación

## Pasos para configurar Supabase

### 1. Crear la tabla en Supabase

1. Ve a tu proyecto en Supabase: https://supabase.com/dashboard
2. Ve a "SQL Editor"
3. Ejecuta este SQL:

```sql
-- Crear tabla para almacenar los datos de la aplicación
CREATE TABLE IF NOT EXISTS app_data (
  id INTEGER PRIMARY KEY DEFAULT 1,
  data JSONB NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Crear función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Crear trigger para actualizar updated_at
CREATE TRIGGER update_app_data_updated_at 
BEFORE UPDATE ON app_data 
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

-- Insertar registro inicial
INSERT INTO app_data (id, data) 
VALUES (1, '{}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- Configurar políticas RLS (Row Level Security)
-- Opción 1: Permitir todo (solo para desarrollo)
ALTER TABLE app_data ENABLE ROW LEVEL SECURITY;

-- Política para permitir lectura (ajusta según necesites)
CREATE POLICY "Allow read access" ON app_data
FOR SELECT USING (true);

-- Política para permitir escritura (ajusta según necesites)
CREATE POLICY "Allow write access" ON app_data
FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow update access" ON app_data
FOR UPDATE USING (true);
```

### 2. Obtener las credenciales

1. Ve a "Settings" → "API"
2. Copia:
   - **Project URL**: `https://tu-proyecto.supabase.co`
   - **anon/public key**: Esta es tu `VITE_API_KEY`

### 3. Configurar el archivo .env

```env
VITE_API_URL=https://tu-proyecto.supabase.co
VITE_API_KEY=tu-anon-key-aqui
```

### 4. Verificar que funciona

1. Abre la consola del navegador (F12)
2. Haz algún cambio en la aplicación
3. Deberías ver mensajes como:
   - `🔄 Intentando guardar en servidor...`
   - `✅ Datos guardados exitosamente en el servidor`

## Solución de Problemas

### Error 404 o 406
- La tabla no existe o el nombre es diferente
- Ejecuta el SQL de creación de tabla

### Error 401 (Unauthorized)
- Verifica que la API_KEY sea la correcta
- Verifica que las políticas RLS permitan acceso

### Error CORS
- En Supabase, ve a Settings → API
- Verifica que tu dominio esté en la lista de dominios permitidos
- Para desarrollo local, `http://localhost:5173` debería estar permitido

### Los datos no se guardan
- Abre la consola del navegador y revisa los mensajes
- Verifica que la tabla existe en Supabase
- Ve a "Table Editor" en Supabase y revisa si hay datos

## Verificar datos en Supabase

1. Ve a "Table Editor" en tu dashboard de Supabase
2. Selecciona la tabla `app_data`
3. Deberías ver una fila con `id = 1` y la columna `data` con tu información

