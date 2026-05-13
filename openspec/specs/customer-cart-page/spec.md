# customer-cart-page Specification

## Purpose
Dedicated cart page with item listing, quantity controls, and checkout navigation.

## ADDED Requirements

### Requirement: Customer can view all cart items on a dedicated page

The system SHALL provide a dedicated `/cart` page that displays all items currently in the customer's cart with full details and controls.

#### Scenario: Cart page shows all items with details
- **WHEN** a customer navigates to `/cart` with items in their cart
- **THEN** the page SHALL display each item showing product name, price, quantity selector, and item subtotal
- **AND** the page SHALL display a cart total summary

#### Scenario: Cart page shows empty state
- **WHEN** a customer navigates to `/cart` with no items in the cart
- **THEN** the page SHALL display a friendly empty state message ("Tu carrito está vacío")
- **AND** a "Ver productos" button that navigates to the home page

#### Scenario: Cart page shows loading state
- **WHEN** the cart store is initializing
- **THEN** the page SHALL display skeleton placeholders

#### Scenario: Update item quantity in cart page
- **WHEN** a customer clicks the "+" or "−" button on a cart item
- **THEN** the item quantity SHALL increment or decrement by 1
- **AND** the item subtotal and cart total SHALL update in real-time
- **AND** removing an item when quantity reaches 0 SHALL remove the item

#### Scenario: Remove item from cart page
- **WHEN** a customer clicks the delete/trash button on a cart item
- **THEN** the item SHALL be removed from the cart
- **AND** the total SHALL update to reflect the removal
- **AND** if the last item is removed, the empty state SHALL display

#### Scenario: Navigate to checkout from cart page
- **WHEN** a customer clicks "Ir al checkout" button on the cart page
- **THEN** the system SHALL navigate to `/checkout`
- **AND** the user SHALL be redirected to `/login` first if not authenticated

### Requirement: Cart page preserves Mesa Design System styling

The system SHALL style the cart page according to the Mesa Design System (warm orange brand, consistent typography, clean card-based layout).

#### Scenario: Cart page follows Mesa design
- **WHEN** a customer views the cart page
- **THEN** the page SHALL use consistent spacing, typography (Inter Tight), and orange accent colors matching the rest of the customer-facing UI
- **AND** the layout SHALL be responsive: single column on mobile, two columns on desktop (items on left, summary on right)
