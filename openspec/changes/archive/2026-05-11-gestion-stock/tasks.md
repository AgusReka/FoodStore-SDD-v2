## 1. Migración y Modelos

- [x] 1.1 Agregar `stock_cantidad` (Integer, nullable=True) y `stock_minimo` (Integer, nullable=True) al modelo `Product`
- [x] 1.2 Agregar `stock_actual` (Numeric(10,2), default=0) y `stock_minimo` (Numeric(10,2), default=0) al modelo `Ingredient`
- [x] 1.3 Crear migración Alembic con `ALTER TABLE` para ambas tablas + índice `ix_ingredientes_stock_actual`
- [x] 1.4 Actualizar schemas de Product (`ProductCreate`, `ProductUpdate`, `ProductRead` con `stock_cantidad` y `stock_disponible`)
- [x] 1.5 Actualizar schemas de Ingredient (`IngredientCreate`, `IngredientUpdate`, `IngredientRead` con `stock_actual`, `stock_minimo`, `stock_suficiente`)
- [x] 1.6 Actualizar tipos frontend (`entities/product/index.ts` e `entities/ingredient/index.ts` con campos de stock)

## 2. Lógica de Stock (Backend)

- [x] 2.1 Implementar `check_stock()` real en `ProductRepository`: si tiene ingredientes → validar stock_actual de cada uno; si no → validar stock_cantidad
- [x] 2.2 Agregar método `calculate_available_stock(product)` que retorna unidades disponibles (mínimo de ingredientes o stock_cantidad)
- [x] 2.3 Agregar método `deduct_stock(order)` en `OrderService`: descuenta ingredientes o stock_cantidad por cada item (atómico, FOR UPDATE)
- [x] 2.4 Agregar método `restore_stock(order)` en `OrderService`: suma stock revertido al cancelar (atómico, FOR UPDATE)
- [x] 2.5 Modificar `update_status()` para llamar `deduct_stock` en transición a CONFIRMADO y `restore_stock` en transición a CANCELADO (desde CONFIRMADO)
- [x] 2.6 Agregar re-validación de stock dentro de la transacción de confirmación (doble check atómico)
- [x] 2.7 Crear endpoint `GET /api/v1/productos/{id}/stock` para consultar stock detallado
- [x] 2.8 Crear endpoint `GET /api/v1/admin/stock-alerts` para alertas de stock bajo

## 3. Frontend Admin — Gestión de Stock

- [x] 3.1 Actualizar `AdminIngredientForm` con campos `stock_actual` y `stock_minimo`
- [x] 3.2 Actualizar tabla de ingredientes (columnas stock_actual, stock_minimo, indicador stock_suficiente)
- [x] 3.3 Actualizar `AdminProductForm` con campo `stock_cantidad` condicional (visible solo sin ingredientes)
- [x] 3.4 Agregar lógica dinámica: al agregar/quitar ingredientes, el campo stock se oculta/muestra
- [x] 3.5 Agregar columna "Stock" en tabla de productos con indicador visual (color rojo si stock ≤ 5)
- [x] 3.6 Mostrar "N uds. (calculado)" para productos con ingredientes y "N uds. (directo)" para simples

## 4. Frontend Admin — Alertas de Stock

- [x] 4.1 Crear componente `StockAlertsPage` con tabla de ingredientes donde stock_actual < stock_minimo
- [x] 4.2 Calcular severidad: `(stock_minimo - stock_actual) / stock_minimo` para ordenar
- [x] 4.3 Agregar enlace "Alertas de Stock" en sidebar del admin con badge de notificación
- [x] 4.4 Agregar estado vacío: "Todos los ingredientes tienen stock suficiente"
- [x] 4.5 Botón "Reponer" en cada alerta que navega al edit del ingrediente

## 5. Frontend Público — Indicadores de Stock

- [x] 5.1 Implementar `ProductCard` con badge verde "En stock" / rojo "Sin stock"
- [x] 5.2 Implementar `ProductDetail` con indicador de stock disponible
- [x] 5.3 Agregar validación de stock en `CartDrawer` antes de submit (llamar a endpoint de validación)
- [x] 5.4 Mostrar mensaje de error en Cart si un producto se quedó sin stock desde que se agregó
