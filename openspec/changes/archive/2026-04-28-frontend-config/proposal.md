## Why

El frontend de Food Store necesita una configuración sólida para comenzar el desarrollo. Actualmente, con `project-setup` archivado, tenemos la estructura de carpetas (FSD) pero no hay herramientas de build, configuración de TypeScript, ni librerías core configuradas. Sin esta configuración, los desarrolladores no pueden empezar a construir componentes React ni consumir datos del backend.

## What Changes

- Inicializar proyecto Vite + React + TypeScript en `/frontend`
- Configurar TypeScript en modo estricto (`strict: true`)
- Configurar TailwindCSS para estilos utilitarios
- Configurar instancia de Axios con URL base y estructura de interceptores
- Configurar TanStack Query (React Query) para data fetching
- Configurar React Router para ruteo client-side
- Crear `.env` y `.env.example` con variables compatibles con Vite (`VITE_` prefix)
- Configurar estructura de carpetas siguiendo Feature-Sliced Design (app, pages, widgets, features, entities, shared)
- Configurar scripts de build y dev en `package.json`

## Capabilities

### New Capabilities

- `frontend-tooling`: Configuración de Vite + React + TypeScript strict, setup de build y scripts de desarrollo
- `frontend-styling`: Setup de TailwindCSS con configuración de tema personalizado y estilos base
- `frontend-api-client`: Instancia de Axios configurada con interceptores, URL base desde variables de entorno
- `frontend-data-fetching`: Setup de TanStack Query con configuración de QueryClient y providers
- `frontend-routing`: Setup de React Router con estructura base de rutas

### Modified Capabilities

- `project-structure`: Expande la estructura FSD creada en `project-setup` con archivos configurados y dependencias instaladas

## Impact

**Frontend:**
- Nuevos archivos: `frontend/package.json`, `frontend/vite.config.ts`, `frontend/tsconfig.json`, `frontend/tailwind.config.js`, `frontend/postcss.config.js`, `frontend/src/main.tsx`, `frontend/src/App.tsx`, etc.
- Dependencias nuevas: react, react-dom, typescript, vite, @vitejs/plugin-react, tailwindcss, postcss, autoprefixer, axios, @tanstack/react-query, react-router-dom
- Variables de entorno: `VITE_API_URL` para conexión con el backend

**Backend:**
- No hay impacto directo en código, pero la configuración CORS en `backend-config` debe permitir el servidor de desarrollo del frontend (localhost:5173)
