/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.tsx', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  // 웹 미리보기: media 모드면 <html> class 변경 시 NativeWind가 예외를 던짐 → class 모드
  darkMode: 'class',
  theme: {
    extend: {},
  },
  plugins: [],
}
