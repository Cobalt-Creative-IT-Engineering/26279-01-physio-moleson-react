// ─── Thème actif ──────────────────────────────────────────────────────────────
// Changer cette valeur et rebuilder pour changer l'identité visuelle du site.
// Le blueprint fournit uniquement le thème "base". Ajoutez vos propres thèmes
// dans src/themes/ (voir src/themes/index.ts).
import type { ThemeName } from "../themes/index";
export const ACTIVE_THEME: ThemeName = "base";

// ─── Coming Soon / Page d'attente ─────────────────────────────────────────
// Deux leviers pour afficher une page d'attente avant l'ouverture du site :
//   1. FORCE_COMING_SOON=true  → toujours afficher
//   2. VITE_COMING_SOON_UNTIL=YYYY-MM-DDTHH:mm  → afficher tant que la date
//      n'est pas atteinte (fuseau local du navigateur)

export const FORCE_COMING_SOON = false;

export const COMING_SOON_UNTIL: Date | null = (() => {
  const raw = import.meta.env.VITE_COMING_SOON_UNTIL;
  if (typeof raw !== "string" || !raw) return null;
  const d = new Date(raw);
  return isNaN(d.getTime()) ? null : d;
})();

// ─── Site Configuration ───────────────────────────────────────────────────
// Centralise le nom du site, la langue et les éléments de navigation.

export const SITE_CONFIG = {
  name:        "Site Name",
  lang:        "fr",
  description: "Description du site (utilisée comme valeur par défaut pour les meta tags).",
} as const;

// ─── Réseaux sociaux ──────────────────────────────────────────────────────────
// Remplissez uniquement les plateformes que vous utilisez. Les liens vides
// seront ignorés par le composant Footer / ContactPage.
export const SOCIAL_LINKS = {
  facebook:  "",
  instagram: "",
  twitter:   "",
  linkedin:  "",
  youtube:   "",
} as const;

// cta: true → s'affiche à droite du nav en style bouton
// cta: false → lien standard à gauche du nav
export const NAV_ITEMS = [
  { id: 1, title: "À propos",    url: "/about",    cta: false },
  { id: 2, title: "Articles",    url: "/articles", cta: false },
  { id: 3, title: "Infos",       url: "/info",     cta: false },
  { id: 4, title: "Contact",     url: "/contact",  cta: true  },
] as const;

export type NavItem = (typeof NAV_ITEMS)[number];
