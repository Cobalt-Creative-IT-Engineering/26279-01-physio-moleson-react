/**
 * (Obsolète) Schémas ACF REST.
 *
 * Le projet consomme désormais **toutes** les données via WPGraphQL
 * (WPGraphQL + WPGraphQL for ACF). Il n'y a plus de mapping REST :
 *
 * - CPT `therapeute` / `service` → queries `GQL_THERAPEUTES` / `GQL_SERVICES`
 * - Options pages `accueil` / `sensopro` / `cabinet` / `optGlobale`
 *   → queries `GQL_ACCUEIL` / `GQL_SENSOPRO` / `GQL_CABINET` / `GQL_GLOBAL`
 *
 * Tout est défini dans src/hooks/useWordPress.ts. Les noms de champs sont
 * ceux générés automatiquement par WPGraphQL for ACF (camelCase).
 *
 * Voir doc/wordpress-setup.md pour la config WordPress (règle anti-collision
 * « nom GraphQL de la page d'options ≠ nom GraphQL du groupe »).
 *
 * Fichier conservé volontairement vide pour mémoire ; rien ne l'importe.
 */

export {};
