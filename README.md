# Formulario de Compromiso - 360-V3-6TO PROYECTO INNOVACIÓN

Aplicación web desarrollada con React para la evaluación de compañeros de equipo.

## Características

- ✅ Selección de servidor (RPSOFT, 6TO PY INNOVACION, LABORATORIOS)
- ✅ Selección de proyecto basado en el servidor elegido
- ✅ Selección de compañero a evaluar
- ✅ Formulario de evaluación con múltiples preguntas
- ✅ Panel de administración accesible con `Ctrl + Alt + A`
- ✅ Gestión completa de servidores, proyectos, compañeros y preguntas
- ✅ Visualización y exportación de datos en CSV
- ✅ Almacenamiento local en localStorage

## Instalación

1. Instalar dependencias:
```bash
npm install
```

2. Ejecutar en modo desarrollo:
```bash
npm run dev
```

3. Compilar para producción:
```bash
npm run build
```

## Uso

### Usuario Normal

1. Selecciona tu servidor
2. Selecciona tu proyecto
3. Selecciona el compañero a evaluar
4. Responde todas las preguntas del formulario
5. Envía la evaluación

### Administrador

1. Presiona `Ctrl + Alt + A` para abrir el panel de administración
2. Gestiona servidores, proyectos, compañeros y preguntas
3. Visualiza y exporta las evaluaciones realizadas
4. Presiona `ESC` o el botón "Cerrar Panel" para salir

## Estructura del Proyecto

```
formulario_compromiso/
├── src/
│   ├── components/
│   │   ├── ServerSelection.jsx
│   │   ├── ProjectSelection.jsx
│   │   ├── TeammateSelection.jsx
│   │   ├── EvaluationForm.jsx
│   │   ├── AdminPanel.jsx
│   │   ├── SuccessMessage.jsx
│   │   └── *.css
│   ├── utils/
│   │   └── dataUtils.js
│   ├── App.jsx
│   ├── App.css
│   ├── main.jsx
│   └── index.css
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

## Tecnologías

- React 18
- Vite
- CSS3 (sin frameworks externos)

## Notas

- Los datos se almacenan localmente en el navegador (localStorage)
- El panel de administración requiere el atajo de teclado `Ctrl + Alt + A`
- Todas las preguntas son obligatorias antes de enviar la evaluación

