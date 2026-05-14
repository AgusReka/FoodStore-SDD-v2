## Context

The `mercadopago-integration` change implemented the full MP backend (SDK integration, preference creation, webhook handling) and frontend checkout flow. However, the flow suffers from a fundamental ordering problem: **it creates Order + Payment before redirecting to MP**. This means:

1. If MP preference creation fails → orphan Order + Payment remain in the DB
2. If the user abandons payment on MP's site → Order stays in `pendiente` forever
3. If MP returns with an error → Order already exists and must be handled as an error case

The existing `back_urls` point to the frontend (`/mp/return`), which means the frontend is responsible for handling the MP return. But the frontend can't create orders — only the backend can. This forces the "create first" approach.

**Solution**: Move the `back_urls` to point to new **backend** endpoints, introduce a temporary `CheckoutSession` to hold cart data, and defer Order + Payment creation until MP confirms the payment.

## Goals / Non-Goals

**Goals:**
- Eliminate orphan orders by deferring Order+Payment creation until MP confirms payment
- Introduce `CheckoutSession` model with 30-minute TTL for temporary cart storage
- New `POST /api/v1/checkout/mp-init` endpoint that validates stock and creates session + MP preference
- New `GET /api/v1/checkout/mp-return` endpoint that handles MP redirect and creates Order+Payment on success
- Update `back_urls` to point to backend (not frontend)
- Simplify CheckoutPage to send cart data + redirect to MP
- Clean up old `create-preference` endpoint and frontend helpers

**Non-Goals:**
- No changes to non-MP payment methods (efectivo, transferencia)
- No changes to webhook processing (still works)
- No changes to PaymentStatus component (still works for existing orders)
- No changes to order history, admin dashboard, or other features

## Decisions

### Decision 1: Backend-handled return URLs

**Chosen: Backend endpoints for MP return**

The `back_urls.success/failure/pending` will point to the backend (e.g., `http://localhost:8000/api/v1/checkout/mp-return`) instead of the frontend. This allows the backend to:

1. Receive the MP redirect with payment status
2. Look up the CheckoutSession by `external_reference` 
3. Create Order + Payment atomically if the payment was approved
4. Redirect the browser to the frontend order detail page

This is the standard approach for Checkout Pro: the return URL is a server endpoint that can take action based on the payment result.

**Alternative considered**: Keeping frontend return URLs and adding a "confirm" API call from PaymentReturnPage. Rejected because it adds a round-trip and the user sees a flash of the return page before being redirected again.

### Decision 2: CheckoutSession model with DB persistence

**Chosen: Database-backed sessions with TTL**

A `checkout_sessions` table stores:
- User ID, items (JSON), address, observations, total
- MP preference ID
- Status (pending | completed | expired)
- Created/expires timestamps

Sessions expire after 30 minutes (via `expires_at`). An Alembic migration creates the table.

**Alternative considered**: In-memory cache (Redis). Rejected because we don't have Redis in the stack and DB persistence is reliable enough for temporary sessions.

### Decision 3: Atomic order+payment creation on MP return

**Chosen: Backend handler creates both in a transaction**

When `mp-return` receives a successful MP redirect:
1. Find CheckoutSession by `external_reference`
2. Validate session is still `pending` and not expired
3. In a DB transaction: create Order items → create Order → create Payment → update CheckoutSession to `completed`
4. Redirect to frontend `/orders/:id?new=true`

If any step fails, the transaction rolls back and no partial state persists.

### Decision 4: Reuse existing order/payment creation logic

The existing `PedidoService.create()` and `PagoService.create()` methods already handle order and payment creation correctly. The new `mp-return` handler will call these same services, ensuring consistency.

## Architecture

### New Model: CheckoutSession

```
checkout_sessions
├── id              UUID PK
├── user_id         UUID FK → usuarios
├── items           JSONB    [{"product_id", "quantity", "unit_price", "subtotal"}, ...]
├── direccion_id    UUID FK → direcciones
├── observaciones   TEXT NULL
├── total           DECIMAL(10,2)
├── status          TEXT     "pending" | "completed" | "expired"
├── mp_preference_id TEXT NULL
├── created_at      TIMESTAMP
└── expires_at      TIMESTAMP (created_at + 30 min)
```

### New Endpoints

