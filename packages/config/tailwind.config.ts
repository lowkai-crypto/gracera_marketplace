import type { Config } from 'tailwindcss'

/**
 * Gracera design token system
 *
 * Palette:
 *   Teal   — brand primary, trust, global trade
 *   Orange — CTA and action moments only
 *   Slate  — all neutral surfaces, text, borders
 *
 * Usage rules:
 *   - Teal as bg only on small accents (badges, icons, borders); never large fills
 *   - Orange on primary action buttons and critical conversion moments only
 *   - White / slate-50 for all page surfaces — Sara's white-space rule
 *   - Slate-900 for body text; slate-500 for secondary; slate-200 for borders
 */
const config: Config = {
  content: [
    './apps/web/src/**/*.{ts,tsx}',
    './packages/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Brand teal — primary identity colour
        teal: {
          50:  '#F0FDFA',
          100: '#CCFBF1',
          200: '#99F6E4',
          300: '#5EEAD4',
          400: '#2DD4BF',
          500: '#14B8A6',
          600: '#0D9488', // DEFAULT — use this
          700: '#0F766E',
          800: '#115E59',
          900: '#134E4A',
          950: '#042F2E',
        },
        // Action orange — CTAs and conversion moments only
        orange: {
          50:  '#FFF7ED',
          100: '#FFEDD5',
          200: '#FED7AA',
          300: '#FDBA74',
          400: '#FB923C',
          500: '#F97316', // DEFAULT — use this for primary buttons
          600: '#EA580C',
          700: '#C2410C',
          800: '#9A3412',
          900: '#7C2D12',
        },
        // Slate — every neutral surface, text, border
        slate: {
          50:  '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A', // primary text
          950: '#020617',
        },
      },

      fontFamily: {
        sans: [
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          '"Helvetica Neue"',
          'Arial',
          'sans-serif',
        ],
        mono: [
          'ui-monospace',
          'SFMono-Regular',
          '"SF Mono"',
          'Menlo',
          'Consolas',
          'monospace',
        ],
      },

      fontSize: {
        // Type scale — set once, stay on it
        '2xs': ['0.6875rem', { lineHeight: '1rem' }],
        'xs':  ['0.75rem',   { lineHeight: '1.125rem' }],
        'sm':  ['0.875rem',  { lineHeight: '1.375rem' }],
        'base':['1rem',      { lineHeight: '1.625rem' }],
        'lg':  ['1.125rem',  { lineHeight: '1.75rem' }],
        'xl':  ['1.25rem',   { lineHeight: '1.875rem' }],
        '2xl': ['1.5rem',    { lineHeight: '2rem' }],
        '3xl': ['1.875rem',  { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem',   { lineHeight: '2.5rem' }],
        '5xl': ['3rem',      { lineHeight: '1.1' }],
        '6xl': ['3.75rem',   { lineHeight: '1.05' }],
        '7xl': ['4.5rem',    { lineHeight: '1.02' }],
      },

      letterSpacing: {
        tighter: '-0.04em',
        tight:   '-0.025em',
        snug:    '-0.015em',
        normal:  '0em',
        label:   '0.06em',   // uppercase labels, eyebrows
        wide:    '0.1em',
      },

      borderRadius: {
        'none': '0',
        'sm':   '3px',   // subtle, not pill
        DEFAULT:'5px',
        'md':   '7px',
        'lg':   '10px',
        'xl':   '14px',
        'full': '9999px',
      },

      boxShadow: {
        'xs':  '0 1px 2px rgba(15,23,42,0.04)',
        'sm':  '0 2px 6px rgba(15,23,42,0.06)',
        DEFAULT:'0 4px 14px rgba(15,23,42,0.08)',
        'md':  '0 6px 20px rgba(15,23,42,0.09)',
        'lg':  '0 12px 36px rgba(15,23,42,0.11)',
        'xl':  '0 24px 60px rgba(15,23,42,0.14)',
        'none':'none',
        // Teal glow — for active match cards, verified badges
        'teal':'0 0 0 3px rgba(13,148,136,0.18)',
        // Orange glow — focus ring on CTA buttons
        'orange':'0 0 0 3px rgba(249,115,22,0.2)',
      },

      spacing: {
        // Section vertical rhythm
        'section':  '6rem',   // py-section
        'section-sm':'4rem',
      },

      maxWidth: {
        'prose': '65ch',
        'container': '72rem', // max-w-container — main content width
        'wide': '84rem',
      },

      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in':    'fadeIn 0.35s ease-out',
        'slide-up':   'slideUp 0.4s ease-out',
      },

      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%':   { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
