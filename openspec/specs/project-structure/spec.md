# Project Structure Specification

## ADDED Requirements

### Requirement: Monorepo Organization

The system SHALL organize the project as a monorepo with two main directories: `/backend` for the API server and `/frontend` for the client application.

#### Scenario: Basic directory structure exists
- **WHEN** the project is cloned
- **THEN** there exists a `/backend` directory containing the FastAPI application
- **AND** there exists a `/frontend` directory containing the React application

### Requirement: Backend Feature-First Structure

The backend SHALL organize code using a feature-first (vertical) architecture where each functional domain has its own module containing all related files.

#### Scenario: Module structure
- **WHEN** examining the backend directory
- **THEN** each module (auth, productos, pedidos, etc.) is organized as a self-contained unit
- **AND** each module directory contains: model.py, schemas.py, repository.py, service.py, router.py

#### Scenario: Core directory
- **WHEN** examining the backend directory
- **THEN** there exists a `/core` directory containing shared infrastructure code (config.py, database.py, security.py)

### Requirement: Frontend Feature-Sliced Design Structure

The frontend SHALL organize code using Feature-Sliced Design (FSD) with horizontal layers and vertical segments.

#### Scenario: FSD Layer structure
- **WHEN** examining the frontend/src directory
- **THEN** there exist directories: app, pages, widgets, features, entities, shared
- **AND** imports flow unidirectionally from higher to lower layers (pages → features → entities → shared)

#### Scenario: Features organization
- **WHEN** examining the features directory
- **THEN** each feature (auth, cart, orders, admin) is self-contained with its own components, hooks, and API calls

### Requirement: Git Configuration

The system SHALL have proper git configuration including a .gitignore file and conventional commit conventions.

#### Scenario: Gitignore coverage
- **WHEN** examining .gitignore
- **THEN** it excludes: .env files, __pycache__, node_modules, .venv, *.pyc, dist, .DS_Store, .pytest_cache
- **AND** it does NOT exclude source code or configuration files

#### Scenario: Git history
- **WHEN** examining git log
- **THEN** commits follow conventional commit format: feat:, fix:, docs:, chore:, refactor:, test:
- **AND** commits are atomic and incremental (not one massive initial commit)

### Requirement: Root README Documentation

The system SHALL have a README.md at the root with setup instructions.

#### Scenario: README content
- **WHEN** viewing the README.md at project root
- **THEN** it contains: project description, prerequisites, installation steps, running instructions
- **AND** it documents how to start both backend and frontend