"""Unit tests for OrderStateMachine — pure logic, no DB required."""

import pytest
from backend.core.enums import OrderStatus
from backend.modules.pedidos.state_machine import (
    OrderStateMachine,
    SideEffect,
    TransitionResult,
)


@pytest.fixture
def machine() -> OrderStateMachine:
    return OrderStateMachine()


class TestValidTransitions:
    """Every valid transition should return allowed=True with correct side effects."""

    def test_pendiente_to_confirmado(self, machine: OrderStateMachine):
        result = machine.transition(OrderStatus.PENDIENTE, OrderStatus.CONFIRMADO)
        assert result.allowed is True
        assert result.error is None
        assert SideEffect.DEDUCT_STOCK in result.side_effects

    def test_pendiente_to_cancelado(self, machine: OrderStateMachine):
        result = machine.transition(OrderStatus.PENDIENTE, OrderStatus.CANCELADO)
        assert result.allowed is True
        assert result.error is None
        assert result.side_effects == [SideEffect.NONE]

    def test_pending_mp_to_confirmado(self, machine: OrderStateMachine):
        result = machine.transition(OrderStatus.PENDING_MP, OrderStatus.CONFIRMADO)
        assert result.allowed is True
        assert result.error is None
        assert SideEffect.DEDUCT_STOCK in result.side_effects

    def test_pending_mp_to_cancelado(self, machine: OrderStateMachine):
        result = machine.transition(OrderStatus.PENDING_MP, OrderStatus.CANCELADO)
        assert result.allowed is True
        assert result.error is None
        assert result.side_effects == [SideEffect.NONE]

    def test_confirmado_to_preparando(self, machine: OrderStateMachine):
        result = machine.transition(OrderStatus.CONFIRMADO, OrderStatus.PREPARANDO)
        assert result.allowed is True
        assert result.error is None

    def test_confirmado_to_cancelado(self, machine: OrderStateMachine):
        result = machine.transition(OrderStatus.CONFIRMADO, OrderStatus.CANCELADO)
        assert result.allowed is True
        assert SideEffect.RESTORE_STOCK in result.side_effects

    def test_preparando_to_enviado(self, machine: OrderStateMachine):
        result = machine.transition(OrderStatus.PREPARANDO, OrderStatus.ENVIADO)
        assert result.allowed is True
        assert result.error is None

    def test_enviado_to_entregado(self, machine: OrderStateMachine):
        result = machine.transition(OrderStatus.ENVIADO, OrderStatus.ENTREGADO)
        assert result.allowed is True
        assert result.error is None


class TestInvalidTransitions:
    """Invalid transitions should return allowed=False with an error message."""

    @pytest.mark.parametrize(
        "from_status,to_status",
        [
            (OrderStatus.PENDIENTE, OrderStatus.ENVIADO),
            (OrderStatus.PENDIENTE, OrderStatus.ENTREGADO),
            (OrderStatus.PENDIENTE, OrderStatus.PREPARANDO),
            (OrderStatus.PENDING_MP, OrderStatus.ENVIADO),
            (OrderStatus.PENDING_MP, OrderStatus.ENTREGADO),
            (OrderStatus.PENDING_MP, OrderStatus.PREPARANDO),
            (OrderStatus.PENDING_MP, OrderStatus.PENDIENTE),
            (OrderStatus.CONFIRMADO, OrderStatus.ENTREGADO),
            (OrderStatus.CONFIRMADO, OrderStatus.ENVIADO),
            (OrderStatus.PREPARANDO, OrderStatus.CONFIRMADO),
            (OrderStatus.PREPARANDO, OrderStatus.CANCELADO),
            (OrderStatus.PREPARANDO, OrderStatus.ENTREGADO),
            (OrderStatus.ENVIADO, OrderStatus.CONFIRMADO),
            (OrderStatus.ENVIADO, OrderStatus.CANCELADO),
            (OrderStatus.ENVIADO, OrderStatus.PREPARANDO),
        ],
    )
    def test_invalid_transition(
        self, machine: OrderStateMachine, from_status: OrderStatus, to_status: OrderStatus
    ):
        result = machine.transition(from_status, to_status)
        assert result.allowed is False
        assert result.error is not None
        assert "Invalid transition" in result.error


class TestTerminalStatuses:
    """Terminal statuses (entregado, cancelado) cannot transition anywhere."""

    @pytest.mark.parametrize("terminal", [OrderStatus.ENTREGADO, OrderStatus.CANCELADO])
    @pytest.mark.parametrize(
        "target",
        [
            OrderStatus.PENDIENTE,
            OrderStatus.CONFIRMADO,
            OrderStatus.PREPARANDO,
            OrderStatus.ENVIADO,
            OrderStatus.ENTREGADO,
            OrderStatus.CANCELADO,
        ],
    )
    def test_no_transition_from_terminal(
        self, machine: OrderStateMachine, terminal: OrderStatus, target: OrderStatus
    ):
        """No status can transition FROM a terminal status (not even to itself)."""
        result = machine.transition(terminal, target)
        assert result.allowed is False
        assert "terminal" in result.error.lower()


