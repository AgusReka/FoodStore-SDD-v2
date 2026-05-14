# Tasks: refactor-mp-order-flow

## ⚠️ IMPORTANT: Load these domain skills before implementing

Before writing any code in these areas, load the relevant skill:
- Backend (FastAPI/Python): `/skill fastapi-python`
- Base de datos (PostgreSQL/Alembic): `/skill postgresql-database-engineering`
- JWT / seguridad: `/skill jwt-security`
- React / TypeScript: `/skill react-dev`
- Manejo de estado Zustand: `/skill zustand-state-management`

---

## 1. Backend — New OrderStatus enum + State machine

- [x] 1.1 Add `PENDING_MP = "pending_mp"` to `OrderStatus` enum in `backend/core/enums.py`
- [x] 1.2 Add transitions from `PENDING_MP` to `CONFIRMADO` (with `DEDUCT_STOCK`) and `CANCELADO` (with `NONE`) in `backend/modules/pedidos/state_machine.py`
- [x] 1.3 Create Alembic migration to alter the `pedidos.estado` enum to include `pending_mp`

## 2. Backend — Refactor mp-init to create Order + Payment

- [x] 2.1 Update `backend/modules/checkout/schemas.py`: `MpInitResponse` solo necesita `init_point` (sin `session_id`)
- [x] 2.2 Update `backend/modules/checkout/service.py`:
  - `init_mp_session()` ahora crea Order (status `pending_mp`) + Payment (status `pendiente`, method `mercadopago`) antes de crear la preferencia MP
  - Usa `order.id` como `external_reference` en la preferencia
  - Almacena `mp_preference_id` y `mp_init_point` en el Payment
  - Envuelve la creación de Order + Payment + preferencia en una transacción (rollback si falla preferencia)
- [x] 2.3 Update `backend/modules/checkout/router.py`: el endpoint `mp-init` ya no devuelve `session_id`
- [x] 2.4 Update `MercadoPagoService.create_preference_from_session()` para aceptar `order_id` como `external_reference` en vez de `session_id`

## 3. Backend — Refactor mp-return a solo update de status

- [x] 3.1 Update `backend/modules/checkout/router.py`: `mp-return` cambia de `/{status}/{session_id}` a `/{status}/{order_id}` en el path
- [x] 3.2 Refactor `handle_mp_return()` en `service.py`:
  - Recibe `order_id` (no session_id)
  - Busca Order por ID
  - Si status=success: llama a `process_status_update(payment_id, APROBADO)` → Order → CONFIRMADO + stock
  - Si status=failure: marca Order CANCELADO, Payment RECHAZADO
  - Si status=pending: no-op, redirect a order detail
  - Idempotente: si ya está CONFIRMADO/CANCELADO, solo redirect

## 4. Backend — Simplificar webhook de MP

- [x] 4.1 Simplificar `handle_webhook()` en `mp_service.py`:
  - Eliminar `_create_payment_from_session()` (ya no se necesita)
  - Buscar Payment por `mp_payment_id`
  - Si no existe → ignorar (webhook llegó antes que mp-init, o es otra notificación)
  - Si existe → `process_status_update(payment_id, new_status)`
- [x] 4.2 Actualizar `handle_webhook()` para no depender de `external_reference`

## 5. Backend — Ajustar OrderService y PagoService

- [x] 5.1 Asegurar que `OrderService.create_order()` acepte un parámetro opcional `status` para crear orden con `pending_mp`
- [x] 5.2 Verificar que `PagoService._advance_order_to_confirmed()` funcione correctamente desde `pending_mp`

## 6. Frontend — Unificar flujo MP en CheckoutPage

- [x] 6.1 Update `frontend/src/pages/CheckoutPage.tsx`:
  - Eliminar la bifurcación temprana para MP (el `if (paymentMethod === 'mercadopago')` con return temprano)
  - MP ahora crea Order + Payment igual que efectivo/transferencia
  - Después de crear Order+Payment, redirigir a MP via `window.location.href = init_point`
  - El endpoint `mp-init` ahora devuelve solo `{ init_point }`
- [x] 6.2 Update `frontend/src/shared/constants/orderStatus.ts` para incluir `pending_mp`

## 7. Tests

- [x] 7.1 Unit tests: `OrderStateMachine` con transiciones desde `PENDING_MP`
- [x] 7.2 Unit tests: `CheckoutService.init_mp_session` — verifica que crea Order + Payment
- [x] 7.3 Unit tests: `CheckoutService.handle_mp_return` — success/failure/pending actualizan status correctamente
- [x] 7.4 Integration test: mp-init crea order → mp-return success → order CONFIRMADO + stock deducido
- [x] 7.5 Integration test: mp-init crea order → mp-return failure → order CANCELADO
