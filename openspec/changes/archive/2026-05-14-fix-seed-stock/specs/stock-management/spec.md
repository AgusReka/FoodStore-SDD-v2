## ADDED Requirements

### Requirement: Checkout-time stock validation
The checkout flow SHALL validate product stock availability before creating a Mercado Pago payment preference, using the same stock calculation logic as order confirmation (`ProductRepository.check_stock()`). For composite products, this SHALL validate against ingredient stock; for simple products, against `stock_cantidad`.

#### Scenario: Checkout rejects composite product with insufficient ingredient stock
- **WHEN** a user tries to checkout with "Hamburguesa Clásica" (composite) but ingredient "Carne picada" has stock_actual < 200g
- **THEN** the system SHALL return a BadRequest error: "Stock insuficiente para 'Hamburguesa Clásica'"
- **AND** the error message SHALL reference the insufficient ingredient name

#### Scenario: Checkout accepts composite product with sufficient ingredient stock
- **WHEN** a user tries to checkout with "Hamburguesa Clásica" (composite) and all ingredients have sufficient stock_actual
- **THEN** the system SHALL proceed to create the MP payment preference
- **AND** the CheckoutSession SHALL be created with PENDING status

#### Scenario: Checkout rejects simple product with insufficient stock_cantidad
- **WHEN** a user tries to checkout with "Coca Cola 500ml" but stock_cantidad < requested quantity
- **THEN** the system SHALL return a BadRequest error: "Stock insuficiente para 'Coca Cola 500ml'"

#### Scenario: Checkout accepts simple product with sufficient stock_cantidad
- **WHEN** a user tries to checkout with "Coca Cola 500ml" and stock_cantidad >= requested quantity
- **THEN** the system SHALL proceed to create the MP payment preference

#### Scenario: Checkout return re-validates stock
- **WHEN** MP redirects with "success" status and ingredient stock has dropped below required quantity in the meantime
- **THEN** the system SHALL expire the CheckoutSession
- **AND** redirect to the cart with mp-error=true
