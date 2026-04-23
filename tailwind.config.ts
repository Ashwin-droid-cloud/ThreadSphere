import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'Cascadia Code', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        canvas: {
          DEFAULT: '#f6f8fa',
          subtle: '#eaeef2',
          inset: '#e1e4e8',
        },
        border: {
          DEFAULT: '#d0d7de',
          muted: '#e1e4e8',
          subtle: '#eaeef2',
        },
        fg: {
          DEFAULT: '#1f2328',
          muted: '#656d76',
          subtle: '#8c959f',
          onEmphasis: '#ffffff',
        },
        accent: {
          fg: '#0969da',
          emphasis: '#0550ae',
          muted: '#ddf4ff',
          subtle: '#f0f9ff',
        },
        success: {
          fg: '#1a7f37',
          emphasis: '#1f883d',
          muted: '#d1f0da',
          subtle: '#f0fff4',
        },
        attention: {
          fg: '#9a6700',
          emphasis: '#bf8700',
          muted: '#fff8c5',
          subtle: '#fffbdd',
        },
        danger: {
          fg: '#cf222e',
          emphasis: '#a40e26',
          muted: '#ffd8d3',
          subtle: '#fff0ee',
        },
        done: {
          fg: '#8250df',
          emphasis: '#6639ba',
          muted: '#eddeff',
          subtle: '#fbefff',
        },
      },
      animation: {
        'pulse-slow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 3s linear infinite',
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.2s ease-out',
        'blink': 'blink 1s step-end infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
