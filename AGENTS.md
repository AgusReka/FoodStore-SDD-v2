# AGENTS.md - Food Store Project

## Descripción del Proyecto

Food Store es una aplicación de e-commerce para delivery de comida construida con **FastAPI + React + PostgreSQL**.

## Stack Tecnológico

### Backend
- **FastAPI** - Framework web moderno de Python
- **SQLModel** - ORM con type annotations
- **Alembic** - Migraciones de base de datos
- **Pydantic** - Validación de datos
- **python-jose** - Manejo de JWT
- **Passlib** - Hash de contraseñas
- **Python 3.11+**

### Frontend
- **React 18** - Biblioteca de UI
- **TypeScript** - Tipado estático
- **Vite** - Build tool
- **TanStack Query** - Data fetching
- **Zustand** - State management
- **TailwindCSS** - Estilos
- **React Router** - Ruteo
- **Node.js 18+**
- **pnpm** (recomendado) o npm

### Base de Datos
- **PostgreSQL 15+**

## Estructura del Proyecto

```
FoodStore-SDD/
├── backend/              # Aplicación FastAPI (Feature-First)
│   ├── main.py          # Entry point
│   ├── core/            # Infraestructura compartida
│   │   ├── config.py
│   │   ├── database.py
│   │   └── security.py
│   ├── modules/         # Módulos de funcionalidades
│   │   ├── auth/
│   │   ├── usuarios/
│   │   ├── productos/
│   │   ├── categorias/
│   │   ├── pedidos/
│   │   ├── pagos/
│   │   ├── direcciones/
│   │   └── admin/
│   └── db/
│       ├── migrations/  # Migraciones Alembic
│       └── seed.py
│
├── frontend/             # Aplicación React (FSD - Feature-Sliced Design)
│   └── src/
│       ├── app/         # Configuración de la app
│       ├── pages/       # Páginas de ruta
│       ├── widgets/     # Componentes UI reutilizables
│       ├── features/    # Módulos de funcionalidades
│       │   ├── auth/
│       │   ├── cart/
│       │   ├── orders/
│       │   └── admin/
│       ├── entities/    # Entidades de dominio
│       └── shared/      # Utilidades compartidas
│
├── openspec/            # OPSX Workflow
│   ├── changes/        # Cambios activos
│   ├── specs/          # Especificaciones principales
│   └── config.yaml     # Configuración de OPSX
│
├── docs/                # Documentación
├── .agents/             # Skills de agentes (locales)
├── .claude/             # Configuración de Claude (skills y comandos)
└── skills-lock.json    # Lockfile de skills instaladas
```

## Workflow: OPSX (OpenSpec)

Este proyecto utiliza **OPSX** — un workflow fluido y CLI-driven para especificaciones y cambios.

### Comandos Disponibles

| Comando | Descripción |
|---------|-------------|
| `/opsx:explore [topic]` | Modo exploración - pensar antes de comprometer |
| `/opsx:propose [change-name]` | Proponer un cambio con todos los artefactos |
| `/opsx:apply [change-name]` | Implementar tareas del cambio |
| `/opsx:archive [change-name]` | Archivar el cambio completado |


### Skills Instaladas Localmente

Estas skills están instaladas localmente en `.agents/skills/` y disponibles para todo el proyecto:

| Skill | Propósito | Trigger / Cuándo usarla | Ruta Local |
|-------|-----------|-------------------------|------------|
| **fastapi-python** | Desarrollo con FastAPI | Al crear/editar endpoints, modelos, schemas o servicios en backend/ | `.agents/skills/fastapi-python/` |
| **react-dev** | Desarrollo con React + TypeScript | Al crear componentes React, hooks, o páginas en frontend/ | `.agents/skills/react-dev/` |
| **jwt-security** | Implementación de JWT | Al trabajar con autenticación, tokens, login/registro | `.agents/skills/jwt-security/` |
| **postgresql-database-engineering** | Ingeniería de PostgreSQL | Al crear migraciones, índices, consultas complejas, o modelar DB | `.agents/skills/postgresql-database-engineering/` |
| **tailwindcss** | Estilos con TailwindCSS | Al diseñar componentes UI, layouts, o estilos responsivos | `.agents/skills/tailwindcss/` |
| **tailwind-design-system** | Sistemas de diseño con Tailwind v4 | Al crear design tokens, themes, dark mode, o componentes reutilizables en la sección **admin** | `.agents/skills/tailwind-design-system/` |
| **zustand-state-management** | Manejo de estado con Zustand | Al crear/editar stores globales, estado de auth/carrito/etc. | `.agents/skills/zustand-state-management/` |
| **dashboard-crud-page** | Páginas CRUD estandarizadas | Al crear páginas CRUD de listado/creación/edición/borrado en la sección **admin** | `.agents/skills/dashboard-crud-page/` |
| **foodstore-design** | Sistema de diseño FoodStore (Mesa Design System) — UI de cliente premium, mobile-first | Al crear landing pages, grillas de productos, cards de comida, carrito, checkout, y toda la UI del frontend de **cliente** | `.agents/skills/foodstore-design/` |
| **judgment-day** | Revisión adversarial paralela | Al decir "judgment day", "revisión", "que lo juzguen", "doble review" | `.agents/skills/judgment-day/` |
| **skill-creator** | Crear nuevas skills | Al querer documentar patrones o crear nuevas instrucciones para el agente | `.agents/skills/skill-creator/` |
| **find-skills** | Descubrir e instalar skills del ecosistema | Al preguntar "cómo hago X", "hay una skill para X", o querer extender capacidades | `.agents/skills/find-skills/` |
| **mercadopago-integration** | Arquitectura de checkout con Mercado Pago (modo seguro: interfaces provider-agnostic, mocks, schemas, UX states) | Al planificar o implementar la integración con Mercado Pago durante el change `mercadopago-integration` | `.agents/skills/mercadopago-integration/` |

