## 1. Importar nuevos modelos

- [x] 1.1 Agregar imports de `Ingredient` y `ProductIngredient` desde `backend.modules.ingredientes.model`

## 2. Crear función seed_ingredients

- [x] 2.1 Definir data de ingredientes (15 ingredientes con nombre, descripción, unidad_medida, stock_actual, stock_minimo)
- [x] 2.2 Implementar `seed_ingredients(session)` usando `get_or_create` y retornando dict nombre→ingredient

## 3. Actualizar seed_products con stock_cantidad

- [x] 3.1 Agregar `stock_cantidad` a productos simples (bebidas: Coca Cola, Agua, Jugo)
- [x] 3.2 Agregar `stock_cantidad` a productos simples (postres: Flan, Helado, Torta)
- [x] 3.3 Agregar `stock_cantidad` a productos simples (ensaladas: Caesar, Griega, Bowl)
- [x] 3.4 Retornar dict nombre→product desde seed_products

## 4. Crear función seed_product_ingredients

- [x] 4.1 Definir relaciones producto→ingredientes para cada producto compuesto
- [x] 4.2 Implementar `seed_product_ingredients(session, products, ingredients)` que cree registros en `producto_ingredientes`

## 5. Reordenar main()

- [x] 5.1 Agregar `seed_ingredients()` antes de `seed_products()` en el flujo de main
- [x] 5.2 Pasar ingredientes a `seed_products()` para referencia
- [x] 5.3 Agregar `seed_product_ingredients()` después de `seed_products()`
- [x] 5.4 Asegurar commits intermedios correctos

## 6. Verificar

- [x] 6.1 Ejecutar seed y confirmar que crea todas las entidades sin errores
- [x] 6.2 Ejecutar seed dos veces y confirmar idempotencia
- [x] 6.3 Verificar que productos simples tengan stock_cantidad y productos compuestos tengan ingredientes
