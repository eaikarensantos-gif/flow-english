import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: "#0D0D0D",
          card: "#161616",
          elevated: "#1E1E1E",
        },
        accent: {
          DEFAULT: "#F5C842",
          hover: "#D4AA35",
        },
      },
      fontFamily: {
        sans: ["Space Grotesk", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
