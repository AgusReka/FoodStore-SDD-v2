# Backend Database Specification

## Purpose

Define the database connection, session management, and model layer for the Food Store backend using SQLAlchemy async with PostgreSQL.
## Requirements
### Requirement: PostgreSQL Connection

The backend SHALL connect to PostgreSQL using SQLAlchemy async engine with proper connection pooling.

#### Scenario: Production database URL format
- **WHEN** DATABASE_URL starts with postgresql://
- **THEN** the backend connects to PostgreSQL at the specified host:port
- **AND** authentication uses the provided credentials

#### Scenario: Async engine configuration
- **WHEN** the backend starts
- **THEN** SQLAlchemy AsyncEngine is created with echo=False in production
- **AND** pool_size defaults to 5 connections
- **AND** max_overflow allows 10 additional connections

#### Scenario: SQLite fallback for development
- **WHEN** DATABASE_URL is "sqlite+aiosqlite:///./dev.db" or not set
- **THEN** the backend connects to SQLite for local development
- **AND** all async operations work the same way

### Requirement: Database Session Management

The backend SHALL provide async database sessions through a dependency injection pattern.

#### Scenario: Request-scoped sessions
- **WHEN** an API request is made
- **THEN** a database session is injected via Depends()
- **AND** the session is closed automatically after the response

#### Scenario: Unit of Work pattern
- **WHEN** multiple operations need atomicity
- **THEN** use a transaction that commits on success or rolls back on error

### Requirement: Async SQLAlchemy Models

The backend SHALL define database models using SQLAlchemy async mapping.

#### Scenario: Base model definition
- **WHEN** defining a new model
- **THEN** use DeclarativeBase with the async engine
- **AND** models inherit from Base with typed columns

#### Scenario: Async CRUD operations
- **WHEN** performing database operations
- **THEN** use async/await syntax
- **AND** never block the event loop with sync operations

### Requirement: Domain Entity Models

The backend SHALL define SQLAlchemy model classes for all Food Store domain entities using the shared `Base` from `backend.core.base`.

#### Scenario: User model definition
- **WHEN** the application starts
- **THEN** a `User` model exists with columns: id (UUID PK), email (unique), username (unique), hashed_password, nombre, apellido, telefono, avatar_url, is_active, is_verified, role (enum: admin, cliente), created_at, updated_at

#### Scenario: RefreshToken model definition
- **WHEN** the application starts
- **THEN** a `RefreshToken` model exists with columns: id (UUID PK), token (unique, indexed), user_id (FK to users), expires_at, created_at, revoked_at

#### Scenario: Category model definition
- **WHEN** the application starts
- **THEN** a `Category` model exists with columns: id (UUID PK), nombre (unique), descripcion, imagen_url, is_active, created_at, updated_at
- **AND** a relationship to Product exists (one-to-many)

#### Scenario: Product model definition
- **WHEN** the application starts
- **THEN** a `Product` model exists with columns: id (UUID PK), nombre, descripcion, precio (Decimal), moneda (default: ARS), imagen_url, is_available, category_id (FK to categories), created_at, updated_at

#### Scenario: Address model definition
- **WHEN** the application starts
- **THEN** an `Address` model exists with columns: id (UUID PK), user_id (FK to users), calle, numero, ciudad, codigo_postal, latitud, longitud, es_principal (bool), created_at, updated_at

#### Scenario: Order model definition
- **WHEN** the application starts
- **THEN** an `Order` model exists with columns: id (UUID PK), user_id (FK to users), address_id (FK to addresses), estado (enum: pendiente, confirmado, preparando, enviado, entregado, cancelado), total (Decimal), moneda, created_at, updated_at
- **AND** a relationship to OrderItem exists (one-to-many)

#### Scenario: OrderItem model definition
- **WHEN** the application starts
- **THEN** an `OrderItem` model exists with columns: id (UUID PK), order_id (FK to orders), product_id (FK to products), cantidad (Integer), precio_unitario (Decimal), subtotal (Decimal)

#### Scenario: Payment model definition
- **WHEN** the application starts
- **THEN** a `Payment` model exists with columns: id (UUID PK), order_id (FK to orders, unique), metodo (enum: efectivo, transferencia, mercadopago), estado (enum: pendiente, aprobado, rechazado, reembolsado), monto (Decimal), moneda, mp_payment_id (nullable), created_at, updated_at

### Requirement: Alembic Migrations

The backend SHALL use Alembic for database schema migrations with async support.

#### Scenario: Alembic configuration
- **WHEN** setting up the project
- **THEN** an `alembic.ini` file exists at the project root with the correct database URL reference
- **AND** an `env.py` in `db/alembic/` is configured for async Alembic with SQLAlchemy async engine
- **AND** the env.py uses `run_async` for async migration support

#### Scenario: Initial migration
- **WHEN** running `alembic upgrade head`
- **THEN** all domain entity tables are created in the database
- **AND** the migration is repeatable and idempotent

#### Scenario: Migration-based startup
- **WHEN** the application starts in any environment
- **THEN** tables are NOT auto-created via `Base.metadata.create_all`
- **AND** instead Alembic migrations are the sole source of schema changes

### Requirement: Seed Data

The backend SHALL provide a seed script that populates the database with development data.

#### Scenario: Seed command execution
- **WHEN** running `python -m db.seed`
- **THEN** the script creates initial data: admin user, test client user, product categories, sample products, and a test order

#### Scenario: Idempotent seeding
- **WHEN** the seed script runs multiple times
- **THEN** it does not duplicate existing data
- **AND** it handles existing records gracefully (upsert or skip)

### Requirement: Model Relationships and Constraints

Domain models SHALL define proper relationships, foreign keys, and constraints.

#### Scenario: Foreign key constraints
- **WHEN** creating related records
- **THEN** foreign key constraints ensure referential integrity
- **AND** orphaned records are handled via cascade delete where appropriate

#### Scenario: Unique constraints
- **WHEN** defining models
- **THEN** unique constraints exist on email (User), username (User), token (RefreshToken), nombre (Category)
- **AND** a composite unique constraint prevents duplicate product names within the same category

#### Scenario: Indexed columns
- **WHEN** querying by common fields
- **THEN** indexes exist on: email (User), username (User), token (RefreshToken), category_id (Product), user_id (Order), order_id (OrderItem), estado (Order)

