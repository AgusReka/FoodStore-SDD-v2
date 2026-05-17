## Why

La UI de cliente presenta varios problemas de usabilidad y consistencia: las cards de producto muestran ingredientes que rompen el layout, el botón "+" está en la imagen en vez de junto al precio, la navbar duplica el acceso al perfil, la navegación post-pedido no refresca la lista de pedidos, y falta un filtro por período en Mis Pedidos. Estos issues afectan la experiencia del usuario y la calidad visual del frontend.

## What Changes

1. **Card de producto**: Mover el botón "+" flotante del área de la imagen al área del precio (junto al texto), eliminar la sección de ingredientes de la card, y asegurar que todo el texto respete los límites del contenedor.
2. **Navbar**: Eliminar el botón de texto "Mi Perfil" de la navegación desktop (duplicado con el icono de persona que ya existe), manteniendo solo el icono SVG.
3. **Refetch post-pedido**: Invalidar la query `['orders', 'list']` al llegar a la pantalla de detalle con `?new=true`, para que "Volver a mis pedidos" muestre datos actualizados.
4. **Filtro por período en Mis Pedidos**: Agregar filtros de período predefinidos ("Última semana", "Último mes", "Últimos 3 meses", "Todos") en la página Mis Pedidos, con soporte en backend para filtrar por rango de fechas.

## Capabilities

### New Capabilities
- *(ninguna — todos los cambios modifican capacidades existentes)*

### Modified Capabilities
- `customer-catalog-page`: La card de producto cambia su layout — el botón "+" se mueve al área de precio, se eliminan los ingredientes, y se aplica text overflow consistente.
- `customer-header`: El nav link "Mi Perfil" (texto) se elimina del header desktop. El icono de persona se mantiene como único acceso a perfil.
- `customer-order-detail`: Al navegar al detalle con `?new=true`, se debe invalidar el caché de la lista de pedidos para garantizar datos frescos al volver.
- `customer-order-history`: La página Mis Pedidos agrega filtros por período predefinido. El endpoint `GET /pedidos/` acepta un nuevo query param `periodo` con valores `last_week`, `last_month`, `last_3_months`, `all`.

## Impact

- **Frontend**: `ProductCard.tsx` (layout del botón +, remover ingredientes), `Header.tsx` (remover nav link), `OrderDetailPage.tsx` (invalidación de query), `OrdersPage.tsx` + `useOrders.ts` (nuevo filtro período + query param)
- **Backend**: `router.py` (nuevo query param `periodo`), `service.py` (pasar filtro al repo), `repository.py` (añadir condición `created_at >= fecha_desde` en `get_by_user` y `count_by_user`)
- **No breaking changes**: Todos los cambios son aditivos o de UI. El nuevo query param es opcional (default `all`).
