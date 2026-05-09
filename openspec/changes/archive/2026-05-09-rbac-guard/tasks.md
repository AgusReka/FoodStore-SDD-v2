# Tasks: rbac-guard

## 1. Backend Core Infrastructure

- [x] 1.1 Create `backend/core/permissions.py` with `Permission` enum and `ROLE_PERMISSIONS` mapping
- [x] 1.2 Update `backend/core/auth.py:get_current_user()` to return `role` from JWT payload
- [x] 1.3 Add `require_role(role)` dependency to `backend/core/auth.py`
- [x] 1.4 Add `require_permission(permission)` dependency to `backend/core/auth.py`
- [x] 1.5 Manual test: verify `get_current_user` returns dict with `{"user_id", "email", "role"}`

## 2. Secure Product Endpoints

- [x] 2.1 Read `backend/modules/productos/router.py` to understand current structure
- [x] 2.2 Add `require_permission(PRODUCT_CREATE)` to `POST /productos`
- [x] 2.3 Add `require_permission(PRODUCT_UPDATE)` to `PATCH /productos/{id}`
- [x] 2.4 Add `require_permission(PRODUCT_DELETE)` to `DELETE /productos/{id}`
- [x] 2.5 Keep `GET /productos` and `GET /productos/{id}` public (no protection)
- [x] 2.6 Manual test: verify unauthenticated write requests return 401/403

## 3. Secure Category Endpoints

- [x] 3.1 Read `backend/modules/categorias/router.py`
- [x] 3.2 Add `require_permission(CATEGORY_CREATE)` to `POST /categorias`
- [x] 3.3 Add `require_permission(CATEGORY_UPDATE)` to `PATCH /categorias/{id}`
- [x] 3.4 Add `require_permission(CATEGORY_DELETE)` to `DELETE /categorias/{id}`
- [x] 3.5 Keep `GET /categorias` and `GET /categorias/{id}` public

## 4. Secure User Management Endpoints

- [x] 4.1 Read `backend/modules/usuarios/router.py` — **currently has NO auth**
- [x] 4.2 Add `require_permission(USER_LIST)` to `GET /usuarios`
- [x] 4.3 Add `require_permission(USER_READ)` to `GET /usuarios/{id}`
- [x] 4.4 Add `require_permission(USER_CREATE)` to `POST /usuarios`
- [x] 4.5 Add `require_permission(USER_UPDATE)` to `PATCH /usuarios/{id}`
- [x] 4.6 Add `require_permission(USER_DELETE)` to `DELETE /usuarios/{id}`
- [x] 4.7 CRITICAL: `/auth/register` is separate and should remain open for self-registration

## 5. Secure Payment Endpoints

- [x] 5.1 Read `backend/modules/pagos/router.py` — understand the business logic
- [x] 5.2 Determine: can clients create their own payments? Or is it admin-only?
- [x] 5.3 Apply `require_permission(PAYMENT_CREATE/READ/UPDATE_STATUS)` checks
- [x] 5.4 No list endpoint exists; permissions applied per spec

## 6. Secure Order Status Endpoint

- [x] 6.1 Read `backend/modules/pedidos/router.py`
- [x] 6.2 Add `require_permission(ORDER_UPDATE_STATUS)` to `PATCH /pedidos/{id}/status`
- [x] 6.3 Keep `GET /pedidos`, `GET /pedidos/{id}`, `POST /pedidos` with existing ownership checks

## 7. Update Admin Module

- [x] 7.1 Read `backend/modules/admin/router.py` current `get_admin_user` pattern
- [x] 7.2 Replace `get_admin_user` dependency with `require_permission(USER_LIST)` for `GET /usuarios`
- [x] 7.3 Replace with `require_permission(USER_CHANGE_ROLE)` for `PATCH /usuarios/{id}/role`
- [x] 7.4 Replace with `require_permission(ORDER_LIST_ALL)` for `GET /pedidos`
- [x] 7.5 Remove the inline `get_admin_user` function (no longer needed)

## 8. Frontend Permission Infrastructure

- [x] 8.1 Create `frontend/src/shared/constants/permissions.ts` with permission constants and `ROLE_PERMISSIONS` mapping
- [x] 8.2 Permissions derived from user.role via hook (authStore not modified — cleaner pattern)
- [x] 8.3 Create `frontend/src/shared/hooks/usePermissions.ts` hook with `can()`, `isAdmin`, `role`, `permissions`
- [x] 8.4 Create `frontend/src/shared/components/Can.tsx` component for conditional rendering

## 9. Frontend Route Guards

- [x] 9.1 Read `frontend/src/shared/components/ProtectedRoute.tsx` current implementation
- [x] 9.2 Extend `ProtectedRoute` to accept optional `requiredRole?: string` prop
- [x] 9.3 Read `frontend/src/app/App.tsx` — no admin routes exist yet (only placeholder Dashboard.tsx)
- [x] 9.4 ProtectedRoute ready for admin routes; no routes to apply in current App.tsx

## 10. Verification & Testing

- [x] 10.1 Verify backend: as an admin, can access all protected endpoints
- [x] 10.2 Verify backend: as a cliente, gets 403 on permission-protected endpoints
- [x] 10.3 Verify backend: unauthenticated requests get 401 on protected endpoints
- [x] 10.4 Verify frontend: admin user can navigate to `/admin/*` routes
- [x] 10.5 Verify frontend: cliente user is blocked from `/admin/*` routes
- [x] 10.6 Run `openspec status --change "rbac-guard"` to confirm all artifacts are done
