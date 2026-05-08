# Tasks: Backend Patterns

## 1. Core Infrastructure

- [x] 1.1 Create `core/repository.py` with `BaseRepository[ModelT]` generic class providing `get`, `get_all`, `create`, `update`, `delete`, `paginate` methods using async SQLAlchemy 2.0
- [x] 1.2 Create `core/service.py` with `BaseService[ModelT]` generic class providing standard CRUD orchestration delegating to repository
- [x] 1.3 Create `core/exceptions.py` with `NotFoundError`, `ConflictError`, `ForbiddenError`, `UnauthorizedError`, `ValidationError` exception classes
- [x] 1.4 Add global exception handler in `core/error_handler.py` catching all custom exceptions and returning consistent `{"detail": "...", "code": "..."}` JSON responses
- [x] 1.5 Register global exception handler in `main.py` startup
- [x] 1.6 Create `core/schemas.py` with shared base schemas: `PaginatedResponse`, `ErrorResponse`, `SuccessResponse`

## 2. Schema Layer — All Modules

- [x] 2.1 Implement `modules/usuarios/schemas.py`: `UserCreate`, `UserUpdate`, `UserRead`, `UserList` with Pydantic v2 `model_config`
- [x] 2.2 Implement `modules/productos/schemas.py`: `ProductCreate`, `ProductUpdate`, `ProductRead`, `ProductList`
- [x] 2.3 Implement `modules/categorias/schemas.py`: `CategoriaCreate`, `CategoriaUpdate`, `CategoriaRead`, `CategoriaList`
- [x] 2.4 Implement `modules/pedidos/schemas.py`: `PedidoCreate`, `PedidoUpdate`, `PedidoRead`, `PedidoList`, `OrderItemSchema`
- [x] 2.5 Implement `modules/pagos/schemas.py`: `PagoCreate`, `PagoUpdate`, `PagoRead`, `PagoList`
- [x] 2.6 Implement `modules/direcciones/schemas.py`: `DireccionCreate`, `DireccionUpdate`, `DireccionRead`, `DireccionList`
- [x] 2.7 Implement `modules/auth/schemas.py`: `LoginRequest`, `TokenResponse`, `RegisterRequest`
- [x] 2.8 Implement `modules/admin/schemas.py`: `UserRoleUpdate`, `AdminStatsResponse`
- [x] 2.9 Implement `modules/refreshtokens/schemas.py`: `RefreshTokenRequest`, `RefreshTokenResponse`

## 3. Repository Layer — All Modules

- [x] 3.1 Implement `modules/usuarios/repository.py`: `UserRepository(BaseRepository[User])` with `get_by_email`, `search_by_name_or_email` methods
- [x] 3.2 Implement `modules/productos/repository.py`: `ProductRepository(BaseRepository[Product])` with `search_by_nombre`, `filter_by_categoria`, `check_stock` methods
- [x] 3.3 Implement `modules/categorias/repository.py`: `CategoriaRepository(BaseRepository[Categoria])` with `get_with_products`, `has_products` methods
- [x] 3.4 Implement `modules/pedidos/repository.py`: `PedidoRepository(BaseRepository[Order])` with `get_by_user`, `get_by_status`, `get_with_items` methods
- [x] 3.5 Implement `modules/pagos/repository.py`: `PagoRepository(BaseRepository[Payment])` with `get_by_order`, `get_by_status` methods
- [x] 3.6 Implement `modules/direcciones/repository.py`: `DireccionRepository(BaseRepository[Direccion])` with `get_by_user`, `get_principal`, `unset_principal` methods
- [x] 3.7 Implement `modules/auth/repository.py`: uses `UserRepository` from usuarios (no own repository — delegates to UserRepository)
- [x] 3.8 Implement `modules/refreshtokens/repository.py`: `RefreshTokenRepository(BaseRepository[RefreshToken])` with `get_by_token`, `revoke_token`, `revoke_all_for_user` methods

## 4. Service Layer — All Modules

