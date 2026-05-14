## Why

Food Store currently lists "Mercado Pago" as a payment method option and stores an `mp_payment_id` on payments, but has no actual integration with the Mercado Pago SDK. Customers who select Mercado Pago at checkout receive no MP checkout experience — the payment cannot be processed. Integrating Mercado Pago is critical for the platform to accept card, debit, and digital wallet payments, increasing conversion and trust.

## What Changes

- **Backend: Mercado Pago SDK integration** — Install `mercadopago` Python SDK, add configuration (access token, webhook secret) to env/config
- **Backend: Payment Preference creation** — New endpoint to create an MP payment preference from an order, returning the checkout URL
- **Backend: Webhook (IPN) handler** — New public endpoint to receive Mercado Pago IPN notifications and update payment status accordingly
- **Backend: MP status mapping** — Map MP payment statuses to internal `PaymentStatus` values (approved → aprobado, rejected → rechazado, in_process/in_mediation → pendiente, refunded → reembolsado)
- **Backend: Alembic migration** — Migration for any new fields (e.g., `mp_preference_id`)
- **Frontend: MP checkout redirect** — When user selects Mercado Pago and confirms order, redirect browser to MP Checkout Pro init_point URL
- **Frontend: Return URL handling** — Handle MP redirect back to app on success, failure, or pending
- **Frontend: Order detail update** — Show MP-specific payment status and pending payment action on order detail page
- **Configuration** — New env vars: `MERCADOPAGO_ACCESS_TOKEN`, `MERCADOPAGO_WEBHOOK_SECRET`

## Capabilities

### New Capabilities
- `mercadopago-integration`: Mercado Pago SDK integration, preference creation, webhook handling, and frontend redirect flow

### Modified Capabilities
- `payment-handling`: Add Mercado Pago-specific payment creation flow (preference-based, async confirmation via webhook) alongside existing direct payment methods
- `customer-checkout-flow`: Update checkout flow to redirect to Mercado Pago Checkout Pro when MP is selected, and handle return URLs

## Impact

- **Backend modules affected**: `pagos/` — new `mercado_pago_service.py`, new `mercado_pago_router.py`; `core/config.py` — new MP config fields
- **Backend dependencies**: New `mercadopago` Python package
- **Frontend pages affected**: `CheckoutPage.tsx` — MP redirect logic; `OrderDetailPage.tsx` — MP payment status
- **Infrastructure**: Webhook endpoint needs to be publicly accessible (no auth); MP dashboard needs webhook URL configured
- **Database**: New `mp_preference_id` column on `pagos` table (nullable)
