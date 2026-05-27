## Tasks

- [x] 1.1 Rewrite `connection_manager.py`: Queue → WebSocketManager with connect/ disconnect/ broadcast using send_json
- [x] 1.2 Rewrite `/events` endpoint in `router.py`: SSE StreamingResponse → WebSocket with JWT validation from query param
- [x] 1.3 Frontend `useKDS.ts`: EventSource → WebSocket with exponential backoff reconnection + polling fallback
- [x] 1.4 Rewrite `test_connection_manager.py`: mock WebSocket instead of Queue tests
- [x] 1.5 Fix auto-confirm for non-MP orders in `PagoService.create_payment()`
- [x] 1.6 Run all tests and verify everything passes
