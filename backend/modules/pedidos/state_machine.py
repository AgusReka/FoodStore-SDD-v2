"""Pure state machine for Order status transitions. No DB dependency."""
from dataclasses import dataclass, field
from enum import Enum

from backend.core.enums import OrderStatus


class SideEffect(str, Enum):
    DEDUCT_STOCK = "deduct_stock"
    RESTORE_STOCK = "restore_stock"
    NONE = "none"


@dataclass
class TransitionResult:
    allowed: bool
    error: str | None = None
    side_effects: list[SideEffect] = field(default_factory=list)


class OrderStateMachine:
    """Pure state machine for Order status transitions. No DB dependency."""

    TRANSITIONS = {
        OrderStatus.PENDIENTE: [
            (OrderStatus.CONFIRMADO, [SideEffect.DEDUCT_STOCK]),
            (OrderStatus.CANCELADO, [SideEffect.NONE]),
        ],
        OrderStatus.CONFIRMADO: [
            (OrderStatus.PREPARANDO, [SideEffect.NONE]),
            (OrderStatus.CANCELADO, [SideEffect.RESTORE_STOCK]),
        ],
        OrderStatus.PREPARANDO: [
            (OrderStatus.ENVIADO, [SideEffect.NONE]),
        ],
        OrderStatus.ENVIADO: [
            (OrderStatus.ENTREGADO, [SideEffect.NONE]),
        ],
    }

    TERMINAL_STATUSES = {OrderStatus.ENTREGADO, OrderStatus.CANCELADO}

    def transition(
        self, from_status: OrderStatus, to_status: OrderStatus
    ) -> TransitionResult:
        if from_status in self.TERMINAL_STATUSES:
            return TransitionResult(
                False,
                f"Cannot transition from terminal status '{from_status.value}'",
            )
        transitions = self.TRANSITIONS.get(from_status, [])
        for target, effects in transitions:
            if target == to_status:
                return TransitionResult(True, side_effects=effects)
        return TransitionResult(
            False,
            f"Invalid transition from '{from_status.value}' to '{to_status.value}'",
        )

    def get_valid_transitions(
        self, from_status: OrderStatus
    ) -> list[OrderStatus]:
        if from_status in self.TERMINAL_STATUSES:
            return []
        return [target for target, _ in self.TRANSITIONS.get(from_status, [])]
