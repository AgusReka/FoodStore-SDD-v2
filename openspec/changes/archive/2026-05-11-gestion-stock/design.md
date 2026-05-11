## Context

FoodStore no tiene manejo de stock. El método `check_stock()` en `ProductRepository` solo verifica `is_available=True`, ignorando cantidades. Los pedidos no descuentan inventario al confirmarse ni lo liberan al cancelarse.

Productos se dividen en dos categorías naturales:
- **Compuestos**: tienen ingredientes (pizza, hamburguesa) — su disponibilidad depende del stock de insumos
- **Simples**: no tienen ingredientes (gaseosa, agua) — su disponibilidad es directa

## Goals / Non-Goals

**Goals:**
- Sistema híbrido de stock: productos compuestos calculan stock desde ingredientes; productos simples usan stock directo
- `check_stock()` real con validación según tipo de producto
- Descuento atómico de stock al confirmar pedido (`pendiente → confirmado`)
- Liberación de stock al cancelar pedido (`pendiente/cancelado → cancelado`)
- UI en admin para gestionar stock de ingredientes y productos simples
- Indicadores visuales de stock en frontend (ProductCard, Cart)
- Migración Alembic con datos existentes preservados

**Non-Goals:**
- Sistema de reserva de stock con timeout (no se reserva stock en `pendiente`, solo se verifica disponibilidad)
- Historial de movimientos de stock (log de auditoría queda para future change)
- Predicción o reorden automática de insumos
- Stock por variante o por sucursal (single-location)
- Role `STOCK` separado (lo gestiona el admin existente)

## Decisions

### D1: Stock nulo vs stock cero para productos sin stock directo
- **Opción**: `stock_cantidad` como `Optional[int]` con default `None`
- **Razón**: `None` significa "este producto no tiene stock directo, se calcula por ingredientes". Cero (0) significaría "no hay stock" que es semánticamente diferente. Esto permite distinguir "no aplica" de "agotado".
- **Alternativa descartada**: Dos tablas separadas para productos simples y compuestos (overengineering).

### D2: Descuento de stock en CONFIRMADO, no en PENDIENTE
- **Opción**: El stock se descuenta al pasar de `pendiente → confirmado`
- **Razón**: En `pendiente` el pedido puede no pagarse aún. Descontar en pendiente requeriría reservas con timeout o liberación manual. La confirmación es el punto donde el pedido es definitivo.
- **Trade-off**: Entre la creación y la confirmación, otros pedidos pueden llevarse el stock. Es aceptable porque la ventana es corta (minutos/horas).

### D3: SELECT ... FOR UPDATE para operaciones de stock
- **Opción**: Usar `SELECT ... FOR UPDATE` dentro de una transacción para el descuento/liberación de stock
- **Razón**: Prevenir race conditions cuando dos pedidos se confirman simultáneamente. Sin locking, dos transacciones podrían leer el mismo stock y descontar por encima de cero.
- **Implementación**: `with session.begin_nested():` + `session.execute(stmt.with_for_update())`

### D4: stock_actual y stock_minimo como DECIMAL en Ingredient
- **Opción**: `Numeric(10, 2)` para coincidir con `ProductIngredient.cantidad`
- **Razón**: Los ingredientes se miden en kg, ml, unidades — necesitan precisión decimal para cálculos consistentes con `cantidad * items_pedidos`
- **Alternativa descartada**: Enteros (no permiten medios kg, 0.5l, etc.)

### D5: Validación doble (al crear + al confirmar)
- **Opción**: Se valida stock al crear el pedido (rápido, para UX) y se re-valida al confirmar (con FOR UPDATE, definitivo)
- **Razón**: La validación en creación es una cortesía para el usuario. La validación en confirmación es la verdadera guarda atómica.

## Data Model

### Product (tabla: `productos`)
```
+ stock_cantidad: Integer | None   ← None = calculado por ingredientes
+ stock_minimo: Integer | None      ← alerta si stock directo < esto (nullable por ahora)
```

### Ingredient (tabla: `ingredientes`)
```
+ stock_actual: Numeric(10, 2)      ← cantidad disponible hoy (default 0)
+ stock_minimo: Numeric(10, 2)      ← alerta si stock_actual < esto (default 0)
```

### Índices nuevos
- `ix_ingredientes_stock_actual` en `ingredientes.stock_actual` (para queries de alertas)

## API Changes

### Schemas de Producto
```python
# ProductCreate — se agrega
stock_cantidad: int | None = None   # None = usa ingredientes

# ProductUpdate — se agrega
stock_cantidad: int | None = None   # None = no cambia; 0 = agotado

# ProductRead — se agrega
stock_cantidad: int | None = None
stock_disponible: int | None = None  # calculado: stock directo o min(ingredientes / cantidad)
```

