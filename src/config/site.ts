// ─── Thème actif ──────────────────────────────────────────────────────────────
// Le projet utilise un thème unique "base". Système de thèmes annuels conservé
// du blueprint pour permettre des variantes futures (saison, événement…).
import type { ThemeName } from "../themes/index";
export const ACTIVE_THEME: ThemeName = "base";

// ─── Coming Soon / Page d'attente ─────────────────────────────────────────
// Deux leviers pour afficher une page d'attente avant l'ouverture du site :
//   1. FORCE_COMING_SOON=true             → toujours afficher
//   2. VITE_COMING_SOON_UNTIL=YYYY-MM-DDTHH:mm → afficher tant que la date n'est pas atteinte

export const FORCE_COMING_SOON = false;

export const COMING_SOON_UNTIL: Date | null = (() => {
  const raw = import.meta.env.VITE_COMING_SOON_UNTIL;
  if (typeof raw !== "string" || !raw) return null;
  const d = new Date(raw);
  return isNaN(d.getTime()) ? null : d;
})();

// ─── Identité du site ─────────────────────────────────────────────────────

export const SITE_CONFIG = {
  name:        "Physio du Moléson",
  tagline:     "Cabinet de physiothérapie à Bulle",
  lang:        "fr",
  description: "Cabinet de physiothérapie à Bulle. Une équipe de cinq thérapeutes diplômé·e·s à votre écoute, au pied du Moléson.",
} as const;

// ─── Coordonnées ─────────────────────────────────────────────────────────
// Ces valeurs servent de fallback. À terme, elles seront remplacées par des
// champs ACF (Options Page "global") pour permettre l'édition côté WordPress.

export const CONTACT = {
  phone:        "026 303 93 43",
  phoneTel:     "+41263039343",
  email:        "physiomoleson@gmail.com",
  addresses: [
    { id: 66, label: "Cabinet n°66", street: "Rue Saint-Denis 66", postcode: "1630", city: "Bulle" },
    { id: 68, label: "Cabinet n°68", street: "Rue Saint-Denis 68", postcode: "1630", city: "Bulle" },
  ],
  // Horaires du secrétariat téléphonique. `highlight` = ligne mise en avant.
  secretariat: [
    { days: "Mercredi non-stop",     hours: "09:00-12:00, 13:00-17:00", highlight: true  },
    { days: "Lun, Mar, Jeu, Ven",    hours: "Sur rappel, 07:30-18:00",      highlight: false },
  ],
} as const;

// ─── Réseaux sociaux ──────────────────────────────────────────────────────
// Vide = lien ignoré par Footer / ContactPage.

export const SOCIAL_LINKS = {
  instagram: "",
  facebook:  "",
  linkedin:  "",
  youtube:   "",
} as const;

// ─── Navigation principale ────────────────────────────────────────────────
// `cta: true` → s'affiche à droite en style bouton.

export const NAV_ITEMS = [
  { id: 1, title: "Accueil",     url: "/",          cta: false },
  { id: 2, title: "Nos services", url: "/services", cta: false },
  { id: 3, title: "Sensopro",    url: "/sensopro",  cta: false },
  { id: 4, title: "Thérapeutes", url: "/equipe",    cta: false },
  { id: 5, title: "Cabinet",     url: "/cabinet",   cta: false },
  { id: 7, title: "FAQ",         url: "/faq",       cta: false },
  { id: 6, title: "Prendre rendez-vous",     url: "/#contact", cta: true  },
] as const;

export type NavItem = (typeof NAV_ITEMS)[number];
