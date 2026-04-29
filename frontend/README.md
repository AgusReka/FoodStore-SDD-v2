# Food Store Frontend

Frontend para la aplicación de e-commerce de comida Food Store, construido con React + TypeScript + Vite.

## Stack Tecnológico

- **React 19** + **TypeScript**
- **Vite** (build tool)
- **TailwindCSS** (estilos)
- **TanStack Query** (data fetching)
- **Axios** (HTTP client)
- **React Router v6** (routing)
- **Zustand** (state management - próximamente)

## Estructura del Proyecto (FSD)

```
src/
├── app/          # Configuración de la app (Layout, providers, routing)
├── pages/        # Páginas de ruta
├── widgets/      # Componentes UI reutilizables
├── features/     # Módulos de funcionalidades
├── entities/     # Entidades de dominio
└── shared/       # Utilidades compartidas (api, types, config)
```

## Instalación

```bash
cd frontend
pnpm install
```

## Desarrollo

```bash
pnpm dev
```

La app corre en `http://localhost:5173`

## Build

```bash
pnpm build
```

## Preview de producción

```bash
pnpm preview
```

## Variables de Entorno

Copiar `.env.example` a `.env` y configurar:

- `VITE_API_URL` - URL del backend (default: `http://localhost:8000`)
