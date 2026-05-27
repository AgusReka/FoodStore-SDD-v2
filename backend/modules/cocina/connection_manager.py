"""In-process WebSocket connection manager for single-instance deployments.

Holds a set of active WebSocket connections and broadcasts
JSON events to all connected kitchen display clients.

Límite conocido: En un deploy multi-instancia, las conexiones WebSocket
estarían distribuidas entre instancias. Para escalar, reemplazar con
Redis Pub/Sub + un bus externo.
"""
import json
import logging
from datetime import datetime, timezone

from fastapi import WebSocket

logger = logging.getLogger(__name__)


class WebSocketManager:
    """Manages active WebSocket connections and broadcasts events."""

    def __init__(self):
        self._connections: set[WebSocket] = set()

    async def connect(self, websocket: WebSocket) -> None:
        """Register a new WebSocket connection."""
        self._connections.add(websocket)
        logger.info("WS client connected. Total: %d", len(self._connections))

    async def disconnect(self, websocket: WebSocket) -> None:
        """Remove a disconnected WebSocket client."""
        self._connections.discard(websocket)
        logger.info("WS client disconnected. Total: %d", len(self._connections))

    async def broadcast(self, event_type: str, data: dict) -> None:
        """Send a JSON event to all connected clients.

        Best-effort: if a client disconnected, the event is silently
        dropped and the client is removed from the set.
        """
        payload = {
            "event": event_type,
            "data": data,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }
        message = json.dumps(payload, default=str)
        dead: list[WebSocket] = []
        for ws in self._connections:
            try:
                await ws.send_text(message)
            except Exception:
                dead.append(ws)
        for ws in dead:
            self._connections.discard(ws)

    @property
    def active_count(self) -> int:
        """Number of currently connected WebSocket clients."""
        return len(self._connections)


# Singleton instance shared across the application
connection_manager = WebSocketManager()
