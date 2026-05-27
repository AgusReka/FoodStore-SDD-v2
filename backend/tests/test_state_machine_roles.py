"""Tests for role-aware FSM transitions in OrderStateMachine.

COCINA, ADMIN, PEDIDOS, and CLIENTE roles have different allowed transitions.
"""
import pytest
from backend.core.enums import OrderStatus, UserRole
from backend.modules.pedidos.state_machine import OrderStateMachine


@pytest.fixture
def machine() -> OrderStateMachine:
    return OrderStateMachine()


class TestCocinaRole:
    """COCINA can: CONFIRMADO→PREPARANDO, PREPARANDO→ENVIADO.
    COCINA cannot: cancel from confirmado, mark as entregado."""

    def test_cocina_confirmado_to_preparando_allowed(self, machine: OrderStateMachine):
        result = machine.transition(
            OrderStatus.CONFIRMADO, OrderStatus.PREPARANDO, actor_role=UserRole.COCINA,
        )
        assert result.allowed is True
        assert result.error is None

    def test_cocina_preparando_to_enviado_allowed(self, machine: OrderStateMachine):
        result = machine.transition(
            OrderStatus.PREPARANDO, OrderStatus.ENVIADO, actor_role=UserRole.COCINA,
        )
        assert result.allowed is True
        assert result.error is None

    def test_cocina_cannot_cancel_from_confirmado(self, machine: OrderStateMachine):
        result = machine.transition(
            OrderStatus.CONFIRMADO, OrderStatus.CANCELADO, actor_role=UserRole.COCINA,
        )
        assert result.allowed is False
        assert "not authorized" in result.error.lower()

    def test_cocina_cannot_cancel_from_preparando(self, machine: OrderStateMachine):
        """PREPARANDO→CANCELADO is not a valid transition at all, regardless of role."""
        result = machine.transition(
            OrderStatus.PREPARANDO, OrderStatus.CANCELADO, actor_role=UserRole.COCINA,
        )
        assert result.allowed is False
        assert "Invalid transition" in result.error

    def test_cocina_cannot_mark_entregado(self, machine: OrderStateMachine):
        result = machine.transition(
            OrderStatus.ENVIADO, OrderStatus.ENTREGADO, actor_role=UserRole.COCINA,
        )
        assert result.allowed is False
        assert "not authorized" in result.error.lower()


class TestAdminRole:
    """ADMIN bypasses all role checks — can execute any defined transition."""

    def test_admin_confirmado_to_preparando_allowed(self, machine: OrderStateMachine):
        result = machine.transition(
            OrderStatus.CONFIRMADO, OrderStatus.PREPARANDO, actor_role=UserRole.ADMIN,
        )
        assert result.allowed is True

    def test_admin_confirmado_to_cancelado_allowed(self, machine: OrderStateMachine):
        result = machine.transition(
            OrderStatus.CONFIRMADO, OrderStatus.CANCELADO, actor_role=UserRole.ADMIN,
        )
        assert result.allowed is True

    def test_admin_preparando_to_enviado_allowed(self, machine: OrderStateMachine):
        result = machine.transition(
            OrderStatus.PREPARANDO, OrderStatus.ENVIADO, actor_role=UserRole.ADMIN,
        )
        assert result.allowed is True

    def test_admin_enviado_to_entregado_allowed(self, machine: OrderStateMachine):
        result = machine.transition(
            OrderStatus.ENVIADO, OrderStatus.ENTREGADO, actor_role=UserRole.ADMIN,
        )
        assert result.allowed is True

    def test_admin_pendiente_to_cancelado_allowed(self, machine: OrderStateMachine):
        result = machine.transition(
            OrderStatus.PENDIENTE, OrderStatus.CANCELADO, actor_role=UserRole.ADMIN,
        )
        assert result.allowed is True

    def test_admin_pending_mp_to_cancelado_allowed(self, machine: OrderStateMachine):
        result = machine.transition(
            OrderStatus.PENDING_MP, OrderStatus.CANCELADO, actor_role=UserRole.ADMIN,
        )
        assert result.allowed is True


