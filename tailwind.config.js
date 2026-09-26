/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        bg:           "var(--color-bg)",
        "bg-alt":     "var(--color-bg-alt)",
        surface:      "var(--color-surface)",
        ink:          "var(--color-ink)",
        "ink-soft":   "var(--color-ink-soft)",
        "ink-mute":   "var(--color-ink-mute)",
        primary: {
          DEFAULT: "var(--color-primary)",
          hover:   "var(--color-primary-hover)",
          // Liens et intertitres en petit corps : le terracotta plein n'atteint
          // que 4.25:1 sur fond clair, la charte impose alors #8F4C35.
          text:    "var(--color-primary-text)",
          soft:    "var(--color-primary-soft)",
          bg:      "var(--color-primary-bg)",
        },
        sauge:        "var(--color-sauge)",
        ocre:         "var(--color-ocre)",
        accent:       "var(--color-accent)",
        line:         "var(--color-line)",
        "line-soft":  "var(--color-line-soft)",
        // Textes posés sur un aplat
        "on-primary":   "var(--color-on-primary)",
        "on-dark":      "var(--color-on-dark)",
        "on-dark-soft": "var(--color-on-dark-soft)",
        "on-dark-mute": "var(--color-on-dark-mute)",
        dark:           "var(--color-dark)",
      },
      // Pas d'entrée "mono" : la charte ne prévoit aucune monospace, les
      // surtitres et étiquettes sont en Mulish Bold (classe .label).
      fontFamily: {
        display: ["var(--font-display)", "Verdana", "sans-serif"],
        body:    ["var(--font-body)", "Trebuchet MS", "sans-serif"],
      },
      fontSize: {
        // Eyebrow / labels / monospace
        "10": ["10px", { lineHeight: "1.4" }],
        "11": ["11px", { lineHeight: "1.5" }],
      },
      // Interlettrage des surtitres : 0,1 em (charte, Typographie).
      letterSpacing: {
        eyebrow: "0.1em",
        wider2:  "0.1em",
      },
      borderRadius: {
        btn:  "var(--radius-btn)",  // pill (999px)
        card: "var(--radius-card)", // 4px
      },
      boxShadow: {
        sm: "var(--shadow-sm)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
      },
      maxWidth: {
        container: "1280px",
      },
      transitionTimingFunction: {
        out: "cubic-bezier(0.2, 0, 0, 1)",
      },
    },
  },
  plugins: [],
};
