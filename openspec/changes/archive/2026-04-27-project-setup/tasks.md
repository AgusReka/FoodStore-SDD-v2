## 1. Create Monorepo Structure

- [x] 1.1 Create `/backend` directory at project root
- [x] 1.2 Create `/frontend` directory at project root
- [x] 1.3 Initialize Git repository at root (if not already initialized)

## 2. Backend Directory Structure

- [x] 2.1 Create `/backend/core/` directory with config.py, database.py, security.py placeholder files
- [x] 2.2 Create `/backend/modules/` directory
- [x] 2.3 Create backend module directories: auth/, refreshtokens/, usuarios/, direcciones/, categorias/, productos/, pedidos/, pagos/, admin/
- [x] 2.4 For each module directory, create placeholder files: __init__.py, model.py, schemas.py, repository.py, service.py, router.py
- [x] 2.5 Create `/backend/db/` directory with alembic/, migrations/, seed.py placeholder
- [x] 2.6 Create `/backend/main.py` placeholder file

## 3. Frontend Directory Structure

- [x] 3.1 Create `/frontend/src/` directory
- [x] 3.2 Create FSD layer directories: app/, pages/, widgets/, features/, entities/, shared/
- [x] 3.3 Within shared/, create: api/, components/, config/, hooks/, stores/
- [x] 3.4 Create placeholder files in each FSD layer
- [x] 3.5 Create feature directories: auth/, cart/, orders/, admin/
- [x] 3.6 Create entity directories: user/, product/, order/, address/
- [x] 3.7 Create frontend root files: index.html, vite.config.ts, tailwind.config.js, package.json placeholder

## 4. Git Configuration

- [x] 4.1 Create `.gitignore` at root with all required exclusions (.env, __pycache__, node_modules, .venv, *.pyc, dist, .DS_Store, .pytest_cache)
- [x] 4.2 Create `.gitignore` in backend/ with Python-specific exclusions
- [x] 4.3 Create `.gitignore` in frontend/ with Node-specific exclusions

## 5. Environment Configuration Files

- [x] 5.1 Create `/backend/.env.example` with all documented variables (DATABASE_URL, SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES, REFRESH_TOKEN_EXPIRE_DAYS, CORS_ORIGINS, MP_ACCESS_TOKEN, MP_PUBLIC_KEY, MP_NOTIFICATION_URL)
- [x] 5.2 Add comments explaining each variable's purpose
- [x] 5.3 Create `/frontend/.env.example` with VITE_API_URL and VITE_MERCADOPAGO_PUBLIC_KEY
- [x] 5.4 Add comments explaining each variable's purpose

## 6. Documentation

- [x] 6.1 Create `/README.md` at root with:
  - Project description (Food Store E-Commerce)
  - Prerequisites section (Python 3.11+, Node.js 18+, PostgreSQL 15+)
  - Installation steps for backend
  - Installation steps for frontend
  - How to run both servers
  - Project structure overview

## 7. Initial Git Commits

- [x] 7.1 Run `git add .` and commit with message: `feat: project structure with feature-first backend and FSD frontend`
- [x] 7.2 Verify git log shows the conventional commit format
- [x] 7.3 Verify .gitignore excludes .env files (test by checking `git status`)