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
        background: "var(--background)",
        foreground: "var(--foreground)",
        newspaper: {
          bg: "#f4ede1",
          paper: "#fcf8f2",
          aged: "#e8dcbe",
          ink: "#1c1917",
          subtle: "#44403c",
          border: "#292524",
          accent: "#991b1b",
        },
        scratch: {
          silver: "#94a3b8",
          dark: "#0f172a",
          card: "#1e293b",
          gold: "#eab308",
        }
      },
      fontFamily: {
        serif: ["Georgia", "Cambria", "'Times New Roman'", "Times", "serif"],
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "'Segoe UI'", "Roboto", "sans-serif"],
        mono: ["monospace"],
      },
      boxShadow: {
        'paper': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1), 0 20px 25px -5px rgba(0,0,0,0.05)',
        'vintage': '5px 5px 0px 0px rgba(0, 0, 0, 0.85)',
        'scratch': '0 10px 30px -5px rgba(0, 0, 0, 0.3)',
      },
      keyframes: {
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        unfold: {
          '0%': { transform: 'rotateX(-90deg)', opacity: '0' },
          '100%': { transform: 'rotateX(0deg)', opacity: '1' },
        }
      },
      animation: {
        shimmer: 'shimmer 2s infinite',
        unfold: 'unfold 0.8s ease-out forwards',
      }
    },
  },
  plugins: [],
};
export default config;
