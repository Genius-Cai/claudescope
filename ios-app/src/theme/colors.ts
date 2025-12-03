export const colors = {
  primary: {
    50: '#faf5ff',
    100: '#f3e8ff',
    200: '#e9d5ff',
    300: '#d8b4fe',
    400: '#c084fc',
    500: '#a855f7',
    600: '#9333ea',
    700: '#7e22ce',
    800: '#6b21a8',
    900: '#581c87',
  },
  background: {
    light: '#ffffff',
    dark: '#09090b',
  },
  text: {
    light: '#09090b',
    dark: '#fafafa',
  },
  border: {
    light: '#e4e4e7',
    dark: '#27272a',
  },
  card: {
    light: '#ffffff',
    dark: '#18181b',
  },
} as const;

export type ColorScheme = 'light' | 'dark';