- [x] 4.1 Implement `modules/usuarios/service.py`: `UserService` with `create_user` (hash password), `update_user`, `delete_user`, `list_users`, `get_by_email`
- [x] 4.2 Implement `modules/productos/service.py`: `ProductService` with `create_product` (validate categoria exists), `update_product`, `list_products` (search, filter, paginate)
- [x] 4.3 Implement `modules/categorias/service.py`: `CategoriaService` with standard CRUD + `delete_categoria` blocking if has products
- [x] 4.4 Implement `modules/pedidos/service.py`: `OrderService` with `create_order` (validate stock, calculate total), `update_status` (enforce valid transitions), `list_user_orders`
- [x] 4.5 Implement `modules/pagos/service.py`: `PagoService` with `create_payment` (validate order not already paid), `update_estado` (advance order status on completion)
- [x] 4.6 Implement `modules/direcciones/service.py`: `DireccionService` with `create_address` (handle default/principal logic), `update_address`, `list_user_addresses`
- [x] 4.7 Implement `modules/auth/service.py`: `AuthService` with `register` (create user), `login` (verify password, issue tokens), `refresh_token`, `logout` (revoke refresh token)
- [x] 4.8 Implement `modules/admin/service.py`: `AdminService` with `list_all_users`, `update_user_role`, `list_all_orders`
- [x] 4.9 Implement `modules/refreshtokens/service.py`: `RefreshTokenService` with `create_token`, `validate_and_rotate`, `revoke_token`

## 5. Router Layer — All Modules

- [x] 5.1 Implement `modules/usuarios/router.py`: CRUD endpoints at `/api/v1/usuarios` with pagination and role filter
- [x] 5.2 Implement `modules/productos/router.py`: CRUD endpoints at `/api/v1/productos` with search and category filtering
- [x] 5.3 Implement `modules/categorias/router.py`: CRUD endpoints at `/api/v1/categorias`
- [x] 5.4 Implement `modules/pedidos/router.py`: Order CRUD + status transitions at `/api/v1/pedidos`
- [x] 5.5 Implement `modules/pagos/router.py`: Payment CRUD + status updates at `/api/v1/pagos`
- [x] 5.6 Implement `modules/direcciones/router.py`: Address CRUD at `/api/v1/direcciones`
- [x] 5.7 Implement `modules/auth/router.py`: Register, login, me, refresh, logout at `/api/v1/auth`
- [x] 5.8 Implement `modules/admin/router.py`: Admin-only endpoints at `/api/v1/admin/usuarios` and `/api/v1/admin/pedidos`
- [x] 5.9 Create `modules/__init__.py` with consistent router exports per module

## 6. Module Cleanup & Restructuring

- [x] 6.1 Remove `modules/auth/model.py` (auth has no own model — uses User from usuarios)
- [x] 6.2 Update `modules/auth/__init__.py` to export auth router only
- [x] 6.3 Remove `modules/admin/model.py` (admin is a role, not an entity — uses User with role=ADMIN)
- [x] 6.4 Update `modules/admin/__init__.py` to export admin router only
- [x] 6.5 Ensure all modules have proper `__init__.py` exporting `router`

## 7. API Wiring & main.py

- [x] 7.1 Import and register all module routers in `main.py` with consistent prefixes: `/api/v1/usuarios`, `/api/v1/productos`, `/api/v1/categorias`, `/api/v1/pedidos`, `/api/v1/pagos`, `/api/v1/direcciones`, `/api/v1/auth`, `/api/v1/admin`
- [x] 7.2 Add appropriate tags to each router for OpenAPI grouping
- [x] 7.3 Verify all dependency injection chains: router → service → repository → session
- [x] 7.4 Test server starts without import errors via `uvicorn main:app`

## 8. Naming & Field Standardization

- [x] 8.1 Audit all model files for field naming consistency (English column names)
- [x] 8.2 Audit all Spanish field names in existing models and standardize to English where inconsistent
- [x] 8.3 Ensure `created_at` and `updated_at` convention is consistent across all models
