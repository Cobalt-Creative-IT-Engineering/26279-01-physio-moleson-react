/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      // Charte « Alpage » (doc/charte/), resserrée à trois couleurs de base
      // (vert, sable, anthracite) + jaune pour les boutons et les points.
      // Les valeurs vivent dans src/index.css.
      colors: {
        bg:        "var(--color-bg)",
        "bg-alt":  "var(--color-bg-alt)",
        surface:   "var(--color-surface)",
        ink:       "var(--color-ink)",
        // Petit texte d'accent sur fond clair, aplats forts.
        vert:      "var(--color-vert)",
        // Bandeau de tête des cards uniquement (décoratif).
        olive:     "var(--color-olive)",
        sable:     "var(--color-sable)",
        // Boutons, surlignage, état actif — jamais en couleur de texte sur clair.
        jaune:     "var(--color-jaune)",
        line:      "var(--color-line)",
        dark:      "var(--color-dark)",
        "on-dark": "var(--color-on-dark)",
      },
      // Pas d'entrée "mono" : la charte ne prévoit aucune monospace, les
      // surtitres et étiquettes sont en Mulish Bold (classe .label).
      fontFamily: {
        display: ["var(--font-display)", "Verdana", "sans-serif"],
        body:    ["var(--font-body)", "Trebuchet MS", "sans-serif"],
      },
      // Interlettrage des surtitres : 0,1 em (charte, Typographie).
      letterSpacing: {
        eyebrow: "0.1em",
      },
      borderRadius: {
        btn:  "var(--radius-btn)",  // pilule
        card: "var(--radius-card)", // 0 — aplats francs
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
