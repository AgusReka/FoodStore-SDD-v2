## Context

El proyecto Food Store tiene la estructura básica configurada pero carece de implementación real del backend. El frontend existe pero no puede conectarse a ningún API funcional. Se necesita implementar la capa de configuración, base de datos, seguridad y logging del backend.

## Goals / Non-Goals

**Goals:**
- Configurar PostgreSQL con SQLAlchemy async para el backend FastAPI
- Implementar autenticación JWT con python-jose y passlib
- Crearhealth check endpoint paracontainer orchestration
- Configurar logging estructurado con niveles configurables

**Non-Goals:**
- No implementar usuarios ni auth routes completos (eso es otra capability)
- No configurar RabbitMQ ni Redis aún
- No implementar migrations (schema inicial vía SQLAlchemy create_all)
- No crear tests unitarios aún

## Decisions

### 1. Async SQLAlchemy vs sync
**Decision:** Usar SQLAlchemy con asyncpg para operaciones asincrónicas
**Rationale:** FastAPI es async-native; tener todo el stack async maximiza el throughput
**Alternatives considered:** SQLAlchemy sync (más simple pero menor performance)

### 2. JWT vs cookies/sessions  
**Decision:** JWT en Authorization header (Bearer token)
**Rationale:** Mejor para APIs stateless, mobile-friendly, no requiere CSRF protection
**Alternatives considered:** HTTPOnly cookies (más seguro contra XSS pero complica CORS)

### 3. Pydantic Settings para configuración
**Decision:** Usar pydantic-settings para toda la configuración
**Rationale:** Validation automática, soporte .env, convierte tipos, documentación en código
**Alternatives considered:** Os.environ manualmente (error-prone, sin validación)

### 4. Logging: Python stdlib vs custom
**Decision:** Python logging stdlib con configurable JSON output
**Rationale:** Compatible con kubectl logs, integrations estándar
**Alternatives considered:** structlog (más fancy pero más dependencias)

## Risks / Trade-offs

- **[Risk]** Entorno de desarrollo sin PostgreSQL → **[Mitigation]** Usar SQLite local para dev, con flag para Switch a PostgreSQL
- **[Risk]** JWT sin refresh tokens cortos → **[Mitigation]** ACCESS_TOKEN_EXPIRE_MINUTES=30 (configurable)
- **[Risk]** Sin migrations tooling → **[Mitigation]** create_all() inicial, migrations vienen después
- **[Trade-off]** Simplicidad dev vs prod → **Mitigation:** .env con DATABASE_URL por defecto a SQLite