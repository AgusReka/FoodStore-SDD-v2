## Context

Food Store currently manages products and categories but has no concept of ingredients. Products have no composition data. This change introduces a full ingredient management system with CRUD operations and a many-to-many relationship between products and ingredients.

**Current state:** Product model has no ingredient relationship. No ingredient table exists.
**Technical constraints:** Follows existing module patterns (model → schemas → repository → service → router), SQLAlchemy async, FastAPI, React + TypeScript.
**Stakeholders:** Admin users (manage ingredients), customers (view product composition).

## Goals / Non-Goals

**Goals:**
- Provide full CRUD for ingredients (create, read, update, delete)
- Enable associating ingredients with products via a junction table with quantity
- Expose ingredient info in product read responses
- Admin-only management of ingredients
- Follow existing backend (feature-first) and frontend (FSD + admin CRUD) patterns

**Non-Goals:**
- Customer-facing ingredient browse/search page (out of scope for this change)
- Nutritional info (calories, macros, etc.) — only ingredient name + unit + quantity
- Stock/inventory tracking for ingredients
- Recipe management or complex ingredient hierarchies

## Decisions

### Decision 1: Dedicated `ingredientes` module (vs. inline in productos)

- **Chosen**: New `backend/modules/ingredientes/` with its own model, schemas, repository, service, router
- **Rationale**: Follows existing feature-first pattern used by `categorias`, `productos`, etc. Keeps concerns separated. Ingredients have their own lifecycle independent of products.
- **Alternative considered**: Adding ingredient fields directly to Product model — rejected because ingredients are a separate domain entity with their own CRUD.

### Decision 2: Junction table `producto_ingredientes` for many-to-many

- **Chosen**: Separate junction table with `product_id`, `ingredient_id`, and `cantidad` (quantity as numeric)
- **Rationale**: A product can have many ingredients, and an ingredient can appear in many products. The junction table allows storing the quantity needed per product.
- **Alternative considered**: JSON array on Product — rejected because it breaks normalization, makes querying impossible, and complicates migrations.

### Decision 3: Quantity as simple numeric (decimal)

- **Chosen**: `cantidad` as `Numeric(10, 2)` — decimal value representing the amount (e.g., 0.5 kg, 2 units)
- **Rationale**: Most flexible for different ingredient types (weight, volume, count). The `unidad_medida` field on Ingredient describes the unit.
- **Alternative considered**: String-based quantity (e.g., "1/2 cup") — rejected because it prevents aggregation and sorting.

### Decision 4: Cascade behavior — restrict delete on junction

- **Chosen**: When deleting an ingredient, return 409 Conflict if any product references it (soft block). When deleting a product, cascade-delete junction rows.
- **Rationale**: Prevents orphaned references and data integrity issues. Product deletion implicitly cleans up its ingredient associations.

### Decision 5: Admin-only permissions

- **Chosen**: All ingredient mutation endpoints require `INGREDIENT_CREATE`, `INGREDIENT_UPDATE`, `INGREDIENT_DELETE` permissions. Read endpoints require `INGREDIENT_READ` or are public (list).
- **Rationale**: Ingredients management is an admin function. Reading ingredients (for product pages) should be available to all authenticated users and potentially public.

### Decision 6: Frontend follows existing admin CRUD pattern

- **Chosen**: New `features/admin/ingredients/` with index page, table, form modal, delete dialog — mirrors `features/admin/categories/` exactly.
- **Rationale**: Consistency. The category CRUD is the established pattern for admin list pages. Using the same pattern reduces cognitive load and review effort.

## Data Model

### Ingredient (`ingredientes` table)

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK, default uuid4 |
| nombre | String(100) | NOT NULL, UNIQUE |
| descripcion | Text | nullable |
| unidad_medida | String(50) | NOT NULL (e.g., "kg", "g", "unidad", "litro", "ml", "cucharada") |
| imagen_url | String(500) | nullable |
| created_at | DateTime | server_default now() |
| updated_at | DateTime | onupdate now() |

### Product-Ingredient Junction (`producto_ingredientes` table)

| Column | Type | Constraints |
|--------|------|-------------|
| product_id | UUID | PK, FK → productos.id ON DELETE CASCADE |
| ingredient_id | UUID | PK, FK → ingredientes.id ON DELETE RESTRICT |
| cantidad | Numeric(10, 2) | NOT NULL |

Composite PK on (product_id, ingredient_id).

## API Changes

### New endpoints: `/api/v1/ingredientes`

| Method | Path | Permission | Description |
|--------|------|------------|-------------|
| GET | `/api/v1/ingredientes` | None (public) | List ingredients with pagination & search |
| GET | `/api/v1/ingredientes/{id}` | None (public) | Get ingredient by ID |
| POST | `/api/v1/ingredientes` | INGREDIENT_CREATE | Create ingredient |
| PATCH | `/api/v1/ingredientes/{id}` | INGREDIENT_UPDATE | Update ingredient |
| DELETE | `/api/v1/ingredientes/{id}` | INGREDIENT_DELETE | Delete ingredient |

### Modified endpoints: `/api/v1/productos`

Product schemas gain an optional `ingredientes` field:

**ProductCreate** (modified):
```json
{
  "nombre": "Pizza Margherita",
  "ingredientes": [
    { "ingredient_id": "uuid-1", "cantidad": 0.5 },
    { "ingredient_id": "uuid-2", "cantidad": 0.2 }
  ]
}
```

**ProductUpdate** (modified): Same structure, replaces all associations on update.

**ProductRead** (modified): Adds `ingredientes` array with ingredient details.

## Frontend Component Structure

```
frontend/src/
├── entities/ingredient/
│   └── index.ts           ← TypeScript types + normalizer
├── features/admin/ingredients/
│   ├── index.tsx           ← CRUD page (list + modal orchestration)
│   ├── components/
│   │   ├── IngredientTable.tsx    ← Table with pagination
│   │   ├── IngredientForm.tsx     ← Create/edit form modal
│   │   └── DeleteIngredientDialog.tsx ← Delete confirmation
│   └── hooks/
│       └── useIngredients.ts      ← TanStack Query hooks
├── pages/AdminPage.tsx     ← Modified: add nav link
├── app/App.tsx             ← Modified: add /admin/ingredients route
└── shared/api/endpoints.ts ← Modified: add ingredient endpoints
```

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| Adding ingredients to product schemas changes the API contract | Use optional `ingredientes` field — existing clients unaffected |
| Cascade delete on product side could silently remove ingredient data | Intentional: deleting a product removes its ingredient associations. The ingredient itself is not deleted. |
| RESTRICT on ingredient delete could frustrate admins | Return clear 409 error with message listing affected products |
| Unit of measure as free text could lead to inconsistent values | Consider a predefined enum or reference table in future iterations; for now, free text with validation |
