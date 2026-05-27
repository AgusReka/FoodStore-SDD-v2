# Design: SSE → WebSocket Migration

## Architecture

### WebSocketManager

```python
class WebSocketManager:
    _connections: set[WebSocket]
    _lock: asyncio.Lock
    
    async connect(websocket)
    async disconnect(websocket)
    async broadcast(event_type, data)  # send_json to all
    active_count: int  # property
```

Replaces `ConnectionManager` which used `asyncio.Queue` per client. Now stores raw `WebSocket` objects and calls `send_json()` directly.

### WebSocket Endpoint

```
ws://host/api/v1/cocina/events?token=<jwt>
```

- JWT validated from query param
- `websocket.accept()` after auth
- Incoming messages are ignored (KDS is read-only from client perspective)
- FastAPI handles `ping/pong` automatically
- On disconnect (`WebSocketDisconnect`), calls `manager.disconnect()`

### JWT Validation in WebSocket

FastAPI WebSocket endpoints don't support `Depends()` for auth the same way as HTTP. We extract the token from query params and validate manually using the existing JWT utilities.

### Frontend Reconnection

WebSocket doesn't auto-reconnect like `EventSource`. Implement:
- **Exponential backoff**: 1s → 2s → 4s → 8s → max 30s
- **Polling fallback**: 30s interval while disconnected
- **onopen**: Reset backoff, clear polling, fetch initial data
- **onclose**: Start polling, attempt reconnect
- **onerror**: Same as onclose

### Keepalive

FastAPI/Starlette handles WebSocket `ping/pong` frames automatically. No manual keepalive needed.

## File Changes

| File | Change |
|------|--------|
| `backend/modules/cocina/connection_manager.py` | Rewrite: Queue → WebSocket |
| `backend/modules/cocina/router.py` | SSE endpoint → WebSocket endpoint |
| `backend/tests/test_connection_manager.py` | Rewrite tests for WebSocket |
| `frontend/src/features/cocina/hooks/useKDS.ts` | EventSource → WebSocket + reconnection |

## Event Format

WebSocket messages are JSON (same as SSE data payload, minus the SSE framing):

```json
{
  "event": "PEDIDO_CONFIRMADO",
  "data": {
    "order_id": "uuid",
    "old_status": "PENDIENTE",
    "new_status": "CONFIRMADO"
  },
  "timestamp": "2026-05-21T12:00:00+00:00"
}
```

## Limitations

- Single-instance only (same as before). For multi-instance, replace with Redis Pub/Sub.
- WebSocket doesn't support EventSource-style named events; the `event` field is embedded in JSON.
