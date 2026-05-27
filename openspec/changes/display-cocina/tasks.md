## 1. Foundation — Backend Core

- [x] 1.1 Agregar `COCINA` y `PEDIDOS` al enum `UserRole` en `backend/core/enums.py`
- [x] 1.2 Agregar nuevos permisos (`kitchen:view`, `kitchen:update_status`) al enum `Permission` en `backend/core/permissions.py`
- [x] 1.3 Mapear roles `COCINA` y `PEDIDOS` en `ROLE_PERMISSIONS` con sus permisos correspondientes
- [x] 1.4 Modificar `require_role()` en `backend/core/auth.py` para aceptar múltiples roles (`*roles: UserRole`) en vez de uno solo
- [x] 1.5 Agregar role-awareness al FSM: modificar `OrderStateMachine.transition()` para aceptar `actor_role: UserRole | None` y validar transiciones por rol
- [x] 1.6 Crear migración Alembic: `ALTER TYPE userrole ADD VALUE 'COCINA'` y `ADD VALUE 'PEDIDOS'`
- [x] 1.7 Actualizar `backend/db/seed.py`: agregar usuario `cocina@foodstore.com` con rol COCINA

## 2. Tiempo Real — SSE Infrastructure

- [x] 2.1 Implementar `ConnectionManager` en `backend/modules/cocina/connection_manager.py` — gestor de conexiones SSE con `asyncio.Lock`, métodos `connect()`, `disconnect()`, `broadcast()`
- [x] 2.2 Implementar endpoint SSE `GET /api/v1/cocina/events` en `backend/modules/cocina/router.py` — validar JWT + rol autorizado, conectar al ConnectionManager, mantener StreamingResponse abierto
- [x] 2.3 Crear `backend/modules/cocina/__init__.py` y registrar el router en `backend/main.py` bajo prefijo `/api/v1/cocina`
- [x] 2.4 Integrar eventos SSE en `OrderService.update_status()` — después de `session.commit()`, publicar evento al ConnectionManager según la transición ejecutada (PEDIDO_CONFIRMADO, PEDIDO_EN_PREPARACION, PEDIDO_EN_CAMINO, PEDIDO_CANCELADO)

## 3. REST API — Módulo Cocina

- [x] 3.1 Implementar endpoint `GET /api/v1/cocina/pedidos` en `backend/modules/cocina/router.py` — lista pedidos CONFIRMADO + PREPARANDO ordenados por antigüedad, incluye `confirmed_at` (timestamp de entrada a cocina)
- [x] 3.2 Implementar endpoint `PATCH /api/v1/cocina/pedidos/{id}/estado` — avance de estado con validación de rol en el FSM, requiere rol COCINA/PEDIDOS/ADMIN
- [x] 3.3 Crear `backend/modules/cocina/service.py` con `CocinaService` — lógica de listado de pedidos de cocina y delegación al OrderService
- [x] 3.4 Crear `backend/modules/cocina/schemas.py` — Pydantic models para requests/responses del KDS (CocinaPedidoRead, CocinaUpdateStatus)

## 4. Frontend — KDS Pantalla de Cocina

- [x] 4.1 Actualizar `frontend/src/shared/stores/authStore.ts`: agregar `'cocina'` y `'pedidos'` al union type `UserRead.role`
- [x] 4.2 Modificar `frontend/src/shared/components/ProtectedRoute.tsx`: soportar `requiredRole` como `string | string[]` (múltiples roles permitidos)
- [x] 4.3 Crear hook `frontend/src/features/cocina/hooks/useKDS.ts` — maneja conexión SSE (`EventSource`) con reconexión automática, polling fallback cada 30s, y estado de conexión
- [x] 4.4 Crear componente `frontend/src/features/cocina/components/KDSBoard.tsx` — layout de dos columnas "Por preparar" y "En preparación", recibe pedidos via hook useKDS
- [x] 4.5 Crear componente `frontend/src/features/cocina/components/OrderCard.tsx` — tarjeta de pedido con número, ítems, exclusiones, notas, timer de urgencia, botones de acción
- [x] 4.6 Crear componente `frontend/src/features/cocina/components/UrgencyTimer.tsx` — timer que se recalcula cada 15s, muestra colores según umbrales (<10min normal, 10-20min naranja, >20min rojo)
- [x] 4.7 Crear componente `frontend/src/features/cocina/components/NewOrderAlert.tsx` — alerta visual/sonora (Web Audio API) al recibir PEDIDO_CONFIRMADO, toggle de sonido persistente
- [x] 4.8 Crear página `frontend/src/pages/CocinaPage.tsx` — pantalla completa, monta KDSBoard, layout standalone
- [x] 4.9 Actualizar `frontend/src/app/App.tsx` — agregar ruta `/cocina` con `ProtectedRoute` multi-rol fuera del Layout de cliente, misma estrategia que admin

## 5. Testing

- [x] 5.1 Tests unitarios del FSM role-aware: verificar que COCINA solo puede CONFIRMADO→PREPARANDO y PREPARANDO→ENVIADO, y que ADMIN puede todo
- [x] 5.2 Tests de integración del endpoint `GET /api/v1/cocina/pedidos`: verificar listado, orden, filtrado por estado, y 403 para rol no autorizado
- [x] 5.3 Tests de integración SSE: verificar conexión con token válido, rechazo con token inválido, y recepción de eventos al cambiar estados
- [x] 5.4 Tests del ConnectionManager: verificar connect/disconnect/broadcast con conexiones simuladas
