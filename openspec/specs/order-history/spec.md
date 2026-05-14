# order-history Specification

## Purpose
TBD - created by archiving change orders-state-machine. Update Purpose after archive.
## Requirements
### Requirement: Record order status transitions

The system SHALL automatically record every order status transition in an `order_history` audit table, capturing the previous status, new status, who performed the change, and when it occurred.

#### Scenario: Record transition from pendiente to confirmado
- **WHEN** an order status changes from `pendiente` to `confirmado`
- **THEN** a new history record SHALL be created with `from_status: "pendiente"`, `to_status: "confirmado"`, and a non-null `created_at` timestamp

#### Scenario: Record transition with actor
- **WHEN** an admin changes an order status via PATCH `/pedidos/{id}/status`
- **THEN** the history record SHALL include `changed_by` set to the admin's user ID

#### Scenario: Record transition with reason
- **WHEN** a status change request includes a `reason` field
- **THEN** the history record SHALL store the provided reason

#### Scenario: History records are immutable
- **WHEN** a history record is created
- **THEN** it SHALL NOT be modified or deleted after creation

### Requirement: List order history

The system SHALL expose order history via a GET endpoint.

#### Scenario: Customer views own order history
- **WHEN** an authenticated customer sends a GET to `/pedidos/{id}/history`
- **THEN** the system SHALL return all history records for that order, ordered by `created_at` ascending

#### Scenario: Customer cannot view another user's order history
- **WHEN** an authenticated customer sends a GET to `/pedidos/{id}/history` for another user's order
- **THEN** the system SHALL return a 403 Forbidden error

#### Scenario: Admin views any order history
- **WHEN** an authenticated admin sends a GET to `/pedidos/{id}/history`
- **THEN** the system SHALL return all history records regardless of order ownership

#### Scenario: Empty history for new order
- **WHEN** a customer views history for an order with no status transitions
- **THEN** the system SHALL return an empty list

