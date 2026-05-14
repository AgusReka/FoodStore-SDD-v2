## 1. Fix stock validation in init_mp_session

- [x] 1.1 Replace `product_repo.get(pid)` with `product_repo.get_with_ingredients(pid)` in `CheckoutService.init_mp_session()` to ensure ingredients are eager-loaded
- [x] 1.2 Replace inline `product.stock_cantidad or 0` stock validation with `await product_repo.check_stock(product_id, item["quantity"])` in the loop
- [x] 1.3 Adjust error handling: if `check_stock` returns `(False, error_msg)`, raise `BadRequestError` with the returned error message

## 2. Fix stock re-validation in handle_mp_return

- [x] 2.1 Replace inline `product.stock_cantidad or 0` validation in `handle_mp_return()` with `product_repo.check_stock()` for the re-validation on MP success return
- [x] 2.2 Verify the redirect-to-cart fallback behavior is preserved on re-validation failure

## 3. Verify and clean up

- [x] 3.1 Verify `init_mp_session()` still builds `session_items` correctly with product name and price (fetched via `get_with_ingredients`)
- [x] 3.2 Test the full checkout flow: add a composite product (Hamburguesa Clásica), initiate MP checkout, verify no 400 error (requires running backend)
- [x] 3.3 Run `python -m backend.db.seed` to confirm existing seed data is unaffected
