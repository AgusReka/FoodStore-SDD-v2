## 1. Card de Producto — Layout y contenido

- [x] 1.1 Eliminar el botón "+" flotante del interior del contenedor de imagen (líneas 117-127 de `ProductCard.tsx`)
- [x] 1.2 Agregar botón "+" junto al precio en el footer de la card (área líneas 158-162), alineado a la derecha del precio
- [x] 1.3 Eliminar el bloque de ingredientes (líneas 152-156 de `ProductCard.tsx`)
- [x] 1.4 Verificar que el nombre (`line-clamp-1`) y descripción (`line-clamp-2`) sigan funcionando correctamente

## 2. Navbar — Eliminar "Mi Perfil" duplicado

- [x] 2.1 Eliminar el `<button>` de "Mi Perfil" en el nav desktop (líneas 240-248 de `Header.tsx`)
- [x] 2.2 Verificar que el icono `user` (líneas 306-327) sigue funcionando como único acceso a perfil
- [x] 2.3 Verificar que el menú mobile conserva el link "Mi Perfil" (líneas 452-457)

## 3. Refetch Post-Pedido

- [x] 3.1 Agregar import de `useQueryClient` de `@tanstack/react-query` en `OrderDetailPage.tsx`
- [x] 3.2 Agregar import de `queryKeys` de `@shared/api/queryKeys` en `OrderDetailPage.tsx`
- [x] 3.3 Agregar `useEffect` que invalide `queryKeys.orders.list()` cuando `isNewOrder && order` estén presentes (alrededor de línea 150)
- [x] 3.4 Verificar que la invalidación no ocurre en visitas normales (sin `?new=true`)

## 4. Filtro por Período — Backend

- [x] 4.1 Agregar query param `periodo: str | None = Query(None, description="Period filter: last_week, last_month, last_3_months, all")` en `router.py` endpoint `list_my_orders`
- [x] 4.2 Agregar parámetro `periodo` a `list_by_user` en `service.py` y convertir string a `fecha_desde` (datetime)
- [x] 4.3 Agregar parámetro `periodo` a `get_by_user` y `count_by_user` en `repository.py`, añadiendo condición `Order.created_at >= desde` cuando corresponda
- [x] 4.4 Verificar que el endpoint funciona sin `periodo` (default "all" = sin filtro de fecha)

## 5. Filtro por Período — Frontend

- [x] 5.1 Definir constantes de período en `OrdersPage.tsx`: `PERIOD_FILTERS = [{ value: 'last_week', label: 'Última semana' }, { value: 'last_month', label: 'Último mes' }, { value: 'last_3_months', label: 'Últimos 3 meses' }, { value: 'all', label: 'Todas' }]`
- [x] 5.2 Agregar estado `periodFilter` con default `'all'` en `OrdersPage.tsx`
- [x] 5.3 Agregar row de pills de período debajo de los pills de status (o al mismo nivel)
- [x] 5.4 Modificar `useOrdersList` en `useOrders.ts` para aceptar y enviar `periodo` como query param
- [x] 5.5 Verificar que cambiar de período resetea a página 1
- [x] 5.6 Verificar que el filtro por período y el de status funcionan en conjunto