class TestPedidosRole:
    """PEDIDOS role can do all kitchen-adjacent transitions."""

    def test_pedidos_confirmado_to_preparando_allowed(self, machine: OrderStateMachine):
        result = machine.transition(
            OrderStatus.CONFIRMADO, OrderStatus.PREPARANDO, actor_role=UserRole.PEDIDOS,
        )
        assert result.allowed is True

    def test_pedidos_preparando_to_enviado_allowed(self, machine: OrderStateMachine):
        result = machine.transition(
            OrderStatus.PREPARANDO, OrderStatus.ENVIADO, actor_role=UserRole.PEDIDOS,
        )
        assert result.allowed is True

    def test_pedidos_enviado_to_entregado_allowed(self, machine: OrderStateMachine):
        result = machine.transition(
            OrderStatus.ENVIADO, OrderStatus.ENTREGADO, actor_role=UserRole.PEDIDOS,
        )
        assert result.allowed is True

    def test_pedidos_confirmado_to_cancelado_allowed(self, machine: OrderStateMachine):
        result = machine.transition(
            OrderStatus.CONFIRMADO, OrderStatus.CANCELADO, actor_role=UserRole.PEDIDOS,
        )
        assert result.allowed is True

    def test_pedidos_pendiente_to_cancelado_allowed(self, machine: OrderStateMachine):
        result = machine.transition(
            OrderStatus.PENDIENTE, OrderStatus.CANCELADO, actor_role=UserRole.PEDIDOS,
        )
        assert result.allowed is True


class TestClienteRole:
    """CLIENTE cannot execute any kitchen transition."""

    def test_cliente_cannot_confirmado_to_preparando(self, machine: OrderStateMachine):
        result = machine.transition(
            OrderStatus.CONFIRMADO, OrderStatus.PREPARANDO, actor_role=UserRole.CLIENTE,
        )
        assert result.allowed is False
        assert "not authorized" in result.error.lower()

    def test_cliente_pendiente_to_cancelado_allowed(self, machine: OrderStateMachine):
        """CLIENTE can cancel their own PENDIENTE order."""
        result = machine.transition(
            OrderStatus.PENDIENTE, OrderStatus.CANCELADO, actor_role=UserRole.CLIENTE,
        )
        assert result.allowed is True


class TestSystemRole:
    """System (actor_role=None) can execute system/internal transitions."""

    def test_system_pendiente_to_confirmado_allowed(self, machine: OrderStateMachine):
        result = machine.transition(
            OrderStatus.PENDIENTE, OrderStatus.CONFIRMADO, actor_role=None,
        )
        assert result.allowed is True
        assert result.error is None

    def test_system_pending_mp_to_confirmado_allowed(self, machine: OrderStateMachine):
        result = machine.transition(
            OrderStatus.PENDING_MP, OrderStatus.CONFIRMADO, actor_role=None,
        )
        assert result.allowed is True
        assert result.error is None

    def test_system_pending_mp_to_cancelado_allowed(self, machine: OrderStateMachine):
        """System (actor_role=None) bypasses role checks — this transition is allowed."""
        result = machine.transition(
            OrderStatus.PENDING_MP, OrderStatus.CANCELADO, actor_role=None,
        )
        assert result.allowed is True
        assert result.error is None


class TestInvalidTransitionsWithRoles:
    """Invalid transitions fail regardless of role."""

    @pytest.mark.parametrize(
        "from_status,to_status",
        [
            (OrderStatus.PENDIENTE, OrderStatus.ENTREGADO),
            (OrderStatus.PENDIENTE, OrderStatus.ENVIADO),
            (OrderStatus.PENDIENTE, OrderStatus.PREPARANDO),
            (OrderStatus.CONFIRMADO, OrderStatus.ENTREGADO),
            (OrderStatus.CONFIRMADO, OrderStatus.ENVIADO),
            (OrderStatus.PREPARANDO, OrderStatus.CONFIRMADO),
            (OrderStatus.PREPARANDO, OrderStatus.ENTREGADO),
            (OrderStatus.ENVIADO, OrderStatus.CONFIRMADO),
            (OrderStatus.ENVIADO, OrderStatus.PREPARANDO),
            (OrderStatus.ENVIADO, OrderStatus.CANCELADO),
        ],
    )
    def test_invalid_transition_fails_with_admin(
        self, machine: OrderStateMachine, from_status: OrderStatus, to_status: OrderStatus,
    ):
        result = machine.transition(from_status, to_status, actor_role=UserRole.ADMIN)
        assert result.allowed is False
        assert "Invalid transition" in result.error


