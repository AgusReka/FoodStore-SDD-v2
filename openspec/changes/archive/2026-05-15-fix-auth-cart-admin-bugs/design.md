## Context

Se identificaron 6 bugs post-archive que afectan la UX del usuario final y el panel admin. Todos son bugs localizados (cada uno en un archivo distinto) sin dependencias entre sí.

## Goals / Non-Goals

**Goals:**
- Bug 1: Limpiar caché de TanStack Query al hacer logout para que el nuevo login siempre muestre datos frescos
- Bug 2: ProductDetailModal redirija a login cuando no hay token (como ya hacen ProductCard, ProductDetailPage y ProductDetail)
- Bug 3: ProductCard muestre toast + abra cart drawer al agregar producto (consistente con ProductDetailPage)
- Bug 4: Admin routes exijan rol "admin" para acceder
- Bug 5: Registro redirija a `/login?email=...` sin auto-loguear
- Bug 6: Admin pueda ver detalle de cualquier pedido en `GET /pedidos/{id}`

**Non-Goals:**
- No cambios en el flujo de login existente
- No cambios en el modelo de datos
- No nuevos endpoints ni schemas
- No cambios en el sistema de permisos (require_permission)

## Decisions

### Bug 1 — Limpiar query cache en logout

**Opción**: `queryClient.clear()` en Header.tsx después de `logout()`.

**Alternativa rechazada**: Importar queryClient en authStore. La store no debería depender de TanStack Query. El Header ya tiene acceso al hook `useQueryClient()` y es el lugar natural.

### Bug 2 — ProductDetailModal redirect

**Solución**: Agregar `useNavigate` y redirigir a `/login?redirect=/productos/${product.id}` igual que hacen los otros 3 componentes.

### Bug 3 — ProductCard add-to-cart feedback

**Solución**: Agregar `addToast()` + `setCartOpen(true)` después de `addItem()`, exactamente como hace ProductDetailPage. Consistencia UX.

### Bug 4 — Admin role guard

**Solución**: Pasar `requiredRole="admin"` al `<ProtectedRoute>` en App.tsx línea 51. El `ProtectedRoute` ya tiene la lógica implementada correctamente.

### Bug 5 — Registro sin auto-login

**Solución**: Eliminar `await login(email, password)` y `navigate('/')`. Reemplazar con `navigate('/login?email=...')`. Eliminar parámetro `password` de `onSuccess` ya que no se necesita más.

### Bug 6 — Admin bypass en get_order

**Solución**: Agregar el mismo patrón que `get_order_history` ya usa: `if UserRole(current_user["role"]) != UserRole.ADMIN: raise ForbiddenError`.

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| Bug 1: `queryClient.clear()` borra TODA la caché (no solo auth) | Es aceptable — al cerrar sesión es correcto limpiar todo. No hay datos críticos en caché que no se recarguen |
| Bug 4: Un admin sin perfil cargado (user null) no puede acceder a admin | ProtectedRoute ya maneja este caso — muestra spinner hasta que fetchProfile carga el user con role |
| Bug 6: Admin puede ver pedidos de otros usuarios | Es el comportamiento deseado por definición del rol admin |
