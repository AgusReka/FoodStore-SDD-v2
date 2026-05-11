## Why

El roadmap actual fragmenta la experiencia del cliente (catálogo, carrito, checkout, pedidos) en 3 fases distintas (Fase 4, 5 y 6), lo que retrasa la entrega de un MVP funcional para el usuario final. La UI de cliente es el core del negocio — sin ella, la app solo tiene admin CRUDs. Reorganizamos las fases para consolidar toda la experiencia del cliente en una sola fase, entregando valor real más rápido.

## What Changes

### Reorganización de Fases

**Fase 4 actual** (`addresses-crud` + `cart-frontend`) se transforma en una **Fase 4 — Customer Experience** más amplia:

| Change | Propósito |
|--------|-----------|
| `customer-catalog` | HomePage con grilla de productos, filtros por categoría, búsqueda, cards de producto |
| `customer-cart-checkout` | CartPage completo + CheckoutPage con selección de dirección y resumen de pedido |
| `customer-orders` | OrdersPage con historial de pedidos, detalle y timeline de estados |

**Fase 5 actual** (`orders-create` + `orders-state-machine` + `mercadopago-integration`) se reestructura:

| Change | Propósito |
|--------|-----------|
| `mercadopago-integration` | Integración de pagos con MercadoPago (más liviana al tener el checkout listo) |
| `orders-state-machine` | FSM completa con transiciones desde admin y frontend |
| `admin-dashboard` | Dashboard con KPIs, gráficos (recharts), gestión de usuarios y pedidos |

**Fase 6 actual** (`admin-panel` + `client-profile` + `ui-global`) se reestructura:

| Change | Propósito |
|--------|-----------|
| `addresses-ui` | CRUD de direcciones desde el perfil de usuario (backend ya existe, solo frontend) |
| `ui-global` | Toasts, skeleton loaders, estados vacíos, modales de confirmación, responsive polish |

### Cambios al Diagrama de Dependencias

```
products-crud (F3)
    │
customer-catalog (F4)
    │
    ├── customer-cart-checkout (F4)
    │       │
    │       ├── customer-orders (F4)
    │       ├── mercadopago-integration (F5)
    │       └── orders-state-machine (F5)
    │               │
    │               └── admin-dashboard (F5)
    │
addresses-ui (F6) ← se mueve a perfil, no bloquea checkout
    │
ui-global (F6)
```

### Cambios Específicos al CHANGES.md

- Reemplazar tabla de FASE 4 con los nuevos 3 cambios
- Reemplazar tabla de FASE 5: sacar `orders-create` (se absorbe en `customer-cart-checkout`), mantener `orders-state-machine` y `mercadopago-integration`, agregar `admin-dashboard`
- Reemplazar tabla de FASE 6: sacar `admin-panel` y `client-profile`, mantener `ui-global`, agregar `addresses-ui`
- Actualizar diagrama de dependencias
- Actualizar tabla resumen ejecutivo
- Actualizar tabla de épicas cubiertas
- Actualizar skills recomendadas

## Capabilities

### New Capabilities
- `customer-catalog`: Catálogo público de productos con grilla, filtros por categoría, búsqueda, y cards de producto con indicadores de stock
- `customer-cart-checkout`: Flujo completo de carrito y checkout con selección de dirección, resumen de pedido y creación del pedido
- `customer-orders`: Visualización de historial de pedidos, detalle del pedido y timeline de estados para el cliente

### Modified Capabilities
- `product-catalog`: Se expande para incluir el frontend público de visualización de productos (antes era solo backend + admin CRUD)
- `order-processing`: Se simplifica al absorber la creación de pedidos dentro del checkout del cliente
- `address-management`: Pasa de ser un change independiente a integrarse en el checkout y perfil de usuario
- `admin-panel`: Se renombra y enfoca específicamente en dashboard con métricas, gestión de usuarios y gestión de pedidos
- `payment-handling`: Dependencia ahora apunta a customer-cart-checkout en lugar de orders-create

## Impact

- **Frontend**: Se crearán/reemplazarán 3 páginas clave (HomePage como catálogo, CartPage, CheckoutPage, OrdersPage) y se completarán los placeholders actuales
- **Backend**: Sin cambios mayores — los módulos ya existen (productos, direcciones, pedidos, pagos). Posibles ajustes menores en endpoints de pedidos para soportar el flujo de checkout
- **Documentación**: Actualización completa de `docs/CHANGES.md` con la nueva estructura de fases
- **Dependencias**: Se simplifica el grafo de dependencias al consolidar cambios
