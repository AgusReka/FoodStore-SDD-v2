## Why

El backend de Food Store necesita una configuración sólida para funcionar en producción. Actualmente existe la estructura del proyecto pero no hay configuración de base de datos, seguridad, ni servicios base. Sin esta configuración, el backend no puede iniciar ni servir como API funcional.

## What Changes

- **BREAKING** Crear configuración centralizada de aplicación usando Pydantic Settings
- Configurar conexión a PostgreSQL con SQLAlchemy async
- Implementar middleware de seguridad JWT
- Configurar CORS para permitir el frontend
- Crear health check endpoint para monitoreo
- Configurar logging estructurado

## Capabilities

### New Capabilities
- `backend-database`: Configuración de base de datos PostgreSQL con connection pool y migrations
- `backend-security`: Autenticación JWT, hashing de passwords, y protección de endpoints
- `backend-health`: Endpoint de health check para containers y load balancers
- `backend-logging`: Logging estructurado con configuración de уровня

### Modified Capabilities
- Ninguno por el momento — estas son capabilities nuevas

## Impact

- Backend: nuevos archivos en `backend/app/core/`, `backend/app/api/`
- Dependencias: agregar `python-jose`, `passlib`, `aiosqlite`/`asyncpg`, `pydantic-settings`
- No afecta al frontend