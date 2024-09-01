/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  darkMode: "class", // Enable dark mode
  theme: {
    extend: {
      colors: {
        // Define dark mode colors
        "dark-bg": "#1a202c",
        "dark-text": "#f7fafc",
        "dark-secondary": "#2d3748",
        "dark-accent": "#4a5568",
      },
      typography: {
        DEFAULT: {
          css: {
            h1: {
              fontSize: "2rem",
              fontWeight: "700",
              marginTop: "2rem",
              marginBottom: "1rem",
            },
            h2: {
              fontSize: "1.5rem",
              fontWeight: "700",
              marginTop: "1.5rem",
              marginBottom: "1rem",
            },
            h3: {
              fontSize: "1.25rem",
              fontWeight: "600",
              marginTop: "1.25rem",
              marginBottom: "0.75rem",
            },
          },
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
