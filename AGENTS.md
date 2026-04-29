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
├── .agents/             # Skills de agentes (global)
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

### Skills de OPSX Instaladas

Las siguientes skills están configuradas en `.claude/skills/`:

| Skill | Propósito | Trigger |
|-------|-----------|---------|
| **openspec-propose** | Crear propuesta con todos los artefactos | "propose", "create a change", "new feature" |
| **openspec-apply-change** | Implementar tareas de un cambio | "implement", "apply", "write code", "do the tasks" |
| **openspec-archive-change** | Archivar cambio completado | "archive", "close", "done with" |
| **openspec-explore** | Modo exploración y pensamiento | "explore", "think about", "investigate" |
| **find-skills** | Descubrir e instalar nuevas skills | "how do I do X", "find a skill for X" |

### Skills Adicionales Disponibles (Globales)

Estas skills están disponibles en el sistema pero no necesariamente instaladas en el proyecto:

| Skill | Propósito |
|-------|-----------|
| **fastapi-python** | Desarrollo con FastAPI |
| **react-dev** | Desarrollo con React + TypeScript |
| **jwt-security** | Implementación de JWT |
| **postgresql-database-engineering** | Ingeniería de PostgreSQL |
| **tailwindcss** | Estilos con TailwindCSS |
| **zustand-state-management** | Manejo de estado con Zustand |
| **judgment-day** | Revisión adversarial paralela |
| **skill-creator** | Crear nuevas skills |

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
