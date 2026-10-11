/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#050D1B', // Outer background
          900: '#0B172A', // Sidebar background
          850: '#0F1F38',
          800: '#13284A',
          700: '#1D3B70', // Sidebar active item
          600: '#2A4E8F',
          500: '#3B67BA',
        },
        surface: {
          canvas: '#F7F9FD',
          card: '#FFFFFF',
          cardSubtle: '#F8FAFC',
          border: '#E2E8F0',
          borderSubtle: '#EDF2F7',
        },
        brand: {
          blue: '#405CFF',
          blueHover: '#334CE0',
          violet: '#6555FF',
          violetLight: '#EEF0FF',
          violetBorder: '#D8D4FF',
        },
        content: {
          primary: '#111827',
          secondary: '#64748B',
          muted: '#94A3B8',
          subtle: '#CBD5E1',
        },
        status: {
          green: '#10B981',
          greenLight: '#ECFDF5',
          greenBorder: '#A7F3D0',
          orange: '#F59E0B',
          orangeLight: '#FFFBEB',
          orangeBorder: '#FDE68A',
          red: '#EF4444',
          redLight: '#FEF2F2',
          redBorder: '#FECACA',
          blue: '#3B82F6',
          blueLight: '#EFF6FF',
          blueBorder: '#BFDBFE',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace']
      },
      boxShadow: {
        subtle: '0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 1px 2px 0 rgba(0, 0, 0, 0.02)',
        card: '0 4px 6px -1px rgba(0, 0, 0, 0.03), 0 2px 4px -1px rgba(0, 0, 0, 0.02)',
        cardHover: '0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.025)',
        modal: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      }
    },
  },
  plugins: [],
}
