## Why

El admin y los clientes no tienen actualización en tiempo real de los pedidos. Para ver cambios de estado (confirmado → preparando → enviado → entregado) o nuevos pedidos, tienen que recargar la página manualmente. El detalle del pedido del cliente tiene un polling temporal solo para MP; el admin no tiene ninguna notificación cuando llega un pedido nuevo. Esto genera fricción en la experiencia de uso y retrasos operativos.

## What Changes

- Crear un **WebSocket por order_id** para la vista de detalle del cliente: `WS /api/v1/pedidos/{order_id}/events?token=...`
- Crear un **WebSocket general para el admin**: `WS /api/v1/admin/pedidos/events?token=...`
- El admin recibe una **alerta visual y sonora** cuando llega un pedido nuevo
- Ambos WebSockets reciben eventos de cambio de estado en tiempo real
- Eliminar el polling manual en `OrderDetailPage.tsx` (reemplazado por WebSocket)

## Capabilities

### New Capabilities
- `order-realtime-events`: Capacidad de recibir eventos de pedidos en tiempo real vía WebSocket, tanto para clientes (por order_id) como para administradores (todos los pedidos)

### Modified Capabilities
- *(ninguna — no cambian requisitos de comportamiento, solo se agrega transporte en tiempo real)*

## Impact

- **Backend — Nuevo archivo**: `backend/modules/pedidos/connection_manager.py` con dos managers: `UserEventManager` (conexiones por order_id) y `AdminEventManager` (broadcast a todos los admins)
- **Backend — Router existente**: `backend/modules/pedidos/router.py` agrega dos endpoints WebSocket
- **Backend — Service existente**: `backend/modules/pedidos/service.py` agrega `_publish_order_event()` y `_publish_admin_event()`, llama a ambos desde `update_status()` y `create_order()`
- **Frontend — Nuevo hook**: `useOrderWS(orderId)` para detalle del cliente
- **Frontend — Nuevo hook**: `useAdminOrdersWS()` para admin
- **Frontend — Nuevo componente**: NewOrderAlert para admin
- **Frontend — Modificaciones**: `OrderDetailPage.tsx`, `AdminOrderDetailPage.tsx`, `AdminOrderListPage.tsx` se conectan a WebSocket
- **Sin breaking changes**: Los endpoints REST existentes no cambian; WebSocket es adicional
