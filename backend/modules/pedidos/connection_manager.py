"""WebSocket connection managers for real-time order updates.

Extends the KDS WebSocketManager pattern to two new channels:
1. OrderSubscriptionManager — per-order subscriptions for customers
2. AdminEventManager — broadcast to all admin connections

Límite conocido: En un deploy multi-instancia, las conexiones WebSocket
estarían distribuidas entre instancias. Para escalar, reemplazar con
Redis Pub/Sub + un bus externo.
"""
import json
import logging
from collections import defaultdict
from datetime import datetime, timezone

from fastapi import WebSocket

from backend.modules.cocina.connection_manager import WebSocketManager

logger = logging.getLogger(__name__)


class OrderSubscriptionManager:
    """Manages WebSocket subscriptions per order_id.

    Customers connect to a specific order and receive events
    only for that order (e.g. status changes).
    """

    def __init__(self):
        self._subscriptions: dict[str, set[WebSocket]] = defaultdict(set)

    async def subscribe(self, order_id: str, websocket: WebSocket) -> None:
        """Subscribe a WebSocket connection to an order's events."""
        self._subscriptions[order_id].add(websocket)
        logger.info(
            "WS subscribed to order %s. Total subscribers: %d",
            order_id, len(self._subscriptions[order_id]),
        )

    async def unsubscribe(self, order_id: str, websocket: WebSocket) -> None:
        """Remove a WebSocket from an order's subscription set."""
        ws_set = self._subscriptions.get(order_id)
        if ws_set:
            ws_set.discard(websocket)
            if not ws_set:
                del self._subscriptions[order_id]

    async def broadcast_to_order(self, order_id: str, event_type: str, data: dict) -> None:
        """Send a JSON event to all WebSockets subscribed to a specific order.

        Best-effort: disconnected clients are silently removed.
        """
        payload = {
            "event": event_type,
            "data": data,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }
        message = json.dumps(payload, default=str)

        ws_set = self._subscriptions.get(order_id)
        if not ws_set:
            return

        dead: list[WebSocket] = []
        for ws in ws_set:
            try:
                await ws.send_text(message)
            except Exception:
                dead.append(ws)

        if dead:
            for ws in dead:
                ws_set.discard(ws)
            if not ws_set:
                del self._subscriptions[order_id]

    async def disconnect(self, websocket: WebSocket) -> None:
        """Remove a WebSocket from ALL order subscriptions."""
        dead_orders = []
        for order_id, ws_set in self._subscriptions.items():
            ws_set.discard(websocket)
            if not ws_set:
                dead_orders.append(order_id)
        for order_id in dead_orders:
            del self._subscriptions[order_id]

    @property
    def active_subscriptions(self) -> int:
        """Total number of active subscriptions across all orders."""
        return sum(len(ws_set) for ws_set in self._subscriptions.values())


# Singleton instances shared across the application
order_subscription_manager = OrderSubscriptionManager()
admin_manager = WebSocketManager()
