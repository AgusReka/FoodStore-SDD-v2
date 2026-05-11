# Roadmap Restructure

## MODIFIED Requirements

### Requirement: Phase 4 — Carrito y Direcciones (OLD → Customer Experience NEW)
**Reason**: La experiencia del cliente (catálogo, carrito, checkout, pedidos) estaba fragmentada en 3 fases. Se unifica en una sola Fase 4.

| Old Phase 4 | New Phase 4 |
|-------------|-------------|
| `addresses-crud` | `customer-catalog` |
| `cart-frontend` | `customer-cart-checkout` |
| — | `customer-orders` |

#### Scenario: New Phase 4 structure is documented
- **WHEN** the roadmap is viewed
- **THEN** Phase 4 shows `customer-catalog`, `customer-cart-checkout`, `customer-orders` as its changes

### Requirement: Phase 5 — Pedidos y Pagos (Restructured)
**Reason**: `orders-create` se absorbe en `customer-cart-checkout` de Fase 4. Se agrega `admin-dashboard`.

| Old Phase 5 | New Phase 5 |
|-------------|-------------|
| `orders-create` | `mercadopago-integration` |
| `orders-state-machine` | `orders-state-machine` |
| `mercadopago-integration` | `admin-dashboard` |

#### Scenario: New Phase 5 structure is documented
- **WHEN** the roadmap is viewed
- **THEN** Phase 5 shows `mercadopago-integration`, `orders-state-machine`, `admin-dashboard` as its changes

### Requirement: Phase 6 — Panel Admin y UI Global (Restructured)
**Reason**: `admin-panel` se renombra a `admin-dashboard` (pasa a Fase 5). `client-profile` se reemplaza por `addresses-ui`. `ui-global` se mantiene.

| Old Phase 6 | New Phase 6 |
|-------------|-------------|
| `admin-panel` | `addresses-ui` |
| `client-profile` | `ui-global` |
| `ui-global` | — |

#### Scenario: New Phase 6 structure is documented
- **WHEN** the roadmap is viewed
- **THEN** Phase 6 shows `addresses-ui` and `ui-global` as its changes

### Requirement: Dependencies graph updated
**Reason**: El diagrama de dependencias debe reflejar la nueva estructura.

#### Scenario: Dependency diagram is updated
- **WHEN** the CHANGES.md is viewed
- **THEN** the dependency diagram shows the new phase structure with accurate arrows

### Requirement: Executive summary updated
**Reason**: La tabla resumen ejecutivo debe reflejar los nuevos cambios y su complejidad.

#### Scenario: Summary table is updated
- **WHEN** the CHANGES.md is viewed
- **THEN** the executive summary table lists the new changes with updated complexity ratings

### Requirement: Epics table updated
**Reason**: La tabla de épicas debe mapearse a los nuevos cambios.

#### Scenario: Epics table is updated
- **WHEN** the CHANGES.md is viewed
- **THEN** the epics table maps each new change to its corresponding epic
