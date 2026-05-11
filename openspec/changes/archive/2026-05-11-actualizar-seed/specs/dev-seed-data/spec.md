## ADDED Requirements

### Requirement: Development Seed Data
El sistema SHALL proveer un script de seed (`backend/db/seed.py`) que inicialice la base de datos con datos representativos de desarrollo para todos los modelos del sistema.

#### Scenario: Seed crea todas las entidades
- **WHEN** se ejecuta `python -m db.seed` sobre una base de datos vacía con migraciones aplicadas
- **THEN** se SHALL crear: usuario admin, usuario cliente de prueba, categorías, ingredientes con stock, productos con stock/ingredientes, dirección, y una orden de ejemplo con items y pago

#### Scenario: Seed es idempotente
- **WHEN** se ejecuta `python -m db.seed` dos veces consecutivas
- **THEN** no SHALL crear registros duplicados
- **AND** el script SHALL reportar qué registros ya existían

#### Scenario: Productos simples tienen stock_cantidad
- **WHEN** el seed crea un producto simple (ej: "Coca Cola 500ml")
- **THEN** `stock_cantidad` SHALL tener un valor entero positivo
- **AND** el producto NO SHALL tener ingredientes asociados

#### Scenario: Productos compuestos tienen ingredientes
- **WHEN** el seed crea un producto compuesto (ej: "Hamburguesa Clásica")
- **THEN** el producto SHALL tener ingredientes asociados con cantidades
- **AND** `stock_cantidad` SHALL ser NULL
- **AND** `stock_disponible` SHALL calcularse desde los ingredientes

#### Scenario: Ingredientes tienen stock inicial
- **WHEN** el seed ejecuta `seed_ingredients()`
- **THEN** cada ingrediente SHALL tener `stock_actual` y `stock_minimo` con valores positivos

#### Scenario: Seed mantiene datos existentes
- **WHEN** se ejecuta el seed sobre una base con datos parciales
- **THEN** los registros existentes NO SHALL ser modificados ni duplicados
- **AND** solo se SHALL agregar los registros faltantes
