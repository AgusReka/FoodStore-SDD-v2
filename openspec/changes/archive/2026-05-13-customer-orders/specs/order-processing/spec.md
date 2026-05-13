# Spec: order-processing (delta)

## MODIFIED Requirements

### Requirement: List user orders

The system SHALL support listing orders for the authenticated user with pagination and status filtering.

**Scenarios:**

#### Scenario: List my orders
- **WHEN** a GET request is sent to `/api/v1/pedidos`
- **THEN** a paginated list of the current user's orders SHALL be returned

#### Scenario: Filter my orders by status
- **WHEN** a GET request is sent to `/api/v1/pedidos?estado=pendiente`
- **THEN** only orders with `pendiente` status SHALL be returned

#### Scenario: Filter with invalid status
- **WHEN** a GET request is sent to `/api/v1/pedidos?estado=invalid_status`
- **THEN** the system SHALL return a 422 Validation Error
