/**
 * Contenus fixes sans équivalent ACF. Tout le reste (accueil, cabinet,
 * prestations, Sensopro, équipe et sa bannière, FAQ, coordonnées) vient de
 * WordPress :
 * un champ vide n'est pas affiché, sans texte de repli.
 */

// ─── Équipe ───────────────────────────────────────────────────────────────
// Pas de champ « langues » côté ACF.

/** Langues par prénom ; « Français » par défaut. */
export const LANGUES: Record<string, string[]> = {
  Andrzej: ["Français", "Espagnol", "Polonais"],
};
export const LANGUE_PAR_DEFAUT = ["Français"];
