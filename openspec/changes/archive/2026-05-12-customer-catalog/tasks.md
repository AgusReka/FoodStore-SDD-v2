## 1. Data Layer — Customer Catalog Hooks

- [x] 1.1 Create `frontend/src/features/catalog/hooks/useCustomerProducts.ts` with `useCustomerProductsList` hook (TanStack Query, search, category filter, pagination params)
- [x] 1.2 Create `frontend/src/features/catalog/hooks/useCustomerCategories.ts` with `useCustomerCategoriesList` hook (TanStack Query for active categories)
- [x] 1.3 Create `frontend/src/features/catalog/hooks/useCustomerProductDetail.ts` with `useCustomerProductDetail` hook (TanStack Query for single product)
- [x] 1.4 Create `frontend/src/features/catalog/index.ts` barrel export

## 2. Product Grid Component

- [x] 2.1 Implement `ProductGrid` component in `frontend/src/entities/product/ProductGrid.tsx` with responsive grid layout (2/3/4 columns)
- [x] 2.2 Add skeleton loading cards (pulsing placeholder cards matching ProductCard dimensions)
- [x] 2.3 Add empty state ("No hay productos disponibles") with optional illustration
- [x] 2.4 Add error state with "Reintentar" button
- [x] 2.5 Wire ProductCard into the grid with click handler for navigation to detail page

## 3. Category Filter Rail

- [x] 3.1 Create `frontend/src/features/catalog/components/CategoryRail.tsx` — horizontal scrollable pill list
- [x] 3.2 Implement "Todas" (All) pill as default selected state
- [x] 3.3 Implement category pill click handler to filter products
- [x] 3.4 Add active pill visual highlight styling (Mesa warm orange)
- [x] 3.5 Add horizontal scroll with touch support for mobile

## 4. Search Bar

- [x] 4.1 Create `frontend/src/features/catalog/components/SearchBar.tsx` with debounced input (300ms)
- [x] 4.2 Implement search query parameter sync with product list hook
- [x] 4.3 Add clear button when search has text
- [x] 4.4 Add search icon/indicator

## 5. Home Page Catalog

- [x] 5.1 Rewrite `frontend/src/pages/HomePage.tsx` to compose SearchBar, CategoryRail, ProductGrid, and pagination
- [x] 5.2 Wire TanStack Query hooks for products and categories
- [x] 5.3 Implement pagination controls at bottom of grid
- [x] 5.4 Ensure search and category filter state persist across re-renders
- [x] 5.5 Add page transition/loading states

## 6. Product Detail Page

- [x] 6.1 Create `frontend/src/pages/ProductDetailPage.tsx` fetching product by ID and rendering ProductDetail component
- [x] 6.2 Add "Volver" (Back) button that navigates to home page
- [x] 6.3 Add loading skeleton state
- [x] 6.4 Add "Producto no encontrado" state with link to home
- [x] 6.5 Add error state with "Reintentar" button
- [x] 6.6 Register route `/productos/:id` in `App.tsx`

## 7. Header Widget

- [x] 7.1 Implement `Header` component in `frontend/src/widgets/Header.tsx` with logo/app name, search input, navigation links, and cart icon
- [x] 7.2 Add cart item count badge reading from Zustand `cartStore`
- [x] 7.3 Wire cart icon click to navigate to `/cart`
- [x] 7.4 Implement glassmorphism styling (backdrop blur, semi-transparent bg, subtle border)
- [x] 7.5 Make header sticky (fixed at top, z-index layering)

## 8. Layout Integration

- [x] 8.1 Integrate Header into `frontend/src/app/Layout.tsx` above `<Outlet />`
- [x] 8.2 Ensure admin routes are not broken by Header layout change
- [x] 8.3 Add any missing route guards if needed
- [x] 8.4 Verify header displays correctly on all public pages (home, login, register, product detail)
