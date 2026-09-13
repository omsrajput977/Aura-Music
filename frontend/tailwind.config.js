/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        'xs': '375px',
      },
      colors: {
        void: '#07080d',
        obsidian: '#0f111a',
        surface: 'rgba(255, 255, 255, 0.05)',
        surfaceHover: 'rgba(255, 255, 255, 0.09)',
        glassBorder: 'rgba(255, 255, 255, 0.12)',
        neonCyan: '#00f2fe',
        neonViolet: '#9b51e0',
        neonAmber: '#ffaa00',
        spotifyGreen: '#1ed760'
      },
      animation: {
        'spin-33': 'spin 1.818s linear infinite',
        'spin-45': 'spin 1.333s linear infinite',
        'spin-slow': 'spin 20s linear infinite',
        'spin-reverse-slow': 'spin-reverse 25s linear infinite',
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 3s ease-in-out infinite alternate',
      },
      keyframes: {
        'spin-reverse': {
          from: { transform: 'rotate(360deg)' },
          to: { transform: 'rotate(0deg)' }
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          '0%': { filter: 'drop-shadow(0 0 15px rgba(30, 215, 96, 0.3))' },
          '100%': { filter: 'drop-shadow(0 0 30px rgba(0, 242, 254, 0.6))' }
        }
      },
      backgroundImage: {
        'radial-vignette': 'radial-gradient(circle at center, transparent 30%, rgba(7, 8, 13, 0.8) 100%)',
        'vinyl-grooves': 'repeating-radial-gradient(circle at center, #111 0px, #1a1a1a 1px, #111 2px, #0a0a0a 3px)',
      }
    },
  },
  plugins: [],
}
