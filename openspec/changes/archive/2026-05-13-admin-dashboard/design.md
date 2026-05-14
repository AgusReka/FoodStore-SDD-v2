## Context

El admin panel actual tiene:
- **AdminDashboard.tsx**: Placeholder con texto de bienvenida, sin métricas ni datos reales
- **AdminPage.tsx**: Sidebar con 5 items (Dashboard, Categorías, Ingredientes, Productos, Alertas de Stock). Sin "Pedidos"
- **App.tsx**: Admin routes anidadas bajo `AdminPage`, sin ruta de órdenes
- **Backend**: Endpoints admin listos (`GET /admin/pedidos`, `PATCH /pedidos/{id}/status`, `GET /pedidos/{id}/history`)
- **Feature structure**: `features/admin/categories/`, `features/admin/ingredients/`, `features/admin/products/` — patrón establecido

El sidebar tiene `<NavLink>` con estilo `isActive` y badge de stock alerts. No hay Recharts instalado. No hay feature de órdenes admin.

## Goals / Non-Goals

**Goals:**
- Reemplazar AdminDashboard.tsx con KPIs reales + gráficos (Recharts)
- Crear `features/admin/orders/` con listado, detalle y cambio de estado
- Agregar "Pedidos" al sidebar admin con badge de pendientes
- Registrar rutas `/admin/orders` y `/admin/orders/:id`

**Non-Goals:**
- Backend: no se toca (endpoints ya existen)
- Integración con MercadoPago desde admin
- Dashboard con datos en tiempo real (WebSockets)
- Customer orders management desde admin
- Exportación de datos (CSV/Excel)

## Decisions

### Decisión 1: Recharts para gráficos del dashboard

**Elección**: Usar Recharts como librería de gráficos.

**Razón**: Es la librería más popular para React, con componentes declarativos (PieChart, BarChart, Tooltip) que se integran naturalmente con el patrón de componentes de React. No necesita wrappers especiales y está activamente mantenida.

**Alternativas rechazadas:**
- Chart.js + react-chartjs-2: Más verboso, configuración menos declarativa
- Nivo: Gran librería pero más compleja para gráficos simples
- Build desde cero: Innecesario para gráficos estándar (pie, bar)

### Decisión 2: Feature-First structure para admin orders

**Elección**: Seguir el mismo patrón que `features/admin/categories/`, `features/admin/ingredients/`, `features/admin/products/`.

**Razón**: Consistencia con la arquitectura existente. Cada feature admin tiene:
```
features/admin/orders/
├── index.tsx          ← page component export
├── components/        ← sub-componentes
│   ├── OrdersTable.tsx
│   ├── OrderStatusBadge.tsx
│   ├── OrderStatusModal.tsx
│   └── OrderDetailInfo.tsx
└── hooks/
    └── useAdminOrders.ts
```

### Decisión 3: Datos del dashboard desde endpoints existentes

**Elección**: Calcular KPIs y métricas desde el endpoint `GET /admin/pedidos` con filtros, no crear endpoints específicos de dashboard.

**Razón**: El endpoint de admin/pedidos ya soporta paginación y filtros. Para KPIs como "órdenes hoy", se usa `?desde=<inicio_hoy>&hasta=<ahora>` y se calcula el count client-side. Esto evita crear endpoints nuevos. Si en el futuro el dashboard necesita mejor rendimiento, se puede agregar un endpoint `/admin/dashboard/metrics`.

**Cálculos client-side:**
- Órdenes Hoy: `GET /admin/pedidos?desde=today&hasta=now` → `data.total`
- Órdenes Pendientes: `GET /admin/pedidos?estado=pendiente&limit=1` → `data.total`
- Ingresos: `GET /admin/pedidos?desde=today&estado=entregado` → sum de totales
- Productos Vendidos: `GET /admin/pedidos?desde=today&estado=entregado` → sum de items
- Top productos: agregar de la misma respuesta

**Optimización**: Se pueden hacer hasta 3-4 llamadas paralelas en el dashboard. Si es lento, se introduce un endpoint dedicado después.

### Decisión 4: Dashboard layouts con TailwindCSS grid

**Elección**: Usar TailwindCSS grid system responsive para el layout del dashboard.

**Razón**: El proyecto ya usa TailwindCSS v3. No se necesita una librería adicional de layout. Las cards y grids responsivos se logran con:
- `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4` para KPI cards
- `grid grid-cols-1 lg:grid-cols-2` para charts

### Decisión 5: Status change modal reutilizable

**Elección**: Crear un componente `OrderStatusModal` que recibe el estado actual y muestra las transiciones válidas.

**Razón**: Evitar duplicar lógica. El modal se usa tanto desde la tabla de listado (acción rápida) como desde el detalle. Las transiciones válidas se pueden hardcodear del lado frontend (ya están definidas en el state machine) o obtenerse de un endpoint. Para simplicidad inicial, se hardcodean sincronizadas con el backend.

### Decisión 6: Estado de pedidos pendientes como badge en sidebar

**Elección**: Query separada para contar pedidos pendientes, con refetch cada 60s (mismo patrón que stock alerts).

**Razón**: Consistencia con el badge de Alertas de Stock existente. Se agrega un `useQuery` adicional en `AdminPage.tsx` que cuenta pedidos `pendiente`. El color del badge será `amber` (ámbar/naranja) para distinguirlo del badge rojo de stock alerts.

## Risks / Trade-offs

| Riesgo | Mitigación |
|--------|------------|
| Múltiples llamadas API en dashboard (3-4 paralelas) pueden ser lentas | Optimizar con Promise.all; introducir endpoint dedicado si es necesario |
| Status transitions hardcodeadas en frontend pueden desincronizarse del backend | Documentar en el código que deben coincidir con `OrderStateMachine`; agregar comentario con referencia al enum |
| Recharts añade ~200KB al bundle | Es una dependencia justificada para el dashboard; solo afecta a la ruta admin |
| El dashboard sin WebSockets muestra datos con lag de hasta 60s | Aceptable para un dashboard admin; no requiere datos en tiempo real |

## Open Questions

- ¿Necesitamos un endpoint dedicado `/admin/dashboard/metrics` para mejor rendimiento? → Evaluar después de implementar si las llamadas paralelas son muy lentas.
- ¿Debemos mostrar tendencia (% vs ayer) en KPI cards? → Sí, se calcula comparando con el día anterior.
