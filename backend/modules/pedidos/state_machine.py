"""Pure state machine for Order status transitions. No DB dependency."""
from dataclasses import dataclass, field
from enum import Enum

from backend.core.enums import OrderStatus, UserRole


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

    # Each transition: (to_status, side_effects, allowed_roles)
    # - allowed_roles: set of UserRole that can execute this transition
    # - None means any role is allowed (system/internal)
    TRANSITIONS = {
        OrderStatus.PENDIENTE: [
            (OrderStatus.CONFIRMADO, [SideEffect.DEDUCT_STOCK], None),
            (OrderStatus.CANCELADO, [SideEffect.NONE], {UserRole.CLIENTE, UserRole.PEDIDOS, UserRole.ADMIN}),
        ],
        OrderStatus.PENDING_MP: [
            (OrderStatus.CONFIRMADO, [SideEffect.DEDUCT_STOCK], None),
            (OrderStatus.CANCELADO, [SideEffect.NONE], {UserRole.CLIENTE, UserRole.PEDIDOS, UserRole.ADMIN}),
        ],
        OrderStatus.CONFIRMADO: [
            (OrderStatus.PREPARANDO, [SideEffect.NONE], {UserRole.COCINA, UserRole.PEDIDOS, UserRole.ADMIN}),
            (OrderStatus.CANCELADO, [SideEffect.RESTORE_STOCK], {UserRole.PEDIDOS, UserRole.ADMIN}),
        ],
        OrderStatus.PREPARANDO: [
            (OrderStatus.ENVIADO, [SideEffect.NONE], {UserRole.COCINA, UserRole.PEDIDOS, UserRole.ADMIN}),
        ],
        OrderStatus.ENVIADO: [
            (OrderStatus.ENTREGADO, [SideEffect.NONE], {UserRole.PEDIDOS, UserRole.ADMIN}),
        ],
    }

    TERMINAL_STATUSES = {OrderStatus.ENTREGADO, OrderStatus.CANCELADO}

    def transition(
        self,
        from_status: OrderStatus,
        to_status: OrderStatus,
        actor_role: UserRole | None = None,
    ) -> TransitionResult:
        """Validate a status transition.

        Args:
            from_status: Current order status.
            to_status: Desired new status.
            actor_role: Role of the user performing the transition.
                        Pass None for system-triggered transitions (payment auto-confirm).

        Returns:
            TransitionResult with allowed=True/False and any side effects.
        """
        if from_status in self.TERMINAL_STATUSES:
            return TransitionResult(
                False,
                f"Cannot transition from terminal status '{from_status.value}'",
            )

        transitions = self.TRANSITIONS.get(from_status, [])
        for target, effects, allowed_roles in transitions:
            if target == to_status:
                # Check role authorization
                if allowed_roles is not None and actor_role is not None:
                    if actor_role not in allowed_roles:
                        allowed_names = [r.value for r in allowed_roles]
                        return TransitionResult(
                            False,
                            f"Role '{actor_role.value}' is not authorized for "
                            f"transition '{from_status.value}' → '{to_status.value}'. "
                            f"Requires one of: {allowed_names}",
                        )
                return TransitionResult(True, side_effects=effects)

        return TransitionResult(
            False,
            f"Invalid transition from '{from_status.value}' to '{to_status.value}'",
        )

    def get_valid_transitions(
        self, from_status: OrderStatus, actor_role: UserRole | None = None
    ) -> list[OrderStatus]:
        """Return list of valid target statuses for a given status and role."""
        if from_status in self.TERMINAL_STATUSES:
            return []
        result = []
        for target, _, allowed_roles in self.TRANSITIONS.get(from_status, []):
            if allowed_roles is None or actor_role is None or actor_role in allowed_roles:
                result.append(target)
        return result
