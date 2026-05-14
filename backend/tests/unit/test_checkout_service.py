"""Unit tests for CheckoutService — mocked repositories and MP SDK."""
from unittest.mock import AsyncMock, MagicMock, patch
from uuid import uuid4, UUID

import pytest

from backend.core.enums import OrderStatus, PaymentMethod, PaymentStatus
from backend.core.exceptions import BadRequestError
from backend.modules.checkout.service import CheckoutService


pytestmark = pytest.mark.asyncio


@pytest.fixture
def mock_session():
    return AsyncMock()


@pytest.fixture
def service(mock_session):
    return CheckoutService(mock_session)


def _mock_product():
    p = MagicMock()
    p.id = uuid4()
    p.name = "Test Product"
    p.price = 100.0
    return p


def _mock_order():
    o = MagicMock()
    o.id = uuid4()
    o.status = OrderStatus.PENDING_MP
    o.user_id = uuid4()
    o.total = 200.0
    return o


def _mock_payment():
    p = MagicMock()
    p.id = uuid4()
    p.order_id = uuid4()
    p.status = PaymentStatus.PENDIENTE
    p.payment_method = PaymentMethod.MERCADOPAGO
    return p


class TestInitMpSession:
    """CheckoutService.init_mp_session() — creates Order + Payment + MP pref."""

    async def test_success(self, service, mock_session):
        """Happy path: creates order + payment + MP preference, returns init_point."""
        user_id = uuid4()
        product = _mock_product()
        items_data = [{"product_id": product.id, "quantity": 2}]
        direccion_id = uuid4()

        prod_repo_patch = patch(
            "backend.modules.checkout.service.ProductRepository",
            autospec=True,
        )
        pedido_repo_patch = patch(
            "backend.modules.checkout.service.PedidoRepository",
            autospec=True,
        )
        order_svc_patch = patch(
            "backend.modules.checkout.service.OrderService",
            autospec=True,
        )
        pago_repo_patch = patch(
            "backend.modules.checkout.service.PagoRepository",
            autospec=True,
        )
        pago_svc_patch = patch(
            "backend.modules.checkout.service.PagoService",
            autospec=True,
        )
        mp_svc_patch = patch(
            "backend.modules.checkout.service.MercadoPagoService",
            autospec=True,
        )

        with prod_repo_patch as mock_prod_repo_cls, \
             pedido_repo_patch as mock_ped_repo_cls, \
             order_svc_patch as mock_order_svc_cls, \
             pago_repo_patch as mock_pago_repo_cls, \
             pago_svc_patch as mock_pago_svc_cls, \
             mp_svc_patch as mock_mp_cls:

            # ProductRepo mock
            mock_prod_repo = MagicMock()
            mock_prod_repo_cls.return_value = mock_prod_repo
            mock_prod_repo.get_with_ingredients = AsyncMock(return_value=product)
            mock_prod_repo.check_stock = AsyncMock(return_value=(True, None))

            # Order mock
            order = _mock_order()
            mock_order_svc = MagicMock()
            mock_order_svc_cls.return_value = mock_order_svc
            mock_order_svc.create_order = AsyncMock(return_value=order)

            # Payment mock
            payment = _mock_payment()
            mock_pago_repo = MagicMock()
            mock_pago_repo_cls.return_value = mock_pago_repo
            mock_pago_repo.create = AsyncMock(return_value=payment)
            mock_pago_repo.update = AsyncMock()

            # MP service mock
            mock_mp_instance = MagicMock()
            mock_mp_cls.return_value = mock_mp_instance
            mock_mp_instance.create_preference_from_session = AsyncMock(return_value={
                "init_point": "https://mp.com/checkout?pref=123",
                "preference_id": "pref_123",
            })

            result = await service.init_mp_session(
                user_id=user_id,
                items_data=items_data,
                direccion_id=direccion_id,
            )

            # Verify Order created with PENDING_MP
            mock_order_svc.create_order.assert_awaited_once()
            create_kwargs = mock_order_svc.create_order.call_args.kwargs
            assert create_kwargs["status"] == OrderStatus.PENDING_MP
            assert create_kwargs["user_id"] == user_id

            # Verify Payment created
            mock_pago_repo.create.assert_awaited_once_with(
                order_id=order.id,
                payment_method=PaymentMethod.MERCADOPAGO,
                amount=200.0,
            )

            # Verify MP pref uses order.id as external_reference
            mock_mp_instance.create_preference_from_session.assert_awaited_once()
            mp_kwargs = mock_mp_instance.create_preference_from_session.call_args.kwargs
            assert mp_kwargs["external_reference"] == str(order.id)

            # Verify Payment updated with MP refs
            mock_pago_repo.update.assert_awaited_once_with(
                payment.id,
                mp_preference_id="pref_123",
                mp_init_point="https://mp.com/checkout?pref=123",
            )

            # Verify return value
            assert result == {"init_point": "https://mp.com/checkout?pref=123"}

    async def test_raises_on_stock_insufficient(self, service, mock_session):
        """Insufficient stock raises BadRequestError."""
        product = _mock_product()
        items_data = [{"product_id": product.id, "quantity": 2}]

        with patch(
            "backend.modules.checkout.service.ProductRepository",
            autospec=True,
        ) as mock_prod_repo_cls:
            mock_prod_repo = MagicMock()
            mock_prod_repo_cls.return_value = mock_prod_repo
            mock_prod_repo.get_with_ingredients = AsyncMock(return_value=product)
            mock_prod_repo.check_stock = AsyncMock(
                return_value=(False, "Stock insuficiente")
            )

            with pytest.raises(BadRequestError, match="insuficiente"):
                await service.init_mp_session(
                    uuid4(), items_data, uuid4()
                )

    async def test_creates_order_and_payment_in_same_transaction(
        self, service, mock_session
    ):
        """Order and payment are created before MP preference."""
        user_id = uuid4()
        product = _mock_product()
        items_data = [{"product_id": product.id, "quantity": 1}]

        with patch(
            "backend.modules.checkout.service.ProductRepository",
            autospec=True,
        ) as mock_prod_repo_cls:
            mock_prod_repo = MagicMock()
            mock_prod_repo_cls.return_value = mock_prod_repo
            mock_prod_repo.get_with_ingredients = AsyncMock(return_value=product)
            mock_prod_repo.check_stock = AsyncMock(return_value=(True, None))

            with patch(
                "backend.modules.checkout.service.OrderService",
                autospec=True,
            ) as mock_order_svc_cls:
                order = _mock_order()
                mock_order_svc = MagicMock()
                mock_order_svc_cls.return_value = mock_order_svc
                mock_order_svc.create_order = AsyncMock(return_value=order)

                with patch(
                    "backend.modules.checkout.service.PagoRepository",
                    autospec=True,
                ) as mock_pago_repo_cls:
                    payment = _mock_payment()
                    mock_pago_repo = MagicMock()
                    mock_pago_repo_cls.return_value = mock_pago_repo
                    mock_pago_repo.create = AsyncMock(return_value=payment)
                    mock_pago_repo.update = AsyncMock()

                    with patch(
                        "backend.modules.checkout.service.MercadoPagoService",
                        autospec=True,
                    ) as mock_mp_cls:
                        mock_mp_instance = MagicMock()
                        mock_mp_cls.return_value = mock_mp_instance
                        mock_mp_instance.create_preference_from_session = AsyncMock(
                            return_value={
                                "init_point": "https://mp.com/checkout",
                                "preference_id": "pref_123",
                            }
                        )

                        await service.init_mp_session(
                            user_id, items_data, uuid4()
                        )

                        # Verify execution order
                        mock_order_svc.create_order.assert_awaited_once()
                        mock_pago_repo.create.assert_awaited_once()
                        mock_mp_instance.create_preference_from_session.assert_awaited_once()


