/**
 * Contenus fixes sans équivalent ACF. Tout le reste (accueil, cabinet,
 * prestations, Sensopro, équipe, FAQ, coordonnées) vient de WordPress :
 * un champ vide n'est pas affiché, sans texte de repli.
 */

// ─── Équipe ───────────────────────────────────────────────────────────────
// Pas de page d'options « Équipe » ni de champ « langues » côté ACF.

export const INTRO_EQUIPE = {
  accroche: "Cinq physiothérapeutes diplômé·e·s à votre écoute, au pied du Moléson.",
  // À valider : les spécialités ne figurent plus que dans le portrait, plus
  // sur la carte (remarque du handoff).
  texte:    "Chacun et chacune prend en charge l'ensemble des services de base. Les certifications complémentaires sont indiquées sur chaque carte.",
} as const;

/** Langues par prénom ; « Français » par défaut. */
export const LANGUES: Record<string, string[]> = {
  Andrzej: ["Français", "Espagnol", "Polonais"],
};
export const LANGUE_PAR_DEFAUT = ["Français"];
