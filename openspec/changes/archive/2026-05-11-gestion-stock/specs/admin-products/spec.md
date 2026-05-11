# admin-products Specification (Delta)

## ADDED Requirements

### Requirement: Admin can view product stock in list

The admin product list SHALL display the available stock for each product.

#### Scenario: View stock in products table
- **WHEN** an admin navigates to the products management page
- **THEN** the table SHALL include a "Stock" column showing `stock_disponible` for each product

#### Scenario: Stock indicator for compound products
- **WHEN** a product has ingredients and calculated stock of 15
- **THEN** the Stock column SHALL show "15 uds. (calculado)"

#### Scenario: Stock indicator for simple products
- **WHEN** a product has no ingredients and `stock_cantidad: 30`
- **THEN** the Stock column SHALL show "30 uds. (directo)"

#### Scenario: Low stock visual indicator
- **WHEN** a product's `stock_disponible` is 5 or less
- **THEN** the stock value SHALL be displayed with a red/orange color

### Requirement: Admin can set product stock

The admin product form SHALL allow setting stock for simple products and display calculated stock for compound products.

#### Scenario: Stock field visible for products without ingredients
- **WHEN** an admin creates or edits a product and the ingredients list is empty
- **THEN** a `stock_cantidad` numeric input SHALL be displayed

#### Scenario: Stock field hidden for products with ingredients
- **WHEN** an admin creates or edits a product and ingredients are added
- **THEN** the `stock_cantidad` input SHALL be hidden
- **AND** a read-only `stock_disponible` calculated value SHALL be shown instead

#### Scenario: Stock field visibility updates dynamically
- **WHEN** an admin adds the first ingredient to a product
- **THEN** the stock input SHALL dynamically switch from editable to read-only calculated display
