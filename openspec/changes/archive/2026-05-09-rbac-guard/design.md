# Design: rbac-guard

## Context

The Food Store app currently has critical security vulnerabilities:
- `productos`, `categorias`, `usuarios`, `pagos` endpoints are **completely unprotected** (no auth at all)
- Only `admin/router.py` has a manual `get_admin_user` dependency that checks `user.role == ADMIN`
- `get_current_user` extracts only `user_id` and `email` from JWT, ignoring the `role` claim that is already being set
- The `ProtectedRoute.tsx` component only checks for existence of `accessToken`, not the user's role

The JWT already contains `role` in its payload during login and refresh. We just need to:
1. Use it consistently in authorization checks
2. Add permission-based authorization (not just binary admin/cliente)
3. Secure all unprotected endpoints

### Current JWT Payload Structure

```json
{
  "sub": "<uuid>",
  "role": "admin" | "cliente",
  "email": "user@example.com",
  "exp": <timestamp>
}
```

### Code Patterns to Leverage

**Existing auth dependency** (`backend/core/auth.py`):
- `oauth2_scheme = OAuth2PasswordBearer(...)`
- `get_current_user(token) -> {"user_id": ..., "email": ...}`

**Existing admin pattern** (`backend/modules/admin/router.py`):
```python
async def get_admin_user(
    current_user: Annotated[dict, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> tuple:
    user_id = UUID(current_user["user_id"])
    repo = UserRepository(db)
    user = await repo.get(user_id)
    if not user or user.role != UserRole.ADMIN:
        raise ForbiddenError("Admin access required")
    return user, db
```

Problems with this pattern:
- Makes a DB call on every request (fetching the user to check role)
- Role is IN the JWT already — no DB call needed
- Not reusable across endpoints (defined inline in admin/router.py)

---

## Goals / Non-Goals

**Goals:**
1. Create centralized, reusable `require_role()` and `require_permission()` FastAPI dependencies
2. Secure ALL currently unprotected endpoints with appropriate auth/permissions
3. Make `get_current_user` return the `role` from JWT (avoids DB lookups for simple checks)
4. Add frontend route guards for admin pages
5. Create permission constants and role-to-permissions mapping
6. Seed default roles with appropriate permissions

**Non-Goals:**
1. Do NOT create a database-driven permission system (no `roles`, `permissions`, `role_permissions` tables)
   - Use config-driven role-permission mapping instead for simplicity
   - The `User.role` column (ENUM) is sufficient
2. Do NOT modify the existing JWT generation/refresh mechanism (it already puts `role` in the token)
3. Do NOT remove `get_current_user` — extend it and build on top
4. Do NOT implement dynamic role creation UI in this change (seed-only initially)

---

## Decisions

### Decision 1: Config-driven permissions, not DB-driven

**Problem:** Should permissions be stored in database or defined in code?

**Options considered:**
1. **Full DB-driven**: `roles`, `permissions`, `role_permissions` tables
2. **Code-only**: Permission constants + role-permissions mapping in Python modules
3. **Hybrid**: DB for role assignments, code for permission definitions

**Decision: Code-only (Option 2)**

**Rationale:**
- Simplicity: No migrations needed, no DB queries per request
- Performance: All lookups are in-memory dictionary lookups
- Change frequency: Permissions change when code changes (rare), not at runtime
- Current pattern: `UserRole` is already an enum, not a DB table

**Implementation:**
```python
# backend/core/permissions.py
class Permission(str, enum.Enum):
    # Products
    PRODUCT_LIST = "product:list"
    PRODUCT_READ = "product:read"
    PRODUCT_CREATE = "product:create"
    PRODUCT_UPDATE = "product:update"
    PRODUCT_DELETE = "product:delete"
    
    # Categories
    CATEGORY_LIST = "category:list"
    CATEGORY_CREATE = "category:create"
    # ... etc ...

# Role to permissions mapping
ROLE_PERMISSIONS: dict[UserRole, set[Permission]] = {
    UserRole.ADMIN: {
        Permission.PRODUCT_LIST,
        Permission.PRODUCT_CREATE,
        Permission.PRODUCT_UPDATE,
        Permission.PRODUCT_DELETE,
        Permission.CATEGORY_LIST,
        Permission.CATEGORY_CREATE,
        # ... ALL permissions ...
    },
    UserRole.CLIENTE: set(),  # Ownership-based access only
}
```

