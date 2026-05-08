## 1. Alembic Setup

- [x] 1.1 Create `backend/alembic.ini` with async-compatible configuration pointing to `db/alembic/`
- [x] 1.2 Create `backend/db/alembic/env.py` with async support using `run_async()` and `target_metadata = Base.metadata`
- [x] 1.3 Create `backend/db/alembic/script.py.mako` migration template
- [x] 1.4 Add `alembic` to `backend/requirements.txt`

## 2. Enum Definitions

- [x] 2.1 Create shared enum classes in `backend/core/enums.py`: `UserRole`, `OrderStatus`, `PaymentMethod`, `PaymentStatus`

## 3. User & Auth Models

- [x] 3.1 Define `User` model in `backend/modules/usuarios/model.py` — id (UUID PK), email (unique), username (unique), hashed_password, nombre, apellido, telefono, avatar_url, is_active, is_verified, role (UserRole), created_at, updated_at
- [x] 3.2 Define `RefreshToken` model in `backend/modules/refreshtokens/model.py` — id (UUID PK), token (unique, indexed), user_id (FK → users), expires_at, created_at, revoked_at

## 4. Product & Category Models

- [x] 4.1 Define `Category` model in `backend/modules/categorias/model.py` — id (UUID PK), nombre (unique), descripcion, imagen_url, is_active, created_at, updated_at; with relationship to Product
- [x] 4.2 Define `Product` model in `backend/modules/productos/model.py` — id (UUID PK), nombre, descripcion, precio (Decimal), moneda, imagen_url, is_available, category_id (FK → categories), created_at, updated_at; unique constraint on (nombre, category_id)

## 5. Address & Order Models

- [x] 5.1 Define `Address` model in `backend/modules/direcciones/model.py` — id (UUID PK), user_id (FK → users), calle, numero, ciudad, codigo_postal, latitud, longitud, es_principal, created_at, updated_at
- [x] 5.2 Define `Order` model in `backend/modules/pedidos/model.py` — id (UUID PK), user_id (FK → users), address_id (FK → addresses), estado (OrderStatus), total (Decimal), moneda, created_at, updated_at; with relationship to OrderItem
- [x] 5.3 Define `OrderItem` model in `backend/modules/pedidos/model.py` — id (UUID PK), order_id (FK → orders), product_id (FK → products), cantidad, precio_unitario (Decimal), subtotal (Decimal)

## 6. Payment Model

- [x] 6.1 Define `Payment` model in `backend/modules/pagos/model.py` — id (UUID PK), order_id (FK → orders, unique), metodo (PaymentMethod), estado (PaymentStatus), monto (Decimal), moneda, mp_payment_id (nullable), created_at, updated_at

## 7. Alembic Migration

- [x] 7.1 Ensure all model modules are imported in `env.py` to register metadata for autogeneration
- [x] 7.2 Run `alembic revision --autogenerate -m "initial_schema"` to generate initial migration
- [x] 7.3 Review and verify the generated migration file (check all tables, columns, constraints, indexes)
- [x] 7.4 Apply migration with `alembic upgrade head` and verify all tables created

## 8. Seed Data

- [x] 8.1 Implement `backend/db/seed.py` with async session and idempotent creation of: admin user, test client user, product categories, sample products, and a test order
- [x] 8.2 Test seed by running `python -m db.seed` and verifying data exists

## 9. Application Integration

- [x] 9.1 Update `backend/main.py` to remove `Base.metadata.create_all` from lifespan and add a startup log recommending Alembic migrations
- [x] 9.2 Update `backend/core/models/__init__.py` to re-export all model classes from their respective modules
- [x] 9.3 Verify backend starts successfully and database connection works (health endpoint)
