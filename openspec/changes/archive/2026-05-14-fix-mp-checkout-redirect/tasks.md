# Tasks: fix-mp-checkout-redirect

## ⚠️ IMPORTANT: Load these domain skills before implementing

Before writing any code in these areas, load the relevant skill:
- Backend (FastAPI/Python): `/skill fastapi-python`
- Base de datos (PostgreSQL/Alembic): `/skill postgresql-database-engineering`
- JWT / seguridad: `/skill jwt-security`

---

## Phase 1: Backend — CheckoutSession model + migration

- [x] 1.1 Create `backend/modules/checkout/model.py` — `CheckoutSession` model
- [x] 1.2 Create Alembic migration for `checkout_sessions` table
- [x] 1.3 Create `backend/modules/checkout/__init__.py`
- [x] 1.4 Register CheckoutSession model import in `backend/main.py` + `env.py`

## Phase 2: Backend — CheckoutSession repository

- [x] 2.1 Create `backend/modules/checkout/repository.py` — `CheckoutSessionRepository`

## Phase 3: Backend — Schemas for checkout endpoints

- [x] 3.1 Create `backend/modules/checkout/schemas.py` — Pydantic models

## Phase 4: Backend — Update mp_service for session-based preference creation

- [x] 4.1 Add `create_preference_from_session()` to `MercadoPagoService`
- [x] 4.2 Keep existing `create_preference(payment_id)` for non-CheckoutSession use cases

## Phase 5: Backend — Checkout service (mp-init logic)

- [x] 5.1 Create `backend/modules/checkout/service.py` — `CheckoutService`

## Phase 6: Backend — Checkout router (endpoints)

- [x] 6.1 Create `backend/modules/checkout/router.py` — mp-init + mp-return endpoints
- [x] 6.2 Register checkout router in `backend/main.py`

## Phase 7: Backend — Clean up old endpoint + add retry endpoint

- [x] 7.1 Remove `POST /api/v1/pagos/mercadopago/create-preference` from mp_router.py
- [x] 7.2 Remove `CreatePreferenceRequest` and `CreatePreferenceResponse` schemas
- [x] 7.3 Add `POST /api/v1/pagos/mercadopago/retry-preference` for "Pagar ahora" on existing payments

## Phase 8: Frontend — Update API client

- [x] 8.1 Add `CHECKOUT_MP_INIT` endpoint to frontend API constants
- [x] 8.2 Delete `frontend/src/features/payments/createMpPreference.ts`

## Phase 9: Frontend — Simplify CheckoutPage

- [x] 9.1 Update `frontend/src/pages/CheckoutPage.tsx` — MP uses mp-init flow, direct payments keep old flow

## Phase 10: Frontend — Simplify PaymentReturnPage

- [x] 10.1 Update `frontend/src/pages/PaymentReturnPage.tsx`:
  - The backend now handles the MP return and redirects to /orders/:id?new=true or /cart?mp-error=true
  - This page can remain as a fallback / safety net, but the main flow no longer depends on it
  - Add a check: if the URL has no `status` param, redirect to the current cart/orders page

## Phase 11: Backend — Clean up stale sessions (optional but recommended)

- [x] 11.1 Add a background task or scheduled cleanup in `lifespan` that calls `CheckoutSessionRepository.expire_old_sessions()` every few minutes

## Phase 12: Tests

- [x] 12.1 Unit tests for CheckoutSession model (create, status transitions)
- [x] 12.2 Unit tests for CheckoutSessionRepository
- [x] 12.3 Unit tests for CheckoutService.init_mp_session (stock validation, total calculation)
- [x] 12.4 Unit tests for CheckoutService.handle_mp_return (success creates order, failure expires session, duplicate calls idempotent)
- [x] 12.5 Integration test: full mp-init → mp-return → order created flow
- [x] 12.6 Update existing tests that reference the removed `create-preference` endpoint
