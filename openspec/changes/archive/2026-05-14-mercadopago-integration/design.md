## Context

Food Store already has a `pagos` module with basic CRUD: create payment, update status, get by ID. The `Payment` model includes `mp_payment_id` (nullable) and the `PaymentMethod` enum includes `MERCADOPAGO`. The checkout UI already shows "Mercado Pago" as a payment option. However, selecting it and confirming the order does nothing special — the payment is created in `pendiente` status with no MP interaction. There is no Mercado Pago SDK, no preference creation, no webhook listener, and no redirect to MP Checkout Pro.

This design covers the full integration: backend SDK service → preference creation → webhook IPN handling → frontend redirect and return flow.

## Goals / Non-Goals

**Goals:**
- Integrate Mercado Pago Checkout Pro (redirect-based) as a working payment method
- Create MP payment preferences from orders when customer selects MP
- Handle IPN webhook notifications to update payment statuses
- Map MP payment statuses to internal `PaymentStatus` enum
- Add frontend redirect to MP checkout and return URL handling for success/failure/pending
- Maintain backward compatibility with existing payment methods (efectivo, transferencia)

**Non-Goals:**
- No subscription/recurring payment support (one-time orders only)
- No Mercado Pago point-of-sale or physical card reader integration
- No split payments or marketplace/multi-receiver model
- No in-browser card form (Checkout Pro handles this on MP's side)
- No PCI-DSS scope (all card data is handled by MP, not our servers)

## Decisions

### Decision 1: Checkout Pro (redirect) vs Checkout API (card form)
**Chosen: Checkout Pro**

Checkout Pro redirects the customer to Mercado Pago's hosted page, then returns via a callback URL. This is simpler to implement, keeps PCI scope out of our app, and provides a trustable payment UX (MP handles OTP, fraud detection, saved cards, etc.).

Checkout API (in-browser card form with `mercado-pago.js`) would give more control but introduces frontend complexity, requires frontend SDK integration, and still leaves us dependent on MP for security features. The redirect approach is the recommended starting point for new integrations per MP docs.

**Alternative considered: Checkout API** — rejected for MVP scope. Can be added later as a progressive enhancement.

### Decision 2: IPN (webhook) vs polling for status updates
**Chosen: IPN webhook as primary, polling as fallback**

Mercado Pago sends IPN notifications to a configured webhook URL when payment status changes. We'll use this as the primary mechanism to update payment status. The webhook handler will validate the notification with MP's API (using `payment.get`), map the MP status to our `PaymentStatus`, and update the record.

Additionally, we'll implement a fallback polling mechanism: when the user returns to the app from MP redirect, the frontend can query payment status via our API, which can optionally re-fetch from MP if the webhook hasn't arrived yet.

**Alternative considered: Polling only** — simpler but slower status updates. Webhook provides near-instant updates.

### Decision 3: New router vs extending existing pagos router
**Chosen: New sub-module `mercadopago/` within `pagos/`**

We'll create a `mercadopago/` module inside `pagos/` with its own service and router, maintaining separation of concerns. The existing `pagos` router stays clean. The MP router mounts at `/api/v1/pagos/mercadopago/`.

- `backend/modules/pagos/mercadopago/mp_service.py` — MercadoPagoService (create preference, get payment status, handle webhook)
- `backend/modules/pagos/mercadopago/mp_router.py` — endpoints for preference creation, webhook, return URLs

### Decision 4: Preference creation timing
**Chosen: Create preference AFTER order is created, as a separate step**

The checkout flow for MP will be:
1. User confirms order on checkout page
2. Frontend calls `POST /api/v1/pedidos` to create the order
3. Frontend calls `POST /api/v1/pagos` to create the payment record (status: pendiente)
4. Frontend calls `POST /api/v1/pagos/mercadopago/create-preference` with `payment_id`
5. Backend creates MP preference, stores `mp_preference_id` and `mp_init_point` on the payment
6. Frontend redirects browser to `mp_init_point`
7. User completes payment on MP site
8. MP sends IPN webhook → backend updates payment status
9. User returns to app via return URL

### Decision 5: Database model changes
**Chosen: Add `mp_preference_id` and `mp_init_point` to Payment model**

We're adding two nullable fields to the existing `Payment` model:
- `mp_preference_id` (String, 255) — Mercado Pago preference ID
- `mp_init_point` (String, 512) — URL to redirect user to MP Checkout

The existing `mp_payment_id` is repurposed: it will store the MP payment ID after the webhook confirms payment (this was the original intent).

### Decision 6: Webhook security
**Chosen: Validate via Mercado Pago's X-Signature + IPN re-fetch**

Mercado Pago sends `X-Signature` header with HMAC-SHA256 of the notification payload using our `webhook_secret`. We'll:
1. Verify the `X-Signature` header
2. Re-fetch the payment status from MP's API (don't trust the webhook payload alone)
3. Only update status if the MP API confirms it

