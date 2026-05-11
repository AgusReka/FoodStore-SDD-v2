# Tasks: Categories CRUD

## 1. Entity and Types

- [x] 1.1 Create `entities/category/index.ts` with `Category`, `CreateCategoryDto`, `UpdateCategoryDto` types

## 2. Shared Components

- [x] 2.1 Implement `Button.tsx` with variants (primary, secondary, danger), sizes, and loading state
- [x] 2.2 Implement `Input.tsx` with label, error message, and all HTML input props
- [x] 2.3 Implement `Modal.tsx` with open/close, backdrop click, escape key, and title/content/footer slots

## 3. Admin Categories Feature

- [x] 3.1 Create `features/admin/categories/hooks/useCategories.ts` with TanStack Query hooks for list, create, update, and delete
- [x] 3.2 Create `features/admin/categories/components/CategoryTable.tsx` with paginated table, loading skeleton, and empty state
- [x] 3.3 Create `features/admin/categories/components/CategoryForm.tsx` with create/edit form and validation
- [x] 3.4 Create `features/admin/categories/components/DeleteCategoryDialog.tsx` with confirmation and 409 conflict error handling
- [x] 3.5 Create `features/admin/categories/index.tsx` exporting `CategoryListPage` that composes all components

## 4. Admin Panel Routing

- [x] 4.1 Refactor `AdminPage.tsx` into a layout with sidebar navigation and `<Outlet />` for sub-routes
- [x] 4.2 Add `/admin/categories` route in `App.tsx` nested under the admin layout
- [x] 4.3 Verify navigation flow: sidebar links, active state, and deep linking work correctly
