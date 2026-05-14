# customer-cart-page Specification

## Purpose
Dedicated cart page with item listing, quantity controls, and checkout navigation.
## Requirements
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

### Requirement: Cart has ShippingBar showing delivery progress

The cart SHALL display a ShippingBar showing how close the customer is to free delivery.

#### Scenario: ShippingBar shows progress
- **WHEN** a customer opens the cart
- **THEN** a ShippingBar SHALL be displayed showing the current subtotal vs. the free delivery threshold
- **AND** if the subtotal is below the threshold, the bar SHALL show progress with "Faltan $X para envío gratis"
- **AND** if the subtotal meets or exceeds the threshold, the bar SHALL show "¡Envío gratis!"

### Requirement: Cart has Tip selector

The cart SHALL display a Tip selector when the `CONFIG.features.tipping` feature flag is enabled.

#### Scenario: Tip selector shown when enabled
- **WHEN** `CONFIG.features.tipping` is true
- **THEN** the cart SHALL display a Tip selector with preset tip amounts (e.g., 10%, 15%, 20%, custom)
- **WHEN** `CONFIG.features.tipping` is false
- **THEN** the Tip selector SHALL NOT be displayed

### Requirement: Cart shows fee breakdown

The cart SHALL display a full fee breakdown: subtotal, delivery, tip, and total.

#### Scenario: Fee breakdown displayed
- **WHEN** a customer views the cart
- **THEN** the cart SHALL display the fee breakdown: subtotal, delivery fee, tip (if applicable), and total
- **AND** each line item SHALL be clearly labeled with proper formatting

### Requirement: Cart has EmptyState with quick-add suggestions

The empty cart state SHALL display 3 quick-add product suggestion cards.

#### Scenario: Empty state shows suggestions
- **WHEN** the cart is empty
- **THEN** the empty state SHALL display the Mesa EmptyState component
- **AND** 3 product suggestion cards SHALL be shown for quick add
- **AND** each suggestion card SHALL have an "Agregar" button

### Requirement: Cart stock validation with Mesa-styled alerts

The cart SHALL validate stock on load and show Mesa-styled error alerts for out-of-stock items.

#### Scenario: Stock validation on load
- **WHEN** a customer opens the cart and an item is out of stock
- **THEN** the system SHALL display a Mesa-styled error alert: "{productName} ya no está disponible"
- **AND** the item SHALL be grayed out or marked as unavailable

