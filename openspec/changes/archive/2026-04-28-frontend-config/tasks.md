## 1. Project Initialization with Vite

- [x] 1.1 Initialize Vite + React + TypeScript project in `/frontend` using `npm create vite@latest . -- --template react-ts` (or pnpm equivalent)
- [x] 1.2 Install core dependencies: `react`, `react-dom`, `react-router-dom`, `axios`, `@tanstack/react-query`
- [x] 1.3 Install dev dependencies: `typescript`, `vite`, `@vitejs/plugin-react`, `@types/react`, `@types/react-dom`, `tailwindcss`, `postcss`, `autoprefixer`, `@types/axios`
- [x] 1.4 Verify `package.json` has correct scripts: `dev` (vite), `build` (tsc && vite build), `preview` (vite preview)

## 2. TypeScript Strict Configuration

- [x] 2.1 Configure `tsconfig.json` with `"strict": true` in `compilerOptions`
- [x] 2.2 Set `"jsx": "react-jsx"` in `compilerOptions`
- [x] 2.3 Configure `"target": "ES2020"`, `"module": "ESNext"`, `"moduleResolution": "bundler"`
- [x] 2.4 Add `"baseUrl": "."` and configure `paths` for clean imports (e.g., `@shared/*` → `src/shared/*`)

## 3. TailwindCSS Setup

- [x] 3.1 Initialize TailwindCSS: `npx tailwindcss init -p` to generate `tailwind.config.js` and `postcss.config.js`
- [x] 3.2 Configure `content` array in `tailwind.config.js` with all FSD paths: `./src/**/*.{js,ts,jsx,tsx}`
- [x] 3.3 Set `darkMode: 'class'` in `tailwind.config.js` for future dark mode support
- [x] 3.4 Create or update `src/index.css` with Tailwind directives: `@tailwind base;`, `@tailwind components;`, `@tailwind utilities;`
- [x] 3.5 Import `index.css` in `src/main.tsx`

## 4. Axios API Client Setup

- [x] 4.1 Create `src/shared/api/` directory structure
- [x] 4.2 Create `src/shared/api/axios.ts` with Axios instance configured with:
  - `baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000'`
  - Default headers: `Content-Type: application/json`, `Accept: application/json`
- [x] 4.3 Add request interceptor structure in `axios.ts` to inject `Authorization: Bearer <token>` (read from storage placeholder)
- [x] 4.4 Add response interceptor structure in `axios.ts` to handle 401 errors (placeholder for token refresh logic)
- [x] 4.5 Export the configured Axios instance as `apiClient`

## 5. TanStack Query (React Query) Setup

- [x] 5.1 Create or update `src/main.tsx` to wrap the app with `<QueryClientProvider>`
- [x] 5.2 Create a QueryClient instance with default options:
  - `retry: 1`
  - `staleTime: 5 * 60 * 1000` (5 minutes)
  - `refetchOnWindowFocus: false`
- [x] 5.3 Conditionally render `<ReactQueryDevTools />` only when `import.meta.env.DEV` is true
- [x] 5.4 Create `src/shared/api/queryKeys.ts` with factory pattern for query keys (e.g., `products: { list: () => ['products', 'list'], detail: (id) => ['products', 'detail', id] }`)

## 6. React Router Setup

- [x] 6.1 Configure `BrowserRouter` in `src/main.tsx` or `src/App.tsx`
- [x] 6.2 Create a `Layout` component in `src/app/` using `<Outlet />` from react-router-dom
- [x] 6.3 Define base routes in `src/App.tsx` or `src/routes.tsx`:
  - `/` → placeholder HomePage component
  - `/login` → placeholder LoginPage component
  - `/register` → placeholder RegisterPage component
  - `*` → NotFound component
- [x] 6.4 Add comment or example showing `React.lazy()` + `<Suspense>` pattern for future code splitting

## 7. Environment Configuration

- [x] 7.1 Create `frontend/.env.example` with `VITE_API_URL=http://localhost:8000`
- [x] 7.2 Create `frontend/.env` (gitignored) with `VITE_API_URL=http://localhost:8000`
- [x] 7.3 Verify `.gitignore` includes `.env` but NOT `.env.example`

## 8. FSD Structure Population

- [x] 8.1 Ensure `src/app/` has `App.tsx` and `Layout.tsx` (or equivalent)
- [x] 8.2 Ensure `src/pages/` has placeholder page components (HomePage, LoginPage, RegisterPage, NotFound)
- [x] 8.3 Ensure `src/shared/` has `api/`, `config/`, `types/`, `components/` directories
- [x] 8.4 Add `README.md` in `frontend/` with setup instructions (pnpm install, pnpm dev, etc.)

## 9. Verification

- [x] 9.1 Run `pnpm dev` and verify the Vite dev server starts on localhost:5173
- [x] 9.2 Verify TypeScript compiles without strict mode errors: `pnpm tsc --noEmit`
- [x] 9.3 Verify TailwindCSS works: add a `bg-blue-500 text-white p-4` class to a component and see it render
- [x] 9.4 Verify API client: import `apiClient` in a component and make a test GET to `$VITE_API_URL/` (health check)
- [x] 9.5 Verify TanStack Query: check DevTools appear in development mode
- [x] 9.6 Verify React Router: navigate to `/login` and see the placeholder LoginPage render
