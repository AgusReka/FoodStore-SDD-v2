## Why

El archivo `backend/db/seed.py` actual está desactualizado respecto a los últimos cambios del modelo de datos. Tras las implementaciones de `ingredients-crud` y `gestion-stock`, ahora existen los modelos `Ingredient` y `ProductIngredient`, y el modelo `Product` tiene campos `stock_cantidad`/`stock_minimo` con un sistema híbrido de stock. El seed actual no crea ingredientes, no asigna stock a productos simples ni vincula productos compuestos con sus ingredientes. Esto obliga a cargar datos manualmente después de cada migración limpia, dificultando el desarrollo y testing.

## What Changes

- Agregar importación de los modelos `Ingredient` y `ProductIngredient`
- Crear función `seed_ingredients()` con ingredientes realistas (pan, carne, queso, lechuga, tomate, masa, mozzarella, etc.) incluyendo `stock_actual` y `stock_minimo`
- Crear función `seed_product_ingredients()` para vincular productos compuestos con sus ingredientes y cantidades
- Agregar `stock_cantidad` a productos simples (bebidas)
- Reordenar el flujo de `main()` para que ingredientes se siembren antes que productos
- Mantener el patrón `get_or_create` para asegurar idempotencia
- Mantener los datos existentes (admin, usuario, categorías, direcciones, órdenes)

## Capabilities

### New Capabilities
- `dev-seed-data`: Script de seed de desarrollo que inicializa la base de datos con datos representativos para todos los modelos actuales del sistema

### Modified Capabilities
<!-- Ninguno — no hay cambios en contratos de API ni requerimientos de specs existentes -->

## Impact

- **Archivo modificado**: `backend/db/seed.py` (único archivo afectado)
- **Datos nuevos**: ~15 ingredientes, ~18 productos con stock/ingredientes
- **Sin impacto en API**: no cambian endpoints, schemas, ni modelos
