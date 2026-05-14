## ADDED Requirements

### Requirement: Profile page SHALL display avatar card

**Old:** (none — new requirement)

**New:** The system SHALL display an avatar card on the profile page with user initials, full name, email, and order statistics. The page SHALL use a responsive layout: desktop 2-column with sidebar, mobile with horizontal tabs.

#### Scenario: User profile shows avatar card
- **WHEN** the user visits their profile
- **THEN** an avatar card SHALL display with initials, name, email, and order stats

#### Scenario: Desktop shows sidebar layout
- **WHEN** viewed on desktop (768px+)
- **THEN** profile SHALL display as 2-column layout with sidebar navigation

#### Scenario: Mobile shows horizontal tabs
- **WHEN** viewed on mobile (< 768px)
- **THEN** profile SHALL display horizontal tab navigation instead of sidebar

### Requirement: Profile SHALL include address edit form

**Old:** (none — new requirement)

**New:** The system SHALL provide an inline address edit form on the profile page with required field indicators (*) and a "Campos obligatorios" note.

#### Scenario: User edits address inline
- **WHEN** the user clicks edit on an address
- **THEN** an inline form SHALL appear with required field indicators and "Campos obligatorios" note
