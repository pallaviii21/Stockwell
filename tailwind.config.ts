import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        stockwell: {
          bg: "#F8F6F1",
          sidebar: "#F0EBE2",
          card: "#FFFFFF",
          primary: "#593A2C",
          "primary-hover": "#472E23",
          secondary: "#765440",
          taupe: "#A78B73",
          border: "#E9E2D8",
          text: "#30251F",
          muted: "#918477",
          "muted-light": "#F2EFEB",
          highlight: "#F5EFE6",
        },
        status: {
          inStock: {
            text: "#2E6930",
            bg: "#EBF5ED",
            border: "#C3E3C8",
          },
          lowStock: {
            text: "#B45309",
            bg: "#FEF3C7",
            border: "#FDE68A",
          },
          outOfStock: {
            text: "#B91C1C",
            bg: "#FEE2E2",
            border: "#FECACA",
          },
          pending: {
            text: "#92400E",
            bg: "#FEF3C7",
            border: "#FDE68A",
          },
          completed: {
            text: "#15803D",
            bg: "#DCFCE7",
            border: "#BBF7D0",
          },
          cancelled: {
            text: "#4B5563",
            bg: "#F3F4F6",
            border: "#E5E7EB",
          },
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "Helvetica Neue", "Arial", "sans-serif"],
      },
      borderRadius: {
        lg: "12px",
        xl: "14px",
        "2xl": "16px",
      },
    },
  },
  plugins: [],
};
export default config;
