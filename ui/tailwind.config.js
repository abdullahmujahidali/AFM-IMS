import tailwindAspectRatio from "@tailwindcss/aspect-ratio";
import tailwindForms from "@tailwindcss/forms";
import tailwindTypography from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/**/*.{js,jsx,ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#3490dc',
          light: '#3cbaeb',
          dark: '#2779bd',
        },
        secondary: {
          DEFAULT: '#ffed4a',
          light: '#fff9c2',
          dark: '#f9ca24',
        },
        danger: '#e3342f',
        success: '#38c172',
        warning: '#ffed4a',
        info: '#6cb2eb',
        light: '#f8f9fa',
        dark: '#343a40',
      },
      typography: {
        DEFAULT: {
          css: {
            color: '#333',
            a: {
              color: '#3490dc',
              '&:hover': {
                color: '#2779bd',
              },
            },
          },
        },
      },
      screens: {
        'xs': '480px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
      },
    },
  },
  plugins: [tailwindForms, tailwindTypography, tailwindAspectRatio],
}
