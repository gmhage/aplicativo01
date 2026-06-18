/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        // Display: arredondada gordinha (estilo Duolingo) — títulos e números
        // grandes, com personalidade amigável e bojos largos.
        display: ['"Baloo 2"', 'ui-rounded', 'system-ui', 'sans-serif'],
        // Corpo/UI: arredondada porém mais leve, legível em parágrafos longos.
        sans: ['Nunito', 'ui-rounded', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
      },
      colors: {
        // Espinha dorsal da marca (constante em todas as telas).
        grape: '#6D28D9',
        magenta: '#DB2777',
        coral: '#FB5436',
        gold: '#F5A524',
        ink: '#1E1B2E',
        mist: '#FBF7FF',
      },
      boxShadow: {
        // Sombra com tinta violeta, em vez de cinza neutro.
        aura: '0 18px 40px -20px rgba(109, 40, 217, 0.45)',
        card: '0 8px 30px -16px rgba(109, 40, 217, 0.22)',
        seal: '0 6px 16px -6px rgba(245, 165, 36, 0.6)',
      },
      keyframes: {
        breathe: {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.55' },
          '50%': { transform: 'scale(1.12)', opacity: '0.8' },
        },
        rise: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        // Deslizamento lento do gradiente das auras (vivo, mas sutil).
        aura: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        pop: {
          '0%': { transform: 'scale(0.8)', opacity: '0' },
          '60%': { transform: 'scale(1.06)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      animation: {
        breathe: 'breathe 5s ease-in-out infinite',
        rise: 'rise 0.45s ease-out both',
        aura: 'aura 12s ease-in-out infinite',
        pop: 'pop 0.32s ease-out both',
      },
    },
  },
  plugins: [],
}
