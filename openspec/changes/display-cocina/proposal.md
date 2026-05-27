## Why

Food Store no tiene display de cocina (KDS) ni un rol Cocinero dedicado. Hoy la operación de cocina está absorbida por Admin via el FSM de pedidos, sin una interfaz en tiempo real que muestre qué pedidos están listos para preparar. Esto obliga al equipo de cocina a recargar manualmente o coordinarse fuera del sistema, generando demoras y errores. Se necesita un Kitchen Display System (KDS) que reciba pedidos pagados por push, permita a la cocina avanzar estados (confirmado → preparando → enviado), y resalte urgencias por tiempo de espera.

## What Changes

**Nuevo rol COCINA:**
- Se agrega el rol `COCINA` al enum `UserRole`, a los permisos del sistema y al seed de desarrollo
- El frontend reconoce el nuevo rol para guard de rutas y navegación
- El cocinero ve solo la pantalla de cocina (`/cocina`) — sin CRUD, sin despacho, sin gestión de usuarios

**Nuevo módulo backend `cocina/`:**
- Endpoint REST `GET /api/v1/cocina/pedidos` — lista pedidos en `CONFIRMADO` y `PREPARANDO` ordenados por antigüedad
- Endpoint SSE `GET /api/v1/cocina/events` — push de eventos en tiempo real (nuevo pedido, cambio de estado, cancelación)
- `ConnectionManager` — pub/sub en proceso para single-instance (documentado el límite multi-instancia)

**Eventos en tiempo real (SSE):**
- Se agrega un hook en `OrderService.update_status()` que, después de commitear la transición, publica eventos al `ConnectionManager`
- Eventos: `PEDIDO_CONFIRMADO`, `PEDIDO_EN_PREPARACION`, `PEDIDO_EN_CAMINO`, `PEDIDO_CANCELADO`

**FSM con conciencia de roles:**
- El `OrderStateMachine.transition()` recibe un parámetro `actor_role` opcional
- Las transiciones se validan por rol: COCINA solo puede ejecutar `CONFIRMADO → PREPARANDO` y `PREPARANDO → ENVIADO`
- Admin/PEDIDOS mantienen todas las capacidades actuales

**Frontend — Pantalla de Cocina (KDS):**
- Nueva ruta `/cocina` con layout standalone (pantalla completa, sin header de cliente)
- Dos columnas: "Por preparar" (CONFIRMADO) y "En preparación" (PREPARANDO)
- Conexión SSE para recibir eventos en tiempo real, con fallback por polling cada 30s
- Timer de urgencia en cada tarjeta: <10min normal, 10-20min advertencia, >20min urgente
- Alerta visual/sonora al llegar un nuevo pedido (US-COCINA-05)
- La ruta queda excluida del auto-logout por inactividad

**Seed de desarrollo:**
- Usuario `cocina@foodstore.com` con rol COCINA
- Roles COCINA y PEDIDOS agregados al catálogo de roles

**Lo que NO se incluye en esta v1:**
- US-COCINA-07 (marcar producto no disponible desde cocina) → se difiere a v2
- Estado `LISTO` intermedio (PA-CO-01) → se mantiene el modelo actual
- Multi-instancia / Redis Pub/Sub → documentado como límite conocido

## Capabilities

### New Capabilities
- `kds-kitchen-display`: Kitchen Display System — pantalla de cocina en tiempo real con SSE, columnas por estado, timer de urgencia, alertas visuales/sonoras, y fallback por polling
- `cocina-role`: Rol Cocinero — nuevo actor COCINA con permisos específicos, guard de rutas, endpoints protegidos, y seed de usuario de prueba

### Modified Capabilities
- `rbac-system`: Se agrega el rol `COCINA` al sistema de roles y permisos, con su propio conjunto de permisos (kitchen:view, kitchen:update_status)
- `order-processing`: El FSM se vuelve role-aware — cada transición valida qué roles pueden ejecutarla. Se agrega publicación de eventos SSE después de cada transición relevante para cocina

## Impact

**Backend:**
- `backend/core/enums.py` — agregar `COCINA = "cocina"` y `PEDIDOS = "pedidos"` a `UserRole`
- `backend/core/permissions.py` — agregar permisos de cocina + mapear COCINA/PEDIDOS en ROLE_PERMISSIONS
- `backend/modules/pedidos/state_machine.py` — agregar `actor_role` a `transition()`
- `backend/modules/pedidos/service.py` — hook de eventos SSE en `update_status()`
- Nuevo: `backend/modules/cocina/` — módulo con router, service, schemas, connection_manager
- `backend/db/alembic/versions/` — migración para ALTER TYPE userrole ADD VALUE
- `backend/db/seed.py` — agregar usuario cocina

**Frontend:**
- `frontend/src/shared/stores/authStore.ts` — agregar `'cocina'` a UserRead.role
- `frontend/src/shared/components/ProtectedRoute.tsx` — soporte para múltiples roles
- Nuevo: `frontend/src/features/cocina/` — hooks, componentes KDS
- Nuevo: `frontend/src/pages/CocinaPage.tsx` — página principal del KDS
- `frontend/src/app/App.tsx` — agregar ruta `/cocina`

**Dependencias externas:**
- Sin nuevas dependencias npm o pip (SSE se implementa con EventSource nativo del navegador + StreamingResponse de FastAPI)