class TestTerminalWithRoles:
    """Terminal states reject all transitions regardless of role."""

    @pytest.mark.parametrize("role", list(UserRole))
    def test_entregado_rejects_all_with_any_role(
        self, machine: OrderStateMachine, role: UserRole,
    ):
        result = machine.transition(OrderStatus.ENTREGADO, OrderStatus.CONFIRMADO, actor_role=role)
        assert result.allowed is False
        assert "terminal" in result.error.lower()

    @pytest.mark.parametrize("role", list(UserRole))
    def test_cancelado_rejects_all_with_any_role(
        self, machine: OrderStateMachine, role: UserRole,
    ):
        result = machine.transition(OrderStatus.CANCELADO, OrderStatus.CONFIRMADO, actor_role=role)
        assert result.allowed is False
        assert "terminal" in result.error.lower()


class TestGetValidTransitionsWithRoles:
    """get_valid_transitions filters by role."""

    def test_confirmado_cocina_sees_only_preparando(self, machine: OrderStateMachine):
        transitions = machine.get_valid_transitions(
            OrderStatus.CONFIRMADO, actor_role=UserRole.COCINA,
        )
        assert transitions == [OrderStatus.PREPARANDO]

    def test_confirmado_admin_sees_both(self, machine: OrderStateMachine):
        transitions = machine.get_valid_transitions(
            OrderStatus.CONFIRMADO, actor_role=UserRole.ADMIN,
        )
        assert OrderStatus.PREPARANDO in transitions
        assert OrderStatus.CANCELADO in transitions
        assert len(transitions) == 2

    def test_confirmado_pedidos_sees_both(self, machine: OrderStateMachine):
        transitions = machine.get_valid_transitions(
            OrderStatus.CONFIRMADO, actor_role=UserRole.PEDIDOS,
        )
        assert OrderStatus.PREPARANDO in transitions
        assert OrderStatus.CANCELADO in transitions
        assert len(transitions) == 2

    def test_confirmado_cliente_sees_none(self, machine: OrderStateMachine):
        transitions = machine.get_valid_transitions(
            OrderStatus.CONFIRMADO, actor_role=UserRole.CLIENTE,
        )
        assert transitions == []

    def test_preparando_cocina_sees_enviado(self, machine: OrderStateMachine):
        transitions = machine.get_valid_transitions(
            OrderStatus.PREPARANDO, actor_role=UserRole.COCINA,
        )
        assert transitions == [OrderStatus.ENVIADO]

    def test_enviado_pedidos_sees_entregado(self, machine: OrderStateMachine):
        transitions = machine.get_valid_transitions(
            OrderStatus.ENVIADO, actor_role=UserRole.PEDIDOS,
        )
        assert transitions == [OrderStatus.ENTREGADO]

    def test_enviado_cocina_sees_none(self, machine: OrderStateMachine):
        transitions = machine.get_valid_transitions(
            OrderStatus.ENVIADO, actor_role=UserRole.COCINA,
        )
        assert transitions == []

    def test_no_role_returns_all_for_confirmado(self, machine: OrderStateMachine):
        transitions = machine.get_valid_transitions(OrderStatus.CONFIRMADO)
        assert OrderStatus.PREPARANDO in transitions
        assert OrderStatus.CANCELADO in transitions
        assert len(transitions) == 2

    def test_terminal_returns_empty_with_admin(self, machine: OrderStateMachine):
        assert machine.get_valid_transitions(
            OrderStatus.ENTREGADO, actor_role=UserRole.ADMIN,
        ) == []
        assert machine.get_valid_transitions(
            OrderStatus.CANCELADO, actor_role=UserRole.ADMIN,
        ) == []

    def test_pendiente_cocina_sees_confirmado_only(self, machine: OrderStateMachine):
        """PENDIENTE→CONFIRMADO has allowed_roles=None (any role), so COCINA sees it.
        PENDIENTE→CANCELADO requires {CLIENTE, PEDIDOS, ADMIN}, so COCINA does NOT see it."""
        transitions = machine.get_valid_transitions(
            OrderStatus.PENDIENTE, actor_role=UserRole.COCINA,
        )
        assert OrderStatus.CONFIRMADO in transitions
        assert OrderStatus.CANCELADO not in transitions
        assert len(transitions) == 1

    def test_pendiente_cliente_sees_both(self, machine: OrderStateMachine):
        """CLIENTE sees both PENDIENTE transitions because CONFIRMADO allows any role
        and CANCELADO explicitly includes CLIENTE."""
        transitions = machine.get_valid_transitions(
            OrderStatus.PENDIENTE, actor_role=UserRole.CLIENTE,
        )
        assert OrderStatus.CONFIRMADO in transitions
        assert OrderStatus.CANCELADO in transitions
        assert len(transitions) == 2
