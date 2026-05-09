# Spec: authentication (delta)

## ADDED Requirements

### Requirement: get_current_user includes role

The `get_current_user` dependency SHALL include the user's role from the JWT payload in its return value.

#### Scenario: Role extracted from token
- **WHEN** `get_current_user` decodes a valid JWT
- **THEN** the returned dict SHALL include `"role": <role_value>` alongside `"user_id"` and `"email"`

#### Scenario: Missing role claim
- **WHEN** a JWT is decoded that does not contain a `role` claim
- **THEN** the system SHALL return a 401 Unauthorized error with "Invalid token structure"

---

## MODIFIED Requirements

(No modified requirements from base spec — only adding new requirements above)
