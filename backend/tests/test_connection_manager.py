"""Tests for the WebSocketManager used by the Kitchen Display System."""

import pytest

from backend.modules.cocina.connection_manager import WebSocketManager


class MockWebSocket:
    """A fake WebSocket that records sent messages and can simulate errors."""

    def __init__(self, name: str = "mock"):
        self.name = name
        self.sent_messages: list[str] = []
        self.closed = False
        self._send_fail = False

    def fail_next_send(self):
        """Make the next send_text call raise an exception."""
        self._send_fail = True

    async def send_text(self, message: str) -> None:
        if self._send_fail:
            self._send_fail = False
            raise RuntimeError("simulated send failure")
        self.sent_messages.append(message)

    async def receive_text(self) -> str:
        return ""


@pytest.fixture
def manager() -> WebSocketManager:
    """Return a fresh WebSocketManager for each test."""
    return WebSocketManager()


@pytest.mark.asyncio
class TestConnect:
    """connect() registers a WebSocket."""

    async def test_connect_adds_websocket(self, manager: WebSocketManager):
        ws = MockWebSocket()
        await manager.connect(ws)
        assert manager.active_count == 1

    async def test_connect_multiple_clients_increase_count(self, manager: WebSocketManager):
        ws1 = MockWebSocket()
        ws2 = MockWebSocket()
        await manager.connect(ws1)
        await manager.connect(ws2)
        assert manager.active_count == 2


@pytest.mark.asyncio
class TestDisconnect:
    """disconnect() removes a WebSocket."""

    async def test_disconnect_removes_websocket(self, manager: WebSocketManager):
        ws = MockWebSocket()
        await manager.connect(ws)
        assert manager.active_count == 1
        await manager.disconnect(ws)
        assert manager.active_count == 0

    async def test_disconnect_unknown_websocket_does_nothing(self, manager: WebSocketManager):
        ws = MockWebSocket()
        await manager.disconnect(ws)
        assert manager.active_count == 0

    async def test_disconnect_idempotent(self, manager: WebSocketManager):
        ws = MockWebSocket()
        await manager.connect(ws)
        await manager.disconnect(ws)
        await manager.disconnect(ws)
        assert manager.active_count == 0

    async def test_reconnect_after_disconnect(self, manager: WebSocketManager):
        ws1 = MockWebSocket("a")
        await manager.connect(ws1)
        await manager.disconnect(ws1)
        ws2 = MockWebSocket("b")
        await manager.connect(ws2)
        assert manager.active_count == 1
        assert ws1 not in manager._connections
        assert ws2 in manager._connections


@pytest.mark.asyncio
class TestBroadcast:
    """broadcast() sends JSON events to all connected websockets."""

    async def test_broadcast_sends_to_all_connected(self, manager: WebSocketManager):
        ws1 = MockWebSocket("a")
        ws2 = MockWebSocket("b")
        await manager.connect(ws1)
        await manager.connect(ws2)

        await manager.broadcast("order_update", {"order_id": "abc"})

        assert len(ws1.sent_messages) == 1
        assert len(ws2.sent_messages) == 1
        assert ws1.sent_messages[0] == ws2.sent_messages[0]
        assert "order_update" in ws1.sent_messages[0]
        assert "abc" in ws1.sent_messages[0]

    async def test_broadcast_handles_disconnected_gracefully(self, manager: WebSocketManager):
        ws1 = MockWebSocket("a")
        ws2 = MockWebSocket("b")
        await manager.connect(ws1)
        await manager.connect(ws2)
        await manager.disconnect(ws2)

        await manager.broadcast("test", {"x": 1})

        assert len(ws1.sent_messages) == 1
        # ws2 was disconnected, so it should not have received the message
        assert len(ws2.sent_messages) == 0

    async def test_broadcast_with_no_connections_does_not_raise(self, manager: WebSocketManager):
        await manager.broadcast("test", {"x": 1})

    async def test_broadcast_removes_broken_connection(self, manager: WebSocketManager):
        """A websocket that fails on send is removed from the set."""
        ws = MockWebSocket("broken")
        await manager.connect(ws)
        ws.fail_next_send()

        await manager.broadcast("test", {"x": 1})

        assert ws not in manager._connections
        assert manager.active_count == 0


@pytest.mark.asyncio
class TestActiveCount:
    """active_count reflects current connections."""

    async def test_active_count_starts_at_zero(self, manager: WebSocketManager):
        assert manager.active_count == 0

    async def test_active_count_increases_on_connect(self, manager: WebSocketManager):
        ws = MockWebSocket()
        await manager.connect(ws)
        assert manager.active_count == 1

    async def test_active_count_decreases_on_disconnect(self, manager: WebSocketManager):
        ws = MockWebSocket()
        await manager.connect(ws)
        await manager.disconnect(ws)
        assert manager.active_count == 0

    async def test_active_count_counts_multiple(self, manager: WebSocketManager):
        ws1 = MockWebSocket("a")
        ws2 = MockWebSocket("b")
        ws3 = MockWebSocket("c")
        await manager.connect(ws1)
        await manager.connect(ws2)
        await manager.connect(ws3)
        assert manager.active_count == 3
        await manager.disconnect(ws2)
        assert manager.active_count == 2
