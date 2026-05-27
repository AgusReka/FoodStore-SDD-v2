## Context

El sistema ya tiene una infraestructura WebSocket exitosa para el KDS (cocina) usando `WebSocketManager` en `cocina/connection_manager.py`. Este change extiende ese mismo patrón a dos nuevas audiencias:

1. **Clientes** viendo el detalle de su pedido — necesitan actualización en tiempo real del estado
2. **Administradores** gestionando pedidos — necesitan ver cambios de estado + alerta de nuevos pedidos

Actualmente:
- El cliente recarga la página manualmente para ver cambios post-pago (salvo un polling temporal de 30s solo para MP)
- El administrador recarga la tabla manualmente
- No existe notificación de nuevo pedido para el admin

## Goals / Non-Goals

**Goals:**
- Cliente ve cambios de estado de su pedido en tiempo real (sin recargar)
- Admin ve cambios en la tabla de pedidos en tiempo real
- Admin recibe alerta (toast visual + opcional sonido) cuando llega un nuevo pedido
- Mismo patrón de conexión, auth y reconexión que el KDS existente

**Non-Goals:**
- No cambiar la API REST existente (solo agregar WebSocket)
- No reemplazar TanStack Query — los WebSocket invalidan queries en lugar de reemplazar el estado
- No implementar multi-instancia / Redis Pub/Sub (misma limitación que KDS)
- No agregar WebSocket a la lista de pedidos del cliente (solo al detalle)

## Decisions

### 1. Reusar `WebSocketManager` existente (no crear clase nueva)

**Decision**: `AdminEventManager` y `UserEventManager` son instancias separadas de la misma clase `WebSocketManager`. No se necesita una nueva clase.

**Rationale**: La interfaz (`connect`, `disconnect`, `broadcast`) es idéntica. La única diferencia es semántica — qué eventos van a qué instancia. Separar instancias permite control granular (ej. broadcast a admin no llega a KDS).

```python
from backend.modules.cocina.connection_manager import WebSocketManager

admin_manager = WebSocketManager()
user_manager = WebSocketManager()
```

### 2. UserEventManager por order_id, no por usuario

**Decision**: Agregar un diccionario `_order_subscriptions: dict[str, set[WebSocket]]` para que los clientes se suscriban a un order_id específico.

**Rationale**: Un usuario puede tener múltiples órdenes. Suscribir por order_id evita filtrar del lado del cliente y mantiene limpio el broadcast. Alternativa considerada: un manager por usuario — rechazada porque sería más complejo de limpiar en desconexión.

**Interface**:
```python
class OrderSubscriptionManager:
    async def subscribe(self, order_id: str, ws: WebSocket) -> None
    async def unsubscribe(self, order_id: str, ws: WebSocket) -> None
    async def broadcast_to_order(self, order_id: str, event_type: str, data: dict) -> None
    async def disconnect(self, ws: WebSocket) -> None  # removes from all subscriptions
```

### 3. Eventos publicados desde `OrderService`

**Decision**: `OrderService` publica a tres managers diferentes en `update_status()` y `create_order()`.

```python
# update_status() — además de _publish_kitchen_event():
await self._publish_order_event(order_id, old_status, new_status)  # → user_manager
await self._publish_admin_event(order_id, old_status, new_status)   # → admin_manager

# create_order() — nuevo:
await self._publish_new_order_alert(order)  # → admin_manager
```

Esto mantiene el patrón existente sin romper el flujo actual.

### 4. Frontend: WebSocket invalida TanStack Query (no reemplaza estado)

**Decision**: Al recibir un evento WebSocket, los hooks hacen `refetch()` o `setOrders()` según el caso (mismo patrón que `useKDS.ts`).

**Rationale**: Simple, consistente con lo que ya funciona en KDS. El WebSocket es un "acelerador" que gatilla refetch, no una fuente de verdad alternativa.

### 5. Alerta de nuevo pedido en admin

**Decision**: Componente `NewOrderAlert` que muestra un toast con sonido + botón "Ver pedido". Se cierra automáticamente a los 8 segundos o al hacer clic.

**Rationale**: Mismo patrón que el `NewOrderAlert` de KDS. El toast es no-intrusivo y no interrumpe el flujo de trabajo del admin.

