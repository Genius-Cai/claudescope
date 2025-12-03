/** @type {import('tailwindcss').Config} */
module.exports = {
  // 必须添加 NativeWind 预设
  presets: [require('nativewind/preset')],
  content: [
    './App.{js,jsx,ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // ClaudeScope 品牌色
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
      },
    },
  },
  plugins: [],
};
