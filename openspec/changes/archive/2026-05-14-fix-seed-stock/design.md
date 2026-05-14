## Context

The checkout service (`backend/modules/checkout/service.py`) performs inline stock validation using `product.stock_cantidad or 0` which only works for simple products. Composite products (with ingredients like "Hamburguesa Clásica") store their stock in ingredient `stock_actual` values, and `stock_cantidad` is `NULL` per spec.

Meanwhile, `ProductRepository` already has a properly implemented `check_stock(product_id, quantity) -> tuple[bool, str | None]` method that handles both product types, and is already used by `OrderService.create_order()`. The checkout service simply never used it.

## Goals / Non-Goals

**Goals:**
- Fix `CheckoutService.init_mp_session()` to validate stock correctly for both simple and composite products
- Fix `CheckoutService.handle_mp_return()` to re-validate stock consistently
- Eliminate the duplicate inline stock validation logic
- Products fetched during validation must eager-load ingredients

**Non-Goals:**
- No changes to the stock management spec requirements (already correct)
- No API contract changes
- No database schema changes
- No changes to `OrderService` or `ProductRepository` (they're already correct)

## Decisions

### Decision 1: Reuse ProductRepository.check_stock() instead of inline validation
- **Option A (selected):** Replace inline `product.stock_cantidad or 0` check with calls to `product_repo.check_stock(product_id, quantity)` — the same method `OrderService` already uses correctly
- **Option B:** Add a `_calculate_available_stock()` helper to CheckoutService — would duplicate existing logic
- **Why A:** DRY principle. `ProductRepository.check_stock()` already handles both product types, includes proper error messages, and uses `get_with_ingredients()` to eager-load ingredients. Also eliminates the risk of future divergence between checkout and order stock validation.

### Decision 2: Fetch products with eager-loaded ingredients
- In `init_mp_session()`, replace `product_repo.get(pid)` with `product_repo.get_with_ingredients(pid)` so the product has its ingredients loaded for both stock validation AND price data
- Alternatively, call `check_stock()` for validation and `get()` separately for price/name — but that's two DB queries. Using `get_with_ingredients()` once is better.

### Decision 3: Keep seed data as-is
- The seed data already follows the spec correctly: composite products have `stock_cantidad = NULL` and ingredients linked via `seed_product_ingredients()`
- No seed changes needed — the fix is purely in the checkout service's validation logic

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| `init_mp_session()` currently builds session_items with product name/price/stock info. After the fix, stock validation happens before building items — error messages still reference product name. | Use `check_stock` result, and if it fails, the error message from check_stock already includes the product name. If it passes, we already have the product loaded. |
| The `handle_mp_return()` re-validation path (lines 204-217) returns a redirect to cart on failure instead of raising an exception. This is intentional (user already paid via MP, stock may have sold out). Keep this behavior. | No change needed — just replace the inline validation with `check_stock()` in those redirect paths. |
