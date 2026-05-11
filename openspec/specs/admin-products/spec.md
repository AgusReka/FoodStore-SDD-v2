# admin-products Specification

## Purpose
TBD - created by archiving change products-crud. Update Purpose after archive.
## Requirements
### Requirement: Admin can list all products

The admin panel SHALL display a paginated table of all products with search and category filter capabilities.

#### Scenario: View products page
- **WHEN** an admin navigates to the products management page
- **THEN** the system SHALL display a table with all products showing name, price, category, availability status, and action buttons

#### Scenario: Empty products list
- **WHEN** there are no products created yet
- **THEN** the table SHALL display an empty state message inviting the admin to create the first product

#### Scenario: Paginated products
- **WHEN** there are more products than the page size
- **THEN** the system SHALL display pagination controls to navigate between pages

#### Scenario: Search products by name
- **WHEN** an admin types a search term in the search input
- **THEN** the system SHALL filter the product list to show only products whose name contains the search term (case-insensitive)

#### Scenario: Filter products by category
- **WHEN** an admin selects a category from the filter dropdown
- **THEN** the system SHALL filter the product list to show only products in that category

### Requirement: Admin can create a product

The admin panel SHALL provide a form to create a new product with all required fields.

#### Scenario: Create product with valid data
- **WHEN** an admin fills in name, price, category, and optional fields (description, currency, image URL, availability), then submits the form
- **THEN** the product SHALL be created and the admin SHALL see it in the list

#### Scenario: Create product with validation errors
- **WHEN** an admin submits the form without a name or price
- **THEN** the system SHALL show validation errors and NOT submit the request

#### Scenario: Create product with category selection
- **WHEN** an admin selects a category from a dropdown populated with existing categories
- **THEN** the product SHALL be created with the selected category association

#### Scenario: Create product with ingredient associations
- **WHEN** an admin adds ingredients with quantities to the product form
- **THEN** the product SHALL be created with the specified ingredient associations

#### Scenario: Create product with invalid category
- **WHEN** an admin submits the form and the API returns a 404 for the selected category
- **THEN** the system SHALL display the error message

### Requirement: Admin can edit a product

The admin panel SHALL provide a form pre-populated with product data to update it.

#### Scenario: Edit product basic info
- **WHEN** an admin clicks edit on a product, changes fields (name, price, description), and submits
- **THEN** the product SHALL be updated and the list SHALL reflect the change

#### Scenario: Edit product category
- **WHEN** an admin edits a product and changes its category
- **THEN** the product SHALL be reassigned to the new category

#### Scenario: Edit product ingredients
- **WHEN** an admin edits a product and adds, removes, or changes ingredient quantities
- **THEN** the product's ingredient associations SHALL be replaced with the updated list

#### Scenario: Toggle product availability
- **WHEN** an admin edits a product and toggles the available/unavailable status
- **THEN** the product SHALL be updated with the new status

### Requirement: Admin can delete a product

The admin panel SHALL allow deleting a product, with confirmation and conflict handling.

#### Scenario: Delete product with confirmation
- **WHEN** an admin clicks delete on a product
- **THEN** the system SHALL show a confirmation dialog before sending the DELETE request

#### Scenario: Delete product successfully
- **WHEN** an admin confirms deletion and the API returns success
- **THEN** the product SHALL be removed from the list

#### Scenario: Delete product with associated orders
- **WHEN** an admin attempts to delete a product that has associated orders
- **THEN** the system SHALL display a conflict error message explaining that the product cannot be deleted

#### Scenario: Cancel deletion
- **WHEN** an admin opens the delete confirmation dialog and clicks cancel
- **THEN** the dialog SHALL close and the product SHALL NOT be deleted

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

