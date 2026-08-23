import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // SFW-inspired earth palette (placeholder brand tokens)
        soil: {
          50: "#f7f5f0",
          100: "#ece7db",
          200: "#d8cdb6",
          300: "#bfae8c",
          400: "#a8916b",
          500: "#8f7752",
          600: "#755f42",
          700: "#5c4a35",
          800: "#463829",
          900: "#33291f"
        },
        leaf: {
          50: "#f2f7f0",
          100: "#e0ecdb",
          200: "#c2d9b9",
          300: "#9cc08e",
          400: "#74a465",
          500: "#548947",
          600: "#406d37",
          700: "#33552d",
          800: "#2a4426",
          900: "#233820"
        },
        clay: {
          500: "#b3592f",
          600: "#94481f"
        }
      }
    }
  },
  plugins: []
};

export default config;
