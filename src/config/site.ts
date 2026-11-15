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

// ─── Secrétariat ──────────────────────────────────────────────────────────
// Horaires du secrétariat téléphonique (pas de champ ACF). Téléphone,
// e-mail, adresses et réseaux sociaux viennent des options globales ACF.
// `highlight` = ligne mise en avant.

export const SECRETARIAT = [
  { days: "Mercredi non-stop",  hours: "09:00–12:00, 13:00–17:00", highlight: true  },
  { days: "Lun, Mar, Jeu, Ven", hours: "Sur rappel, 07:30–18:00",  highlight: false },
] as const;

// ─── Prise de rendez-vous ─────────────────────────────────────────────────
// Agenda Tbooking du cabinet, ouvert dans un nouvel onglet. Une fiche
// thérapeute peut fournir son propre lien (champ ACF `urlTbooking`).

export const TBOOKING_URL = "https://www.tbooking.ch/fr/physio-du-moleson/2854-3711";

// ─── Navigation principale ────────────────────────────────────────────────
// Le bouton « Prendre rendez-vous » (TBOOKING_URL) s'ajoute à droite.

export const NAV_ITEMS = [
  { id: 1, title: "Accueil",     url: "/" },
  { id: 2, title: "Le cabinet",  url: "/cabinet" },
  { id: 3, title: "Prestations", url: "/prestations" },
  { id: 4, title: "Équipe",      url: "/equipe" },
  { id: 5, title: "FAQ",         url: "/faq" },
  { id: 6, title: "Contact",     url: "/contact" },
] as const;

export type NavItem = (typeof NAV_ITEMS)[number];