### Decision 7: Frontend — no new payment-specific store
**Chosen: Extend existing CheckoutPage flow**

We won't create a new store or feature for MP. The `CheckoutPage` will detect when `mercadopago` is the selected payment method and, on confirm, after creating the order and payment, call the create-preference endpoint and redirect. No new payment-specific pages are needed initially — success/failure/pending return URLs will be query-param handled on the frontend router.

## Architecture

```
┌────────────────────────────────────────────────────────┐
│                    Frontend (React)                     │
│  ┌──────────────────────────────────────────────────┐  │
│  │  CheckoutPage                                     │  │
│  │  1. Create order → POST /api/v1/pedidos          │  │
│  │  2. Create payment → POST /api/v1/pagos          │  │
│  │  3. Create preference → POST /api/pagos/mp/pref  │  │
│  │  4. Redirect browser → mp_init_point             │  │
│  └──────────────┬───────────────────────────────────┘  │
│                 │                                       │
│  ┌──────────────▼───────────────────────────────────┐  │
│  │  OrderDetailPage                                  │  │
│  │  Show MP payment status + "Pay with MP" button    │  │
│  │  if payment is pending and method is MP           │  │
│  └──────────────────────────────────────────────────┘  │
└──────────────────────┬───────────────────────────────┘
                       │
┌──────────────────────▼───────────────────────────────┐
│                  Backend (FastAPI)                     │
│                                                        │
│  ┌────────────┐  ┌────────────────────────────────┐   │
│  │  Pagos     │  │  MercadoPago Module             │   │
│  │  Router    │  │  ┌──────────────────────────┐   │   │
│  │  (existing)│  │  │ mp_router.py             │   │   │
│  │            │  │  │  POST /create-preference  │   │   │
│  │  POST /    │  │  │  POST /webhook            │   │   │
│  │  GET /{id} │  │  │  GET /success             │   │   │
│  │  PATCH     │  │  │  GET /failure             │   │   │
│  │  /{id}/st  │  │  │  GET /pending             │   │   │
│  │  atus      │  │  └──────────┬───────────────┘   │   │
│  └────────────┘  │             │                     │   │
│                  │  ┌──────────▼───────────────┐   │   │
│                  │  │ mp_service.py             │   │   │
│                  │  │  create_preference()      │   │   │
│                  │  │  handle_webhook()         │   │   │
│                  │  │  get_payment_status()     │   │   │
│                  │  │  map_mp_status()          │   │   │
│                  │  └──────────────────────────┘   │   │
│                  └────────────────────────────────┘   │
│                                                        │
│  ┌────────────────────────────────────────────────┐   │
│  │  Core / Config                                  │   │
│  │  MERCADOPAGO_ACCESS_TOKEN                      │   │
│  │  MERCADOPAGO_WEBHOOK_SECRET                    │   │
│  │  MERCADOPAGO_WEBHOOK_URL (public URL)          │   │
│  └────────────────────────────────────────────────┘   │
└──────────────────────┬───────────────────────────────┘
                       │
┌──────────────────────▼───────────────────────────────┐
│              Mercado Pago (External)                  │
│                                                        │
│  ┌────────────────┐    ┌──────────────────────────┐   │
│  │  Checkout Pro   │    │  IPN Webhook             │   │
│  │  Hosted payment │◄───│  Notifications           │   │
│  │  page           │    │  (payment status changes)│   │
│  └────────────────┘    └──────────────────────────┘   │
└────────────────────────────────────────────────────────┘
```