class TestSideEffects:
    """SideEffects should be declared correctly per transition."""

    def test_deduct_stock_on_confirm(self, machine: OrderStateMachine):
        result = machine.transition(OrderStatus.PENDIENTE, OrderStatus.CONFIRMADO)
        assert SideEffect.DEDUCT_STOCK in result.side_effects
        assert SideEffect.RESTORE_STOCK not in result.side_effects

    def test_deduct_stock_on_pending_mp_confirm(self, machine: OrderStateMachine):
        result = machine.transition(OrderStatus.PENDING_MP, OrderStatus.CONFIRMADO)
        assert SideEffect.DEDUCT_STOCK in result.side_effects
        assert SideEffect.RESTORE_STOCK not in result.side_effects

    def test_no_stock_on_pending_mp_cancel(self, machine: OrderStateMachine):
        result = machine.transition(OrderStatus.PENDING_MP, OrderStatus.CANCELADO)
        assert result.side_effects == [SideEffect.NONE]

    def test_restore_stock_on_cancel_from_confirmado(self, machine: OrderStateMachine):
        result = machine.transition(OrderStatus.CONFIRMADO, OrderStatus.CANCELADO)
        assert SideEffect.RESTORE_STOCK in result.side_effects

    def test_no_stock_side_effect_on_cancel_from_pendiente(self, machine: OrderStateMachine):
        result = machine.transition(OrderStatus.PENDIENTE, OrderStatus.CANCELADO)
        assert result.side_effects == [SideEffect.NONE]

    def test_no_stock_side_effect_on_progress(self, machine: OrderStateMachine):
        """Transitions like confirmado→preparando, preparando→enviado, enviado→entregado
        should have no stock side effects."""
        progress_transitions = [
            (OrderStatus.CONFIRMADO, OrderStatus.PREPARANDO),
            (OrderStatus.PREPARANDO, OrderStatus.ENVIADO),
            (OrderStatus.ENVIADO, OrderStatus.ENTREGADO),
        ]
        for from_status, to_status in progress_transitions:
            result = machine.transition(from_status, to_status)
            assert result.side_effects == [SideEffect.NONE] or not any(
                e in (SideEffect.DEDUCT_STOCK, SideEffect.RESTORE_STOCK)
                for e in result.side_effects
            ), f"Unexpected stock effect for {from_status.value}→{to_status.value}"


class TestGetValidTransitions:
    """get_valid_transitions should return the correct next states."""

    def test_pendiente_transitions(self, machine: OrderStateMachine):
        transitions = machine.get_valid_transitions(OrderStatus.PENDIENTE)
        assert OrderStatus.CONFIRMADO in transitions
        assert OrderStatus.CANCELADO in transitions
        assert len(transitions) == 2

    def test_pending_mp_transitions(self, machine: OrderStateMachine):
        transitions = machine.get_valid_transitions(OrderStatus.PENDING_MP)
        assert OrderStatus.CONFIRMADO in transitions
        assert OrderStatus.CANCELADO in transitions
        assert len(transitions) == 2

    def test_confirmado_transitions(self, machine: OrderStateMachine):
        transitions = machine.get_valid_transitions(OrderStatus.CONFIRMADO)
        assert OrderStatus.PREPARANDO in transitions
        assert OrderStatus.CANCELADO in transitions
        assert len(transitions) == 2

    def test_preparando_transitions(self, machine: OrderStateMachine):
        transitions = machine.get_valid_transitions(OrderStatus.PREPARANDO)
        assert transitions == [OrderStatus.ENVIADO]

    def test_enviado_transitions(self, machine: OrderStateMachine):
        transitions = machine.get_valid_transitions(OrderStatus.ENVIADO)
        assert transitions == [OrderStatus.ENTREGADO]

    def test_entregado_has_no_transitions(self, machine: OrderStateMachine):
        transitions = machine.get_valid_transitions(OrderStatus.ENTREGADO)
        assert transitions == []

    def test_cancelado_has_no_transitions(self, machine: OrderStateMachine):
        transitions = machine.get_valid_transitions(OrderStatus.CANCELADO)
        assert transitions == []


class TestTransitionResultDataclass:
    """TransitionResult should behave as a proper dataclass."""

    def test_default_error_is_none(self):
        result = TransitionResult(allowed=True)
        assert result.error is None
        assert result.allowed is True
        assert result.side_effects == []

    def test_default_side_effects_empty(self):
        result = TransitionResult(allowed=False, error="some error")
        assert result.error == "some error"
        assert result.side_effects == []

    def test_with_side_effects(self):
        result = TransitionResult(
            allowed=True, side_effects=[SideEffect.DEDUCT_STOCK, SideEffect.RESTORE_STOCK]
        )
        assert len(result.side_effects) == 2


class TestIdempotency:
    """The state machine should be stateless and idempotent."""

    def test_same_transition_multiple_times(self, machine: OrderStateMachine):
        """Calling the same transition multiple times should return the same result."""
        for _ in range(10):
            result = machine.transition(OrderStatus.PENDIENTE, OrderStatus.CONFIRMADO)
            assert result.allowed is True

    def test_multiple_instances_same_result(self):
        """Different instances of the state machine should return identical results."""
        m1 = OrderStateMachine()
        m2 = OrderStateMachine()
        assert m1.transition(OrderStatus.PENDIENTE, OrderStatus.CONFIRMADO) == m2.transition(
            OrderStatus.PENDIENTE, OrderStatus.CONFIRMADO
        )
