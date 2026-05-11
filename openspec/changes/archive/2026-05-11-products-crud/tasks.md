## 1. Product Entity Types

- [ ] 1.1 Define TypeScript interfaces in `entities/product/index.ts` (Product, ProductRaw, CreateProductDto, UpdateProductDto, ProductIngredient) following the same pattern as `entities/category/index.ts`
- [ ] 1.2 Implement `normalizeProduct()` function to convert snake_case API responses to camelCase frontend types
- [ ] 1.3 Missing? Search codebase for existing `@entities/product` imports to verify no breaking changes

## 2. Product Hooks (TanStack Query)

- [ ] 2.1 Create `features/admin/products/hooks/useProducts.ts` with query keys (`productsKeys.all`, `productsKeys.list`, `productsKeys.detail`)
- [ ] 2.2 Implement `useProductsList(page, size, search?, categoriaId?)` hook with search and category filter params
- [ ] 2.3 Implement `useProductDetail(id)` hook
- [ ] 2.4 Implement `useCreateProduct()` mutation that invalidates product list on success
- [ ] 2.5 Implement `useUpdateProduct()` mutation that invalidates product list + detail on success
- [ ] 2.6 Implement `useDeleteProduct()` mutation that invalidates product list on success

## 3. Product Table Component

- [ ] 3.1 Create `features/admin/products/components/ProductTable.tsx` with columns: name, price (formatted), category name, availability badge, edit/delete actions
- [ ] 3.2 Add loading skeleton state (5 rows)
- [ ] 3.3 Add empty state with "No hay productos" message and invitation to create
- [ ] 3.4 Integrate Pagination component with page controls

## 4. Product Form Component

- [ ] 4.1 Create `features/admin/products/components/ProductForm.tsx` with fields: name, description, price, currency, image URL
- [ ] 4.2 Add category selector dropdown that fetches categories list
- [ ] 4.3 Add ingredient association section with multi-select ingredient picker and quantity per ingredient
- [ ] 4.4 Add availability toggle checkbox (shown only when editing)
- [ ] 4.5 Add client-side validation (name required, price required and positive)
- [ ] 4.6 Render form in a Modal with size `lg` (product form is more complex than categories)

## 5. Delete Product Dialog

- [ ] 5.1 Create `features/admin/products/components/DeleteProductDialog.tsx` following the pattern of `DeleteCategoryDialog.tsx`
- [ ] 5.2 Handle 409 conflict errors with user-friendly message (product has associated orders)

## 6. Main Page Component & Routing

- [ ] 6.1 Create `features/admin/products/index.tsx` as `ProductListPage` component that composes all sub-components (table, form modal, delete dialog)
- [ ] 6.2 Add `/admin/products` route in `App.tsx` importing `ProductListPage` from `@features/admin/products`
- [ ] 6.3 Add "Productos" sidebar link in `AdminPage.tsx` nav items

## 7. Verification

- [ ] 7.1 Run TypeScript compilation check on the frontend (`pnpm run build` or `npx tsc --noEmit`)
- [ ] 7.2 Verify all CRUD operations work end-to-end: create product with category + ingredients, edit, delete, search, filter by category
