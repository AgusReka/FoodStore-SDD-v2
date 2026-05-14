## Context

Actualmente el flujo de Mercado Pago usa una tabla intermedia (`checkout_sessions`) para diferir la creación de la Order y el Payment hasta que MP confirma el pago. Esto fue introducido en el change `fix-mp-checkout-redirect` para evitar órdenes huérfanas cuando el usuario abandona MP.

**Problema**: Este enfoque tiene 2 caminos paralelos para crear la orden (`mp-return` y webhook), y si ambos fallan — por stock cambiado entre validaciones, error del SDK de MP al obtener `external_reference`, o timings — la orden **nunca se guarda en `pedidos`**. El usuario ve "pago exitoso" en MP pero no encuentra su pedido.

**Contraste**: Los métodos `efectivo` y `transferencia` crean la Order + Payment **inmediatamente** en el momento de la confirmación. MP es el único que no lo hace.

## Goals / Non-Goals

**Goals:**
- Unificar el comportamiento de MP con `efectivo`/`transferencia`: crear Order + Payment inmediatamente en `mp-init`
- Simplificar `mp-return` y webhook: ya no crean órdenes, solo actualizan status
- Eliminar la dependencia de `CheckoutSession` como intermediario para la creación de órdenes
- Asegurar que la orden SIEMPRE exista en `pedidos`, incluso si la confirmación de MP falla
- Mantener el `external_reference` de MP apuntando a un recurso existente (`order.id`)

**Non-Goals:**
- No cambiar el comportamiento de `efectivo`/`transferencia` (siguen igual)
- No eliminar `checkout_sessions` todavía (deprecar, no borrar)
- No cambiar el webhook de MP en su estructura — solo simplificar su lógica
- No modificar el frontend de admin ni el panel de órdenes

## Decisions

### Decision 1: Crear Order + Payment inmediatamente en mp-init

**Chosen: Unificar con efectivo/transferencia**

El endpoint `POST /api/v1/checkout/mp-init` ahora:
1. Valida existencia y stock de productos
2. Crea Order en `pedidos` con status `pending_mp`
3. Crea Payment en `pagos` con status `pendiente` y method `mercadopago`
4. Crea preferencia MP con `external_reference = order.id`
5. Almacena `mp_preference_id` y `mp_init_point` en el Payment
6. Retorna `{ init_point }` al frontend

**Ventajas:**
- La orden EXISTE desde el momento de la confirmación — no puede "desaparecer"
- Comportamiento consistente con efectivo/transferencia
- El `external_reference` apunta a un recurso real (order.id), no a una sesión temporal
- Si MP falla, la orden queda con status `pending_mp` y se puede gestionar

**Desventaja**: Órdenes huérfanas si el usuario abandona MP. Mitigación: job de limpieza o botón "Pagar ahora".

### Decision 2: Nuevo status `pending_mp` en OrderStatus

**Chosen: Agregar `pending_mp` al enum**

El nuevo status indica "pendiente de confirmación de Mercado Pago". Se diferencia de `pendiente` (usado para efectivo/transferencia — espera confirmación del admin).

**Transiciones desde `pending_mp`:**
- `pending_mp` → `confirmado` (MP aprobó, side_effect: `deduct_stock`)
- `pending_mp` → `cancelado` (MP rechazó o usuario abandonó, side_effect: none)

**Estado inicial:** Las órdenes nuevas de MP se crean con `pending_mp`.

### Decision 3: Simplificar mp-return a solo actualización de status

**Chosen: mp-return ya no crea órdenes**

`GET /api/v1/checkout/mp-return/{status}/{order_id}` ahora:
1. Recibe el redirect de MP con `status` (success/failure/pending) y `order_id` (path param)
2. Busca Order por `order_id`
3. Si `status = success`:
   - Encuentra Payment asociado
   - Llama a `process_status_update(payment_id, APROBADO)` → Order → CONFIRMADO + stock deducted
   - Redirige a frontend `/orders/{order_id}?new=true`
4. Si `status = failure`:
   - Marca Order como CANCELADO, Payment como RECHAZADO
   - Redirige a frontend `/cart?mp-error=true`
5. Si `status = pending`:
   - No hace nada (el webhook se encargará)
   - Redirige a frontend `/orders/{order_id}?new=true`

**Idempotencia garantizada**: Si el webhook ya procesó el pago, `process_status_update` encuentra el Payment ya en APROBADO y es no-op.

### Decision 4: Simplificar webhook

**Chosen: Webhook solo actualiza status — eliminar `_create_payment_from_session`**

`handle_webhook()` ahora:
1. Busca Payment por `mp_payment_id`
2. Si no existe → `return {"status": "ignored", "reason": "payment not found"}`
3. Si existe → `process_status_update(payment_id, new_status)` según estado de MP

Ya no necesita el `external_reference` ni la lógica de `_create_payment_from_session`. El Payment siempre existe porque fue creado en `mp-init`.

### Decision 5: Usar `order.id` como `external_reference`

**Chosen: `external_reference = str(order.id)`**

