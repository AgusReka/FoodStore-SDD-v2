# Tasks: mercadopago-integration

## 1. Setup & Configuration

- [x] 1.1 Add `mercadopago` Python SDK to `backend/requirements.txt`
- [x] 1.2 Add Mercado Pago configuration fields to `backend/core/config.py` (`MERCADOPAGO_ACCESS_TOKEN`, `MERCADOPAGO_WEBHOOK_SECRET`, `MERCADOPAGO_WEBHOOK_URL`)
- [x] 1.3 Add Mercado Pago config vars to `backend/.env.example`
- [x] 1.4 Create Alembic migration to add `mp_preference_id` (String, 255) and `mp_init_point` (String, 512) columns to `pagos` table

## 2. Backend: Mercado Pago Service

- [x] 2.1 Create `backend/modules/pagos/mercadopago/__init__.py`
- [x] 2.2 Create `backend/modules/pagos/mercadopago/mp_service.py` with `MercadoPagoService` class:
  - `__init__`: Initialize Mercado Pago SDK client with access token
  - `create_preference(payment_id)`: Create MP Checkout Pro preference from a payment record (title, amount, quantity, back_urls with success/failure/pending, notification_url)
  - `get_payment_status(mp_payment_id)`: Fetch payment status from MP API
  - `handle_webhook(data, headers)`: Validate X-Signature and process IPN notification
  - `_map_mp_status(mp_status)`: Map MP statuses to internal `PaymentStatus` enum
- [x] 2.3 Create `backend/modules/pagos/mercadopago/mp_router.py` with endpoints:
  - `POST /create-preference` — Create MP preference (auth required, customer)
  - `POST /webhook` — IPN webhook handler (no auth, X-Signature validation)
  - `GET /success` — Redirect after successful MP payment
  - `GET /failure` — Redirect after failed MP payment
  - `GET /pending` — Redirect after pending MP payment
- [x] 2.4 Register MP router in `backend/main.py` at prefix `/api/v1/pagos/mercadopago`

## 3. Backend: Payment Model & Repository Updates

- [x] 3.1 Add `mp_preference_id` and `mp_init_point` fields to `backend/modules/pagos/model.py`
- [x] 3.2 Add repository method `get_by_mp_payment_id(mp_payment_id)` to `backend/modules/pagos/repository.py`
- [x] 3.3 Update `backend/modules/pagos/schemas.py` to include `mp_preference_id` and `mp_init_point` in `PagoRead`
- [x] 3.4 Update `backend/modules/pagos/service.py` — ensure `update_status` works correctly when triggered via webhook (MP payment flow)

## 4. Frontend: Checkout Mercado Pago Redirect Flow

- [x] 4.1 Create MP API client helper in frontend (`features/payments/createMpPreference.ts`) that calls `POST /api/v1/pagos/mercadopago/create-preference`
- [x] 4.2 Update `CheckoutPage.tsx` — when payment method is `mercadopago` and order is confirmed:
  - Create order → create payment → call create-preference → redirect browser to `init_point`
- [x] 4.3 Handle error case: if preference creation fails, show error + "Reintentar" button (do NOT clear cart)

## 5. Frontend: Mercado Pago Return Handling

- [x] 5.1 Create `frontend/src/pages/PaymentReturnPage.tsx` — Handle MP return URLs with query param `status` (success/failure/pending):
  - `success`: Show success animation + navigate to order detail
  - `failure`: Show error message + button to retry payment
  - `pending`: Show "Pago pendiente" message + "Pagar ahora" button
- [x] 5.2 Add `/mp/return` route in frontend router configuration
- [x] 5.3 Update `OrderDetailPage.tsx` to show:
  - MP-specific payment status with branding
  - "Pagar ahora" button when payment is `pendiente` and method is `mercadopago`
  - Re-create preference and redirect if user clicks "Pagar ahora"

## 6. Backend: API Endpoint Testing

- [x] 6.1 Write unit tests for `MercadoPagoService` (mock MP SDK):
  - `create_preference` success and error cases
  - `_map_mp_status` all status mappings
  - `handle_webhook` with valid and invalid signatures
- [x] 6.2 Write integration tests for MP router endpoints:
  - `POST /create-preference` with valid/invalid payment_id
  - `POST /webhook` with valid/invalid X-Signature
  - `GET /success`, `/failure`, `/pending` return correct redirects
- [x] 6.3 Update existing `PaymentService` tests to cover MP-related payment flows
