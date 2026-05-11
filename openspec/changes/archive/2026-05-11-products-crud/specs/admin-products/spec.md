# admin-products Specification

## Overview

The admin panel SHALL provide a complete CRUD interface for managing products in the product catalog, including listing, creating, editing, and deleting products with support for category assignment and ingredient association.

## ADDED Requirements

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
