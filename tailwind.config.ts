// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {},
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      background: '#FAF7F0',
      text: '#1C1C1C',
      primary: '#D4AF37',
      secondary: '#A9A9A9',
      hover: '#B89B2E',
      'dark-background': '#1F1F1F',
      'dark-text': '#F1F1F1',
      'dark-primary': '#EACD63',
      'dark-secondary': '#555555',
      'dark-hover': '#F0D880',
    },
  },
  // Add the typography plugin here
  plugins: [require("@tailwindcss/typography")],
};
export default config;