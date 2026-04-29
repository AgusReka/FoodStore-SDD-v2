## ADDED Requirements

### Requirement: Vite React TypeScript project initialization
The frontend SHALL be initialized as a Vite project with React and TypeScript template.

#### Scenario: Project scaffolded with Vite
- **WHEN** the developer runs the setup commands
- **THEN** a `package.json` with react, react-dom, typescript, vite, and @vitejs/plugin-react dependencies SHALL be created
- **AND** a `vite.config.ts` file SHALL exist with React plugin configured

#### Scenario: TypeScript strict mode enabled
- **WHEN** the developer opens `tsconfig.json`
- **THEN** the `compilerOptions.strict` SHALL be set to `true`
- **AND** `compilerOptions.jsx` SHALL be set to `"react-jsx"`

### Requirement: Development and build scripts configured
The `package.json` SHALL contain scripts for development, build, and preview.

#### Scenario: Scripts available
- **WHEN** the developer runs `npm run dev` or `pnpm dev`
- **THEN** the Vite dev server SHALL start on localhost:5173
- **AND** when running `npm run build`, Vite SHALL generate the production build in the `dist/` folder
- **AND** when running `npm run preview`, Vite SHALL serve the production build

### Requirement: Environment configuration with Vite prefix
The project SHALL support environment variables with Vite's `VITE_` prefix convention.

#### Scenario: Environment variables loaded
- **WHEN** a `.env` file exists in the frontend root
- **THEN** variables prefixed with `VITE_` SHALL be accessible via `import.meta.env.VITE_VAR_NAME`
- **AND** a `.env.example` file SHALL exist documenting all required variables

### Requirement: FSD structure populated with base files
The FSD (Feature-Sliced Design) folders SHALL contain initial base files.

#### Scenario: App layer initialized
- **WHEN** the developer inspects `src/app/`
- **THEN** it SHALL contain `App.tsx` (or `App.tsx` in `src/` with proper routing setup)
- **AND** `main.tsx` SHALL exist in `src/` as the entry point

#### Scenario: Shared layer with utilities
- **WHEN** the developer inspects `src/shared/`
- **THEN** it SHALL contain `config/` for constants, `api/` for HTTP client, `types/` for shared types
