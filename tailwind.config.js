/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary': '#3b82f6',
        'primary-dark': '#2563eb',
        'primary-light': '#60a5fa',
        'bg': {
          'primary': '#0a0a0a',
          'secondary': '#1a1a1a',
          'tertiary': '#2a2a2a',
        },
        'text': {
          'primary': '#ffffff',
          'secondary': '#a0a0a0',
          'muted': '#666666',
        },
        'success': '#10b981',
        'warning': '#f59e0b',
        'error': '#ef4444',
        'info': '#3b82f6',
        'border': '#333333',
        'border-focus': '#3b82f6'
      }
    },
  },
  plugins: [],
}