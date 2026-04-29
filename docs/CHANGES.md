# Changes — Mapa Completo de Implementación

## ¿Qué es un change?

Un **change** es la unidad mínima de trabajo en el flujo SDD. No es una tarea suelta ni un ticket — es un conjunto de artefactos que juntos describen, diseñan e implementan una funcionalidad del sistema de forma completa y trazable.

```
openspec/changes/nombre-del-change/
├── proposal.md      ← QUÉ se va a construir y POR QUÉ
├── design.md         ← CÓMO técnicamente (arquitectura, modelos, endpoints)
├── tasks.md          ← CHECKLIST atómica de implementación
└── specs/            ← Especificaciones detalladas (opcional)
```

---

## Mapa Completo de Changes — Food Store

Basado en los documentos del proyecto, el mapa tiene **20 changes** organizados en 6 fases lógicas.

---

## FASE 1 — Fundaciones (sin dependencias)

| Change | Funcionalidad | Historias de Usuario | Dependencias |
|--------|---------------|----------------------|--------------|
| `project-setup` | Scaffolding del monorepo, estructura feature-first (backend) y FSD (frontend), configuración inicial, .gitignore, README.md | US-000 | Ninguna |
| `backend-config` | FastAPI + SQLModel + dependencias core, middleware CORS, rate limiting, estructura `core/` | US-000a | `project-setup` |
| `frontend-config` | React + Vite + TypeScript strict + Tailwind + Axios + TanStack Query + routing base | US-000c, US-000d | `project-setup` |
| `db-setup` | PostgreSQL + Alembic + modelos SQLModel + seed data (roles, estados, admin) | US-000b | `backend-config` |
| `backend-patterns` | BaseRepository[T], UnitOfWork, get_current_user, require_role, manejo de errores RFC 7807 | US-000d, US-068, US-074 | `db-setup` |
| `frontend-stores` | 4 stores Zustand (authStore, cartStore, paymentStore, uiStore) con persistencia | US-000e | `frontend-config` |

---

## FASE 2 — Autenticación y Navegación

| Change | Funcionalidad | Historias de Usuario | Dependencias |
|--------|---------------|----------------------|--------------|
| `auth-backend` | Registro, login, refresh token (con rotación), logout, rate limiting en login | US-001, US-002, US-003, US-004, US-073 | `backend-patterns` |
| `auth-frontend` | Formularios de login/registro, interceptor Axios con refresh automático, manejo de errores | US-002, US-066, US-067 | `auth-backend`, `frontend-stores` |
| `rbac-guard` | RBAC en backend (require_role), protección de rutas en frontend, navegación por rol | US-005, US-006, US-075, US-076 | `auth-backend`, `auth-frontend` |

---

## FASE 3 — Catálogo de Productos

| Change | Funcionalidad | Historias de Usuario | Dependencias |
|--------|---------------|----------------------|--------------|
| `categories-crud` | CRUD categorías con jerarquía (CTE recursiva), soft delete, validación de ciclos | US-007, US-008, US-009, US-010 | `rbac-guard` |
| `ingredients-crud` | CRUD ingredientes con flag `es_alergeno`, filtro por alérgenos | US-011, US-012, US-013, US-014 | `rbac-guard` |
| `products-crud` | CRUD productos, asociaciones M2M con categorías e ingredientes, listado público con paginación/filtros/búsqueda, gestión de stock | US-015 a US-023 | `categories-crud`, `ingredients-crud` |

---

## FASE 4 — Carrito y Direcciones

| Change | Funcionalidad | Historias de Usuario | Dependencias |
|--------|---------------|----------------------|--------------|
| `addresses-crud` | CRUD direcciones de entrega, dirección predeterminada, ownership por usuario | US-024 a US-028 | `rbac-guard` |
| `cart-frontend` | Carrito client-side (Zustand + localStorage), agregar/quitar/modificar items, personalización (exclusión de ingredientes) | US-029 a US-034, US-069, US-070 | `products-crud`, `frontend-stores` |

---

## FASE 5 — Pedidos y Pagos (El Core)

| Change | Funcionalidad | Historias de Usuario | Dependencias |
|--------|---------------|----------------------|--------------|
| `orders-create` | Creación atómica de pedidos con UoW, snapshots de precio/dirección, validación de stock atómica, historial append-only | US-035, US-036, US-037, US-038 | `cart-frontend`, `addresses-crud` |
| `orders-state-machine` | Máquina de estados (6 estados), transiciones validadas, decremento/incremento atómico de stock, cancelación con restauración | US-039 a US-044 | `orders-create` |
| `mercadopago-integration` | Integración Checkout API, preferencias de pago, webhook IPN, idempotency keys, tabla Pago | US-045 a US-048 | `orders-create` |

---

## FASE 6 — Panel Admin y UI Global

| Change | Funcionalidad | Historias de Usuario | Dependencias |
|--------|---------------|----------------------|--------------|
| `admin-panel` | Dashboard con métricas (recharts), gestión de usuarios y roles, gestión de pedidos con FSM | US-049 a US-060, US-064 | `rbac-guard`, `orders-state-machine` |
| `client-profile` | Ver/editar perfil propio, cambiar contraseña | US-061, US-062, US-063 | `rbac-guard` |
| `ui-global` | Skeleton loaders, toasts, estados vacíos, modales de confirmación, responsive design | US-065, US-072 | Todos los anteriores |

