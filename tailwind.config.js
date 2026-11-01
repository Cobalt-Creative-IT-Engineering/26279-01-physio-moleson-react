/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      // Palette de la maquette (doc/maquette/). Les valeurs vivent dans
      // src/index.css.
      colors: {
        bg:            "var(--color-bg)",
        surface:       "var(--color-surface)",
        ink:           "var(--color-ink)",
        muted:         "var(--color-muted)",
        vert:          "var(--color-vert)",
        olive:         "var(--color-olive)",
        sable:         "var(--color-sable)",
        jaune:         "var(--color-jaune)",
        line:          "var(--color-line)",
        field:         "var(--color-field)",
        dark:          "var(--color-dark)",
        "on-dark":     "var(--color-on-dark)",
        "on-dark-soft": "var(--color-on-dark-soft)",
      },
      fontFamily: {
        display: ["var(--font-display)", "Verdana", "sans-serif"],
        body:    ["var(--font-body)", "Trebuchet MS", "sans-serif"],
      },
      borderRadius: {
        btn:   "var(--radius-btn)",
        card:  "var(--radius-card)",
        tile:  "var(--radius-tile)",
        field: "var(--radius-field)",
      },
      maxWidth: {
        container: "1240px",
      },
      transitionTimingFunction: {
        out: "cubic-bezier(0.2, 0, 0, 1)",
      },
    },
  },
  plugins: [],
};
