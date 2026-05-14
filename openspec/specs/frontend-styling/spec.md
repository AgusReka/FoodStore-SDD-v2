# frontend-styling Specification

## Purpose
Mesa Design System CSS foundation: Google Fonts keyframes, utility classes, scrollbar styling, focus ring, and ambient background gradient.
## Requirements
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

### Requirement: Google Fonts Inter Tight + Inter loaded

The frontend SHALL load Google Fonts Inter and Inter Tight via `@import` in the main CSS file or via `<link>` in `index.html`.

#### Scenario: Inter and Inter Tight fonts loaded
- **WHEN** the developer inspects `index.html` or the main CSS file
- **THEN** it SHALL include an `@import` or `<link>` to Google Fonts for Inter and Inter Tight
- **AND** Inter Tight SHALL be set as the display font for headings
- **AND** Inter SHALL be set as the body font

### Requirement: CSS keyframes defined

The main stylesheet SHALL define reusable CSS keyframes: `float-up`, `slide-in-right`, `fade-in`, and `pulse-soft`.

#### Scenario: float-up keyframe exists
- **WHEN** the developer inspects the main CSS file
- **THEN** the `@keyframes float-up` SHALL be defined
- **AND** it SHALL animate from `translateY(24px)` and `opacity(0)` to `translateY(0)` and `opacity(1)`

#### Scenario: slide-in-right keyframe exists
- **WHEN** the developer inspects the main CSS file
- **THEN** the `@keyframes slide-in-right` SHALL be defined
- **AND** it SHALL animate from `translateX(100%)` to `translateX(0)`

#### Scenario: fade-in keyframe exists
- **WHEN** the developer inspects the main CSS file
- **THEN** the `@keyframes fade-in` SHALL be defined
- **AND** it SHALL animate from `opacity(0)` to `opacity(1)`

#### Scenario: pulse-soft keyframe exists
- **WHEN** the developer inspects the main CSS file
- **THEN** the `@keyframes pulse-soft` SHALL be defined
- **AND** it SHALL provide a subtle scale pulse animation (e.g., 1 → 1.03 → 1 at 2s duration)

### Requirement: CSS utility classes defined

The main stylesheet SHALL define the Mesa Design System CSS utility classes.

#### Scenario: .glass utility class
- **WHEN** the developer inspects the main CSS file
- **THEN** the `.glass` class SHALL apply `backdrop-filter: blur(16px)`, a semi-transparent background, and a subtle border

#### Scenario: .btn utility classes
- **WHEN** the developer inspects the main CSS file
- **THEN** the `.btn` base class SHALL be defined with padding, border-radius, font-weight, and transition
- **AND** `.btn-primary` SHALL use the warm orange brand background with white text
- **AND** `.btn-secondary` SHALL use a neutral background with brand text
- **AND** `.btn-ghost` SHALL have no background, a subtle border, and hover fill effect
- **AND** `.btn-glass` SHALL use the `.glass` effect with brand text

#### Scenario: .card utility class
- **WHEN** the developer inspects the main CSS file
- **THEN** the `.card` class SHALL define a card container with white/neutral background, rounded corners, padding, and subtle shadow

#### Scenario: .input utility class
- **WHEN** the developer inspects the main CSS file
- **THEN** the `.input` class SHALL define a styled input with border, padding, border-radius, and focus ring

#### Scenario: .chip utility class
- **WHEN** the developer inspects the main CSS file
- **THEN** the `.chip` class SHALL define a toggle chip with rounded pill shape, padding, and active/inactive state styling

#### Scenario: .stagger utility class
- **WHEN** the developer inspects the main CSS file
- **THEN** the `.stagger` class SHALL define a stagger animation container
- **AND** child elements SHALL animate with sequential delays using `nth-child` delays

#### Scenario: .t-display utility class
- **WHEN** the developer inspects the main CSS file
- **THEN** the `.t-display` class SHALL define the display headline typography: Inter Tight font, large size, bold weight, tight leading

#### Scenario: .section-eyebrow utility class
- **WHEN** the developer inspects the main CSS file
- **THEN** the `.section-eyebrow` class SHALL define section eyebrow text: uppercase, letter-spaced, small, brand-colored

#### Scenario: .ambient utility class
- **WHEN** the developer inspects the main CSS file
- **THEN** the `.ambient` class SHALL define an ambient background section with dark gradient and subtle texture

#### Scenario: .food-art utility class
- **WHEN** the developer inspects the main CSS file
- **THEN** the `.food-art` class SHALL define a CSS gradient placeholder for food images with warm gradient colors

#### Scenario: .container utility class
- **WHEN** the developer inspects the main CSS file
- **THEN** the `.container` class SHALL define a max-width container (e.g., 1200px) with horizontal auto margins

### Requirement: Custom scrollbar styling

The system SHALL apply custom scrollbar styling using the brand color.

#### Scenario: Custom scrollbar styles
- **WHEN** a user views any scrollable area
- **THEN** the scrollbar SHALL use the brand orange color for the thumb
- **AND** the scrollbar SHALL have a thin width and rounded thumb

### Requirement: Focus ring styling

The system SHALL apply a custom focus ring using the brand color.

#### Scenario: Brand-colored focus ring
- **WHEN** a user tabs to any interactive element (input, button, link)
- **THEN** the focus ring SHALL use the brand orange color
- **AND** the focus ring SHALL have consistent offset and width

### Requirement: Ambient background gradient

The system SHALL apply an ambient background gradient to the page body.

#### Scenario: Ambient gradient on body
- **WHEN** a user views any page
- **THEN** the body or root element SHALL have a subtle ambient background gradient (e.g., warm off-white to light orange tint)

