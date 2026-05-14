## ADDED Requirements

### Requirement: Order detail SHALL show status timeline

**Old:** (none — new requirement)

**New:** The system SHALL display a status timeline on the order detail page with animated checkmarks for completed steps and pending indicators for future steps.

#### Scenario: Order progress displays as timeline
- **WHEN** the user opens an order detail
- **THEN** a status timeline SHALL display with animated checkmarks for completed steps

### Requirement: Order detail SHALL show item list

**Old:** (none — new requirement)

**New:** The system SHALL display each ordered item as a Mesa-styled card with product image, name, quantity, and price on the order detail page.

#### Scenario: Order items display in Mesa card style
- **WHEN** the user views order details
- **THEN** each ordered item SHALL display as a Mesa-styled card with quantity and price
