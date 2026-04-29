## ADDED Requirements

### Requirement: TailwindCSS configured with PostCSS
The frontend SHALL have TailwindCSS installed and configured with PostCSS and Autoprefixer.

#### Scenario: TailwindCSS dependencies installed
- **WHEN** the developer inspects `package.json`
- **THEN** it SHALL contain `tailwindcss`, `postcss`, and `autoprefixer` as dev dependencies

#### Scenario: TailwindCSS config file exists
- **WHEN** the developer opens `tailwind.config.js`
- **THEN** the `content` array SHALL include all FSD paths: `./src/**/*.{js,ts,jsx,tsx}`
- **AND** the config SHALL export a valid TailwindCSS configuration object

#### Scenario: PostCSS config exists
- **WHEN** the developer opens `postcss.config.js`
- **THEN** it SHALL include `tailwindcss` and `autoprefixer` as plugins

### Requirement: TailwindCSS directives in main stylesheet
The project SHALL include TailwindCSS directives in the main CSS file.

#### Scenario: CSS file with Tailwind directives
- **WHEN** the developer opens `src/index.css` or `src/App.css`
- **THEN** it SHALL contain `@tailwind base;`, `@tailwind components;`, and `@tailwind utilities;`
- **AND** this CSS file SHALL be imported in `main.tsx`

### Requirement: Dark mode support prepared
The TailwindCSS config SHALL be prepared for dark mode (class-based strategy).

#### Scenario: Dark mode class strategy
- **WHEN** the developer inspects `tailwind.config.js`
- **THEN** the `darkMode` property SHALL be set to `'class'`
- **AND** the project SHALL be ready to toggle dark mode via `dark` class on the HTML element
