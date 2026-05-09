## Why

Critical security gaps exist in the API: productos, categorias, pagos, and usuarios endpoints are completely unprotected. Any unauthenticated user can create, edit, or delete resources. The current authorization is ad-hoc and inconsistent — only the admin module has a manual role check. A centralized Role-Based Access Control (RBAC) system is needed to consistently enforce permissions across all endpoints.

## What Changes

- Add a centralized permission system with granular permissions (e.g., `product:create`, `user:list`)
- Add FastAPI dependencies: `require_role(role)` and `require_permission(permission)` 
- Apply permission checks to **all** previously unprotected endpoints
- Extend `get_current_user` to return user's role and permissions from JWT
- Add frontend route guards for admin pages
- Add conditional UI rendering based on permissions
- Seed script creates default roles (admin, manager, cliente) with appropriate permissions

**BREAKING**: Endpoints that were previously unprotected (`/productos/*`, `/categorias/*`, `/usuarios/*`, `/pagos/*`) will now require authentication and appropriate permissions.

## Capabilities

### New Capabilities
- `rbac-system`: Granular permission model, role-permission assignments, and centralized authorization dependencies

### Modified Capabilities
- `authentication`: JWT claims include role/permissions; `get_current_user` returns role info
- `admin-panel`: Admin endpoints use the new `require_permission` dependency instead of ad-hoc checks
- `backend-security`: All protected endpoints consistently enforce authentication and authorization

## Impact

**Affected Backend Modules:**
- `backend/core/auth.py` — Add `require_role` and `require_permission` dependencies
- `backend/core/enums.py` — Add permission enum
- `backend/modules/*/router.py` — Add permission dependencies to all routers
- `backend/modules/admin/router.py` — Replace `get_admin_user` with standardized dependencies
- `backend/db/migrations/` — Possible migrations for permission tables (if using DB-stored permissions)
- `backend/db/seed.py` — Seed default roles and permissions

**Affected Frontend Modules:**
- `frontend/src/shared/stores/authStore.ts` — Store user permissions
- `frontend/src/shared/components/ProtectedRoute.tsx` — Add role/permission support
- `frontend/src/app/App.tsx` — Apply admin route guards
- `frontend/src/features/admin/*` — Conditional rendering

**No new external dependencies** — builds on existing FastAPI dependency injection system.
