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
          soft:    "var(--color-primary-soft)",
          bg:      "var(--color-primary-bg)",
        },
        accent:       "var(--color-accent)",
        line:         "var(--color-line)",
        "line-soft":  "var(--color-line-soft)",
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        body:    ["var(--font-body)", "system-ui", "sans-serif"],
        mono:    ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      fontSize: {
        // Eyebrow / labels / monospace
        "10": ["10px", { lineHeight: "1.4" }],
        "11": ["11px", { lineHeight: "1.5" }],
      },
      letterSpacing: {
        eyebrow: "0.24em",
        wider2:  "0.18em",
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
