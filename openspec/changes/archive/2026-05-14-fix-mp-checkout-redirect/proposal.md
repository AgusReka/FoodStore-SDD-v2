## Why

The current Mercado Pago checkout flow creates the Order and Payment records **before** redirecting the user to MP's hosted checkout page. If the MP preference creation fails, or if the user abandons the payment on MP's site, the database is left with orphan orders in `pendiente` status. There is no cleanup mechanism, and these orphan orders accumulate in the user's order history.

Additionally, the current flow has been experiencing a 500 error during preference creation due to sending `notification_url: null` (MP API rejects null values), which creates orphan orders every time it fails.

The solution is to invert the flow: create a lightweight, expirable `CheckoutSession` first, defer Order+Payment creation until MP confirms the payment was approved.

## What Changes

- **New model `CheckoutSession`**: Temporary table to hold cart data (items, address, totals) with a 30-minute TTL. No Order or Payment is created until MP confirms success.
- **New endpoint `POST /api/v1/checkout/mp-init`**: Receives cart data, validates stock, creates CheckoutSession + MP preference, returns `init_point`.
- **New endpoint `GET /api/v1/checkout/mp-return`**: Backend receives MP's redirect, validates the payment, creates Order + Payment atomically on success, then redirects the browser to the frontend order detail page.
- **Updated back_urls**: Point to the backend return endpoint instead of the frontend, so order creation happens server-side.
- **Simplified CheckoutPage**: No longer creates Order first. Sends cart data to `/mp-init` and redirects to MP.
- **Removed `POST /pagos/mercadopago/create-preference`**: Replaced by the new mp-init flow.
- **Removed orphan risk**: No Order/Payment is created until MP confirms approval.

## Capabilities

### New Capabilities

- `checkout-session-management`: Temporary storage of cart data during MP redirect flow, with automatic expiry.

### Modified Capabilities

- `mercadopago-integration`: The checkout flow now uses a CheckoutSession to defer order creation until MP confirms payment. The `create-preference` endpoint is replaced by the `mp-init` + `mp-return` flow.
- `payment-handling`: PaymentStatus polling remains but is now only relevant for webhook-delayed updates (no longer for initial payment creation).

## Impact

- **Backend — New**: `CheckoutSession` model, Alembic migration, `checkout/` router with `mp-init` and `mp-return` endpoints, repository for CheckoutSession
- **Backend — Removed**: `POST /pagos/mercadopago/create-preference` endpoint (replaced by `POST /checkout/mp-init`)
- **Frontend — Changed**: `CheckoutPage.tsx` — simplified to call `mp-init` and redirect; `PaymentReturnPage.tsx` — simplified (backend handles return and redirects to frontend)
- **Frontend — Removed**: `createMpPreference.ts` helper (replaced by the new flow)
- **Specs**: Delta specs updated to reflect the new CheckoutSession-based flow
- **Tests**: New tests for CheckoutSession model, mp-init, mp-return endpoints; updated MP service tests
