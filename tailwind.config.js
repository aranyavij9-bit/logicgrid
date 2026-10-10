/** @type {import('tailwindcss').Config} */
// Palette follows aranyavij.com: soft blue and pink on cream, navy text.
const blue = {
  50: '#EEF5FF',
  100: '#DCEBFF',
  200: '#BCD7FF',
  300: '#94BEFF',
  400: '#4F8CF7',
  500: '#4F8CF7',
  600: '#3A72DE',
  700: '#2F5CB8',
  800: '#2A4C92',
  900: '#253F74',
  950: '#1A2A4D',
};
const pink = {
  50: '#FFF5F9',
  100: '#FFE3EC',
  200: '#FFCCDD',
  300: '#FFB6D0',
  400: '#E85F92',
  500: '#F2709F',
  600: '#DB5A8A',
  700: '#B84371',
  800: '#93365B',
  900: '#73304D',
};
const green = {
  50: '#EDFAF5',
  100: '#D3F3E6',
  200: '#A9E6CF',
  300: '#74D3B2',
  400: '#28A27D',
  500: '#28A27D',
  600: '#1E8466',
  700: '#1B6A54',
  800: '#195545',
  900: '#17463A',
  950: '#0A2820',
};
const orange = {
  50: '#FFF6EC',
  100: '#FFEAD2',
  200: '#FDD3A6',
  300: '#FAB877',
  400: '#E8893C',
  500: '#F6A35C',
  600: '#C96F28',
  700: '#A15622',
  800: '#7F4520',
  900: '#663A1D',
  950: '#3A1E0C',
};
const butter = {
  50: '#FFFAEB',
  100: '#FEF1CC',
  200: '#FBE29A',
  300: '#F7D06A',
  400: '#D9A22E',
  500: '#F4C152',
  600: '#C08A1E',
  700: '#97691A',
  800: '#785319',
  900: '#634518',
};
const rose = {
  50: '#FFF1F4',
  100: '#FFE0E8',
  200: '#FFC2D2',
  300: '#F7849F',
  400: '#E8507A',
  500: '#E8507A',
  600: '#CC3A63',
  700: '#A82E50',
  800: '#8A2945',
  900: '#73263D',
  950: '#40101F',
};
const lavender = {
  50: '#F5F2FF',
  100: '#EAE4FE',
  200: '#D6CCFB',
  300: '#BBA9F6',
  400: '#8A74E8',
  500: '#9C88F0',
  600: '#7A63D9',
  700: '#6450B5',
  800: '#4F4090',
  900: '#3F3473',
};

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#1F2850',
        body: '#30395E',
        muted: '#7A82A6',
        line: '#E7E4EA',
        cream: '#FBF8F5',
        // Surfaces: cream page, white cards, soft cream insets
        base: {
          900: '#FBF8F5',
          800: '#FBF8F5',
          700: '#FFFFFF',
          600: '#F7F4F2',
          500: '#F6F3F1',
          400: '#EFECEF',
          300: '#A0A6C2',
        },
        // Navy-tinted neutrals, inverted for a light theme (100 is darkest text)
        gray: {
          50: '#FBF8F5',
          100: '#1F2850',
          200: '#2B3460',
          300: '#30395E',
          400: '#5B6590',
          500: '#7A82A6',
          600: '#A0A6C2',
          700: '#CDCFDE',
          800: '#E7E4EA',
          900: '#F3F0EF',
        },
        // Primary: brand blue
        accent: blue,
        blue,
        // Secondary: brand pink
        secondary: pink,
        cyan: pink,
        success: green,
        emerald: green,
        warning: orange,
        amber: orange,
        orange,
        yellow: butter,
        error: rose,
        red: rose,
        violet: lavender,
      },
      fontFamily: {
        sans: ['Nunito', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        display: ['Fraunces', 'Georgia', 'serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      boxShadow: {
        soft: '0 1px 2px rgba(31, 40, 80, 0.04), 0 10px 28px -14px rgba(31, 40, 80, 0.12)',
        lift: '0 2px 4px rgba(31, 40, 80, 0.05), 0 16px 36px -16px rgba(31, 40, 80, 0.2)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'fade-in-up': 'fadeInUp 0.4s ease-out',
        'fade-in-down': 'fadeInDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'bounce-in': 'bounceIn 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'count-up': 'countUp 0.8s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInDown: {
          '0%': { opacity: '0', transform: 'translateY(-8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        bounceIn: {
          '0%': { opacity: '0', transform: 'scale(0.3)' },
          '50%': { transform: 'scale(1.05)' },
          '70%': { transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        countUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
