## Context

The order management system currently has two UX bugs that affect all users:

**1. Order ID fragmentation**: The `Order.id` is a UUID (e.g., `a1b2c3d4-e5f6-7890-abcd-ef1234567890`). Since UUIDs are not human-friendly, each view truncates/slices it differently:
- Mis pedidos: `id.slice(-8).toUpperCase()` → last 8 hex chars
- Admin: `id.slice(0, 8)` → first 8 hex chars
- Cocina: `numero ?? id.slice(0, 8)` → `numero` is always null, falls back to first 8 chars

A `numero` field exists in `CocinaPedidoRead` schema but is **never populated** — the `pedidos` table has no `numero` column.

**2. Missing product names**: `OrderItemRead` schema only exposes `product_id` (UUID). The underlying `OrderItem` model has a `product` relationship (`item.product.name`) but it's neither eager-loaded by `PedidoRepository` nor exposed in the schema. Only the KDS module (cocina) properly fetches and displays product names via its own `CocinaPedidoItem` schema.

Both are additive, non-breaking changes that only require schema extensions and a DB migration.

## Goals / Non-Goals

**Goals:**
- Every order has a human-readable sequential `numero` (1, 2, 3…) displayed consistently across all views
- "Mis pedidos" and Admin order detail show product names instead of truncated product_id UUIDs
- Existing API contracts remain backward-compatible (additive fields only)

**Non-Goals:**
- Not changing the underlying UUID primary key — `numero` is a display-only identifier
- Not redesigning the order list/detail UI — only fixing what data is displayed
- Not backfilling `numero` for archived/historical orders (only new orders)
- Not modifying the KDS `CocinaPedidoItem` schema (already correct)

## Decisions

### 1. Sequential `numero` via DB sequence (not Python-side counter)

**Decision**: Use a PostgreSQL `SEQUENCE` to generate `numero` values atomically.

**Rationale**:
- A Python-side counter (e.g., querying `SELECT MAX(numero) + 1`) has a race condition under concurrency
- A DB sequence is atomic, gapless-adjacent (sequences can skip numbers but never duplicate), and standard
- `nextval()` returns the next value atomically, safe under concurrent requests

**Alternative considered**: `IDENTITY` / `SERIAL` column. Rejected because `numero` is a display number, not a primary key — it can be nullable during backfill.

### 2. `product_name` as schema field, not a computed property

**Decision**: Add `product_name: str` to `OrderItemRead` and populate it from `item.product.name`.

**Rationale**:
- `from_attributes=True` in Pydantic allows reading `item.product.name` if the relationship is loaded
- Minimum code change — no new API endpoint, no join in the frontend
- The `OrderItem.product` relationship already exists in SQLAlchemy

**What changes**:
- `OrderItemRead` gains `product_name: str` (populated from attribute)
- `PedidoRepository.get_with_items()` adds `selectinload(OrderItem.product)` to load the relationship

## Data Model

### Order (pedidos table) — new column

```python
class Order(Base):
    __tablename__ = "pedidos"
    
    # ... existing columns ...
    numero: Mapped[int | None] = mapped_column(Integer, nullable=True, default=None)
```

New column is nullable initially, will be made non-nullable after backfill.

### Migration Plan

```python
def upgrade():
    # 1. Add nullable column
    op.add_column("pedidos", sa.Column("numero", sa.Integer(), nullable=True))
    
    # 2. Create sequence
    op.execute("CREATE SEQUENCE IF NOT EXISTS pedidos_numero_seq START 1")
    
    # 3. Backfill existing rows
    op.execute("""
        UPDATE pedidos 
        SET numero = nextval('pedidos_numero_seq') 
        WHERE numero IS NULL
    """)
    
    # 4. Make non-nullable and set default
    op.alter_column("pedidos", "numero", nullable=False, 
                    server_default=sa.text("nextval('pedidos_numero_seq')"))

def downgrade():
    op.drop_column("pedidos", "numero")
    op.execute("DROP SEQUENCE IF EXISTS pedidos_numero_seq")
```

### Schema Changes

```python
# backend/modules/pedidos/schemas.py

class OrderItemRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    product_id: UUID
    product_name: str  # ← NEW: populated from item.product.name
    quantity: int
    unit_price: float
    subtotal: float

class PedidoRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    numero: int | None = None  # ← NEW: sequential order number
    user_id: UUID
    address_id: UUID | None = None
    status: OrderStatus
    total: float
    currency: str
    items: list[OrderItemRead]
    payment: PagoRead | None = None
    created_at: datetime
    updated_at: datetime | None = None
```

## API Changes

None — both `numero` and `product_name` are additive fields in existing response schemas. No new endpoints, no request changes.

### Affected endpoints (response shape changes):
- `GET /pedidos/` — list user's orders
- `GET /pedidos/{id}` — order detail
- `GET /admin/pedidos` — admin order list

## Frontend Changes

### Mis pedidos

| Component | Current | New |
|-----------|---------|-----|
| `OrderCard.tsx:34` | `order.id.slice(-8).toUpperCase()` | `order.numero` |
| `OrderDetailPage.tsx:527` | `order.id.slice(-8).toUpperCase()` | `order.numero` |
| `OrderDetailPage.tsx:669` | `Producto #${item.product_id.slice(-6)}` | `item.product_name` |

### Admin

| Component | Current | New |
|-----------|---------|-----|
| `OrdersTable.tsx:87` | `order.id.slice(0, 8)…` | `order.numero` |
| `OrderDetailInfo.tsx:42` | `order.id.slice(0, 8)` | `order.numero` |
| `OrderDetailInfo.tsx:71` | Full UUID displayed | Keep for reference, add `numero` as primary |
| `OrderDetailInfo.tsx:160` | `item.product_id.slice(0, 8)…` | `item.product_name` |
| `DashboardRecentOrders.tsx:88` | `order.id.slice(0, 8)…` | `order.numero` |

### Cocina

| Component | Current | New |
|-----------|---------|-----|
| `OrderCard.tsx:49` | `numero ?? id.slice(0, 8)` | `numero` (now always populated) |

No TypeScript type changes needed — `OrderRead` and `OrderItemRead` interfaces can just start using the new fields since they map from the API response.

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| **Sequence gap**: If `numero` is generated before a transaction rolls back, the sequence value is consumed but not used (gap in numbers) | Accepted — sequences are designed for this. Gaps are harmless for a display identifier. |
| **Concurrent orders**: Two orders created simultaneously could see stale data | `nextval()` is atomic per PostgreSQL, no race condition possible |
| **Existing orders lack `numero`** | Migration backfills them; cocina already handled `numero=None` gracefully in the fallback |
| **Frontend TypeScript**: `OrderRead` interface doesn't declare `numero` or `product_name` yet | The interface is open-ended — accessing `order.numero` returns the value if present. But we should add it to the type for clarity |
| **Pedidos list query doesn't eager-load products** | `get_by_user()` and `get_by_status()` also need `selectinload(OrderItem.product)` — not just `get_with_items()` |

## Open Questions

- ~~Should `numero` be displayed in the cocina URL / route?~~ No — cocina uses `id` in URLs for status updates. `numero` is display-only.
- Does the admin order list also need the full UUID somewhere? Yes — keep the full UUID as a secondary reference in the detail view.
