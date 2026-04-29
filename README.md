# Food Store

E-commerce application for food delivery built with FastAPI + React + PostgreSQL.

## Prerequisites

- Python 3.11+
- Node.js 18+
- PostgreSQL 15+
- pnpm (recommended) or npm

## Project Structure

This is a monorepo with two main directories:
- `/backend` - FastAPI application
- `/frontend` - React application

### Backend Structure (Feature-First)

```
backend/
├── main.py              # FastAPI application entry point
├── core/                # Shared infrastructure
│   ├── config.py        # Application configuration
│   ├── database.py     # Database connection
│   └── security.py     # JWT and security utilities
├── modules/             # Feature modules
│   ├── auth/           # Authentication
│   ├── usuarios/       # User management
│   ├── productos/      # Product catalog
│   ├── categorias/     # Categories
│   ├── pedidos/       # Orders
│   ├── pagos/         # Payment processing
│   ├── direcciones/   # Addresses
│   └── admin/         # Admin functionality
└── db/                  # Database utilities
    ├── migrations/      # Alembic migrations
    └── seed.py         # Database seeding
```

### Frontend Structure (FSD - Feature-Sliced Design)

```
frontend/src/
├── app/                # App configuration
├── pages/              # Route pages
├── widgets/           # Reusable UI components
├── features/          # Feature modules
│   ├── auth/         # Authentication
│   ├── cart/         # Shopping cart
│   ├── orders/       # Order management
│   └── admin/        # Admin panel
├── entities/          # Domain entities
│   ├── user/
│   ├── product/
│   ├── order/
│   └── address/
└── shared/            # Shared utilities
    ├── api/          # API client
    ├── components/   # Common components
    ├── config/       # Configuration
    ├── hooks/        # Custom hooks
    └── stores/       # State management
```

## Installation

### Backend

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment:
   ```bash
   python -m venv .venv
   ```

3. Activate the virtual environment:
   - Windows: `.venv\Scripts\activate`
   - Linux/Mac: `source .venv/bin/activate`

4. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

5. Copy the environment file:
   ```bash
   cp .env.example .env
   ```

6. Update `.env` with your configuration values

7. Run database migrations:
   ```bash
   alembic upgrade head
   ```

8. (Optional) Seed the database:
   ```bash
   python -m db.seed
   ```

### Frontend

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   pnpm install
   # or
   npm install
   ```

3. Copy the environment file:
   ```bash
   cp .env.example .env
   ```

4. Update `.env` with your configuration values

## Running the Application

### Backend

```bash
cd backend
uvicorn main:app --reload
```

The API will be available at http://localhost:8000

API documentation: http://localhost:8000/docs

### Frontend

```bash
cd frontend
pnpm dev
# or
npm run dev
```

The application will be available at http://localhost:5173

## Technology Stack

### Backend
- FastAPI - Modern Python web framework
- SQLModel - ORM with type annotations
- Alembic - Database migrations
- Pydantic - Data validation
- python-jose - JWT handling
- Passlib - Password hashing

### Frontend
- React 18 - UI library
- TypeScript - Type safety
- Vite - Build tool
- TanStack Query - Data fetching
- Zustand - State management
- TailwindCSS - Styling
- React Router - Routing
