# Backend Health Check Specification

## Requirements

### Requirement: Health Endpoint

The backend SHALL expose a health check endpoint for container orchestration.

#### Scenario: Health check request
- **WHEN** GET request is made to /health
- **THEN** returns HTTP 200 OK with {"status": "healthy"}

#### Scenario: Health check with database
- **WHEN** /health endpoint is queried
- **THEN** database connectivity is verified
- **AND** response includes database status

### Requirement: Readiness Probe

The backend SHALL support Kubernetes readiness probes.

#### Scenario: Readiness check
- **WHEN** GET request is made to /ready
- **THEN** returns 200 if all dependencies are available
- **AND** returns 503 if database is unreachable

### Requirement: Liveness Probe

The backend SHALL support Kubernetes liveness probes.

#### Scenario: Liveness check
- **WHEN** GET request is made to /live
- **THEN** returns 200 if the application is running
- **AND** does not check external dependencies