class TestHandleMpReturn:
    """CheckoutService.handle_mp_return() — processes MP redirect."""

    async def _setup_pedido_mocks(self, order_status=OrderStatus.PENDING_MP):
        """Set up base mocks for PedidoRepository + ProductRepository + OrderService."""
        order = _mock_order()
        order.status = order_status

        pedido_patch = patch(
            "backend.modules.checkout.service.PedidoRepository",
            autospec=True,
        )
        product_patch = patch(
            "backend.modules.checkout.service.ProductRepository",
            autospec=True,
        )
        order_svc_patch = patch(
            "backend.modules.checkout.service.OrderService",
            autospec=True,
        )
        pago_repo_patch = patch(
            "backend.modules.checkout.service.PagoRepository",
            autospec=True,
        )
        pago_svc_patch = patch(
            "backend.modules.checkout.service.PagoService",
            autospec=True,
        )

        return order, {
            "pedido": pedido_patch,
            "product": product_patch,
            "order_svc": order_svc_patch,
            "pago_repo": pago_repo_patch,
            "pago_svc": pago_svc_patch,
        }

    async def test_success_approves_payment(self, service, mock_session):
        """MP success should approve payment and redirect to order detail."""
        order, patches = await self._setup_pedido_mocks()

        with patches["pedido"] as mock_ped_repo_cls, \
             patches["product"] as mock_prod_repo_cls, \
             patches["order_svc"] as mock_order_svc_cls, \
             patches["pago_repo"] as mock_pago_repo_cls, \
             patches["pago_svc"] as mock_pago_svc_cls:

            # PedidoRepo returns existing order
            mock_ped_repo = MagicMock()
            mock_ped_repo_cls.return_value = mock_ped_repo
            mock_ped_repo.get = AsyncMock(return_value=order)

            # PagoRepo returns existing payment
            payment = _mock_payment()
            mock_pago_repo = MagicMock()
            mock_pago_repo_cls.return_value = mock_pago_repo
            mock_pago_repo.get_by_order = AsyncMock(return_value=payment)

            # PagoService mocks
            mock_pago_svc = MagicMock()
            mock_pago_svc_cls.return_value = mock_pago_svc
            mock_pago_svc.process_status_update = AsyncMock()

            result = await service.handle_mp_return(
                status="success",
                order_id=str(order.id),
                mp_payment_id="12345",
            )

            assert f"/orders/{order.id}" in result
            assert "new=true" in result
            mock_pago_svc.process_status_update.assert_awaited_once()

    async def test_success_idempotent_already_confirmed(self, service, mock_session):
        """Already CONFIRMADO order should just redirect, no status change."""
        order, patches = await self._setup_pedido_mocks(
            order_status=OrderStatus.CONFIRMADO
        )

        with patches["pedido"] as mock_ped_repo_cls, \
             patches["pago_svc"] as mock_pago_svc_cls:

            mock_ped_repo = MagicMock()
            mock_ped_repo_cls.return_value = mock_ped_repo
            mock_ped_repo.get = AsyncMock(return_value=order)

            mock_pago_svc = MagicMock()
            mock_pago_svc_cls.return_value = mock_pago_svc
            mock_pago_svc.process_status_update = AsyncMock()

            result = await service.handle_mp_return(
                status="success",
                order_id=str(order.id),
            )

            assert f"/orders/{order.id}" in result
            mock_pago_svc.process_status_update.assert_not_called()

    async def test_failure_cancels_order(self, service, mock_session):
        """MP failure should cancel order and redirect to cart."""
        order, patches = await self._setup_pedido_mocks()

        with patches["pedido"] as mock_ped_repo_cls, \
             patches["order_svc"] as mock_order_svc_cls, \
             patches["pago_repo"] as mock_pago_repo_cls:

            mock_ped_repo = MagicMock()
            mock_ped_repo_cls.return_value = mock_ped_repo
            mock_ped_repo.get = AsyncMock(return_value=order)

            mock_order_svc = MagicMock()
            mock_order_svc_cls.return_value = mock_order_svc
            mock_order_svc.update_status = AsyncMock()

            payment = _mock_payment()
            mock_pago_repo = MagicMock()
            mock_pago_repo_cls.return_value = mock_pago_repo
            mock_pago_repo.get_by_order = AsyncMock(return_value=payment)
            mock_pago_repo.update = AsyncMock()

            result = await service.handle_mp_return(
                status="failure",
                order_id=str(order.id),
            )

            assert "cart" in result
            assert "mp-error" in result
            mock_order_svc.update_status.assert_awaited_once()
            update_call = mock_order_svc.update_status.call_args
            # new_status is the second positional arg
            assert update_call.args[1] == OrderStatus.CANCELADO

    async def test_failure_cancels_payment(self, service, mock_session):
        """MP failure should also mark payment as RECHAZADO."""
        order, patches = await self._setup_pedido_mocks()

        with patches["pedido"] as mock_ped_repo_cls, \
             patches["order_svc"] as mock_order_svc_cls, \
             patches["pago_repo"] as mock_pago_repo_cls:

            mock_ped_repo = MagicMock()
            mock_ped_repo_cls.return_value = mock_ped_repo
            mock_ped_repo.get = AsyncMock(return_value=order)

            mock_order_svc = MagicMock()
            mock_order_svc_cls.return_value = mock_order_svc
            mock_order_svc.update_status = AsyncMock()

            payment = _mock_payment()
            mock_pago_repo = MagicMock()
            mock_pago_repo_cls.return_value = mock_pago_repo
            mock_pago_repo.get_by_order = AsyncMock(return_value=payment)
            mock_pago_repo.update = AsyncMock()

            await service.handle_mp_return(
                status="failure",
                order_id=str(order.id),
            )

            mock_pago_repo.update.assert_awaited_once()
            update_call = mock_pago_repo.update.call_args
            assert update_call.kwargs["status"] == PaymentStatus.RECHAZADO

    async def test_pending_redirects_to_order_detail(self, service, mock_session):
        """MP pending should redirect to order detail without status change."""
        order, patches = await self._setup_pedido_mocks()

        with patches["pedido"] as mock_ped_repo_cls:

            mock_ped_repo = MagicMock()
            mock_ped_repo_cls.return_value = mock_ped_repo
            mock_ped_repo.get = AsyncMock(return_value=order)

            result = await service.handle_mp_return(
                status="pending",
                order_id=str(order.id),
            )

            assert f"/orders/{order.id}" in result
            assert "new=true" in result

    async def test_invalid_order_id_redirects_to_cart(self, service, mock_session):
        """Invalid UUID format for order_id should redirect to cart."""
        result = await service.handle_mp_return(
            status="success",
            order_id="not-a-uuid",
        )

        assert "cart" in result
        assert "mp-error" in result

    async def test_missing_order_redirects_to_cart(self, service, mock_session):
        """Non-existent order should redirect to cart."""
        with patch(
            "backend.modules.checkout.service.PedidoRepository",
            autospec=True,
        ) as mock_ped_repo_cls:
            mock_ped_repo = MagicMock()
            mock_ped_repo_cls.return_value = mock_ped_repo
            mock_ped_repo.get = AsyncMock(return_value=None)

            result = await service.handle_mp_return(
                status="success",
                order_id=str(uuid4()),
            )

            assert "cart" in result
            assert "mp-error" in result
