# Proposal: Migrate KDS from SSE to WebSocket

## Why

The project requires WebSocket usage. Migrating the Kitchen Display System (KDS) from SSE to WebSocket fulfills this requirement while maintaining all real-time functionality.

## What Changes

1. **Backend**: Replace SSE `ConnectionManager` (Queue-based) with `WebSocketManager` (WebSocket-based)
2. **Backend**: Change `/cocina/events` from `GET` (SSE StreamingResponse) to `ws://` (WebSocket endpoint)
3. **Frontend**: Replace `EventSource` with `WebSocket` + manual reconnection logic
4. **Tests**: Update all connection manager tests for WebSocket

## What stays the same

- REST endpoints (`GET /pedidos`, `PATCH /pedidos/{id}/estado`, `/health`)
- Event types (`PEDIDO_CONFIRMADO`, `PEDIDO_EN_PREPARACION`, etc.)
- Event publishing in `OrderService._publish_kitchen_event()`
- Polling fallback in frontend (30s interval)
- All existing functionality
