## MODIFIED Requirements

### Requirement: Customer can view all cart items on a dedicated page

**Old:** The system SHALL provide a dedicated `/cart` page that displays all items currently in the customer's cart with full details and controls.

**New:** The system SHALL provide a cart view as a right drawer on desktop (460px, slide-in-right animation + backdrop blur) and a full-screen page on mobile with sticky footer and CTA, displaying all items currently in the customer's cart with full details and controls.

#### Scenario: Desktop shows right drawer
- **WHEN** a customer clicks the cart icon on desktop (768px+)
- **THEN** the system SHALL open a right drawer at 460px width with a slide-in-right animation
- **AND** the drawer SHALL have a backdrop blur overlay

#### Scenario: Mobile shows full-screen page
- **WHEN** a customer clicks the cart icon on mobile (< 768px)
- **THEN** the system SHALL navigate to a full-screen cart page
- **AND** the page SHALL have a sticky footer with the total and CTA button

#### Scenario: Cart drawer shows all items with details
- **WHEN** a customer opens the cart with items
- **THEN** the cart SHALL display each item showing product name, price, quantity selector, and item subtotal
- **AND** the cart SHALL display a total summary

#### Scenario: Cart shows empty state
- **WHEN** a customer opens the cart with no items
- **THEN** the cart SHALL display a Mesa-styled friendly empty state ("Tu carrito está vacío")
- **AND** 3 quick-add suggestion cards SHALL be displayed
- **AND** a "Ver productos" button that navigates to the home page

#### Scenario: Update item quantity
- **WHEN** a customer clicks the "+" or "−" button on a cart item
- **THEN** the item quantity SHALL increment or decrement by 1
- **AND** the item subtotal and cart total SHALL update in real-time

#### Scenario: Remove item from cart
- **WHEN** a customer clicks the delete/trash button on a cart item
- **THEN** the item SHALL be removed from the cart
- **AND** the total SHALL update to reflect the removal

#### Scenario: Navigate to checkout from cart
- **WHEN** a customer clicks "Ir al checkout" button
- **THEN** the system SHALL navigate to `/checkout`
- **AND** the user SHALL be redirected to `/login` first if not authenticated

### Requirement: Cart page preserves Mesa Design System styling

**Old:** The system SHALL style the cart page according to the Mesa Design System (warm orange brand, consistent typography, clean card-based layout).

**New:** (Unchanged — the layout is now drawer-based on desktop, page-based on mobile, both using Mesa styling)

#### Scenario: Cart follows Mesa design
- **WHEN** a customer views the cart
- **THEN** the cart SHALL use Mesa spacing, typography (Inter Tight), and orange accent colors
- **AND** the layout SHALL be responsive: full-screen page on mobile, right drawer on desktop


