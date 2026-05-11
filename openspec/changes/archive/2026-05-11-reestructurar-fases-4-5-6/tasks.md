## 1. Preparación y Análisis

- [ ] 1.1 Leer el `docs/CHANGES.md` actual completo para identificar todas las secciones a modificar
- [ ] 1.2 Identificar referencias a las fases antiguas en otros archivos del proyecto (specs, README, etc.)

## 2. Actualizar Fase 4 — Customer Experience

- [ ] 2.1 Reemplazar tabla de Fase 4 en CHANGES.md: sacar `addresses-crud` y `cart-frontend`, agregar `customer-catalog`, `customer-cart-checkout`, `customer-orders`
- [ ] 2.2 Agregar funcionalidad, historias de usuario y dependencias para cada nuevo cambio de Fase 4
- [ ] 2.3 Actualizar descripción de Fase 4 a "Customer Experience"

## 3. Actualizar Fase 5 — Pedidos, Pagos y Admin

- [ ] 3.1 Reemplazar tabla de Fase 5: sacar `orders-create`, mantener `orders-state-machine` y `mercadopago-integration`, agregar `admin-dashboard`
- [ ] 3.2 Actualizar dependencias: `mercadopago-integration` y `orders-state-machine` ahora dependen de `customer-cart-checkout`
- [ ] 3.3 Agregar `admin-dashboard` con sus dependencias y funcionalidad
- [ ] 3.4 Actualizar descripción de Fase 5 a "Pagos y Administración"

## 4. Actualizar Fase 6 — Polish Final

- [ ] 4.1 Reemplazar tabla de Fase 6: sacar `admin-panel` (pasó a Fase 5) y `client-profile`, mantener `ui-global`, agregar `addresses-ui`
- [ ] 4.2 Agregar `addresses-ui` con su funcionalidad (CRUD direcciones desde perfil)
- [ ] 4.3 Actualizar descripción de Fase 6 a "Polish y Experiencia de Usuario"

## 5. Actualizar Diagrama de Dependencias

- [ ] 5.1 Redibujar el diagrama ASCII de dependencias reflejando la nueva estructura:
  - `products-crud → customer-catalog → customer-cart-checkout → customer-orders`
  - `customer-cart-checkout → mercadopago-integration`
  - `customer-cart-checkout → orders-state-machine → admin-dashboard`
  - `addresses-ui` (independiente, Fase 6)
  - `ui-global` (depende de todos los anteriores)

## 6. Actualizar Tablas Resumen

- [ ] 6.1 Actualizar tabla "Resumen Ejecutivo" (cambios 13-20): renombrar, reordenar y reasignar complejidades
- [ ] 6.2 Actualizar tabla de "Épicas y Historias de Usuario Cubiertas": reasignar épicas a los nuevos cambios

## 7. Actualizar Skills Recomendadas

- [ ] 7.1 Agregar skills para los nuevos cambios:
  - `customer-catalog` → react-dev, tailwindcss, food-ecommerce-ui
  - `customer-cart-checkout` → react-dev, zustand-state-management, food-ecommerce-ui
  - `customer-orders` → react-dev, food-ecommerce-ui
  - `admin-dashboard` → react-dev, tailwind-design-system, dashboard-crud-page
  - `addresses-ui` → react-dev

## 8. Verificación Final

- [ ] 8.1 Revisar que no queden referencias a cambios antiguos (`addresses-crud`, `cart-frontend` como cambios de Fase 4, `orders-create` como cambio de Fase 5, `admin-panel`/`client-profile` como cambios de Fase 6)
- [ ] 8.2 Verificar que el diagrama de dependencias sea consistente con las tablas
- [ ] 8.3 Confirmar que todas las historias de usuario (US-024 a US-072) están cubiertas por los nuevos cambios
- [ ] 8.4 Leer el CHANGES.md completo de punta a punta para validar coherencia
