/**
 * Schémas ACF — contrat WordPress ↔ frontend.
 *
 * Chaque schéma mappe une clé sémantique TypeScript (utilisée dans le code)
 * vers le slug ACF réel défini côté WordPress. Si un champ est renommé dans
 * ACF, on n'a qu'à mettre à jour le slug ici, le code reste inchangé.
 *
 * Convention de nommage côté WP :
 *   - Options pages : préfixe `<scope>_*` (ex: hero_title, sensopro_image)
 *   - CPT fields    : préfixe `<cpt>_*`   (ex: therapeute_bio, service_tags)
 *
 * Voir doc/wordpress-setup.md pour la liste complète des champs à créer
 * côté WordPress.
 */

// ─── Options Page : Global (singleton) ────────────────────────────────────
// Données réutilisées dans Nav, Footer, Contact, etc.
// Sert de source de vérité runtime pour tél/email/adresses (override CONTACT
// hardcodé dans src/config/site.ts).

export const GlobalACF = {
  logo:      "global_logo",
  phone:     "global_phone",
  email:     "global_email",
  // Repeater : { label, street, postcode, city }
  addresses: "global_addresses",
  // Group : { instagram, facebook, linkedin, youtube }
  social:    "global_social",
} as const;

// ─── Options Page : Hero (page d'accueil) ────────────────────────────────

export const HeroACF = {
  eyebrow:        "hero_eyebrow",          // "Cabinet de physiothérapie · Bulle"
  titlePart1:     "hero_title_part1",      // "Une équipe"
  titleEmphasis:  "hero_title_emphasis",   // "à votre écoute," (italic primary)
  titlePart2:     "hero_title_part2",      // "votre santé en mouvement."
  subtitle:       "hero_subtitle",         // wysiwyg/textarea
  ctaPrimary:     "hero_cta_primary_label",
  ctaPrimaryUrl:  "hero_cta_primary_url",
  ctaSecondary:   "hero_cta_secondary_label",
  ctaSecondaryUrl:"hero_cta_secondary_url",
  // Repeater : { number, label }
  stats:          "hero_stats",
  imageMain:      "hero_image_main",
  imageSecondary: "hero_image_secondary",
} as const;

// ─── Options Page : Sensopro ──────────────────────────────────────────────

export const SensoproACF = {
  eyebrow:           "sensopro_eyebrow",
  title:             "sensopro_title",
  intro:             "sensopro_intro",            // wysiwyg
  image:             "sensopro_image",
  // Repeater : { number, title, description }
  benefits:          "sensopro_benefits",
  // Repeater : { number, title, description }
  steps:             "sensopro_steps",
  firstSessionTitle: "sensopro_first_session_title",
  firstSessionText:  "sensopro_first_session_text", // wysiwyg
} as const;

// ─── Options Page : Cabinet ──────────────────────────────────────────────

export const CabinetACF = {
  eyebrow:      "cabinet_eyebrow",
  title:        "cabinet_title",
  intro:        "cabinet_intro",          // wysiwyg
  // Cabinet n°66
  tag66:        "cabinet_66_tag",         // "Près de la voie de chemin de fer"
  images66:     "cabinet_66_images",      // gallery
  // Cabinet n°68
  tag68:        "cabinet_68_tag",         // "Reconnaissable aux télécabines en vitrine"
  images68:     "cabinet_68_images",      // gallery
} as const;

// ─── CPT : `service` (4 entrées attendues) ───────────────────────────────

export const ServiceACF = {
  num:         "service_num",          // "01"…"04" (manuel pour le contrôle d'ordre)
  short:       "service_short",        // "Rhumatologie, orthopédie, traumatologie"
  description: "service_description",  // wysiwyg
  // Repeater : { label }
  tags:        "service_tags",
  image:       "service_image",
} as const;

// ─── CPT : `therapeute` (5 entrées attendues) ────────────────────────────

export const TherapeuteACF = {
  role:         "therapeute_role",          // "Physiothérapeute & ostéopathe"
  since:        "therapeute_since",         // number
  // Repeater : { label }
  certifs:      "therapeute_certifs",
  bio:          "therapeute_bio",           // wysiwyg, bio complète (modal)
  bioShort:     "therapeute_bio_short",     // textarea, bio courte (hover card)
  extras:       "therapeute_extras",        // "Ostéopathie · Sport · Posturologie"
  photo:        "therapeute_photo",
  tbookingUrl:  "therapeute_tbooking_url",
  // Repeater : { spec } — valeurs : "generale", "femme", "sport", "domicile", etc.
  specs:        "therapeute_specs",
} as const;

// ─── Type utilitaire ──────────────────────────────────────────────────────

export type ACFSchema = Record<string, string>;
