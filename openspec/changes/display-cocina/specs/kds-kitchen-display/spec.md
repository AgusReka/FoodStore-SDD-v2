# Spec: kds-kitchen-display

## Overview

Kitchen Display System (KDS) — pantalla de cocina en tiempo real que muestra los pedidos pagados listos para preparar. Recibe actualizaciones por SSE (Server-Sent Events) con fallback por polling. Organiza los pedidos en dos columnas: "Por preparar" (CONFIRMADO) y "En preparación" (PREPARANDO). Incluye timer de urgencia, alertas visuales/sonoras, y resiliencia ante desconexiones.

## Requirements

### Requirement: KDS carga inicial de pedidos

El sistema DEBE proveer un endpoint REST que retorne los pedidos activos de cocina (CONFIRMADO y PREPARANDO) para la carga inicial de la pantalla.

#### Scenario: Carga inicial del KDS
- **WHEN** el cocinero abre la pantalla `/cocina`
- **THEN** el frontend hace `GET /api/v1/cocina/pedidos`
- **AND** recibe la lista de pedidos en estado `CONFIRMADO` y `PREPARANDO`
- **AND** los pedidos están ordenados por antigüedad ascendente (más antiguo primero)

### Requirement: KDS recibe eventos en tiempo real por SSE

El sistema DEBE proveer un endpoint SSE que emita eventos en tiempo real cuando un pedido cambia de estado en la fase de cocina.

#### Scenario: Conexión SSE exitosa
- **WHEN** el frontend abre `GET /api/v1/cocina/events` con token JWT válido y rol autorizado
- **THEN** la conexión SSE se establece
- **AND** el servidor comienza a enviar eventos cuando ocurren

#### Scenario: SSE rechaza token inválido
- **WHEN** un request sin token o con token inválido intenta conectar al SSE
- **THEN** el servidor retorna 401 Unauthorized

#### Scenario: SSE rechaza rol no autorizado
- **WHEN** un usuario con rol `cliente` intenta conectar al SSE
- **THEN** el servidor retorna 403 Forbidden

### Requirement: Eventos SSE definidos

El sistema DEBE emitir los siguientes eventos SSE cuando ocurren transiciones de estado relevantes para cocina.

#### Scenario: Evento PEDIDO_CONFIRMADO
- **WHEN** un pago se aprueba y el pedido pasa de `PENDIENTE`/`PENDING_MP` a `CONFIRMADO`
- **THEN** el servidor emite un evento SSE `PEDIDO_CONFIRMADO` con los datos del pedido
- **AND** el KDS agrega una tarjeta nueva en la columna "Por preparar"

#### Scenario: Evento PEDIDO_EN_PREPARACION
- **WHEN** un cocinero marca un pedido como `CONFIRMADO → PREPARANDO`
- **THEN** el servidor emite un evento SSE `PEDIDO_EN_PREPARACION`
- **AND** el KDS mueve la tarjeta a la columna "En preparación"

#### Scenario: Evento PEDIDO_EN_CAMINO
- **WHEN** un cocinero marca un pedido como `PREPARANDO → ENVIADO`
- **THEN** el servidor emite un evento SSE `PEDIDO_EN_CAMINO`
- **AND** el KDS remueve la tarjeta de la pantalla

#### Scenario: Evento PEDIDO_CANCELADO
- **WHEN** un pedido en `CONFIRMADO` o `PREPARANDO` es cancelado
- **THEN** el servidor emite un evento SSE `PEDIDO_CANCELADO`
- **AND** el KDS remueve la tarjeta de la pantalla

### Requirement: Layout del KDS

El KDS DEBE mostrar los pedidos en dos columnas según su estado.

#### Scenario: Dos columnas por estado
- **WHEN** el KDS se renderiza
- **THEN** se muestran dos columnas: "Por preparar" (pedidos CONFIRMADO) y "En preparación" (pedidos PREPARANDO)

#### Scenario: Tarjeta de pedido
- **WHEN** se renderiza una tarjeta de pedido
- **THEN** muestra: número de pedido, ítems con nombre y cantidad, exclusiones por personalización, notas del cliente, y timer de urgencia

#### Scenario: Orden por antigüedad
- **WHEN** se listan los pedidos en cada columna
- **THEN** están ordenados por antigüedad ascendente (RN-CO02)
- **AND** el más antiguo está al tope

### Requirement: Acciones de cocina sobre pedidos

El sistema DEBE permitir que un usuario con rol COCINA avance los pedidos dentro de la fase de cocina.

#### Scenario: Iniciar preparación
- **WHEN** el cocinero presiona "Iniciar preparación" en un pedido CONFIRMADO
- **THEN** se llama `PATCH /api/v1/cocina/pedidos/{id}/estado` con `{"nuevo_estado": "PREPARANDO"}`
- **AND** el pedido pasa a PREPARANDO
- **AND** la tarjeta se mueve a la columna "En preparación"

#### Scenario: Marcar terminado
- **WHEN** el cocinero presiona "Listo" en un pedido PREPARANDO
- **THEN** se llama `PATCH /api/v1/cocina/pedidos/{id}/estado` con `{"nuevo_estado": "ENVIADO"}`
- **AND** el pedido pasa a ENVIADO
- **AND** la tarjeta desaparece del KDS

### Requirement: Timer de urgencia

El KDS DEBE mostrar y actualizar un indicador de urgencia basado en el tiempo transcurrido desde que el pedido entró a la cola de cocina.

#### Scenario: Timer normal
- **WHEN** un pedido lleva menos de 10 minutos en cocina
- **THEN** se muestra con estilo normal (sin destacar)

#### Scenario: Timer en advertencia
- **WHEN** un pedido lleva entre 10 y 20 minutos en cocina
- **THEN** se muestra con estilo de advertencia (naranja)

#### Scenario: Timer urgente
- **WHEN** un pedido lleva más de 20 minutos en cocina
- **THEN** se muestra con estilo urgente (rojo)

#### Scenario: Timer se actualiza cada 15 segundos
- **WHEN** el KDS está abierto
- **THEN** el timer se recalcula en el cliente cada 15 segundos sin recargar

### Requirement: Alerta de nuevo pedido

El KDS DEBE notificar visual y sonoramente cuando llega un nuevo pedido.

#### Scenario: Alerta visual y sonora
- **WHEN** el KDS recibe un evento `PEDIDO_CONFIRMADO`
- **THEN** reproduce un beep mediante Web Audio API (sin archivos externos)
- **AND** muestra un flash visual breve

#### Scenario: Toggle de sonido
- **WHEN** el cocinero cambia el toggle de sonido a OFF
- **THEN** el sonido NO se reproduce en nuevos pedidos
- **AND** la preferencia persiste entre sesiones (localStorage)

### Requirement: Resiliencia del KDS

El KDS DEBE seguir funcionando si la conexión SSE se pierde.

#### Scenario: Fallback por polling
- **WHEN** la conexión SSE se desconecta
- **THEN** el KDS muestra un indicador de "sin conexión en vivo"
- **AND** hace polling de `GET /api/v1/cocina/pedidos` cada 30 segundos

#### Scenario: Reconexión SSE
- **WHEN** la conexión SSE se restablece
- **THEN** el KDS vuelve al modo push
- **AND** refresca el estado actual con un fetch completo

### Requirement: Exclusión de auto-logout

La ruta `/cocina` DEBE estar excluida del mecanismo de auto-logout por inactividad.

#### Scenario: Pantalla siempre activa
- **WHEN** la pantalla de cocina está abierta y no hay actividad del usuario
- **THEN** el sistema NO debe cerrar la sesión automáticamente
