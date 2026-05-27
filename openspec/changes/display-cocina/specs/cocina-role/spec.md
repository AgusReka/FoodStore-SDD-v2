# Spec: cocina-role

## Overview

Rol Cocinero (COCINA) — nuevo actor del sistema con permisos específicos para operar el Kitchen Display System. El cocinero puede ver los pedidos en fase de cocina, iniciar preparación y marcar pedidos como terminados. No tiene capacidades CRUD, no puede despachar ni entregar pedidos, ni gestionar usuarios.

## Requirements

### Requirement: Nuevo rol COCINA en UserRole enum

El sistema DEBE incluir el valor `COCINA` en el enum `UserRole`.

#### Scenario: COCINA existe como rol válido
- **WHEN** se consulta el enum `UserRole`
- **THEN** DEBE existir `UserRole.COCINA` con valor `"cocina"`

#### Scenario: Seed contiene COCINA
- **WHEN** se ejecuta el seed de desarrollo
- **THEN** existe un usuario `cocina@foodstore.com` con rol `COCINA`

### Requirement: COCINA tiene permisos específicos

El sistema DEBE otorgar al rol COCINA solo los permisos necesarios para su función operativa.

#### Scenario: COCINA puede ver pedidos de cocina
- **WHEN** un usuario COCINA llama `GET /api/v1/cocina/pedidos`
- **THEN** recibe 200 OK con la lista de pedidos

#### Scenario: COCINA puede avanzar estado en fase de cocina
- **WHEN** un usuario COCINA llama `PATCH /api/v1/cocina/pedidos/{id}/estado`
- **THEN** recibe 200 OK si la transición es válida para su rol

#### Scenario: COCINA puede ver productos
- **WHEN** un usuario COCINA llama `GET /api/v1/productos`
- **THEN** recibe 200 OK con el listado de productos

#### Scenario: COCINA NO puede crear/editar productos
- **WHEN** un usuario COCINA intenta `POST /api/v1/productos`
- **THEN** recibe 403 Forbidden

#### Scenario: COCINA NO puede gestionar usuarios
- **WHEN** un usuario COCINA intenta `GET /api/v1/usuarios`
- **THEN** recibe 403 Forbidden

#### Scenario: COCINA NO puede despachar pedidos
- **WHEN** un usuario COCINA intenta `PREPARANDO → CANCELADO`
- **THEN** recibe 403 Forbidden (solo ADMIN puede cancelar en PREPARANDO)

### Requirement: Endpoints protegidos por rol

Los endpoints del módulo cocina DEBEN requerir autenticación y rol autorizado.

#### Scenario: Endpoint protegido
- **WHEN** un request sin token llama `GET /api/v1/cocina/pedidos`
- **THEN** recibe 401 Unauthorized

#### Scenario: Rol no autorizado
- **WHEN** un usuario con rol `cliente` llama `GET /api/v1/cocina/pedidos`
- **THEN** recibe 403 Forbidden

#### Scenario: Múltiples roles autorizados
- **WHEN** un usuario con rol `ADMIN` o `PEDIDOS` llama `GET /api/v1/cocina/pedidos`
- **THEN** recibe 200 OK (ADMIN y PEDIDOS también pueden ver la pantalla de cocina)

### Requirement: Frontend reconoce rol COCINA

El frontend DEBE reconocer el rol COCINA para mostrar la navegación y rutas correspondientes.

#### Scenario: Menú de navegación
- **WHEN** un usuario con rol `cocina` inicia sesión
- **THEN** la navegación muestra un enlace a `/cocina`

#### Scenario: Guard de ruta
- **WHEN** un usuario sin rol `cocina`/`admin`/`pedidos` intenta acceder a `/cocina`
- **THEN** es redirigido al home

#### Scenario: Ruta principal del rol
- **WHEN** un usuario con rol `cocina` inicia sesión
- **THEN** es redirigido a `/cocina` como pantalla principal
