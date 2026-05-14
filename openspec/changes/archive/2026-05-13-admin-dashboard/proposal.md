## Why

El admin panel actual tiene un Dashboard placeholder sin métricas ni KPIs, y no existe una interfaz para gestionar pedidos desde el rol admin. Los admins necesitan un dashboard con indicadores clave del negocio (órdenes, ingresos, productos populares) y la capacidad de listar, ver detalle y cambiar el estado de los pedidos de todos los usuarios. El backend ya expone los endpoints necesarios (`GET /admin/pedidos`, `PATCH /pedidos/{id}/status`, `GET /pedidos/{id}/history`); falta la UI de admin.

## What Changes

- **Admin Dashboard con KPIs**: Reemplazar el placeholder actual por cards de métricas (órdenes hoy/semana/mes, ingresos, pedidos por estado, productos más vendidos) usando Recharts para gráficos.
- **Admin Orders List**: Nueva página `/admin/orders` con tabla paginada de TODOS los pedidos, filtros por estado y fechas, y acciones rápidas (ver detalle, cambiar estado).
- **Admin Order Detail**: Nueva página `/admin/orders/:id` con información completa del pedido (cliente, items, timeline de estados, historial de cambios, pago).
- **Admin Order Status Management**: Interfaz para cambiar el estado del pedido desde admin con selector de estado válido y campo opcional de razón.
- **Sidebar Navigation**: Agregar link "Pedidos" al sidebar del admin con indicador de pedidos pendientes.
- **Route Configuration**: Registrar las nuevas rutas admin en el router de la aplicación.

## Capabilities

### New Capabilities
- `admin-dashboard-metrics`: Dashboard administrativo con KPIs, gráficos de pedidos/ingresos, y cards de resumen — reemplaza el placeholder actual de AdminDashboard.tsx

### Modified Capabilities
- `admin-panel`: Se agregan requirements de frontend para la gestión de pedidos desde el panel admin: listado paginado con filtros, detalle de pedido, y cambio de estado con timeline
- `frontend-routing`: Se agregan las rutas `/admin/orders` y `/admin/orders/:id` bajo el layout admin
- `admin-layout`: Se agrega "Pedidos" al sidebar de navegación admin con badge de pedidos pendientes (status `pendiente`)

## Impact

- **Frontend only**: Sin cambios en backend, base de datos, APIs, o dependencias externas
- **Nuevo feature**: `frontend/src/features/admin/orders/` con componentes, hooks, pages
- **Modificado**: `AdminDashboard.tsx` se reemplaza completamente con KPIs y gráficos
- **Modificado**: `AdminPage.tsx` se agrega "Pedidos" al navItems
- **Modificado**: `App.tsx` se agregan rutas `/admin/orders/*`
- **Dependencia nueva**: `recharts` para gráficos del dashboard
