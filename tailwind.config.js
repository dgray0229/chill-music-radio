/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        navy: '#002F5E',
        'navy-deep': '#001E3D',
        'navy-light': '#0A3A6B',
        ocean: '#589BE3',
        'soft-sky': '#E4EBFC',
        lavender: '#8A7CC8',
      },
    },
  },
  plugins: [],
}
