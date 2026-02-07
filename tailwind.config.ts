import type { Config } from "tailwindcss";

const config: Config = {
  // 1. Enable manual dark mode toggle ('class' strategy)
  darkMode: "class",
  
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // 2. Connect the Geist fonts from layout.tsx
      fontFamily: {
        sans: ["var(--font-geist-sans)", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
      // 3. Define your custom dark colors (Optional, simplifies your code)
      colors: {
        dark: {
          bg: "#0f1117",
          card: "#1e212b",
          border: "#2d303a"
        }
      }
    },
  },
  // 4. Register the animation plugin
  plugins: [require("tailwindcss-animate")],
};

export default config;