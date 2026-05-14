## Why

The checkout flow (`/api/v1/checkout/mp-init`) raises a `BadRequestError` — "Stock insuficiente para 'Hamburguesa Clásica': disponible 0, solicitado 1" — when users try to purchase composite products (those with ingredients) because the stock validation only checks `product.stock_cantidad`, which is `NULL` by design for composite products. Per the existing spec (`stock-management`), composite products derive available stock from their ingredients, not from a direct `stock_cantidad` field. The checkout service must be fixed to validate stock correctly for both simple and composite product types.

## What Changes

- Fix `CheckoutService.init_mp_session()` to calculate available stock from ingredients for composite products instead of only checking `stock_cantidad`
- Fix `CheckoutService.handle_mp_return()` to re-validate stock consistently using the same logic
- Add a helper method `_calculate_available_stock(product)` to encapsulate the stock calculation logic for both product types
- Ensure seed data in `seed.py` remains spec-compliant (composite products keep `stock_cantidad = NULL`)

## Capabilities

### New Capabilities
- _(none — this is a bug fix, no new capability)_

### Modified Capabilities
- `stock-management`: The spec already describes the correct behavior (composite products use ingredient-based stock). The **checkout** flow needs a new requirement clarifying that stock validation during `mp-init` SHALL respect ingredient-based stock for composite products.

## Impact

- **Affected files:**
  - `backend/modules/checkout/service.py` — stock validation logic
- **No API contract changes:** The `mp-init` endpoint signature remains the same; only the validation behavior changes
- **No database changes:** Schema unchanged
- **No frontend changes:** The error response shape stays the same (fewer errors in practice)
