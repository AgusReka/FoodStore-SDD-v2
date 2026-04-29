## Context

Food Store es un sistema e-commerce full-stack (FastAPI + React + PostgreSQL). Este es el change fundacional que establece la estructura del proyecto.

**Estado Actual:** Repositorio vacío o sin estructura definida.

**Restricciones del Proyecto:**
- Stack: FastAPI (Python) + SQLModel + Alembic (backend), React + TypeScript + Vite + Tailwind + Zustand + TanStack Query (frontend)
- Metodología: Spec-Driven Development (SDD)
- Patrones: Feature-first (backend), Feature-Sliced Design (frontend)
- Monorepo con `/backend` y `/frontend` separados

**Stakeholders:** Equipo de desarrollo, reviewers, futuros contributors

## Goals / Non-Goals

**Goals:**
- Crear estructura de monorepo clara con `/backend` y `/frontend`
- Establecer patrones de arquitectura desde el inicio (feature-first backend, FSD frontend)
- Documentar convenciones de commits (conventional commits)
- Proveer archivos de configuración base (`.env.example`, `.gitignore`)
- README.md funcional con instrucciones de setup

**Non-Goals:**
- Implementar funcionalidades de negocio (auth, productos, pedidos, etc.)
- Configurar dependencias específicas de frameworks (FastAPI completo, React completo)
- Crear tests o pipelines CI/CD
- Configurar deployment

## Decisions

### Decisión 1: Estructura del Monorepo

**Opción Elegida:** Carpetas raíz `/backend` y `/frontend` en nivel superior

**Alternativas Consideradas:**
- Monorepo con workspaces (npm/yarn workspaces): Añade complejidad de configuración
- Repositorios separados: Dificulta la correlación de cambios y revisiones compartidas

**Justificación:** Mantiene separación clara de concerns, facilita setups independientes, y es la estructura más común para proyectos FastAPI + React.

### Decisión 2: Feature-First en Backend

**Opción Elegida:** Cada módulo tiene su propia carpeta con `model.py`, `schemas.py`, `repository.py`, `service.py`, `router.py`

**Justificación:**
- Coherencia con la documentación del sistema (ver `docs/Descripcion.txt` sección 3)
- Facilita localización de código relacionado
- Cada módulo es autocontenido

**Módulos definidos:**
```
backend/
├── main.py
├── core/
│   ├── config.py
│   ├── database.py
│   └── security.py
├── modules/
│   ├── auth/
│   ├── refreshtokens/
│   ├── usuarios/
│   ├── direcciones/
│   ├── categorias/
│   ├── productos/
│   ├── pedidos/
│   ├── pagos/
│   └── admin/
└── db/
    ├── alembic/
    ├── migrations/
    └── seed.py
```

### Decisión 3: Feature-Sliced Design (FSD) en Frontend

**Opción Elegida:** Capas horizontales (app > pages > widgets > features > entities > shared) con imports unidireccionales

**Justificación:**
- Definido en la documentación del proyecto (`docs/Descripcion.txt` sección 3)
- Previene imports circulares
- Cada feature es autocontenida

**Estructura:**
```
frontend/
├── src/
│   ├── app/
│   ├── pages/
│   ├── widgets/
│   ├── features/
│   │   ├── auth/
│   │   ├── cart/
│   │   ├── orders/
│   │   └── admin/
│   ├── entities/
│   │   ├── user/
│   │   ├── product/
│   │   ├── order/
│   │   └── address/
│   └── shared/
│       ├── api/
│       ├── components/
│       ├── config/
│       ├── hooks/
│       └── stores/
├── index.html
├── vite.config.ts
└── tailwind.config.js
```

### Decisión 4: Conventional Commits

**Opción Elegida:** Prefijo `feat:`, `fix:`, `docs:`, `chore:`, `refactor:`, `test:` para commits

**Justificación:**
- Historial de git navegable y auto-documentado
- Facilita generación automática de CHANGELOG
- Estándar adoptado por la comunidad

### Decisión 5: Archivos de Configuración Inicial

**`.env.example` Backend:**
```
DATABASE_URL=postgresql://user:pass@localhost:5432/foodstore_db
SECRET_KEY=your-secret-key-min-32-chars
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
CORS_ORIGINS=["http://localhost:5173"]
MP_ACCESS_TOKEN=TEST-xxxx
MP_PUBLIC_KEY=TEST-xxxx
MP_NOTIFICATION_URL=https://your-domain.com/api/v1/pagos/webhook
```

**`.env.example` Frontend:**
```
VITE_API_URL=http://localhost:8000
VITE_MERCADOPAGO_PUBLIC_KEY=TEST-xxxx
```

## Risks / Trade-offs

| Riesgo | Descripción | Mitigación |
|--------|-------------|------------|
| Commits iniciales masivos | Mezclar demasiado en un solo commit | Seguir lista de tareas con commits atómicos por carpeta |
| Estructura rigidizada | Patrones que no escalen | La estructura elegida es estándar y probada en proyectos similares |
| Inconsistencia entre commits | Mezclar cambios de backend y frontend en commits | Un commit por carpeta cuando sea posible |

## Migration Plan

**Steps para implementar:**

1. Crear estructura de carpetas vacías
2. Agregar archivos `.gitignore` base
3. Crear `.env.example` en backend y frontend
4. Inicializar repositorios git separados en cada carpeta (opcional) o un solo repo en raíz
5. Primer commit: estructura básica + gitignore
6. Segundo commit: `.env.example` archivos
7. Tercer commit: README.md
8. Commit final: configuración base de cada stack (requirements.txt, package.json)

**Rollback:** Si la estructura no funciona, se refactoriza en un change dedicado.

## Open Questions

1. **¿Repositorio único o git submodule por carpeta?** — Decisión: repositorio único por simplicidad y para mantener histórico compartido.

2. **¿Cuántos commits iniciales?** — Decisión: 3-4 commits atómicos siguiendo conventional commits:
   - `feat: project structure` (estructura + gitignore)
   - `feat: environment config` (.env.example)
   - `docs: readme` (README.md)
   - `feat: base config` (requirements.txt, package.json, etc.)