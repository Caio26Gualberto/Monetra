import type { Config } from 'tailwindcss';
import animate from 'tailwindcss-animate';

const config: Config = {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    container: {
      center: true,
      padding: '1rem',
      screens: { '2xl': '1400px' }
    },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: '#7C3AED',
          light: '#A78BFA',
          foreground: '#FFFFFF'
        },
        accent: {
          DEFAULT: '#EC4899',
          light: '#F472B6',
          foreground: '#FFFFFF'
        },
        success: '#10B981',
        warning: '#F59E0B',
        danger: '#EF4444',
        info: '#3B82F6',
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))'
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))'
        }
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.25rem'
      },
      backdropBlur: { xs: '2px' },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        'slide-in': {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' }
        },
        'overlay-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        'dialog-in': {
          '0%': { opacity: '0', transform: 'translate(-50%, -48%) scale(0.96)' },
          '100%': { opacity: '1', transform: 'translate(-50%, -50%) scale(1)' }
        }
      },
      animation: {
        'fade-in': 'fade-in 0.3s ease-out',
        'slide-in': 'slide-in 0.3s ease-out',
        'overlay-in': 'overlay-in 0.2s ease-out',
        'dialog-in': 'dialog-in 0.22s ease-out'
      }
    }
  },
  plugins: [animate]
};

export default config;
