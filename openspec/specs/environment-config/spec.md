# Environment Configuration Specification

## Requirements

### Requirement: Backend Environment Variables

The backend SHALL define all necessary environment variables in a `.env.example` file with documented values and sensible defaults.

#### Scenario: Backend .env.example exists
- **WHEN** examining the backend directory
- **THEN** there exists a `.env.example` file at the root
- **AND** it documents all required environment variables

#### Scenario: Database configuration
- **WHEN** the backend starts
- **THEN** DATABASE_URL is required to connect to PostgreSQL
- **AND** the format SHALL be: postgresql://user:pass@host:port/dbname

#### Scenario: JWT security configuration
- **WHEN** authentication is configured
- **THEN** SECRET_KEY is required (minimum 32 characters)
- **AND** ALGORITHM defaults to HS256
- **AND** ACCESS_TOKEN_EXPIRE_MINUTES defaults to 30
- **AND** REFRESH_TOKEN_EXPIRE_DAYS defaults to 7

#### Scenario: CORS configuration
- **WHEN** the backend starts
- **THEN** CORS_ORIGINS defines allowed origins
- **AND** in development it SHALL include http://localhost:5173
- **AND** it MUST be a valid JSON array format

#### Scenario: MercadoPago configuration
- **WHEN** payment integration is configured
- **THEN** MP_ACCESS_TOKEN is required (from MercadoPago dashboard)
- **AND** MP_PUBLIC_KEY is exposed to frontend
- **AND** MP_NOTIFICATION_URL defines the webhook endpoint for IPN notifications

### Requirement: Frontend Environment Variables

The frontend SHALL define required environment variables in `.env.example` with Vite-compatible naming (VITE_ prefix).

#### Scenario: Frontend .env.example exists
- **WHEN** examining the frontend directory
- **THEN** there exists a `.env.example` file at the root
- **AND** all variables have the VITE_ prefix

#### Scenario: API URL configuration
- **WHEN** the frontend makes API calls
- **THEN** VITE_API_URL defines the backend base URL
- **AND** it defaults to http://localhost:8000 in development

#### Scenario: MercadoPago public key
- **WHEN** payment UI is rendered
- **THEN** VITE_MERCADOPAGO_PUBLIC_KEY is available
- **AND** it contains the public key (not the access token)

### Requirement: Environment Security

The system SHALL protect sensitive configuration from version control.

#### Scenario: .env files not committed
- **WHEN** checking git status
- **THEN** .env files are NOT tracked by git
- **AND** only .env.example files are committed

#### Scenario: .env.example completeness
- **WHEN** a developer clones the repository
- **THEN** copying .env.example to .env provides all required variables
- **AND** each variable has a comment explaining its purpose
- **AND** sensitive values have placeholder text (e.g., TEST-xxxx, your-secret-key)