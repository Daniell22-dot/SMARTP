/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Tottenham Hotspur exact brand colors
        spurs: {
          navy: {
            50: '#eef1f7',
            100: '#dce3ec',
            200: '#b9c7d9',
            300: '#8fa7c0',
            400: '#6886a4',
            500: '#4a6a87',
            600: '#36526e',
            700: '#2d4257',
            800: '#263647',
            900: '#222f3c',
            950: '#141a26',
            DEFAULT: '#001C58', // Exact Spurs navy
          },
          gold: {
            50: '#fffef5',
            100: '#fffceb',
            200: '#fff7c6',
            300: '#ffee8c',
            400: '#ffe352',
            500: '#ffda1a',
            600: '#e6c300',
            700: '#b89a00',
            800: '#8a7200',
            900: '#6e5900',
            DEFAULT: '#F0D441', // Exact Spurs gold
          },
        },
        primary: {
          DEFAULT: '#001C58',
        },
        accent: {
          DEFAULT: '#F0D441',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'display-xl': ['4.5rem', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '700' }],
        'display-lg': ['3.75rem', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '700' }],
        'display-md': ['3rem', { lineHeight: '1.15', letterSpacing: '-0.01em', fontWeight: '700' }],
        'display-sm': ['2.25rem', { lineHeight: '1.2', fontWeight: '700' }],
        'heading-xl': ['1.875rem', { lineHeight: '1.3', fontWeight: '700' }],
        'heading-lg': ['1.5rem', { lineHeight: '1.35', fontWeight: '600' }],
        'heading-md': ['1.25rem', { lineHeight: '1.4', fontWeight: '600' }],
        'heading-sm': ['1.125rem', { lineHeight: '1.4', fontWeight: '600' }],
        'body-lg': ['1.125rem', { lineHeight: '1.6', fontWeight: '400' }],
        'body': ['1rem', { lineHeight: '1.6', fontWeight: '400' }],
        'body-sm': ['0.875rem', { lineHeight: '1.5', fontWeight: '400' }],
        'caption': ['0.75rem', { lineHeight: '1.5', fontWeight: '500' }],
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
        'radius-sm': '0.25rem',
        'radius': '0.5rem',
        'radius-md': '0.75rem',
        'radius-lg': '1rem',
        'radius-xl': '1.5rem',
        'radius-2xl': '2rem',
        'radius-full': '9999px',
      },
      boxShadow: {
        'shadow-sm': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        'shadow': '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.06)',
        'shadow-md': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.06)',
        'shadow-lg': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.06)',
        'shadow-xl': '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
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
  darkMode: 'class',
}