/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Neon (neon.com) brand tokens: pitch-black canvas, single green voltage, graphite hairlines
        canvas: '#000000',
        ink: '#ffffff',
        neon: {
          DEFAULT: '#00e599',   // brand voltage / spike green
          bright: '#34d59a',    // emerald — links, code keywords
          mid: '#00cc88',
          deep: '#2c6d4c',
          mint: '#e4f1eb',
        },
        // Legacy Spurs tokens remapped to the Neon palette so untouched pages adopt it
        spurs: {
          navy: {
            50: '#f5f5f5',
            100: '#e5e5e5',
            200: '#d4d4d4',
            300: '#a3a3a3',
            400: '#737373',
            500: '#525252',
            600: '#404040',
            700: '#303236',
            800: '#18191b',
            900: '#000000',
            950: '#000000',
            DEFAULT: '#0c0d0d',
          },
          gold: {
            50: '#eafff5',
            100: '#d4ffe9',
            200: '#a3f2cf',
            300: '#67e3ae',
            400: '#34d59a',
            500: '#00e599',
            600: '#00cc88',
            700: '#0a9e6a',
            800: '#0c7d55',
            900: '#0a6647',
            DEFAULT: '#00e599',  // Neon green
            light: '#34d59a',
          },
        },
        // Grey ladder tuned for dark-first surfaces: hairlines, muted text, raised panels
        gray: {
          50: '#fafafa',
          100: '#f4f4f5',
          200: '#e4e4e7',
          300: '#d4d4d8',
          400: '#94979e',
          500: '#797d86',
          600: '#61646b',
          700: '#303236',
          800: '#18191b',
          900: '#000000',
        },
        primary: {
          DEFAULT: '#ffffff',
        },
        accent: {
          DEFAULT: '#00e599',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['var(--font-jetbrainsmono)', 'JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      fontSize: {
        // Neon keeps the display tier at weight 400 and wins with negative tracking
        'display-xl': ['5rem', { lineHeight: '1.05', letterSpacing: '-0.04em', fontWeight: '400' }],
        'display-lg': ['3rem', { lineHeight: '1.1', letterSpacing: '-0.03em', fontWeight: '400' }],
        'display-md': ['1.75rem', { lineHeight: '1.25', letterSpacing: '-0.02em', fontWeight: '400' }],
        'display-sm': ['1.5rem', { lineHeight: '1.25', letterSpacing: '-0.01em', fontWeight: '500' }],
        'heading-xl': ['1.875rem', { lineHeight: '1.3', letterSpacing: '-0.02em', fontWeight: '500' }],
        'heading-lg': ['1.5rem', { lineHeight: '1.35', letterSpacing: '-0.01em', fontWeight: '500' }],
        'heading-md': ['1.25rem', { lineHeight: '1.4', letterSpacing: '-0.01em', fontWeight: '500' }],
        'heading-sm': ['1.125rem', { lineHeight: '1.4', fontWeight: '400' }],
        'body-lg': ['1.125rem', { lineHeight: '1.6', fontWeight: '400' }],
        'body': ['1rem', { lineHeight: '1.6', fontWeight: '400' }],
        'body-sm': ['0.875rem', { lineHeight: '1.5', fontWeight: '400' }],
        'caption': ['0.75rem', { lineHeight: '1.5', fontWeight: '500' }],
        // Monospace technical label / eyebrow chip
        'caps': ['0.75rem', { lineHeight: '1.5', letterSpacing: '0.12em', fontWeight: '500' }],
      },
      spacing: {
        'space-0': '0',
        'space-1': '0.25rem',
        'space-2': '0.5rem',
        'space-3': '0.75rem',
        'space-4': '1rem',
        'space-5': '1.25rem',
        'space-6': '1.5rem',
        'space-8': '2rem',
        'space-10': '2.5rem',
        'space-12': '3rem',
        'space-16': '4rem',
        'space-20': '5rem',
        'space-24': '6rem',
      },
      borderRadius: {
        // Neon is relentlessly 4px; pills (9999px) are reserved for chips and CTAs
        'sm': '0.25rem',
        'DEFAULT': '0.25rem',
        'md': '0.25rem',
        'lg': '0.25rem',
        'xl': '0.25rem',
        '2xl': '0.25rem',
        '3xl': '0.5rem',
        'radius-sm': '0.25rem',
        'radius': '0.25rem',
        'radius-md': '0.25rem',
        'radius-lg': '0.25rem',
        'radius-xl': '0.25rem',
        'radius-2xl': '0.25rem',
        'radius-full': '9999px',
        'full': '9999px',
      },
      boxShadow: {
        // Neon layers near-black surfaces with hairlines — no drop shadows
        'sm': 'none',
        'DEFAULT': 'none',
        'md': 'none',
        'lg': 'none',
        'xl': 'none',
        '2xl': 'none',
        'shadow-sm': 'none',
        'shadow': 'none',
        'shadow-md': 'none',
        'shadow-lg': 'none',
        'shadow-xl': 'none',
        'glow': '0 0 24px 0 rgba(0, 229, 153, 0.12)',
        'glow-lg': '0 0 60px 0 rgba(0, 229, 153, 0.15)',
      },
      transitionDuration: {
        'fast': '150ms',
        'normal': '250ms',
        'slow': '350ms',
      },
      transitionTimingFunction: {
        'ease-out': 'cubic-bezier(0, 0, 0.2, 1)',
      },
    },
  },
  plugins: [],
}