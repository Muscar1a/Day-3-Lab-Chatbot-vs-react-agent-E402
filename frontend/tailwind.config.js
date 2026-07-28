/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        canvas: { DEFAULT: '#B8D7E8', soft: '#D6EAF3' },
        surface: { DEFAULT: '#F7FAF7', muted: '#E9F0F2' },
        ink: { DEFAULT: '#071C2E', soft: '#17354A' },
        'text-muted': '#526978',
        accent: { DEFAULT: '#F47F6B', soft: '#FFD3C9' },
        info: '#6F9DBA',
        success: '#4F8A72',
        warning: '#C78C3C',
        danger: '#B84B4B',
        white: '#FFFFFF',
      },
      fontFamily: {
        display: ['Space Grotesk', 'Arial Narrow', 'Arial', 'sans-serif'],
        body: ['IBM Plex Sans', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['IBM Plex Mono', 'JetBrains Mono', 'SFMono-Regular', 'Consolas', 'monospace'],
      },
      borderRadius: {
        xs: '4px', sm: '8px', md: '12px', lg: '18px', pill: '999px',
      },
      boxShadow: {
        panel: '4px 4px 0 rgba(7, 28, 46, 0.16)',
        floating: '0 12px 30px rgba(7, 28, 46, 0.16)',
        'panel-sm': '2px 2px 0 rgba(7, 28, 46, 0.12)',
      },
      spacing: {
        1: '4px', 2: '8px', 3: '12px', 4: '16px', 5: '24px', 6: '32px', 7: '48px', 8: '64px',
      },
      transitionDuration: { fast: '120ms', normal: '200ms', slow: '320ms' },
      transitionTimingFunction: { standard: 'cubic-bezier(0.2, 0.8, 0.2, 1)' },
      animation: {
        'fade-in': 'fadeIn 120ms ease-out',
        'slide-up': 'slideUp 200ms cubic-bezier(0.2, 0.8, 0.2, 1)',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
        'spin-slow': 'spin 3s linear infinite',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { opacity: '0', transform: 'translateY(6px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        pulseSoft: { '0%, 100%': { opacity: '1' }, '50%': { opacity: '0.5' } },
      },
      maxWidth: { app: '1600px', chat: '68ch' },
    },
  },
  plugins: [],
}
