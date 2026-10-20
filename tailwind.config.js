/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Nunito', 'Switzer', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
      },
      colors: {
        doodle: {
          cream: '#FFF4D2',
          sky: '#5DA7FB',
          skyDark: '#4A8FE0',
          yellow: '#F8E71C',
          bar: '#333333',
          ink: '#2F3142',
          muted: '#5C5C5C',
        },
        primary: {
          50: '#E8F4FF',
          100: '#CFE6FD',
          500: '#5DA7FB',
          600: '#4A8FE0',
          700: '#3B7BC7',
        },
        family: {
          cream: '#FFF4D2',
          sand: '#FFF4D2',
          orange: '#5DA7FB',
          orangeSoft: '#5DA7FB',
          peach: '#F8E71C',
          sky: '#5DA7FB',
          skyDeep: '#4A8FE0',
          mint: '#5DA7FB',
          ink: '#2F3142',
          muted: '#5C5C5C',
          coral: '#F8E71C',
          sun: '#F8E71C',
          grape: '#5DA7FB',
          berry: '#4A8FE0',
        },
        bronze: '#cd7f32',
        silver: '#c0c0c0',
        gold: '#ffd700',
        platinum: '#e5e4e2',
      },
      borderRadius: {
        '4xl': '2rem',
        doodle: '1.25rem',
      },
      boxShadow: {
        doodle: '3px 4px 0 rgba(51, 51, 51, 0.18)',
        'doodle-sm': '2px 2px 0 rgba(51, 51, 51, 0.12)',
        family: '3px 4px 0 rgba(51, 51, 51, 0.15)',
        'family-card': '3px 4px 0 rgba(51, 51, 51, 0.12)',
        'family-soft': '2px 3px 0 rgba(51, 51, 51, 0.1)',
      },
      backgroundImage: {
        'family-hero': 'linear-gradient(180deg, #FFF4D2 0%, #FFEEB8 100%)',
        'family-header': 'linear-gradient(180deg, #5DA7FB 0%, #4A8FE0 100%)',
        'family-page': 'none',
        'family-child': 'none',
        'grad-card-rose': 'linear-gradient(135deg, #5DA7FB 0%, #4A8FE0 100%)',
        'grad-card-purple': 'linear-gradient(135deg, #5DA7FB 0%, #4A8FE0 100%)',
        'grad-card-green': 'linear-gradient(135deg, #5DA7FB 0%, #4A8FE0 100%)',
        'grad-card-amber': 'linear-gradient(135deg, #5DA7FB 0%, #4A8FE0 100%)',
        'grad-card-blue': 'linear-gradient(135deg, #5DA7FB 0%, #4A8FE0 100%)',
        'grad-card-teal': 'linear-gradient(135deg, #5DA7FB 0%, #4A8FE0 100%)',
        'grad-orb-blue': 'linear-gradient(145deg, #5DA7FB 0%, #4A8FE0 100%)',
      },
    },
  },
  plugins: [],
}
