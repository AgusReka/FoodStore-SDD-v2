## Context

Frontend de FoodStore en React + TypeScript usando TanStack Query, Zustand, y TailwindCSS. Backend en FastAPI con PostgreSQL. Se identificaron 4 issues de UI/UX y 1 bug de refetch que afectan la experiencia del cliente.

### Estado actual

- **ProductCard**: Botón "+" flotante dentro del contenedor de imagen (position absolute, z-10). Ingredientes renderizados como texto plano sin truncado.
- **Header**: Nav link "Mi Perfil" duplicado con icono de persona en desktop.
- **OrderDetailPage**: Navegación post-checkout no invalida caché de TanStack Query.
- **OrdersPage**: Solo filtra por estado, sin soporte de filtro por período.

## Goals / Non-Goals

**Goals:**
- Mejorar la card de producto moviendo el botón "+" junto al precio y eliminando ingredientes del card compacto.
- Simplificar la navbar eliminando el nav link "Mi Perfil" duplicado.
- Asegurar que "Volver a mis pedidos" muestre la lista actualizada (fix de refetch).
- Agregar filtro por período en Mis Pedidos con soporte full-stack.

**Non-Goals:**
- No se rediseña el modal de detalle de producto ni la página de detalle.
- No se cambia la lógica de navegación mobile del header (el menú mobile conserva "Mi Perfil").
- No se agregan filtros por monto, búsqueda textual, ni ordenamiento ascendente.

## Decisions

### 1. Card: Botón "+" movido al área de precio

**Decisión**: Mover el botón `+` flotante de dentro del contenedor de imagen (líneas 117-127 de `ProductCard.tsx`) al área de precio, junto al texto del mismo.

**Alternativa considerada**: Dejarlo como FAB flotante (actual). Se descarta porque el usuario lo quiere junto al texto.

**Implementación**:
- Eliminar el `<button>` flotante del contenedor de imagen.
- Agregar un botón cilíndrico con icono "+" y texto "Agregar" (o solo icono) al mismo nivel que el precio, alineado a la derecha.
- Mantener la misma lógica de `handleAddToCart` y `isAvailable`.

### 2. Card: Eliminar ingredientes, limitar texto

**Decisión**: Eliminar el bloque de ingredientes (líneas 152-156) del `ProductCard`. El nombre ya usa `line-clamp-1` y la descripción `line-clamp-2` — se mantienen.

**Alternativa considerada**: Truncar ingredientes con `line-clamp-1`. Se descarta porque en una card compacta los ingredientes agregan ruido visual sin valor informativo (el detalle completo está en el modal).

### 3. Navbar: Eliminar "Mi Perfil" texto

**Decisión**: Eliminar el `<button>` de "Mi Perfil" (líneas 240-248 de `Header.tsx`) del nav desktop. El icono de persona (líneas 306-327) es suficiente y ya existe como acceso único al perfil.

**Mobile**: El menú mobile conserva el link "Mi Perfil" (texto) porque no hay icono en el drawer.

### 4. Refetch post-pedido

**Decisión**: Agregar un `useEffect` en `OrderDetailPage.tsx` que invalide la query `['orders', 'list']` cuando el componente se monta con `?new=true`.

**Alternativa considerada**: Invalidar desde CheckoutPage o PaymentReturnPage. Se descarta porque `OrderDetailPage` es el punto común por donde pasan todos los flujos (MP y directo), garantizando que la invalidación ocurra siempre.

**Query key a invalidar**: `queryKeys.orders.list()` → `['orders', 'list']`
**Import**: `useQueryClient` desde `@tanstack/react-query`

### 5. Filtro por período en Mis Pedidos

**Decisión**: Agregar un parámetro `periodo` al endpoint `GET /pedidos/` con valores predefinidos. El frontend calcula la fecha y la envía. El backend filtra con una condición SQL `created_at >= fecha_desde`.

**Valores del período**:

| Valor Frontend | Etiqueta | Rango |
|---|---|---|
| `last_week` | Última semana | 7 días atrás |
| `last_month` | Último mes | 30 días atrás |
| `last_3_months` | Últimos 3 meses | 90 días atrás |
| `all` | Todas | Sin filtro (default) |

**Backend**: El router acepta `periodo: Optional[str]`. El service convierte el string a una fecha `datetime` usando la fecha actual menos el delta. El repository agrega `Order.created_at >= desde` a la query.

**Frontend**: Se agregan pills de período similares a los de status en `OrdersPage.tsx`. El hook `useOrdersList` propaga el valor a la API. Cada cambio de período resetea la paginación a página 1.

## Risks / Trade-offs

- [**Riesgo**] La invalidación en `OrderDetailPage` podría causar un refetch innecesario si el usuario ya tiene datos frescos. → **Mitigación**: TanStack Query solo refetchea si los datos están stale, y `staleTime` es de 5 min, así que no hay impacto perceptible.
- [**Riesgo**] El filtro por período en backend usa fechas fijas (no timezone-aware). → **Mitigación**: Se usa `datetime.utcnow()` y la columna `created_at` almacena UTC consistente. No se requiere timezone por ahora.
- [**Trade-off**] El filtro por período es client-calculated (no server-side dates). Si el usuario viaja entre husos, las fechas podrían diferir. Aceptable para MVP.
