// ─── Système de thèmes ────────────────────────────────────────────────────
//
// Pour ajouter un thème (ex: "2027") :
//   1. Créer src/themes/2027/Decorations.tsx
//   2. Ajouter un bloc html.theme-2027 { ... } dans src/index.css
//   3. Ajouter l'entrée "2027" dans THEMES ci-dessous
//   4. Étendre le type ThemeName ci-dessous
//   5. Dispatcher le composant dans src/themes/Decorations.tsx
//   6. Changer ACTIVE_THEME dans src/config/site.ts → "2027"
//
// ACTIVE_THEME est typé comme littéral → Rollup peut tree-shaker les thèmes
// inactifs au build, le bundle ne contient que le thème déployé.

export type ThemeName = "base";

export interface ThemeConfig {
  /** Classe CSS appliquée sur <html> : ex. "theme-base" */
  cssClass: string;
  /**
   * URL Google Fonts à injecter dynamiquement via une balise <link>.
   * null = polices déjà chargées (index.html) ou polices système suffisantes.
   */
  fontsUrl: string | null;
  /** Nom lisible pour le débogage. */
  label: string;
}

export const THEMES: Record<ThemeName, ThemeConfig> = {
  base: {
    cssClass: "theme-base",
    fontsUrl: null,
    label: "Base (neutre)",
  },
};