**Future path:** If we need `manager` or `support` roles later, extend `UserRole` enum and `ROLE_PERMISSIONS` dict.

---

### Decision 2: FastAPI Dependencies for Authorization

**Problem:** How to make authorization checks reusable?

**Decision:** Create two dependencies in `backend/core/auth.py`:

1. **`require_role(role: UserRole)`** — for simple role checks
2. **`require_permission(permission: str | Permission)`** — for granular permission checks

Both depend on `get_current_user()` and run statelessly (no DB calls).

**Implementation pattern:**
```python
def require_role(required_role: UserRole):
    async def checker(
        current_user: Annotated[dict, Depends(get_current_user)]
    ) -> dict:
        user_role = current_user.get("role")
        if user_role != required_role.value:
            # For flexibility: admin has ALL roles
            if user_role != UserRole.ADMIN.value:
                raise ForbiddenError(
                    f"Role '{required_role.value}' required"
                )
        return current_user
    return Depends(checker)

def require_permission(required_permission: str | Permission):
    async def checker(
        current_user: Annotated[dict, Depends(get_current_user)]
    ) -> dict:
        user_role = UserRole(current_user["role"])
        permissions = ROLE_PERMISSIONS.get(user_role, set())
        
        # Admin shortcut: has all permissions
        if user_role == UserRole.ADMIN:
            return current_user
            
        perm_str = (required_permission.value 
                    if isinstance(required_permission, Permission) 
                    else required_permission)
                    
        if Permission(perm_str) not in permissions:
            raise ForbiddenError(
                f"Permission '{perm_str}' required"
            )
        return current_user
    return Depends(checker)
```

**Usage in routers:**
```python
@router.post("/productos", response_model=...)
async def create_product(
    data: ProductCreate,
    _: Annotated[dict, Depends(require_permission(Permission.PRODUCT_CREATE))],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    # Only users with product:create can get here
```

---

### Decision 3: Endpoint Protection Strategy

**Problem:** Which endpoints need auth vs permission vs ownership?

**Decision matrix:**

| Module | Endpoints | Protection | Rationale |
|--------|-----------|------------|-----------|
| `productos` | `GET /list`, `GET /{id}` | **Public** | Anyone can browse products |
| `productos` | `POST`, `PUT`, `DELETE` | `require_permission(PRODUCT_*)` | Only privileged users can modify catalog |
| `categorias` | `GET /list`, `GET /{id}` | **Public** | Same as products |
| `categorias` | `POST`, `PUT`, `DELETE` | `require_permission(CATEGORY_*)` | Same as products |
| `usuarios` | ALL | `require_permission(USER_*)` | User management is admin-only |
| `pagos` | ALL | `require_permission(PAYMENT_*)` + ownership? | Need to check: can clients create their own payments? |
| `pedidos` | `GET /list`, `GET /{id}`, `POST` | `get_current_user` + ownership check | Clients can create and view their own orders |
| `pedidos` | `PATCH /{id}/status` | `require_permission(ORDER_UPDATE_STATUS)` | Only privileged users can change order status |
| `direcciones` | ALL | `get_current_user` + scoped by user_id | Clients manage their own addresses |
| `admin` | ALL | `require_permission()` granular | Use new dependencies instead of `get_admin_user` |

**Note on `pagos`:** Need to explore the actual usage pattern. It's likely that:
- Clients can CREATE payments for their own orders
- But LIST/READ all payments is admin-only

This needs verification during implementation, but we'll start with `require_permission()` and add ownership checks where appropriate.

---

### Decision 4: Frontend Strategy

**Problem:** How to protect admin routes and conditionally render UI?

**Decision:**

1. **Extend `ProtectedRoute`** to accept an optional `requiredRole` prop
2. **Add `usePermissions()` hook** that wraps auth store
3. **Add `Can` component** for conditional rendering
4. **Store permissions in authStore** alongside user data