---

## Diagrama de Dependencias

```
project-setup
├── backend-config ──→ db-setup ──→ backend-patterns
│                                    │
└── frontend-config ──→ frontend-stores
                                    │
auth-backend ←──────────── rbac-guard
      ↑                      │
auth-frontend                 │
      ↑                      │
      └── rbac-guard ←───────┘
              │
categories-crud ← ingredients-crud ← products-crud
                                        │
addresses-crud ← cart-frontend ─────────┤
                │
                └── orders-create ← mercadopago-integration
                            │
orders-state-machine ←──────┘
              │
admin-panel ←┤
              │
client-profile ← ui-global
```

---

## Resumen Ejecutivo

| # | Change | Complejidad | Épicas Cubiertas |
|---|--------|-------------|------------------|
| 1 | `project-setup` | Baja | EPIC 00 |
| 2 | `backend-config` | Baja | EPIC 00 |
| 3 | `frontend-config` | Baja | EPIC 00 |
| 4 | `db-setup` | Media | EPIC 00 |
| 5 | `backend-patterns` | Alta | EPIC 00 |
| 6 | `frontend-stores` | Media | EPIC 00 |
| 7 | `auth-backend` | Alta | EPIC 01 |
| 8 | `auth-frontend` | Media | EPIC 01, EPIC 02 |
| 9 | `rbac-guard` | Alta | EPIC 01, EPIC 02 |
| 10 | `categories-crud` | Media | EPIC 03 |
| 11 | `ingredients-crud` | Media | EPIC 04 |
| 12 | `products-crud` | Alta | EPIC 05 |
| 13 | `addresses-crud` | Media | EPIC 07 |
| 14 | `cart-frontend` | Alta | EPIC 08, EPIC 09 |
| 15 | `orders-create` | Muy Alta | EPIC 10 |
| 16 | `orders-state-machine` | Muy Alta | EPIC 11 |
| 17 | `mercadopago-integration` | Muy Alta | EPIC 12 |
| 18 | `admin-panel` | Alta | EPIC 13 |
| 19 | `client-profile` | Baja | EPIC 06 |
| 20 | `ui-global` | Media | Todas |

---

## Épicas y Historias de Usuario Cubiertas

| Épica | Descripción | Changes |
|-------|-------------|---------|
| EPIC 00 | Infraestructura y Setup | project-setup, backend-config, frontend-config, db-setup, backend-patterns, frontend-stores |
| EPIC 01 | Autenticación y Autorización | auth-backend, auth-frontend, rbac-guard |
| EPIC 02 | Navegación y Layout Base | auth-frontend, rbac-guard |
| EPIC 03 | Gestión de Categorías | categories-crud |
| EPIC 04 | Gestión de Ingredientes y Alérgenos | ingredients-crud |
| EPIC 05 | Gestión de Productos y Catálogo | products-crud |
| EPIC 06 | Gestión del Perfil del Cliente | client-profile |
| EPIC 07 | Gestión de Direcciones de Entrega | addresses-crud |
| EPIC 08 | Carrito de Compras | cart-frontend |
| EPIC 09 | Validaciones Pre-Checkout | cart-frontend |
| EPIC 10 | Creación de Pedidos | orders-create |
| EPIC 11 | Máquina de Estados del Pedido | orders-state-machine |
| EPIC 12 | Integración MercadoPago | mercadopago-integration |
| EPIC 13 | Panel de Administración | admin-panel |

---

## Reglas Importantes

- **Nunca implementes sin artefactos.** Si no existe `proposal.md` y `design.md` aprobados, no hay `/opsx:apply`.
- **El orden importa.** Si el change B necesita código del change A, A tiene que estar archivado antes de proponer B.
- **Un change = un commit** (o varios commits atómicos). Nunca mezcles dos changes en un mismo commit.
- **Las specs son código.** Se versionan en git, se revisan en PRs, evolucionan con el proyecto.

---

## Workflow

```
/opsx:explore  (opcional — pensar antes de comprometer)
       │
       ▼
/opsx:propose  (crear change + todos los artefactos)
       │
       ▼
/opsx:apply    (implementar tareas del change)
       │
       ▼
/opsx:archive  (sync specs + cerrar change)
```

El workflow es **fluido** — podés re-ejecutar cualquier paso, actualizar cualquier artefacto, o saltar a cualquier acción en cualquier momento. No hay phase locks.

---

## Skills Recomendadas por Change

| Change | Skills Principales |
|--------|-------------------|
| `backend-config`, `db-setup` | fastapi-python, postgresql-database-engineering |
| `auth-backend`, `auth-frontend` | jwt-security, fastapi-python |
| `backend-patterns` | fastapi-python |
| `products-crud`, `orders-create` | fastapi-python, postgresql-database-engineering |
| `frontend-stores`, `cart-frontend` | zustand-state-management |
| `mercadopago-integration` | fastapi-python |
| `admin-panel`, `ui-global` | react-dev, tailwindcss |