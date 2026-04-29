## Why

Food Store requiere una estructura de proyecto sólida y consistente desde el inicio. Sin un scaffold organizado, el equipo enfrentará inconsistencias, dificultad para ubicar archivos, y deuda técnica acumulada. Esta fundacion garantiza que backend y frontend sigan patrones reconocidos (feature-first y FSD respectivamente) desde el primer commit.

## What Changes

- Creación del monorepo con carpetas `/backend` y `/frontend`
- Estructura feature-first en backend: módulos auth, usuarios, productos, categorias, ingredientes, pedidos, pagos, direcciones, admin, refreshtokens
- Estructura Feature-Sliced Design en frontend: app, pages, widgets, features, entities, shared
- Archivos `.gitignore` con exclusiones correctas
- Archivo `.env.example` documentado en backend y frontend
- README.md raíz con instrucciones básicas de setup
- Convenciones de commits: conventional commits
- Commits progresivos (no un solo commit masivo)

## Capabilities

### New Capabilities

- `project-structure`: Define la organización del monorepo, convenciones de nombres de archivos, y estructura de capas para backend y frontend
- `environment-config`: Define las variables de entorno necesarias para backend (.env) y frontend (.env), incluyendo secretos, URLs, y configuración de MercadoPago

### Modified Capabilities

_(Ninguna - este es el change inicial, no hay specs previas)_

## Impact

**Backend (FastAPI + Python)**:
- Estructura de carpetas por módulo funcional
- Archivos base: `main.py`, `core/`, `modules/`
- Configuración inicial de dependencias

**Frontend (React + TypeScript + Vite)**:
- Estructura FSD con capas: shared, entities, features, widgets, pages, app
- Configuración de build y linting
- Typedefiniciones base

**Git/Repositorio**:
- `.gitignore` completo
- README.md con setup paso a paso
- Conventional commits desde el inicio