```
POST /api/v1/checkout/mp-init
  Request:  { items: [{product_id, quantity}], direccion_id, observaciones? }
  Response: { init_point: string, session_id: UUID }
  Auth:     Required (JWT)
  Process:
    1. Look up products from DB to get current prices
    2. Validate stock for all items
    3. Calculate total
    4. Create CheckoutSession (status=pending)
    5. Create MP preference with external_reference = session_id
       back_urls.success = /api/v1/checkout/mp-return?status=success
       back_urls.failure = /api/v1/checkout/mp-return?status=failure
       back_urls.pending = /api/v1/checkout/mp-return?status=pending
    6. Store mp_preference_id on session
    7. Return init_point

GET /api/v1/checkout/mp-return
  Query:   status, payment_id, external_reference, ... (MP adds these)
  Auth:    Public (validated via external_reference)
  Success:
    1. Find CheckoutSession by external_reference
    2. Validate session is pending and not expired
    3. Create Order from session items (via PedidoService)
    4. Create Payment from order + session total (via PagoService)
    5. Store mp_preference_id and mp_payment_id on payment
    6. Mark session as completed
    7. Redirect to FRONTEND_URL/orders/:order_id?new=true

  Failure:
    1. Find CheckoutSession by external_reference
    2. Mark session as expired
    3. Redirect to FRONTEND_URL/cart?mp-error=true
```

### Removed Endpoints

- `POST /api/v1/pagos/mercadopago/create-preference` — replaced by `POST /checkout/mp-init`

### Flow Diagram

```
CheckoutPage (NEW flow)
  ┌─────────────────────────────────────────────────┐
  │ 1. User clicks "Pagar con Mercado Pago"         │
  │ 2. POST /api/v1/checkout/mp-init               │
  │    → Backend: valida stock, crea sesión,        │
  │      crea pref MP, devuelve init_point          │
  │ 3. window.location.href = init_point            │
  └─────────────────────────────────────────────────┘
                         │
                         ▼
              Mercado Pago Checkout Pro
                         │
                ┌────────┴────────┐
                ▼                 ▼
           Pago aprueba      Pago falla/abandona
                │                 │
                ▼                 ▼
   GET /mp-return?success   GET /mp-return?failure
                │                 │
     ┌──────────┴──────────┐      │
     ▼                     ▼      ▼
  Crea Order+Payment   Marca     Marca sesión
  en transacción       sesión    como expired
  Marca sesión         completed
  como completed              │
     │                        ▼
     ▼               Redirect a /cart
  Redirect a           ?mp-error=true
  /orders/:id?new=true
```

### CheckoutSession Status Lifecycle

```
pending ──→ completed  (MP returned success, Order+Payment created)
pending ──→ expired    (MP returned failure, or 30min TTL)
```

### Backend Module Structure

```
backend/modules/checkout/          (NEW — checkout session management)
├── __init__.py
├── model.py          → CheckoutSession SQLModel
├── repository.py     → CRUD for sessions
├── service.py        → mp-init + mp-return logic
├── router.py         → /api/v1/checkout/* endpoints
└── schemas.py        → Pydantic request/response models
```

## Changes Summary

| File | Change |
|------|--------|
| `backend/modules/checkout/` — **NEW** | Full module: model, repository, service, router, schemas |
| `backend/main.py` | Add `checkout` router import |
| `backend/modules/pagos/mercadopago/mp_router.py` | Remove `create-preference` endpoint |
| `backend/modules/pagos/mercadopago/mp_service.py` | Update `create_preference` to accept custom `back_urls` (for checkout sessions) |
| `backend/db/migrations/` — **NEW** | Alembic migration for `checkout_sessions` table |
| `frontend/src/pages/CheckoutPage.tsx` | Simplified: call `/checkout/mp-init` instead of order→payment→preference |
| `frontend/src/pages/PaymentReturnPage.tsx` | Simplified: backend now handles return, this page may still show "Pago aprobado/failure" briefly before redirect |
| `frontend/src/features/payments/createMpPreference.ts` | **DELETE** — replaced by new flow |
| `frontend/src/shared/api/endpoints.ts` | Add `/checkout/mp-init` endpoint constant |

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| User's cart data lost if session expires before MP returns | Session has 30min TTL; MP checkout is typically <5min. Show clear error if user returns to expired session. |
| Race condition: MP redirects back before webhook arrives | Both paths (webhook + return) are idempotent — if Order already exists, return just redirects to it. |
| Stock changes between session creation and order creation | Validate stock again when creating Order at mp-return time. If stock changed, fail with error. |
| User closes browser during MP redirect | Session expires in 30min. No orphan data left. |
| MP sends duplicate return callbacks | Use idempotency key on session: once session is `completed`, subsequent calls redirect without creating duplicate orders. |
