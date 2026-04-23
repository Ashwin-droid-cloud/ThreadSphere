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
        'thread-spawn': 'threadSpawn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        'task-slide': 'taskSlide 0.5s ease-out forwards',
        'lock-pulse': 'lockPulse 0.8s ease-in-out',
        'lock-acquire': 'lockAcquire 0.5s ease-out forwards',
        'lock-release': 'lockRelease 0.5s ease-out forwards',
        'flow-arrow': 'flowArrow 1.5s linear infinite',
        'gauge-grow': 'gaugeGrow 1.5s ease-out forwards',
        'table-row-in': 'tableRowIn 0.3s ease-out forwards',
        'overlay-in': 'overlayFadeIn 0.4s ease-out forwards',
        'float': 'float 3s ease-in-out infinite',
        'progress-fill': 'progressFill 2s ease-in-out forwards',
        'glow-ring': 'glowRing 2s ease-in-out infinite',
        'task-complete': 'taskComplete 0.6s ease-out forwards',
        'dash-flow': 'dashFlow 1s linear infinite',
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
        threadSpawn: {
          '0%': { opacity: '0', transform: 'scale(0.3) translateY(20px)' },
          '60%': { opacity: '1', transform: 'scale(1.1) translateY(-4px)' },
          '100%': { opacity: '1', transform: 'scale(1) translateY(0)' },
        },
        taskSlide: {
          '0%': { opacity: '0', transform: 'translateX(-60px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        lockPulse: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.2)' },
        },
        lockAcquire: {
          '0%': { transform: 'scale(0.8)', opacity: '0.5' },
          '50%': { transform: 'scale(1.15)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        lockRelease: {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.15)', opacity: '0.8' },
          '100%': { transform: 'scale(0.9)', opacity: '0.6' },
        },
        flowArrow: {
          '0%': { strokeDashoffset: '20' },
          '100%': { strokeDashoffset: '0' },
        },
        gaugeGrow: {
          '0%': { strokeDasharray: '0 251' },
          '100%': { strokeDasharray: 'var(--gauge-value) 251' },
        },
        tableRowIn: {
          '0%': { opacity: '0', transform: 'translateX(-12px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        overlayFadeIn: {
          '0%': { opacity: '0', backdropFilter: 'blur(0px)' },
          '100%': { opacity: '1', backdropFilter: 'blur(12px)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        progressFill: {
          '0%': { width: '0%' },
          '100%': { width: '100%' },
        },
        glowRing: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(9, 105, 218, 0.3)' },
          '50%': { boxShadow: '0 0 0 8px rgba(9, 105, 218, 0)' },
        },
        taskComplete: {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(0.8)', opacity: '0.5' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        dashFlow: {
          '0%': { strokeDashoffset: '10' },
          '100%': { strokeDashoffset: '0' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
