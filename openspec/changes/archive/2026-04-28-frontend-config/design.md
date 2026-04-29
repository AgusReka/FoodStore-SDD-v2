## Context

Food Store es una aplicación e-commerce full-stack (FastAPI + React + PostgreSQL). El change `project-setup` estableció la estructura de carpetas FSD (Feature-Sliced Design) en `/frontend`, pero no hay herramientas de build ni dependencias configuradas.

**Estado Actual:**
- Estructura FSD creada: `app/`, `pages/`, `widgets/`, `features/`, `entities/`, `shared/`
- Sin `package.json`, sin Vite, sin TypeScript, sin dependencias instaladas
- Backend `backend-config` ya archivado y corriendo en localhost:8000 con CORS configurado

**Restricciones del Proyecto:**
- Stack: React 18+ + TypeScript + Vite + TailwindCSS + Zustand + TanStack Query
- Patrón: Feature-Sliced Design (FSD)
- Node.js 18+, se recomienda pnpm como package manager
- Monorepo con `/backend` y `/frontend` separados

**Stakeholders:** Equipo de desarrollo frontend, integrators, futuros contributors

## Goals / Non-Goals

**Goals:**
- Inicializar proyecto Vite con React y TypeScript
- Configurar TypeScript en modo estricto (`strict: true`)
- Configurar TailwindCSS con PostCSS
- Crear instancia de Axios configurada con URL base y estructura para interceptores
- Configurar TanStack Query (React Query v5) con QueryClient personalizado
- Configurar React Router v6 con estructura base de rutas
- Crear archivos `.env` y `.env.example` con variables Vite (`VITE_` prefix)
- Configurar scripts de desarrollo y build en `package.json`

**Non-Goals:**
- Crear componentes de UI o páginas específicas (eso viene en changes posteriores)
- Configurar Zustand stores (eso es change `frontend-stores`)
- Implementar lógica de negocio o consumo de APIs específicas
- Configurar tests (vitest, testing-library) - eso viene después
- Configurar deployment o CI/CD

## Decisions

### Decisión 1: Vite como Build Tool

**Opción Elegida:** Vite + @vitejs/plugin-react

**Alternativas Consideradas:**
- Create React App (CRA): Deprecado, lento, diffícil de configurar
- Next.js: Demasiado para una SPA que consume API externa, overhead innecesario
- Webpack manual: Mucha configuración, Vite ya trae lo necesario

**Justificación:**
- Vite ofrece HMR (Hot Module Replacement) extremadamente rápido
- Build basado en esbuild (mucho más rápido que webpack/babel)
- Configuración mínima y extensible
- Es el estándar actual para apps React modernas

### Decisión 2: TypeScript en Modo Estricto

**Opción Elegida:** `strict: true` en `tsconfig.json`

**Justificación:**
- Detecta errores en tiempo de compilación, no en runtime
- Mejor autocompletado e IntelliSense en el IDE
- Obliga a definir tipos para props, API responses, estado global
- Alineado con las mejores prácticas del proyecto (ver `AGENTS.md`)

### Decisión 3: TailwindCSS para Estilos

**Opción Elegida:** TailwindCSS + PostCSS + Autoprefixer

**Alternativas Consideradas:**
- CSS Modules: Requiere escribir CSS manual, más lento para prototipar
- Styled-components: Runtime overhead, sintaxis más verbosa
- MUI/Ant Design: Pesado, difícil de customizar, vendor lock-in

**Justificación:**
- Utility-first: desarrollo rápido sin escribir CSS desde cero
- File size pequeno en producción (purge unused styles)
- Consistencia: design system implícito con spacing, colors, breakpoints
- Recomendado en el stack del proyecto (`AGENTS.md`)

### Decisión 4: Axios como HTTP Client

**Opción Elegida:** Axios con instancia personalizada en `shared/api/`

**Alternativas Consideradas:**
- Fetch API nativo: Requiere wrapper para manejo de errores y JSON
- Ky/Ofetch: Librerías más pequeñas pero menos documentación
- React Query directo: React Query no es un HTTP client, necesita uno base

**Justificación:**
- Interceptores para refresh token (necesario para JWT auth en `auth-frontend`)
- Configuración centralizada de base URL y headers
- Manejo automático de JSON y error responses
- Ampliamente adoptado, mucha documentación

### Decisión 5: TanStack Query v5 para Data Fetching

**Opción Elegida:** @tanstack/react-query v5

**Alternativas Consideradas:**
- SWR: Similar pero menos features, comunidad más pequeña
- Redux Toolkit Query: Acopla a Redux, no necesitamos Redux
- useEffect + useState manual: Código repetitivo, manejo de loading/error manual

**Justificación:**
- Manejo automático de caching, background updates, deduplication
- DevTools integradas para debuggear queries
- Perfecto para consumir APIs RESTful como FastAPI
- Separación clara entre server state y client state (Zustand para cliente)

### Decisión 6: React Router v6 para Routing

**Opción Elegida:** react-router-dom v6

**Justificación:**
- Standard de facto para routing en React SPA
- Nested routes y layout routes para estructura FSD
- `useNavigate`, `useParams`, `useLocation` hooks limpios
- Lazy loading con `React.lazy` y `Suspense`

### Decisión 7: Estructura de API Client

**Opción Elegida:** Instancia de Axios en `shared/api/` con:
- `baseURL` desde `import.meta.env.VITE_API_URL`
- Interceptor de request para inyectar JWT token desde Zustand store
- Interceptor de response para manejo centralizado de errores 401/403

**Justificación:**
- Centraliza configuración HTTP en una sola carpeta (`shared/`)
- Prepara el terreno para `auth-frontend` sin acoplarse todavía
- `shared/` en FSD es el lugar correcto para código compartido

## Risks / Trade-offs

**[Risk 1]** Version conflicts entre Vite, React, TypeScript, y plugins
- **Mitigation:** Usar versiones LTS estables documentadas en `package.json`. Fijar versiones menores (ej. `"react": "^18.2.0"`) no versiones `latest`

**[Risk 2]** CORS issues entre frontend (localhost:5173) y backend (localhost:8000)
- **Mitigation:** El change `backend-config` ya configuró CORS en FastAPI. Verificar que `localhost:5173` esté en `allow_origins`

**[Risk 3]** TypeScript strict mode puede ser frustrante al inicio
- **Mitigation:** Usar tipos explícitos en `shared/types/` desde el día 1. Documentar patrones en comentarios

**[Risk 4]** TailwindCSS purging podría eliminar clases dinámicas
- **Mitigation:** Configurar `content` array en `tailwind.config.js` con todas las rutas FSD (`src/**/*.{js,ts,jsx,tsx}`)

**[Risk 5]** TanStack Query DevTools solo en desarrollo
- **Mitigation:** Condicionar import de DevTools con `import.meta.env.DEV` para no incluir en bundle de producción
