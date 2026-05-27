## Context

Food Store actualmente es una API REST pura (FastAPI + PostgreSQL + React). No existe infraestructura de tiempo real — ni WebSocket, ni SSE, ni pub/sub, ni Redis. Los roles disponibles son solo ADMIN y CLIENTE. El estado de los pedidos se maneja con un FSM puro que no distingue qué rol ejecuta cada transición.

La operación de cocina hoy no tiene interfaz propia: los pedidos en estado CONFIRMADO y PREPARANDO se gestionan desde el panel de Admin. No hay una pantalla dedicada para el equipo de cocina, ni notificaciones en tiempo real cuando llega un pedido nuevo.

Este diseño implementa un Kitchen Display System (KDS) que agrega:
- Un nuevo actor (COCINA) con permisos específicos
- Una pantalla de cocina en tiempo real con SSE
- Un FSM con conciencia de roles (cada transición valida quién puede ejecutarla)
- Eventos SSE publicados desde el servicio de pedidos

## Goals / Non-Goals

**Goals:**
- Agregar el rol COCINA al RBAC existente (single-role column, consistente con el modelo actual)
- Implementar un KDS vía SSE (Server-Sent Events) para push unidireccional servidor → cliente
- Hacer el FSM role-aware: COCINA solo puede ejecutar CONFIRMADO→PREPARANDO y PREPARANDO→ENVIADO
- Publicar eventos SSE desde OrderService.update_status() después de cada transición relevante
- Proveer pantalla de cocina en React con 2 columnas, timer de urgencia y alertas
- Soporte de resiliencia: fallback por polling si SSE se desconecta
- Excluir la ruta /cocina del auto-logout por inactividad
- Seed de desarrollo con usuario cocina y roles COCINA/PEDIDOS

**Non-Goals:**
- NO se implementa multi-rol (N:M vía UsuarioRol) — se mantiene single-role column consistente con el modelo actual
- NO se implementa el estado LISTO intermedio (PA-CO-01) — se difiere a v2
- NO se implementa US-COCINA-07 (marcar producto no disponible desde cocina)
- NO se implementa Redis Pub/Sub — el ConnectionManager es en proceso (single-instance). Multi-instancia queda documentado como límite conocido.
- NO se migran los estados existentes del FSM (PREPARANDO, ENVIADO se mantienen)

## Decisions

### D-01: SSE sobre WebSocket
**Opción elegida:** SSE (Server-Sent Events)

**Alternativas consideradas:** WebSocket

**Fundamento:** El KDS solo necesita recibir eventos del servidor (push unidireccional). SSE es significativamente más simple:
- Se implementa con `StreamingResponse` de Starlette/FastAPI — sin manejo de handshake, sin protocolo de framing
- El navegador maneja reconexión automática (`EventSource` nativo)
- El cliente no necesita enviar datos al servidor
- FastAPI no requiere dependencias adicionales
- WebSocket aporta complejidad innecesaria para este caso de uso

### D-02: Conexiones en proceso (single-instance)
**Opción elegida:** Gestor de conexiones en memoria con `asyncio`

**Fundamento:** Para una instancia única del backend, un pub/sub en proceso con un `set` de conexiones SSE activas es suficiente. No requiere Redis ni infraestructura externa. El ConnectionManager se implementa como un singleton thread-safe con `asyncio.Lock`.

**Límite conocido:** Si el proyecto escala a múltiples instancias, las conexiones SSE estarían en una instancia distinta a la que procesa el pedido. En ese escenario se necesitaría Redis Pub/Sub o un bus externo para distribuir los eventos.

### D-03: Single-role (consistente con modelo actual)
**Opción elegida:** Mantener single-role column

**Alternativas consideradas:** Tabla N:M UsuarioRol

**Fundamento:** El modelo actual usa una columna `role` tipo enum en la tabla `usuarios`. Migrar a multi-rol N:M requeriría:
- Nueva tabla `usuario_rol` + catálogo `rol`
- Refactor de todos los endpoints que leen `user.role`
- Cambios en JWT (role → roles[])
- Cambios en el frontend authStore
- Migración de datos

Esto agrega scope significativo sin valor para la v1 del KDS. Un usuario cocinero tiene un solo rol funcional. En equipos chicos, una persona puede tener dos cuentas o se asigna el rol que necesita en ese momento.

### D-04: FSM role-aware
**Opción elegida:** Agregar parámetro `actor_role: UserRole | None` al método `OrderStateMachine.transition()`

**Alternativas consideradas:** Validación de roles solo en el service layer

**Fundamento:** La regla RN-CO03 del feature pack exige que la validación de qué transiciones puede ejecutar cada rol viva en el servicio del FSM, no solo en el `require_role` del endpoint. Esto es correcto porque:
- Centraliza la lógica de negocio en un solo lugar
- Hace el FSM testeable independientemente de la capa HTTP
- Previene que un error en la configuración de rutas permita transiciones no autorizadas

Se modifica `TransitionResult` para incluir `allowed_roles` y se agrega un nuevo método `authorize_transition()` que recibe el rol.

### D-05: Hook de eventos en OrderService
**Opción elegida:** Publicar eventos DESPUÉS de `session.commit()`, no dentro de la transacción

