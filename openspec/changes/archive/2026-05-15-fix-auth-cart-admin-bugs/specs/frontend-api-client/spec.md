## ADDED Requirements

### Requirement: Query cache cleared on logout

The TanStack Query client cache SHALL be cleared when the user logs out, to prevent stale user data from being served on subsequent logins.

#### Scenario: Cache cleared after logout
- **WHEN** the user logs out
- **THEN** the TanStack Query client SHALL clear all cached queries
- **AND** the next login SHALL fetch fresh data from the API

#### Scenario: Stale cache not served after new login
- **WHEN** User A logs in (cache stores User A's profile under `['auth', 'me']`)
- **AND** User A logs out (cache cleared)
- **AND** User B logs in
- **THEN** the `['auth', 'me']` query SHALL fetch User B's profile from the API
- **AND** SHALL NOT display User A's cached profile