**Implementation locations:**
- `frontend/src/shared/stores/authStore.ts` — Add `permissions` to state
- `frontend/src/shared/hooks/usePermissions.ts` — New hook
- `frontend/src/shared/components/ProtectedRoute.tsx` — Extend with role prop
- `frontend/src/shared/components/Can.tsx` — New component
- `frontend/src/app/App.tsx` — Add admin route guards

**Role-permissions mapping on frontend:**
Mirror the backend mapping in a frontend constant:
```typescript
// frontend/src/shared/constants/permissions.ts
export const ROLE_PERMISSIONS: Record<string, string[]> = {
  admin: [
    "product:list", "product:create", "product:update", "product:delete",
    // ...
  ],
  cliente: [],
};
```

This keeps frontend and backend permission logic in sync without API calls.

---

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| **Breaking public API**: Previously unprotected endpoints now require auth | Document clearly in changelog. Keep `GET /productos` and `GET /categorias` public (browsing should work). |
| **Duplicated permission mapping** (frontend + backend) | Keep both mappings in simple constants that are easy to compare. Comment them to reference each other. |
| **No DB flexibility**: New roles require code change | This is intentional for v1. If dynamic roles become a requirement, we can migrate to DB-driven in a separate change. |
| **Permission enumeration could grow large** | Keep it organized by resource type in the enum. Use sensible grouping. |
| **Race condition: `get_current_user` change** | Update `get_current_user` to return `role` first, verify nothing breaks, then add the new dependencies. |

---

## Migration Plan

### Phase 1: Backend Core (No breaking changes yet)
1. Add `backend/core/permissions.py` — Permission enum + `ROLE_PERMISSIONS` mapping
2. Update `backend/core/auth.py:get_current_user` to include `role` in return value
3. Add `require_role()` and `require_permission()` dependencies

### Phase 2: Secure endpoints (Breaking changes)
1. Apply permissions to `productos/router.py` — write operations need permissions
2. Apply permissions to `categorias/router.py` — write operations need permissions
3. Apply permissions to `usuarios/router.py` — ALL operations need permissions
4. Apply permissions to `pagos/router.py`
5. Apply `order:update_status` permission to `pedidos/router.py`
6. Update `admin/router.py` — use new `require_permission()` instead of `get_admin_user`

### Phase 3: Frontend
1. Add permission constants and role mapping
2. Create `usePermissions()` hook
3. Create `<Can>` component
4. Extend `ProtectedRoute` with `requiredRole` prop
5. Apply admin route guards in `App.tsx`

### Phase 4: Seed & Testing
1. Update seed script if needed
2. Manual verification of protected endpoints
3. Verify admin routes work, cliente routes are denied

### Rollback Strategy
- If endpoints are incorrectly locked down: temporarily remove `require_permission()` dependencies from affected routers
- Revert `get_current_user` changes if they break existing code
- Database: no schema changes, so nothing to roll back in DB

---

## Open Questions

None. All decisions are made based on current codebase exploration.

---

## Files to Create/Modify

**New files:**
- `backend/core/permissions.py` — Permission enum + role-to-permissions mapping
- `frontend/src/shared/constants/permissions.ts` — Frontend permission constants
- `frontend/src/shared/hooks/usePermissions.ts` — Permissions hook
- `frontend/src/shared/components/Can.tsx` — Conditional rendering component

**Modified files:**
- `backend/core/auth.py` — Extend `get_current_user`, add `require_role`, `require_permission`
- `backend/modules/productos/router.py` — Add permission checks
- `backend/modules/categorias/router.py` — Add permission checks
- `backend/modules/usuarios/router.py` — Add permission checks
- `backend/modules/pagos/router.py` — Add permission checks
- `backend/modules/pedidos/router.py` — Add `order:update_status` check
- `backend/modules/admin/router.py` — Use new dependencies (remove `get_admin_user` inline)
- `frontend/src/shared/stores/authStore.ts` — Add permissions
- `frontend/src/shared/components/ProtectedRoute.tsx` — Add role support
- `frontend/src/app/App.tsx` — Apply admin route guards
