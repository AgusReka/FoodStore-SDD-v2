# Design: Categories CRUD

## Context

The backend CRUD for categories is fully implemented:
- Model `Category` with fields: `id`, `name`, `description`, `image_url`, `is_active`, `created_at`, `updated_at`
- API endpoints at `/api/v1/categorias/`: GET list (paginated), GET by ID, POST create, PATCH update, DELETE (with product conflict check)
- Permissions: `CATEGORY_CREATE`, `CATEGORY_UPDATE`, `CATEGORY_DELETE`
- Frontend foundation exists: API endpoints (`ENDPOINTS.CATEGORIES_*`), query keys (`queryKeys.categories`), and generic API client helpers

What's missing is the frontend admin UI — there is currently no way for admins to manage categories through the browser. The admin page is a placeholder showing "Panel en construcción".

## Goals / Non-Goals

**Goals:**
- Provide a fully functional admin UI for managing categories
- Follow existing project patterns (feature-sliced design, TanStack Query, Zustand for UI state)
- Reuse existing shared components (Button, Modal, Input, Can)

**Non-Goals:**
- Backend changes — the API is complete and will not be modified
- User-facing category browsing — this is admin-only management
- Bulk category operations — only single create/edit/delete

## Decisions

### Decision 1: Admin sub-routing via nested routes

**Choice**: Transform `AdminPage` into a layout shell with sub-routes for each admin section (dashboard, categories, users, etc.). Categories will live at `/admin/categories`.

**Rationale**: The current AdminPage is a single static component. Adding category management inline would make it unwieldy. Nested routes keep each section independently navigable and testable.

**Alternative considered**: Inline tabs with conditional rendering — simpler but harder to maintain as more admin sections are added.

### Decision 2: Entity type mirrors backend schema

**Choice**: Create a `Category` TypeScript interface in `entities/category/` that mirrors the backend `CategoriaRead` schema with snake_case mapped to camelCase.

**Rationale**: The frontend codebase uses camelCase conventions. The backend API uses Spanish field names (`nombre`, `descripcion`, `imagen_url`). Mapping to English camelCase (`name`, `description`, `imageUrl`) keeps frontend code consistent and readable.

**Fields**:
```typescript
interface Category {
  id: string
  name: string
  description: string | null
  imageUrl: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string | null
}
```

### Decision 3: Feature under `features/admin/categories/`

**Choice**: Place category CRUD components in `features/admin/categories/` rather than a top-level `features/categories/`.

**Rationale**: This is admin-only functionality. Keeping it under `features/admin/` groups all admin features together and makes role-based routing clearer. The pattern aligns with the existing `features/admin/` structure.

### Decision 4: Modals for create/edit, confirmation dialog for delete

**Choice**: Use modals for create and edit forms (instead of separate pages). Use a confirmation dialog before delete.

**Rationale**: Category forms are simple (name, description, optional image URL, active toggle) — a modal is sufficient and keeps the user on the list view. Delete requires confirmation to prevent accidents and displays the conflict error inline in the modal.

### Decision 5: Shared components need fleshing out

**Choice**: The existing `Button`, `Input`, and `Modal` components are stubs. As part of this change, they will be implemented with proper TypeScript props, Tailwind styling, and accessibility attributes.

**Rationale**: These components are dependencies for the categories feature. Building them properly now establishes a reusable foundation for future admin features.

## Architecture

```
frontend/src/
├── entities/
│   └── category/
│       └── index.ts              ← Category type, CreateCategoryDto, UpdateCategoryDto
├── features/
│   └── admin/
│       └── categories/
│           ├── hooks/
│           │   └── useCategories.ts    ← TanStack Query hooks (list, create, update, delete)
│           ├── components/
│           │   ├── CategoryTable.tsx    ← Paginated table of categories
│           │   ├── CategoryForm.tsx     ← Create/edit form (used inside modal)
│           │   └── DeleteCategoryDialog.tsx  ← Confirmation + conflict error display
│           └── index.ts               ← Exports CategoryListPage
├── pages/
│   └── AdminPage.tsx            ← Refactored to layout with sub-routes
├── app/
│   └── App.tsx                  ← Added /admin/categories route
└── shared/
    └── components/
        ├── Button.tsx           ← Implemented from stub
        ├── Input.tsx            ← Implemented from stub
        └── Modal.tsx            ← Implemented from stub
```

## Component Tree

```
<AdminPage>                          /* Layout with sidebar navigation */
  <CategoryListPage>                 /* Main categories view */
    <Button> "Nueva Categoría" </Button>
    <CategoryTable>                  /* TanStack Table with pagination */
      <Skeleton /> (loading state)
      <tr> ... </tr> (data rows)
      <tr> "No hay categorías" </tr> (empty state)
    </CategoryTable>
    <Pagination /> (if > 1 page)
    <Modal> (create/edit)
      <CategoryForm />
        <Input name="name" />
        <Input name="description" />
        <Input name="imageUrl" />
        <Button type="submit" />
    </Modal>
    <Modal> (delete confirmation)
      <p> "¿Estás seguro?" </p>
      <Button variant="danger" />
      <Button variant="secondary" />
    </Modal>
    <p> "No se puede eliminar: tiene productos asociados" </p> (conflict error)
  </CategoryListPage>
</AdminPage>
```

## Data Flow

```
[CategoryListPage]
  │
  ├── useQuery(queryKeys.categories.list())  ← GET /api/v1/categorias?page=&size=
  │     → { items: Category[], total, page, size }
  │
  ├── useMutation(createCategory)            ← POST /api/v1/categorias
  │     → invalidate list query
  │
  ├── useMutation(updateCategory)            ← PATCH /api/v1/categorias/{id}
  │     → invalidate list + detail queries
  │
  └── useMutation(deleteCategory)            ← DELETE /api/v1/categorias/{id}
        → on 409: show conflict error
        → on 204: invalidate list query
```

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| Shared components (Button, Input, Modal) are stubs — implementing them adds scope | Build minimal viable versions; they are dependencies for the feature anyway |
| Admin sub-routing makes AdminPage more complex | Use a simple sidebar with `<Outlet />` — no complex routing library needed beyond React Router nested routes |
| Category form is simple now but may grow (e.g., image upload) | Design the form component to be extensible; keep fields optional where possible |
| Conflict on delete (409) must be shown clearly | Display the error message from the API response directly; avoid custom messages that could become stale |
