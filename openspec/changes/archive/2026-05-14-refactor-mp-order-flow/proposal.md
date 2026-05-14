## Why

El flujo actual de Mercado Pago difiere de los otros métodos de pago: en lugar de crear el Order + Payment inmediatamente, los difiere usando una tabla intermedia (`checkout_sessions`) y los crea recién cuando MP redirige de vuelta (`mp-return`) o cuando llega el webhook. Este enfoque tiene dos problemas graves:

1. **La orden "desaparece" si algo falla**: Si `mp-return` falla (stock cambió entre validaciones, error de SDK, etc.) o si el webhook no procesa correctamente la notificación, el Order NUNCA se crea en `pedidos`. El usuario ve "pago exitoso" en MP pero no encuentra su pedido.
2. **Inconsistencia con otros métodos**: `efectivo` y `transferencia` crean el Order + Payment en el momento de la confirmación. MP es el único que no lo hace, lo que agrega complejidad innecesaria (dos caminos paralelos para crear la orden, race conditions, lógica de idempotencia).

La solución es **unificar el comportamiento**: crear el Order + Payment inmediatamente en `mp-init` (como hacen los otros métodos), y luego solo **actualizar el status** cuando MP confirme el pago.

## What Changes

- **Refactor `mp-init`**: Modificar `POST /api/v1/checkout/mp-init` para que cree el Order + Payment en `pedidos`/`pagos` inmediatamente, igual que `efectivo`/`transferencia`, en lugar de solo crear un `CheckoutSession`
- **Nuevo status `pending_mp`**: Agregar `pending_mp` a `OrderStatus` para indicar que el pago está pendiente de confirmación de MP
- **Simplificar `mp-return`**: El endpoint ya no crea Order + Payment — solo actualiza el status del Order existente y del Payment según el resultado de MP
- **Simplificar webhook**: El webhook ya no necesita `_create_payment_from_session()` — solo busca el Payment por `mp_payment_id` y actualiza su status
- **Cambiar `external_reference`**: Pasar de usar `session_id` a usar `order.id` como `external_reference` en la preferencia de MP
- **Deprecar `CheckoutSession`**: La tabla `checkout_sessions` ya no es necesaria como intermediario (se puede eliminar en una migración futura)
- **Simplificar frontend**: La `CheckoutPage` puede unificar el flujo de MP con el de efectivo/transferencia, eliminando la bifurcación temprana

## Capabilities

### New Capabilities
- *(ninguna — este cambio modifica el flujo existente)*

### Modified Capabilities
- `mp-checkout-flow`: El flujo de checkout con Mercado Pago cambia de "deferred order creation" a "immediate order creation con status update". Esto afecta los requisitos de `mp-init`, `mp-return` y webhook.
- `order-status-lifecycle`: Se agrega el status `pending_mp` al ciclo de vida de órdenes.
- `payment-processing`: El webhook ya no crea órdenes — solo actualiza payments existentes.

## Impact

### Backend
- `backend/modules/checkout/service.py` — Refactor completo: `init_mp_session` crea Order + Payment; `handle_mp_return` solo actualiza status
- `backend/modules/checkout/router.py` — Ajustar endpoints según nuevo service
- `backend/modules/checkout/model.py` — Deprecar `CheckoutSession` (mantener por ahora, eliminar en futuro)
- `backend/modules/pedidos/service.py` — `OrderService` puede requerir un método para crear orden con status `pending_mp`
- `backend/modules/pagos/service.py` — Ajustar `_advance_order_to_confirmed` para el nuevo flujo
- `backend/modules/pagos/mercadopago/mp_service.py` — Simplificar `handle_webhook`: eliminar `_create_payment_from_session`
- `backend/modules/pagos/mercadopago/mp_service.py` — Simplificar `create_preference_from_session` (ahora recibe order_id)
- `backend/core/enums.py` — Agregar `pending_mp` a `OrderStatus`
- `backend/db/migrations/` — Migración para nuevo status enum

### Frontend
- `frontend/src/pages/CheckoutPage.tsx` — Unificar flujo MP con el de efectivo/transferencia
- `frontend/src/shared/constants/orderStatus.ts` — Agregar `pending_mp` a labels y estilos

### Dependencies
- Ninguna nueva. Se elimina la dependencia del flujo de `CheckoutSession` como intermediario.

### Data
- Las órdenes existentes con status `pendiente` creadas por el flujo anterior no se modifican
- Las `checkout_sessions` existentes pueden quedar como huérfanas (se limpian en migración futura)
