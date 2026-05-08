# Spec: user-management

## ADDED Requirements

### Requirement: Create user

The system SHALL support creating a new user with full name, email, and password.

**Scenarios:**

#### Scenario: Create user with valid data
- **WHEN** a POST request is sent to `/api/v1/usuarios` with valid `full_name`, `email`, and `password`
- **THEN** the user SHALL be created and a `UserRead` response returned with status 201

#### Scenario: Create user with duplicate email
- **WHEN** a POST request is sent with an email that already exists
- **THEN** the system SHALL return a 409 Conflict error

### Requirement: Get user by ID

The system SHALL support retrieving a user by their UUID.

**Scenarios:**

#### Scenario: Get existing user
- **WHEN** a GET request is sent to `/api/v1/usuarios/{user_id}`
- **THEN** the system SHALL return the matching `UserRead` response

#### Scenario: Get non-existent user
- **WHEN** a GET request is sent to `/api/v1/usuarios/{non_existent_id}`
- **THEN** the system SHALL return a 404 Not Found error

### Requirement: Update user

The system SHALL support partial updates to user profile fields.

**Scenarios:**

#### Scenario: Update user full_name
- **WHEN** a PATCH request is sent to `/api/v1/usuarios/{user_id}` with `{"full_name": "New Name"}`
- **THEN** the user's `full_name` SHALL be updated and the updated `UserRead` returned

#### Scenario: Update non-existent user
- **WHEN** a PATCH request is sent to `/api/v1/usuarios/{non_existent_id}`
- **THEN** the system SHALL return a 404 Not Found error

### Requirement: Delete user

The system SHALL support soft or hard deletion of a user.

**Scenarios:**

#### Scenario: Delete existing user
- **WHEN** a DELETE request is sent to `/api/v1/usuarios/{user_id}`
- **THEN** the user SHALL be deleted and a 204 No Content response returned

### Requirement: List users with pagination

The system SHALL support listing users with pagination, filtering by role, and searching by name/email.

**Scenarios:**

#### Scenario: List all users
- **WHEN** a GET request is sent to `/api/v1/usuarios`
- **THEN** the system SHALL return a paginated `UserList` response with `items`, `total`, `page`, and `size`

#### Scenario: Filter by role
- **WHEN** a GET request is sent to `/api/v1/usuarios?role=admin`
- **THEN** the system SHALL return only users with the `admin` role
