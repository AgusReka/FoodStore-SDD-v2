## ADDED Requirements

### Requirement: Auth pages SHALL use responsive layout

**Old:** (none — new requirement)

**New:** The system SHALL display auth pages (login, register, forgot password) as a centered modal at 420px with backdrop blur on desktop and as a full-screen page on mobile.

#### Scenario: Desktop shows centered modal
- **WHEN** the user opens login or register on desktop (768px+)
- **THEN** a centered modal SHALL display at 420px with backdrop blur

#### Scenario: Mobile shows full-screen page
- **WHEN** the user opens login or register on mobile (< 768px)
- **THEN** a full-screen layout SHALL display without backdrop

### Requirement: Auth forms SHALL include password features

**Old:** (none — new requirement)

**New:** The system SHALL display a 4-segment password strength bar that updates in real-time on the register form, and a show/hide toggle on all password fields.

#### Scenario: Password strength bar displays
- **WHEN** the user types a password in register form
- **THEN** a 4-segment strength bar SHALL update in real-time

#### Scenario: Password visibility toggles
- **WHEN** the user clicks the show/hide toggle
- **THEN** the password field SHALL toggle between text and password input type

### Requirement: Auth SHALL include Google OAuth

**Old:** (none — new requirement)

**New:** The system SHALL display a Google OAuth button as an alternative authentication method on both login and register pages.

#### Scenario: Google login button appears
- **WHEN** the user views login or register page
- **THEN** a Google OAuth button SHALL display as alternative authentication
