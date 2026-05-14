## ADDED Requirements

### Requirement: Order history SHALL display Mesa-styled cards

**Old:** (none — new requirement)

**New:** The system SHALL display order history as Mesa-styled cards each showing status badge, total amount, date, and order ID. Status filter pills SHALL allow narrowing the list.

#### Scenario: Orders display as styled cards
- **WHEN** the user views their order history
- **THEN** each order SHALL display as a Mesa-styled card with status badge, total, and date

#### Scenario: Filter pills narrow order list
- **WHEN** the user clicks a status filter pill
- **THEN** the order list SHALL filter to show only orders matching that status
