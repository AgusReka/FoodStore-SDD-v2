## Requirements

### Requirement: TanStack Query provider configured
The frontend SHALL have TanStack Query (React Query v5) configured with a QueryClient provider.

#### Scenario: QueryClient provider wraps the app
- **WHEN** the developer inspects `main.tsx` or `App.tsx`
- **THEN** the app SHALL be wrapped with `<QueryClientProvider>` from `@tanstack/react-query`
- **AND** a `QueryClient` instance SHALL be created with default options

#### Scenario: Default query options configured
- **WHEN** the QueryClient is created
- **THEN** it SHALL have `retry: 1` for failed requests
- **AND** `staleTime: 5 * 60 * 1000` (5 minutes) for standard queries
- **AND** `refetchOnWindowFocus: false` to avoid unnecessary refetches

### Requirement: TanStack Query DevTools in development
The app SHALL include React Query DevTools in development mode only.

#### Scenario: DevTools loaded conditionally
- **WHEN** the app runs in development mode (`import.meta.env.DEV` is true)
- **THEN** the TanStack Query DevTools SHALL be rendered
- **AND** when in production mode, DevTools SHALL NOT be included in the bundle

### Requirement: Query keys factory pattern established
The project SHALL establish a pattern for organizing query keys.

#### Scenario: Query keys structured by domain
- **WHEN** a developer needs to define query keys
- **THEN** they SHALL use a structured approach, e.g., `queryKeys.products.list()`, `queryKeys.products.detail(id)`
- **AND** query keys SHALL be defined in `shared/api/queryKeys.ts` or within feature folders