**Fundamento:** Si publicamos el evento dentro de la transacción y el commit falla, el evento ya se habría enviado (estado inconsistente). Si publicamos antes del commit y el evento falla, la transacción se rollbackea. La opción más robusta es:
1. Ejecutar side effects del FSM (stock)
2. Asignar nuevo status
3. Escribir historial
4. Commiteaer
5. **Solo si commit OK** → publicar evento SSE

Si la publicación del evento falla, el pedido ya está en el nuevo estado — la pantalla de cocina lo verá en el próximo polling o al reconectar SSE. Es "best-effort" en v1.

### D-06: Timer de urgencia 100% en cliente
**Opción elegida:** El backend envía el timestamp de entrada a cocina (`confirmed_at`) en cada pedido, el cliente calcula el timer localmente cada 15s

**Fundamento:** El timer de urgencia (RN-CO07) no necesita precisión de servidor. Calcularlo en cliente:
- Evita round-trips al servidor cada 15s
- Funciona incluso si SSE está desconectado (el dato ya está en la tarjeta)
- Los umbrales (<10min, 10-20min, >20min) son configurables pero no críticos

### D-07: Sin estado LISTO intermedio
**Opción elegida:** Mantener `PREPARANDO → ENVIADO` como señal de "cocina terminó"

**Fundamento:** Sigue la recomendación de PA-CO-01. En un modelo de delivery, la comida sale a reparto inmediatamente después de preparada. Separar "comida lista" de "salió a reparto" sería relevante si hubiera un mostrador físico con espera, pero no es el caso de Food Store.

## Architecture

### Diagrama de flujo de eventos SSE

```
Cliente/KDS                     Backend/FastAPI                      DB
    |                                |                               |
    |--- GET /api/v1/cocina/pedidos -|                               |
    |<-- 200 [pedidos CONFIRMADO + PREPARANDO] --                   |
    |                                |                               |
    |--- GET /api/v1/cocina/events --|                               |
    |   (EventSource)                |                               |
    |                                |                               |
    |     ... tiempo pasa ...        |                               |
    |                                |--- PATCH /pedidos/{id}/estado  |
    |                                |     (admin/cocina)             |
    |                                |--- update_status() ------------|
    |                                |                               |
    |                                |<-- commit OK -----------------|
    |                                |                               |
    |<-- SSE: PEDIDO_CONFIRMADO -----|                               |
    |<-- SSE: PEDIDO_EN_PREPARACION  |                               |
    |<-- SSE: PEDIDO_EN_CAMINO ------|                               |
    |<-- SSE: PEDIDO_CANCELADO ------|                               |
    |                                |                               |
    |     ... SSE se cae ...         |                               |
    |--- GET /api/v1/cocina/pedidos -|  (polling fallback cada 30s)  |
    |<-- 200 [estado actual] --------|                               |
```

### Arquitectura del ConnectionManager

```
┌──────────────────────────────────────────┐
│           ConnectionManager              │
│  ┌──────────────────────────────────┐    │
│  │   active_connections: set[SSE]   │    │
│  │   lock: asyncio.Lock             │    │
│  │                                  │    │
│  │   + connect(stream)             │    │
│  │   + disconnect(stream)          │    │
│  │   + broadcast(event)            │    │
│  └──────────────────────────────────┘    │
└──────────────────────────────────────────┘
          ▲
          │ publish(event)
          │
┌──────────────────────────────────────────┐
│           OrderService                   │
│                                          │
│   update_status()                        │
│     └─ state_machine.transition()        │
│     └─ execute side_effects              │
│     └─ order.status = new_status         │
│     └─ add_history()                     │
│     └─ session.commit()                  │
│     └─ event_bus.publish(event)  ◄── NUEVO│
└──────────────────────────────────────────┘
```

## Risks / Trade-offs

| Risk | Mitigación |
|------|------------|
| **Single-instance limit**: ConnectionManager en proceso no funciona con múltiples instancias del backend | Documentado como límite conocido. Si se escala, migrar a Redis Pub/Sub |
| **Evento perdido**: Si el broadcast SSE falla, el KDS no ve el cambio hasta el próximo polling (30s) | Best-effort v1. El polling de respaldo garantiza consistencia eventual. En la práctica, el SSE rara vez falla en LAN |
| **Rol COCINA hardcoded**: El enum `UserRole` requiere migración Alembic para agregar/quitar valores | PostgreSQL permite `ALTER TYPE ... ADD VALUE` sin bloqueo. La eliminación no se soporta (raro) |
| **JWT sin listado de roles**: El token contiene un solo `role`, no una lista | Consistente con single-role. Si se migra a multi-rol en el futuro, el claim `role` pasaría a `roles: []` |
| **Auto-logout en /cocina**: Si el sistema cierra sesión por inactividad, la pantalla de cocina se apaga | Se excluye la ruta `/cocina` del mecanismo de auto-logout |
| **SSE y proxies reversos**: Algunos proxies (Nginx, Cloudflare) pueden bufferear SSE o tener timeouts cortos | Configurar `X-Accel-Buffering: no` y timeouts largos. Documentar en la configuración de deploy |
