/** @type {import('tailwindcss').Config} */
export default {
  // content: tells Tailwind which files to scan for class names
  // If a class is found here, it will be included in the final CSS
  content: [
    "./index.html",           // Scan the main HTML file
    "./src/**/*.{js,ts,jsx,tsx}", // Scan ALL files in src folder
  ],
  
  // darkMode: 'class' means dark mode is controlled by adding 
  // 'dark' class to the HTML element (we control it with JavaScript)
  darkMode: 'class',
  
  theme: {
    extend: {
      // Custom colors that match our design system
      colors: {
        primary: {
          50:  '#EEF2FF',   // Lightest indigo
          100: '#E0E7FF',
          200: '#C7D2FE',
          300: '#A5B4FC',
          400: '#818CF8',
          500: '#6366F1',   // Main primary color
          600: '#4F46E5',
          700: '#4338CA',
          800: '#3730A3',
          900: '#312E81',   // Darkest indigo
        },
        secondary: {
          500: '#8B5CF6',   // Purple accent
          600: '#7C3AED',
        },
        success: '#10B981',  // Emerald green
        warning: '#F59E0B',  // Amber yellow
        danger:  '#EF4444',  // Red
      },
      
      // Custom font family
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      
      // Custom box shadows for card effects
      boxShadow: {
        'card':    '0 4px 6px -1px rgba(0,0,0,0.07), 0 2px 4px -1px rgba(0,0,0,0.06)',
        'card-hover': '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
      },
      
      // Custom border radius
      borderRadius: {
        'xl':  '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      
      // Animation durations
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      
      // Keyframe definitions
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%':   { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)',     opacity: '1' },
        },
      },
    },
  },
  
  plugins: [], // We can add Tailwind plugins here later
}