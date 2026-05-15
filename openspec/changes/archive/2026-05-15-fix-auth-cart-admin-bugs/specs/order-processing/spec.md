## ADDED Requirements

### Requirement: Admin can view any order detail

The system SHALL allow admin users to view the detail of any order via `GET /pedidos/{id}`, even if they are not the order owner.

#### Scenario: Admin views any order detail
- **WHEN** a user with role `admin` sends a GET request to `/api/v1/pedidos/{id}` for an order owned by a different user
- **THEN** the system SHALL return the order detail
- **AND** SHALL NOT return a 403 Forbidden error

#### Scenario: Non-admin cannot view other users' orders
- **WHEN** a user with role `cliente` sends a GET request to `/api/v1/pedidos/{id}` for an order owned by a different user
- **THEN** the system SHALL return a 403 Forbidden error
