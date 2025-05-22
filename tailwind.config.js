/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ], theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-outfit)', 'sans-serif'],
        heading: ['var(--font-raleway)', 'sans-serif'],
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        spinQuick: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        }
      },
      animation: {
        fadeIn: 'fadeIn 0.5s ease-in-out',
        slideInRight: 'slideInRight 0.3s ease-out',
        pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-quick': 'spinQuick 0.5s ease-in-out',
      }, colors: {
        primary: {
          light: '#E0F2FE', // Very light sky blue
          DEFAULT: '#38BDF8', // Sky blue (light/medium)
          dark: '#0EA5E9',  // Slightly darker sky blue
        },
        secondary: {
          light: '#FCE7F3', // Example: Light pink
          DEFAULT: '#EC4899', // Example: Pink
          dark: '#DB2777',   // Example: Darker pink
        },
        accent: {
          light: '#FEF3C7', // Example: Light yellow
          DEFAULT: '#FACC15', // Example: Yellow
          dark: '#EAB308',   // Example: Darker yellow
        },
        neutral: {
          lightest: '#F9FAFB', // Example: Very light gray (new)
          light: '#F3F4F6', // Example: Light gray
          DEFAULT: '#6B7280', // Example: Gray
          dark: '#374151',   // Example: Darker gray
        },
        success: {
          light: '#D1FAE5', // Example: Light green
          DEFAULT: '#10B981', // Example: Green
          dark: '#059669',   // Example: Darker green
        },
        warning: {
          light: '#FEF9C3', // Example: Light orange
          DEFAULT: '#F59E0B', // Example: Orange
          dark: '#D97706',   // Example: Darker orange
        },
        destructive: {
          light: '#FEE2E2', // Example: Light red
          DEFAULT: '#EF4444', // Example: Red
          dark: '#DC2626',   // Example: Darker red
        }, info: {
          light: '#E0F2FE', // Lighter blue
          DEFAULT: '#38BDF8', // Light sky blue
          dark: '#0EA5E9',   // Medium sky blue
        },
      },
    },
  },
  plugins: [],
};
