## Why

Se identificaron 6 bugs post-archive que abarcan autenticación, carrito, routing de admin y permisos de backend. Estos bugs afectan la UX del usuario final y la capacidad del admin para gestionar pedidos.

## What Changes

- **Bug 1 — Logout + re-login no cambia al usuario nuevo**: Limpiar caché de TanStack Query (`['auth', 'me']`) al hacer logout para que el nuevo login siempre traiga datos frescos
- **Bug 2 — ProductDetailModal no redirige a login**: Reemplazar `onClose()` silencioso con redirect a `/login?redirect=...` cuando el usuario no está autenticado
- **Bug 3 — ProductCard add-to-cart sin feedback**: Agregar toast de éxito + apertura del cart drawer al agregar producto desde el catálogo (consistente con ProductDetailPage)
- **Bug 4 — Admin routes sin role guard**: Pasar `requiredRole="admin"` al `ProtectedRoute` que envuelve las rutas `/admin/*`
- **Bug 5 — Registro auto-loguea**: Eliminar `login()` automático post-registro; redirigir a `/login?email=...` como especifica la spec
- **Bug 6 — Admin no puede ver detalle de pedido**: Agregar bypass de admin en `GET /pedidos/{order_id}` para que admins puedan ver pedidos de cualquier usuario

## Capabilities

### New Capabilities
- (ninguna — todos son bug fixes)

### Modified Capabilities
- `authentication`: El logout SHALL invalidar la query cache de TanStack Query para que el próximo login traiga datos frescos. El registro SHALL NO auto-loguear al usuario (redirect a login). El ProductDetailModal SHALL redirigir a login cuando no hay token.
- `frontend-routing`: Las rutas admin SHALL requerir rol "admin" para acceder.
- `admin-panel`: El panel admin SHALL poder ver detalle de cualquier pedido.
- `frontend-api-client`: La caché de TanStack Query SHALL limpiarse al hacer logout para evitar datos stale.
- `order-processing`: El endpoint GET /pedidos/{id} SHALL permitir acceso a admins aunque no sean dueños del pedido.

## Impact

- **frontend/src/shared/hooks/useAuth.ts** — Limpiar query cache en logout
- **frontend/src/widgets/ProductDetailModal.tsx** — Agregar redirect a login
- **frontend/src/widgets/ProductCard.tsx** — Agregar toast + cart drawer
- **frontend/src/app/App.tsx** — Agregar `requiredRole="admin"`
- **frontend/src/pages/RegisterPage.tsx** — Sacar auto-login
- **backend/modules/pedidos/router.py** — Agregar admin bypass en get_order
- No breaking changes, no nuevas dependencias, no cambios de DB
