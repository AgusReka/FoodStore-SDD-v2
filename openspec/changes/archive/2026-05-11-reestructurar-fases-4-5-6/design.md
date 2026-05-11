## Context

El proyecto FoodStore tiene actualmente 15 cambios archivados (Fases 1-3 completadas) y un roadmap documentado en `docs/CHANGES.md` que define 20 cambios en 6 fases. 

### Estado Actual
- **Fase 3 completada**: Catálogo de productos (backend + admin CRUDs), ingredientes, categorías, stock
- **Backend completo**: Todos los módulos implementados (auth, usuarios, productos, categorías, pedidos, pagos, direcciones, ingredientes, admin)
- **Frontend**: Admin CRUDs funcionales, auth completo, pero páginas de cliente como placeholders (CartPage, CheckoutPage, OrdersPage solo tienen texto stub)
- **HomePage**: Solo banner de bienvenida sin grilla de productos

### Problema del Roadmap Actual
La experiencia del cliente (catálogo → carrito → checkout → pedidos) está fragmentada en Fases 4, 5 y 6, lo que significa que pasarían 3 fases más antes de tener un MVP donde un cliente pueda comprar.

## Goals / Non-Goals

**Goals:**
- Reorganizar las fases 4, 5 y 6 para que la experiencia completa del cliente esté en una sola fase (Fase 4)
- Consolidar cambios existentes que estaban artificialmente separados (addresses-crud, cart-frontend, orders-create)
- Simplificar el grafo de dependencias entre cambios
- Actualizar `docs/CHANGES.md` con la nueva estructura
- Mantener compatibilidad hacia atrás con los cambios ya archivados

**Non-Goals:**
- Modificar cambios ya archivados (Fases 1-3)
- Cambiar la estructura del backend o frontend
- Eliminar funcionalidades planeadas (solo se reorganizan)
- Crear código nuevo (esto es un cambio de planificación)

## Decisions

### Decisión 1: Customer Experience como Fase 4 unificada
**En lugar de:** Tener addresses-crud + cart-frontend en Fase 4, orders en Fase 5, y profile en Fase 6.
**Hacemos:** customer-catalog → customer-cart-checkout → customer-orders en Fase 4.
**Por qué:**
- El flujo completo del cliente (ver productos → comprar → ver pedido) es una experiencia cohesiva
- Reduce el tiempo hasta MVP funcional de 3 fases a 1
- Los placeholders actuales (CartPage, CheckoutPage, OrdersPage) se completan juntos
- El backend ya tiene todos los módulos necesarios — es mayormente trabajo de frontend

### Decisión 2: `addresses-ui` se mueve a Fase 6 (no bloquea checkout)
**En lugar de:** Tener addresses-crud como cambio independiente en Fase 4.
**Hacemos:** La selección de dirección va integrada en el checkout de customer-cart-checkout, y el CRUD completo de direcciones (con gestión desde el perfil) va en Fase 6.
**Por qué:**
- El checkout necesita seleccionar una dirección, no un CRUD completo
- El backend de direcciones ya existe — solo necesita un selector en checkout
- El CRUD completo (crear, editar, eliminar, predeterminada) desde el perfil no bloquea el MVP
- Reduce dependencias tempranas

### Decisión 3: `orders-create` se absorbe en `customer-cart-checkout`
**En lugar de:** Tener orders-create como cambio separado en Fase 5 con dependencia de cart-frontend y addresses-crud.
**Hacemos:** La creación del pedido ocurre como parte del checkout en customer-cart-checkout.
**Por qué:**
- La creación atómica del pedido (UoW, snapshots, validación de stock) es intrínseca al checkout
- El backend de pedidos ya existe — es integración frontend-backend
- Elimina una dependencia cruzada entre fases

### Decisión 4: `admin-dashboard` pasa a Fase 5
**En lugar de:** Tener admin-panel en Fase 6 con dependencia de orders-state-machine.
**Hacemos:** Admin-dashboard en Fase 5, después de orders-state-machine.
**Por qué:**
- El dashboard con métricas de pedidos necesita la FSM de estados funcionando
- La gestión de pedidos desde admin es crítica post-MVP
- Sigue teniendo sentido después de la experiencia de cliente

## Riesgos / Trade-offs

| Riesgo | Mitigación |
|--------|------------|
| `customer-cart-checkout` puede ser muy grande (abarca carrito + checkout + creación de pedido) | Dividir en 2 cambios si es necesario: `customer-cart` y `customer-checkout` |
| La creación de pedidos tiene complejidad atómica (UoW, stock, snapshots) que podría retrasar el checkout | El backend ya está implementado — el change se enfoca en integración frontend |
| `addresses-ui` en Fase 6 significa que el CRUD completo de direcciones llega tarde | El checkout tiene un selector de dirección mínimo; el CRUD completo es una mejora |
| El change es puramente documental — no hay código que validar | La revisión del CHANGES.md actualizado sirve como validación |

## Open Questions

- ¿Los cambios `customer-cart-checkout` debería dividirse en dos cambios separados (`customer-cart` y `customer-checkout`) si resulta demasiado grande?
- ¿La Fase 4 debería llamarse "Customer Experience" o "Experiencia del Cliente" (Español/Inglés)?
- ¿Mantenemos la nomenclatura existing de cambios en inglés o usamos español como algunos cambios previos (ej: `gestion-stock`)?
