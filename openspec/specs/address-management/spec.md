# address-management Specification

## Purpose
Manage user delivery addresses with CRUD operations and default address selection.

## Requirements
### Requirement: Create address

The system SHALL support creating a delivery address for the authenticated user.

**Scenarios:**

#### Scenario: Create address with valid data
- **WHEN** a POST request is sent to `/api/v1/direcciones` with `street`, `city`, `postal_code`, `street_number`, and optional `is_primary`
- **THEN** a new address SHALL be created and returned with status 201

#### Scenario: Create address marked as primary
- **WHEN** a POST request is sent with `is_primary: true`
- **THEN** the new address SHALL be marked as the user's default
- **AND** any previous default address SHALL be unmarked

### Requirement: List user addresses

The system SHALL support listing all addresses for the authenticated user.

**Scenarios:**

#### Scenario: List my addresses
- **WHEN** a GET request is sent to `/api/v1/direcciones`
- **THEN** all addresses for the current user SHALL be returned within a `DireccionList` envelope

### Requirement: Update address

The system SHALL support updating address fields and changing the default address.

**Scenarios:**

#### Scenario: Update address fields
- **WHEN** a PATCH request is sent to `/api/v1/direcciones/{id}` with updated fields including `street_number`
- **THEN** the address SHALL be updated

#### Scenario: Set address as primary
- **WHEN** a PATCH request sets `is_primary: true` on an existing address
- **THEN** that address SHALL become the default
- **AND** any previous default SHALL be unmarked

### Requirement: Delete address

The system SHALL support deleting a user address.

**Scenarios:**

#### Scenario: Delete address
- **WHEN** a DELETE request is sent to `/api/v1/direcciones/{id}`
- **THEN** the address SHALL be deleted with status 204