## WebSocket API

### Cliente: `WS /api/v1/pedidos/{order_id}/events?token=...`

Auth: JWT desde query param. Valida que el token pertenezca al dueño del pedido o sea admin.

Formato mensaje (server → client):
```json
{
  "event": "ORDER_STATUS_CHANGED",
  "data": {
    "order_id": "uuid",
    "old_status": "confirmado",
    "new_status": "preparando",
    "timestamp": "2026-05-22T10:30:00Z"
  }
}
```

### Admin: `WS /api/v1/admin/pedidos/events?token=...`

Auth: JWT desde query param. Requiere rol admin.

Eventos:
```json
// Cambio de estado de cualquier orden
{
  "event": "ORDER_STATUS_CHANGED",
  "data": {
    "order_id": "uuid",
    "old_status": "pendiente",
    "new_status": "confirmado",
    "user_id": "uuid"
  }
}

// Nuevo pedido creado
{
  "event": "NUEVO_PEDIDO",
  "data": {
    "order_id": "uuid",
    "user_id": "uuid",
    "total": 15000.00,
    "item_count": 3,
    "created_at": "2026-05-22T10:30:00Z"
  }
}
```

## Frontend Architecture

### Hook `useOrderWS(orderId)`

```
Ubicación: frontend/src/features/orders/hooks/useOrderWS.ts

// Recibe el orderId y gestiona:
// - Conexión WS a /api/v1/pedidos/{orderId}/events
// - Reconexión exponencial (1s → 2s → ... → 30s)
// - Al recibir ORDER_STATUS_CHANGED → refetch() del detalle
// - Cleanup al desmontar
```

### Hook `useAdminOrdersWS(onNewOrder)`

```
Ubicación: frontend/src/features/admin/orders/hooks/useAdminOrdersWS.ts

// Gestiona:
// - Conexión WS a /api/v1/admin/pedidos/events
// - Reconexión exponencial + polling fallback 30s
// - Al recibir ORDER_STATUS_CHANGED → refetch() de la lista de pedidos
// - Al recibir NUEVO_PEDIDO → callback onNewOrder() + refetch()
// - Si se ve una order detail específica → refetchDetail()
// - Cleanup al desmontar
```

### Componente `NewOrderAlert`

```
Ubicación: frontend/src/features/admin/components/NewOrderAlert.tsx

// Props:
// - isOpen: boolean
// - orderId: string
// - onClose: () => void
// - onViewOrder: (orderId: string) => void

// Muestra:
// - Toast con ícono de campana + "¡Nuevo pedido!"
// - Detalle breve: total, cantidad de items
// - Botón "Ver pedido" → navega al detalle
// - Auto-close a los 8 segundos
```

## Data Flow

```
    Cliente                          Admin                       KDS
      │                               │                          │
      │ WS /pedidos/{id}/events       │ WS /admin/pedidos/events │ WS /cocina/events
      │                               │                          │
      └───────┐                       └──────┐                   └──────┐
              │                              │                          │
         OrderSubscriptionManager       AdminEventManager         WebSocketManager
              │                              │                          │
              └──────────┬───────────────────┴──────────────────────────┘
                         │
                  OrderService
                   update_status()
                   create_order()
```

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| **Multi-instancia**: WebSocketManager es in-process | Aceptado. Si se escala horizontalmente, migrar a Redis Pub/Sub como paso separado. El KDS tiene la misma limitación. |
| **Cliente con muchas órdenes abiertas**: una WS por order_id podría abusar de conexiones | El cliente solo ve el detalle de una orden a la vez. Una conexión por página. |
| **Admin recibe eventos mientras está en otra sección**: la conexión WS del admin se mantiene abierta aunque esté en Dashboard | El hook se desconecta al desmontar el componente. Si está en Dashboard, no hay hook de orders montado. |
| **Eventos duplicados**: KDS y admin podrían recibir eventos similares | Son managers diferentes con eventos diferentes. No hay duplicación. |
| **Notificación intrusiva**: alerta de nuevo pedido cada 30 segundos si llegan muchos | La alerta dura 8s y no se acumula (solo una a la vez, encolando la siguiente). |