En la preferencia de MP, `external_reference` pasa de ser `session_id` a `order.id`. Esto:
- Permite que `mp-return` use el `order_id` directamente en la URL path (`/mp-return/success/{order_id}`)
- Permite que cualquier notificación de MP pueda identificar la orden
- No depende de una tabla temporal

### Decision 6: Deprecar CheckoutSession (mantener, no eliminar)

**Chosen: Mantener tabla `checkout_sessions` pero no usarla para el flujo principal**

La tabla queda como registro histórico. Las sesiones existentes seguirán siendo válidas hasta su expiración. En un cambio futuro se puede eliminar.

## Architecture

### Nuevo flujo mp-init

```
POST /api/v1/checkout/mp-init
  Request: { items: [{product_id, quantity}], direccion_id, observaciones? }
  Response: { init_point: string }
  Auth: Required (JWT)

  1. Valida productos existen
  2. Valida stock para todos los items
  3. Calcula total desde precios en DB
  4. Crea Order(pending_mp) en pedidos ← NUEVO
  5. Crea Payment(pendiente, mercadopago) en pagos ← NUEVO
  6. Crea preferencia MP con external_reference = order.id
  7. Almacena mp_preference_id + mp_init_point en Payment
  8. Retorna init_point
```

### Nuevo flujo mp-return

```
GET /api/v1/checkout/mp-return/{status}/{order_id}
  Query: payment_id (de MP)
  Auth: Public

  IF status == "success":
    1. Busca Order por order_id
    2. Busca Payment por order_id
    3. process_status_update(payment_id, APROBADO) → Order → CONFIRMADO
    4. Redirect → /orders/{order_id}?new=true

  IF status == "failure":
    1. Busca Order por order_id
    2. Marca Order como CANCELADO
    3. Marca Payment como RECHAZADO
    4. Redirect → /cart?mp-error=true

  IF status == "pending":
    1. Redirect → /orders/{order_id}?new=true (esperar webhook)
```

### Estado de la state machine actualizada

```
┌─────────────┐
│  pendiente  │ (efectivo/transferencia)
└──────┬──────┘
       │
       ├──→ confirmado  [deduct_stock]
       └──→ cancelado   [none]

┌──────────────┐
│  pending_mp  │ (NUEVO — mercadopago)
└──────┬───────┘
       │
       ├──→ confirmado  [deduct_stock]  ← MP aprobó
       └──→ cancelado   [none]          ← MP rechazó

(resto de transiciones igual)
```

### Backend Module Changes

| File | Change |
|------|--------|
| `backend/core/enums.py` | Agregar `PENDING_MP = "pending_mp"` a OrderStatus |
| `backend/modules/pedidos/state_machine.py` | Agregar transiciones desde `PENDING_MP` |
| `backend/modules/checkout/service.py` | Refactor `init_mp_session`: crear Order+Payment; `handle_mp_return`: solo update status |
| `backend/modules/checkout/router.py` | `mp-return` usa `{order_id}` en path en vez de `{session_id}` |
| `backend/modules/checkout/schemas.py` | `MpInitResponse` simplificado (solo `init_point`) |
| `backend/modules/checkout/repository.py` | Deprecar (ya no necesario para flujo principal) |
| `backend/modules/pagos/mercadopago/mp_service.py` | Simplificar `handle_webhook` (eliminar `_create_payment_from_session`); `create_preference_from_session` recibe `order_id` |
| `backend/modules/pedidos/service.py` | Asegurar que `create_order` acepte status override |
| `backend/db/migrations/` | Migración para alterar el enum `OrderStatus` |

### Frontend Changes

| File | Change |
|------|--------|
| `frontend/src/pages/CheckoutPage.tsx` | Unificar flujo MP con el de efectivo/transferencia — siempre crear Order+Payment, después redirigir a MP |
| `frontend/src/shared/constants/orderStatus.ts` | Agregar `pending_mp` |

### Removed Endpoints / Lógica

- `GET /api/v1/checkout/mp-return/success|failure|pending/{session_id}` → cambia a `/{status}/{order_id}`
- `CheckoutSessionRepository` se depreca (no se elimina)
- `MercadoPagoService._create_payment_from_session()` se elimina

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| Órdenes `pending_mp` huérfanas si usuario abandona MP | Igual que `pendiente` con efectivo. Se puede agregar job de cleanup o botón "Pagar ahora". |
| Stock se valida 2 veces (mp-init y confirmación) | La validación en mp-init asegura disponibilidad al crear la orden. La de confirmación (deduct_stock) es atómica con FOR UPDATE. |
| Race condition: mp-return llega antes que webhook | Ambos caminos son idempotentes. `process_status_update` maneja duplicados. |
| Payment ya existe cuando llega webhook (creado por mp-init) | Webhook busca por `mp_payment_id` → lo encuentra → solo actualiza status. Es el fix del bug actual. |
| Rollback: si preferencia MP falla, Order+Payment ya se crearon | Se debe eliminar la Order+Payment o marcarlos como fallidos. Alternativa: crear Order+Payment DENTRO de la misma transacción que la creación de preferencia, y revertir si falla. |