### Schemas de Ingrediente
```python
# IngredientCreate — se agrega
stock_actual: float = 0
stock_minimo: float = 0

# IngredientUpdate — se agrega
stock_actual: float | None = None
stock_minimo: float | None = None

# IngredientRead — se agrega
stock_actual: float
stock_minimo: float
stock_suficiente: bool  # calculado: stock_actual >= stock_minimo
```

### Endpoints nuevos
```
GET /api/v1/productos/{id}/stock    → stock detallado del producto
GET /api/v1/admin/stock-alerts      → ingredientes con stock < stock_minimo (admin only)
```

### Endpoints modificados
```
POST /api/v1/pedidos                → ahora valida stock real
PATCH /api/v1/pedidos/{id}/estado   → descuenta/libera stock según transición
```

## Stock Flows

### Creación de pedido (validación)
```
1. Por cada item:
   a. Cargar producto con ingredientes
   b. Si tiene ingredientes → verificar stock_actual de cada ingrediente >= cantidad * items_pedidos
   c. Si no tiene ingredientes → verificar stock_cantidad >= cantidad
   d. Si algún check falla → 409 Conflict
2. Si todos pasan → crear Order en PENDIENTE
```

### Confirmación de pedido (descuento atómico)
```
1. Iniciar transacción con FOR UPDATE en las filas de stock
2. Re-validar stock (pudo cambiar desde la creación)
3. Por cada item:
   a. Si tiene ingredientes → descontar stock_actual de cada ingrediente
   b. Si no → descontar stock_cantidad
4. Si stock insuficiente → error (transacción rollback)
5. Actualizar estado a CONFIRMADO
6. Commit
```

### Cancelación de pedido (liberación)
```
(Solo si el pedido está en CONFIRMADO — si está PENDIENTE no hubo descuento)
1. Iniciar transacción con FOR UPDATE
2. Por cada item:
   a. Si tiene ingredientes → sumar stock_actual
   b. Si no → sumar stock_cantidad
3. Actualizar estado a CANCELADO
4. Commit
```

### Diagrama de flujo
```
┌──────────────┐
│  PENDIENTE   │ ← check_stock() (validación liviana)
└──────┬───────┘
       │
  ┌────┴────┐
  │ confirm │          ┌──────────────┐
  └────┬────┘          │  CANCELADO   │
       │ descuenta     │ (libera stock│
       ▼               │  si aplica)  │
┌──────────────┐       └──────▲───────┘
│  CONFIRMADO  │──────────────┘
│ (stock OK)   │   cancela
└──────┬───────┘
       │
       ▼
  (continúa flujo normal)
```

## Frontend Changes

### Admin ProductForm
- Si el producto NO tiene ingredientes → mostrar campo `stock_cantidad`
- Si el producto SÍ tiene ingredientes → mostrar `stock_disponible` calculado (solo lectura)
- El formulario decide dinámicamiento según la lista de ingredientes

### Admin IngredientForm
- Agregar campos `stock_actual` y `stock_minimo`
- Mostrar indicador visual si `stock_actual < stock_minimo`

### Admin StockAlerts (nueva vista en sidebar)
- Tabla de ingredientes donde `stock_actual < stock_minimo`
- Ordenado por `(stock_actual / stock_minimo)` ascendente (más crítico primero)
- Botón para ir directo a editar el ingrediente

### ProductCard (frontend público)
- Badge verde "En stock" / rojo "Sin stock"
- Para productos compuestos, badge basado en cálculo de ingredientes

### CartDrawer
- Antes de submit, llamar a endpoint de validación
- Mostrar items con problemas de stock

## Risks & Trade-offs

| Risk | Mitigation |
|------|------------|
| **Race condition**: dos pedidos se confirman simultáneamente y descuentan del mismo ingrediente | `SELECT ... FOR UPDATE` en la transacción de confirmación — el segundo espera al primero |
| **Stock negativo**: si un ingrediente se agota entre la creación y confirmación de múltiples pedidos | La re-validación en confirmación previene stock negativo; el pedido falla con error claro |
| **Performance**: calcular stock disponible para cada producto en listados requiere joins | Agregar `stock_disponible` como propiedad calculada on-demand, o cachear en una columna separada si es necesario |
| **Admin se olvida de setear stock**: ingredientes nuevos arrancan con stock_actual=0 | Mostrar advertencia en admin si un producto tiene ingredientes con stock_actual=0 |
| **Migración de datos existentes**: productos actuales no tienen stock_cantidad | Default NULL para productos existentes → se comportan como compuestos (o no disponibles hasta que se configure stock) |
