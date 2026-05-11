# admin-categories Specification

## Purpose
Administrative frontend UI for managing product categories — list, create, edit, and delete categories through the admin panel. Connects to the existing backend API at `/api/v1/categorias/`.

## ADDED Requirements

### Requirement: Admin can list all categories

The admin panel SHALL display a paginated table of all categories.

**Scenarios:**

#### Scenario: View categories page
- **WHEN** an admin navigates to the categories management page
- **THEN** the system SHALL display a table with all categories showing name, description, active status, and action buttons

#### Scenario: Empty categories list
- **WHEN** there are no categories created yet
- **THEN** the table SHALL display an empty state message inviting the admin to create the first category

#### Scenario: Paginated categories
- **WHEN** there are more categories than the page size
- **THEN** the system SHALL display pagination controls to navigate between pages

---

### Requirement: Admin can create a category

The admin panel SHALL provide a form to create a new category.

**Scenarios:**

#### Scenario: Create category with valid data
- **WHEN** an admin fills in the name and optional description, then submits the form
- **THEN** the category SHALL be created and the admin SHALL see it in the list

#### Scenario: Create category with validation errors
- **WHEN** an admin submits the form without a name
- **THEN** the system SHALL show a validation error and NOT submit the request

#### Scenario: Create category API error
- **WHEN** an admin submits the form and the API returns an error (e.g., duplicate name)
- **THEN** the system SHALL display the error message and keep the form open

---

### Requirement: Admin can edit a category

The admin panel SHALL provide a form pre-populated with category data to update it.

**Scenarios:**

#### Scenario: Edit category name
- **WHEN** an admin clicks edit on a category, changes the name, and submits
- **THEN** the category SHALL be updated and the list SHALL reflect the change

#### Scenario: Toggle category active status
- **WHEN** an admin edits a category and toggles the active/inactive status
- **THEN** the category SHALL be updated with the new status

---

### Requirement: Admin can delete a category

The admin panel SHALL allow deleting a category, with conflict handling when the category has associated products.

**Scenarios:**

#### Scenario: Delete category with no products
- **WHEN** an admin clicks delete on a category that has no associated products
- **THEN** the category SHALL be deleted and removed from the list

#### Scenario: Delete category with associated products
- **WHEN** an admin attempts to delete a category that has one or more products
- **THEN** the system SHALL display a conflict error message explaining that the category cannot be deleted because it has associated products

#### Scenario: Confirm before delete
- **WHEN** an admin clicks the delete button
- **THEN** the system SHALL show a confirmation dialog before sending the DELETE request
