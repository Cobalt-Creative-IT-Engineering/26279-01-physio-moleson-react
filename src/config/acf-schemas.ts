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

// ─── Accueil (ex-Hero) ────────────────────────────────────────────────────
// Migré en GraphQL (Options Page `accueil`). Mapping dans `GQL_ACCUEIL`
// de src/hooks/useWordPress.ts. Plus de schéma REST ici.

// ─── Sensopro ─────────────────────────────────────────────────────────────
// Migré en GraphQL (Options Page `sensopros`). Mapping dans `GQL_SENSOPRO`
// de src/hooks/useWordPress.ts. Plus de schéma REST ici.

// ─── Cabinet ──────────────────────────────────────────────────────────────
// Migré en GraphQL (Options Page `cabinets`). Mapping dans `GQL_CABINET`
// de src/hooks/useWordPress.ts. Plus de schéma REST ici.

// ─── CPT `service` & `therapeute` ─────────────────────────────────────────
//
// Ces deux CPT ne passent PAS par ce fichier : ils sont consommés via
// WPGraphQL (WPGraphQL for ACF), pas via le REST ACF. Le mapping des champs
// est défini directement dans les queries `GQL_SERVICES` / `GQL_THERAPEUTES`
// de src/hooks/useWordPress.ts (noms camelCase auto-générés par WPGraphQL,
// ex. `debut_dactivite` → `debutDactivite`).
//
// Seules les Options pages ci-dessus (Global/Hero/Sensopro/Cabinet) restent
// en REST ACF et utilisent ce fichier de schémas.

// ─── Type utilitaire ──────────────────────────────────────────────────────

export type ACFSchema = Record<string, string>;
