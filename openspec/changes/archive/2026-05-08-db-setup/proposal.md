## Why

The Food Store backend has all module stubs created but zero database models implemented. Alembic is not configured for migrations, there are no actual SQLAlchemy model definitions, and no seed data exists. Without a proper database setup, the API cannot serve real data. This change establishes the complete database foundation so all subsequent feature work can build on real models and migrations.

## What Changes

- Define **SQLAlchemy model classes** for all 9 domain entities (User, RefreshToken, Product, Category, Order, OrderItem, Payment, Address, Admin)
- Configure **Alembic** with async support for database migrations
- Create the **initial migration** that generates all tables
- Implement a **seed script** with development/test data
- Update the **database configuration** to use proper migration-based initialization instead of `Base.metadata.create_all`
- Add **model relationships** between entities (foreign keys, cascades)

## Capabilities

### New Capabilities
- `backend-database`: Core database setup with Alembic migrations, async SQLAlchemy engine, session management, and seed data for Food Store domain entities

### Modified Capabilities
<!-- No existing capabilities have requirement changes. This is a new foundational setup. -->

## Impact

- **backend/core/database.py** — May need adjustment for migration workflow
- **backend/core/models/** — New model files for each domain entity
- **backend/db/alembic/** — Alembic env.py and migration files
- **backend/db/seed.py** — Seed data for development
- **backend/requirements.txt** — May need `alembic` dependency added
- **All modules in backend/modules/** — Model stubs will be filled with real model classes