Para cargar una skill durante una tarea, usá el comando `/skill` seguido del nombre de la skill.

### Skills Globales Disponibles

Estas skills están instaladas globalmente en `~/.claude/skills/` y también pueden cargarse con `/skill`:

| Skill | Propósito | Trigger / Cuándo usarla |
|-------|-----------|-------------------------|
| **openspec-init** | Inicializar OPSX en un proyecto | Al decir "opsx init", "iniciar opsx", o arrancar un nuevo proyecto |
| **openspec-design** | Crear documento de diseño técnico | Durante `/opsx:propose` para generar design.md |
| **openspec-spec** | Escribir especificaciones | Durante `/opsx:propose` para generar specs delta |
| **openspec-tasks** | Crear checklist de tareas | Durante `/opsx:propose` para generar tasks.md |
| **openspec-onboard** | Walkthrough guiado de OPSX | Al querer aprender OPSX o hacer un primer cambio guiado |
| **openspec-verify** | Validar implementación vs specs | Al querer verificar que un cambio cumple con lo especificado |
| **branch-pr** | Crear Pull Requests | Al crear un PR, preparar cambios para review |
| **issue-creation** | Crear GitHub Issues | Al reportar un bug o solicitar una feature |
| **go-testing** | Testing en Go | Al escribir tests en Go, usar teatest, o agregar cobertura |

## Flujo de Trabajo OPSX

```
/opsx:explore  (opcional — pensar antes de comprometer)
       │
       ▼
/opsx:propose  (crear change + todos los artefactos en un paso)
       │
       ▼
/opsx:apply    (implementar tareas del change)
       │
       ▼
/opsx:archive  (sincronizar specs + cerrar el change)
```

**Nota:** El workflow es **fluido** — podés volver a ejecutar cualquier paso, actualizar cualquier artefacto, o saltar a cualquier acción en cualquier momento. No hay fases rígidas.

## Convenciones del Proyecto

### Backend (Feature-First)
- Cada módulo en `modules/` tiene sus propios modelos, schemas, repositorios, servicios y rutas
- Configuración centralizada en `core/`
- Migraciones con Alembic en `db/migrations/`

### Frontend (Feature-Sliced Design)
- Estructura basada en FSD: `app/`, `pages/`, `widgets/`, `features/`, `entities/`, `shared/`
- State management con Zustand
- Data fetching con TanStack Query
- Estilos con TailwindCSS

### Nomenclatura
- **TODO el código en inglés**: nombres de campos, variables, schemas Pydantic, interfaces TypeScript, atributos de modelos SQLAlchemy, endpoints, query params — todo en inglés
- Las columnas de la BD pueden mantener español (`calle`, `es_principal`) mapeadas con SQLAlchemy `Column("calle", ...)`, pero la capa de aplicación (Python/TS) siempre usa inglés
- Excepción: mensajes para el usuario final (UI text, toasts, etc.) van en español (Argentina)

### Commits
- Usar **Conventional Commits**
- No agregar atribución "Co-Authored-By" o atribución de IA
- Formato: `feat:`, `fix:`, `docs:`, `refactor:`, etc.

## Instalación Rápida

### Backend
```bash
cd backend
python -m venv .venv
# Windows: .venv\Scripts\activate
# Linux/Mac: source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
alembic upgrade head
# Opcional: python -m db.seed
```

### Frontend
```bash
cd frontend
pnpm install  # o npm install
cp .env.example .env
```

## Ejecución

### Backend
```bash
cd backend
uvicorn main:app --reload
# API: http://localhost:8000
# Docs: http://localhost:8000/docs
```

### Frontend
```bash
cd frontend
pnpm dev  # o npm run dev
# App: http://localhost:5173
```

## Configuración de OPSX

El archivo `openspec/config.yaml` contiene la configuración del workflow. Actualmente usa el esquema `spec-driven` con reglas por defecto.

Para agregar contexto del proyecto (tech stack, convenciones, etc.), editar la sección `context:` en `openspec/config.yaml`.

---

**Generado:** 28/04/2026  
**Basado en:** Estructura actual del proyecto y skills instaladas
