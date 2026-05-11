## Why

El sistema actual no tiene manejo de stock. `check_stock()` solo verifica `is_available`, los pedidos no descuentan inventario al confirmarse, y no hay forma de saber si un producto se puede preparar con los ingredientes disponibles. Sin stock management, el negocio puede vender productos que no puede entregar.

## What Changes

- **Modelo híbrido de stock**: productos compuestos (con ingredientes) calculan stock desde sus ingredientes; productos simples (ej: gaseosa) usan `stock_cantidad` directo en Product
- Agregar `stock_actual` y `stock_minimo` al modelo Ingredient
- Agregar `stock_cantidad` opcional al modelo Product
- `check_stock()` real que valida según el tipo de producto
- Descuento atómico de stock al confirmar pedido (estado `confirmado`)
- Liberación de stock al cancelar pedido (desde `pendiente` o `confirmado`)
- UI en admin para gestionar stock de ingredientes y productos simples
- Indicadores de stock en frontend (ProductCard, Cart)
- Alerta visual cuando un ingrediente está por debajo del stock mínimo

## Capabilities

### New Capabilities

- `stock-management`: Sistema híbrido de gestión de stock que cubre productos compuestos (stock calculado desde ingredientes) y productos simples (stock directo), incluyendo descuento/liberación atómica en transiciones de pedidos.

### Modified Capabilities

- `product-catalog`: Se agrega `stock_cantidad` (opcional, solo para productos sin ingredientes) al modelo Product. Se actualiza el escenario de creación y listado para incluir stock.
- `ingredient-management`: Se agregan `stock_actual` y `stock_minimo` al modelo Ingredient. Se actualizan escenarios de CRUD y listado.
- `order-processing`: Se modifica `check_stock` para que valide stock real según tipo de producto. Se agrega descuento de stock al pasar a `confirmado`. Se agrega liberación de stock al cancelar. Se actualizan escenarios de creación y transiciones.
- `admin-products`: Se agrega campo de stock en formulario de creación/edición (condicional: visible solo si el producto no tiene ingredientes). Se muestra stock disponible en tabla de listado.
- `admin-panel`: Se agrega vista de alertas de stock bajo (ingredientes por debajo de `stock_minimo`).

## Impact

- **Backend**: Modelos Product e Ingredient (nuevos campos), repositorio de productos (check_stock real), servicio de pedidos (descuento/liberación atómico), migración Alembic, nuevas rutas de consulta de stock
- **Frontend**: Admin ProductForm (campo stock condicional), Admin IngredientForm (campos stock_actual, stock_minimo), Admin stock alerts view, ProductCard (badge de stock), CartDrawer (validación pre-submit)
- **Base de datos**: Migración con `ALTER TABLE` para agregar columnas a `productos` e `ingredientes`
- **Dependencias**: Ninguna nueva
