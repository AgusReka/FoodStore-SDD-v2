# customer-order-detail delta spec

## ADDED Requirements

### Requirement: Post-checkout invalidates orders list cache

The system SHALL invalidate the cached orders list when the order detail page is visited immediately after checkout, ensuring that navigating back to "Mis Pedidos" shows updated data.

#### Scenario: Orders list cache invalidated on post-checkout redirect
- **WHEN** an authenticated customer completes checkout and is redirected to `/orders/{order_id}?new=true`
- **THEN** the system SHALL call `queryClient.invalidateQueries({ queryKey: ['orders', 'list'] })`
- **AND** the invalidation SHALL happen once, on mount, when `?new=true` is present

#### Scenario: Normal order detail visit does not invalidate
- **WHEN** an authenticated customer navigates to `/orders/{order_id}` directly (without `?new=true`)
- **THEN** the orders list cache SHALL NOT be invalidated
