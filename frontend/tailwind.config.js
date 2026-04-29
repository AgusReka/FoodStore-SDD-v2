export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Apple-style Dark Theme Palette
        // Background colors (dark)
        bg: {
          primary: '#0a0a0a',    // Near black - main background
          secondary: '#141414',   // Slightly lighter
          tertiary: '#1a1a1a',   // Cards, surfaces
          elevated: '#222222',   // Elevated surfaces (modals, dropdowns)
        },
        // Text colors (light for dark bg)
        text: {
          primary: '#f5f5f7',    // Near white - main text (Apple uses slightly off-white)
          secondary: '#a1a1a6',  // Secondary text
          tertiary: '#6e6e73',   // Muted text
          inverse: '#1d1d1f',    // Dark text for light backgrounds
        },
        // Orange accent (Apple-style orange)
        accent: {
          DEFAULT: '#FF8C00',     // Primary orange
          light: '#FF9500',      // Lighter orange for hover
          dark: '#E07800',       // Darker for active states
          muted: '#4D2E00',      // Muted orange background
        },
        // Gray scale optimized for dark mode
        gray: {
          50: '#f5f5f7',
          100: '#e8e8ed',
          200: '#d2d2d7',
          300: '#a1a1a6',
          400: '#86868b',
          500: '#6e6e73',
          600: '#424245',
          700: '#2d2d2f',
          800: '#1d1d1f',
          900: '#141414',
          950: '#0a0a0a',
        }
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'SF Pro Display', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'sans-serif'],
        mono: ['SF Mono', 'Fira Code', 'monospace'],
      },
    },
  },
  plugins: [],
};