## ADDED Requirements

### Requirement: Axios instance configured with base URL
The frontend SHALL have a configured Axios instance with base URL from environment variables.

#### Scenario: Axios instance created
- **WHEN** the developer imports the API client from `shared/api/`
- **THEN** it SHALL return a pre-configured Axios instance
- **AND** the `baseURL` SHALL be set to `import.meta.env.VITE_API_URL` (defaulting to `http://localhost:8000` if not set)

#### Scenario: JSON headers set by default
- **WHEN** the Axios instance makes a request
- **THEN** the `Content-Type` header SHALL be set to `application/json`
- **AND** the `Accept` header SHALL be set to `application/json`

### Requirement: Request interceptor for authentication
The Axios instance SHALL have a request interceptor structure for injecting JWT tokens.

#### Scenario: Request interceptor placeholder
- **WHEN** the developer inspects the Axios instance code
- **THEN** it SHALL include a request interceptor that reads from auth storage (prepared for Zustand store)
- **AND** the interceptor SHALL inject an `Authorization: Bearer <token>` header when a token exists
- **NOTE:** The actual Zustand store integration will be completed in `auth-frontend` change

### Requirement: Response interceptor for error handling
The Axios instance SHALL have a response interceptor for centralized error handling.

#### Scenario: Response interceptor handles 401
- **WHEN** the API returns a 401 Unauthorized response
- **THEN** the interceptor SHALL be prepared to trigger token refresh or logout (implementation in `auth-frontend`)
- **AND** the error SHALL be re-thrown for component-level handling

#### Scenario: Network errors handled
- **WHEN** a network error occurs (no response from server)
- **THEN** the interceptor SHALL log the error and re-throw it
