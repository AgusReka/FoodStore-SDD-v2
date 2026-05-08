"""Payment service."""
from uuid import UUID

from backend.core.enums import OrderStatus, PaymentMethod, PaymentStatus
from backend.core.exceptions import ConflictError, NotFoundError
from backend.core.service import BaseService
from backend.modules.pagos.model import Payment
from backend.modules.pagos.repository import PagoRepository
from backend.modules.pedidos.repository import PedidoRepository


class PagoService(BaseService[Payment]):
    def __init__(self, pago_repo: PagoRepository, pedido_repo: PedidoRepository):
        super().__init__(pago_repo)
        self.pedido_repo = pedido_repo

    async def create_payment(self, order_id: UUID, metodo: PaymentMethod, monto: float) -> Payment:
        order = await self.pedido_repo.get(order_id)
        if not order:
            raise NotFoundError(f"Order {order_id} not found")

        existing = await self.repository.get_by_order(order_id)
        if existing:
            raise ConflictError(f"Order {order_id} already has a payment")

        return await self.repository.create(
            order_id=order_id,
            payment_method=metodo,
            amount=monto,
        )

    async def update_status(self, payment_id: UUID, new_status: PaymentStatus) -> Payment:
        payment = await self.repository.get(payment_id)
        if not payment:
            raise NotFoundError(f"Payment {payment_id} not found")

        updated = await self.repository.update(payment_id, status=new_status)

        if new_status == PaymentStatus.APROBADO:
            await self.pedido_repo.update(payment.order_id, status=OrderStatus.CONFIRMADO)

        return updated
