## Context

El archivo `backend/db/seed.py` fue creado antes de la implementación de los módulos `ingredientes` y `gestion-stock`. Actualmente:

- El modelo `Product` tiene campos `stock_cantidad` (Integer, nullable) y `stock_minimo` (Integer, nullable)
- Existe el modelo `Ingredient` con `stock_actual` (Numeric), `stock_minimo` (Numeric) y `unidad_medida`
- Existe el modelo `ProductIngredient` que vincula productos con ingredientes (`product_id`, `ingredient_id`, `cantidad`)
- El sistema de stock es híbrido: productos sin ingredientes usan `stock_cantidad` directo; productos con ingredientes calculan `stock_disponible` desde el stock de ingredientes
- El seed actual no contempla ninguno de estos cambios

## Goals / Non-Goals

**Goals:**
- Seedear todos los modelos actuales con datos representativos de desarrollo
- Soportar el sistema híbrido de stock (productos simples con stock_cantidad, productos compuestos con ingredientes)
- Mantener idempotencia total (ejecución múltiple no crea duplicados)
- Preservar todos los datos existentes que ya funciona el seed (admin, usuario, categorías, dirección, órdenes)

**Non-Goals:**
- No cambiar modelos, schemas, endpoints ni repositorios
- No modificar la lógica de negocio
- No agregar dependencias externas

## Decisions

### D1: Enfoque híbrido de seeding
| Tipo de producto | Ejemplo | Stock |
|-----------------|---------|-------|
| Simple | Coca Cola, Agua, Jugo | `stock_cantidad` directo |
| Compuesto | Hamburguesa, Pizza, Pastas | Ingredientes con cantidades, `stock_cantidad` = NULL |

**Alternativa considerada**: Hacer todos los productos con ingredientes. Descartado porque las bebidas no tienen ingredientes en el modelo actual y sería forzar datos inconsistentes.

### D2: Ingredientes realistas con unidades de medida
Se usarán unidades del mundo real (unidades, gramos, ml) para que el cálculo de stock sea significativo:
- Pan: "unidades"
- Carne: "gramos"
- Queso: "gramos"
- Bebidas en stock de ingrediente no aplica (son productos simples)

### D3: Stock inicial suficiente
Los ingredientes se crearán con stock suficiente para al menos 20-50 unidades de cada producto compuesto, para que `stock_disponible` dé valores positivos visibles.

### D4: Mantener patrón `get_or_create`
Se reutiliza la función `get_or_create()` existente para mantener la idempotencia. Cada función de seed retorna las entidades creadas para que las funciones siguientes puedan referenciarlas.

## Riesgos / Trade-offs

| Riesgo | Mitigación |
|--------|------------|
| Los nombres/units de ingredientes pueden cambiar en el modelo | El seed es un archivo único, fácil de actualizar |
| Stock estático no refleja cambios de inventario real | Es un seed de desarrollo, no un sistema de producción |
| Si se agregan nuevos productos compuestos, hay que actualizar relaciones | Separar datos en estructuras claras para facilitar mantenimiento |
| Error si algún ingrediente referenciado no existe | Usar diccionarios de retorno de `seed_ingredients()` para garantizar referencias válidas |

## Estructura de datos propuesta

### Ingredientes (15 aprox.)
| Ingrediente | Unidad | Stock Actual | Stock Mínimo |
|------------|--------|-------------|--------------|
| Pan de hamburguesa | unidades | 50 | 10 |
| Carne picada | gramos | 5000 | 1000 |
| Queso mozzarella | gramos | 3000 | 500 |
| Lechuga | unidades | 30 | 10 |
| Tomate | unidades | 40 | 10 |
| Masa de pizza | unidades | 20 | 5 |
| Albahaca | gramos | 200 | 50 |
| Jamón | gramos | 2000 | 500 |
| Huevo | unidades | 60 | 20 |
| Papas | gramos | 10000 | 2000 |
| Cebolla | unidades | 30 | 10 |
| Morrones | unidades | 20 | 5 |
| Pasta seca | gramos | 5000 | 1000 |
| Ricotta | gramos | 2000 | 500 |
| Dulce de leche | gramos | 2000 | 500 |

### Asignaciones producto → ingredientes
| Producto | Ingredientes |
|----------|-------------|
| Hamburguesa Clásica | Pan(2), Carne(200g), Queso(50g), Lechuga(1), Tomate(2) |
| Lomito Completo | Pan(2), Carne(250g), Jamón(100g), Queso(50g), Huevo(2), Papas(200g) |
| Papas Fritas Grandes | Papas(500g) |
| Pizza Margarita | Masa(1), Queso(200g), Tomate(3), Albahaca(10g) |
| Pizza Napolitana | Masa(1), Queso(200g), Tomate(3), Anchoas — sin anchoas en seed, usar equivalente |
| Pizza Especial | Masa(1), Queso(200g), Jamón(100g), Morrones(2) |
| Spaghetti Bolognese | Pasta(400g), Carne(300g), Tomate(3) |
| Ravioles de Ricotta | Pasta(400g), Ricotta(200g) |
| Lasagna Clásica | Pasta(400g), Carne(300g), Queso(150g) |
| Flan Casero | — (simple, stock_cantidad) |
| Helado 2 bochas | — (simple, stock_cantidad) |
| Torta de Chocolate | — (simple, stock_cantidad) |
| Ensalada Caesar | — (simple, stock_cantidad) |
| Ensalada Griega | — (simple, stock_cantidad) |
| Bowl Veggie | — (simple, stock_cantidad) |
