## 1. Backend: Admin bypass en GET /pedidos/{id}

- [x] 1.1 En `backend/modules/pedidos/router.py` función `get_order`, agregar `if UserRole(current_user["role"]) != UserRole.ADMIN:` antes del `raise ForbiddenError`

## 2. Frontend: Limpiar query cache en logout

- [x] 2.1 En `frontend/src/widgets/Header.tsx`, importar `useQueryClient` de `@tanstack/react-query`
- [x] 2.2 En `handleLogout`, llamar `queryClient.clear()` después de `await logout()`

## 3. Frontend: ProductDetailModal redirect a login

- [x] 3.1 En `frontend/src/widgets/ProductDetailModal.tsx`, importar `useNavigate` de `react-router-dom`
- [x] 3.2 Reemplazar `onClose()` en el bloque `if (!accessToken)` con `onClose(); navigate('/login?redirect=/productos/${product.id}')`

## 4. Frontend: ProductCard feedback visual

- [x] 4.1 En `frontend/src/widgets/ProductCard.tsx`, importar `useUiStore` y `addToast`
- [x] 4.2 Después de `addItem(...)` en `handleAddToCart`, agregar `addToast({ type: 'success', message: '...' })` y `setCartOpen(true)`

## 5. Frontend: Admin route role guard

- [x] 5.1 En `frontend/src/app/App.tsx` línea 51, cambiar `<ProtectedRoute />` a `<ProtectedRoute requiredRole="admin" />`

## 6. Frontend: Registro sin auto-login

- [x] 6.1 En `frontend/src/pages/RegisterPage.tsx`, reemplazar `handleRegisterSuccess` para que navegue a `/login?email=...` sin llamar `login()`
- [x] 6.2 Eliminar el parámetro `password` de `onSuccess` en `RegisterForm` si ya no es necesario