## Sequence: Mercado Pago Checkout Flow

```
User          Frontend          Backend           MP SDK         MP API
 │                │                │                │              │
 │  Confirm order │                │                │              │
 ├───────────────►│                │                │              │
 │                │ POST /pedidos  │                │              │
 │                ├───────────────►│                │              │
 │                │◄────order ─────┤                │              │
 │                │                │                │              │
 │                │ POST /pagos    │                │              │
 │                ├───────────────►│                │              │
 │                │◄───payment ────┤                │              │
 │                │                │                │              │
 │                │ POST /mp/pref  │                │              │
 │                ├───────────────►│ create_pref()  │              │
 │                │                ├───────────────►│              │
 │                │                │                ├────►pref────►│
 │                │                │◄───pref ───────┤              │
 │                │◄─init_point ───┤                │              │
 │                │                │                │              │
 │  redirect to   │                │                │              │
 │  MP checkout   │                │                │              │
 │◄───────────────┤                │                │              │
 │                │                │                │              │
 │  ─── User completes payment on MP Checkout ────►│              │
 │                │                │                │              │
 │                │                │          IPN POST /webhook    │
 │                │                │◄──────────────────────────────┤
 │                │                │  validate & update status     │
 │                │                │                │              │
 │  POST /success │                │                │              │
 ├───────────────►│                │                │              │
 │                │ GET /pedidos/  │                │              │
 │                ├───────────────►│                │              │
 │                │◄─order + pay ──┤                │              │
 │  Show order    │                │                │              │
 │  confirmation  │                │                │              │
 │◄───────────────┤                │                │              │
```

## Data Model Changes

### Payment model (existing, with additions)

| Column | Type | Description |
|--------|------|-------------|
| id | UUID PK | Payment ID |
| order_id | UUID FK → pedidos.id | Associated order (unique) |
| payment_method | Enum | efectivo, transferencia, mercadopago |
| status | Enum | pendiente, aprobado, rechazado, reembolsado |
| amount | Numeric(10,2) | Payment amount |
| currency | String(3) | Default: ARS |
| mp_payment_id | String(255) nullable | MP payment ID (after webhook confirms) |
| **mp_preference_id** | String(255) nullable | MP preference ID (NEW) |
| **mp_init_point** | String(512) nullable | MP checkout URL (NEW) |
| created_at | DateTime | Auto-set |
| updated_at | DateTime nullable | Auto-update |

## Configuration (new env vars)

```
MERCADOPAGO_ACCESS_TOKEN=TEST-1234...
MERCADOPAGO_WEBHOOK_SECRET=your_webhook_secret
MERCADOPAGO_WEBHOOK_URL=https://your-domain.com/api/v1/pagos/mercadopago/webhook
```

Backend settings (`Settings` class) will gain matching fields with `dev-` defaults for development.

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| Webhook delivery delayed or missed | Fallback: frontend can poll status on return from MP redirect; manual admin button to re-sync |
| MP API changes | Use versioned `mercadopago` SDK, pin major version |
| Webhook security (fake notifications) | Validate X-Signature + re-fetch payment from MP API before updating |
| User closes browser before redirect | Order stays in pendiente → manual pay button on order detail page |
| MP returns with query params tampered | Never trust return URL params; always verify status via API |
| Network error during preference creation | Frontend shows error with "Reintentar" button; payment remains pendiente |

## Open Questions

- Should we support multiple currencies? For now, ARS only (matches `currency` default).
- Should the webhook URL be configurable via environment or stored in DB? Environment is sufficient for MVP.
- Should we use Mercado Pago's `notification_url` parameter in the preference for explicit webhook URL per payment? Yes, this is more reliable than relying on the dashboard configuration.
