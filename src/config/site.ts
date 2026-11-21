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

// ─── Prise de rendez-vous ─────────────────────────────────────────────────
// Agenda Tbooking du cabinet, ouvert dans un nouvel onglet. Une fiche
// thérapeute peut fournir son propre lien (champ ACF `urlTbooking`).

export const TBOOKING_URL = "https://www.tbooking.ch/fr/physio-du-moleson/2854-3711";

// ─── Formulaire de contact ────────────────────────────────────────────────
// Envoi par Contact Form 7 (API REST de WordPress), protégé par Cloudflare
// Turnstile. Valeurs publiques : l'identifiant du formulaire CF7 et la clé de
// site Turnstile, la même que dans CF7 → Intégration (la clé secrète reste
// dans WordPress). Vide = formulaire
// non branché : un message d'indisponibilité s'affiche à l'envoi.

export const CONTACT_FORM_ID: string = "752";
export const TURNSTILE_SITE_KEY: string = "0x4AAAAAAGLtT5qZL2dQwi0d";

// ─── Navigation principale ────────────────────────────────────────────────
// Le bouton « Prendre rendez-vous » (TBOOKING_URL) s'ajoute à droite.

/**
 * Page « Conditions d'utilisation et protection des données », liée depuis
 * la bannière des cookies et le pied de page.
 */
export const PAGE_CONFIDENTIALITE = "/conditions-utilisation";

export const NAV_ITEMS = [
  { id: 1, title: "Accueil",     url: "/" },
  { id: 2, title: "Le cabinet",  url: "/cabinet" },
  { id: 3, title: "Prestations", url: "/prestations" },
  { id: 4, title: "Équipe",      url: "/equipe" },
  { id: 5, title: "FAQ",         url: "/faq" },
  { id: 6, title: "Contact",     url: "/contact" },
] as const;

export type NavItem = (typeof NAV_ITEMS)[number];
