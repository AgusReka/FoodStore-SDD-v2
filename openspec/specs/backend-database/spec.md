# Backend Database Specification

## ADDED Requirements

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