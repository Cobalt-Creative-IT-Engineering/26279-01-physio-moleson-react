import { ACFGroup } from "./ACFField";

interface ACFRendererProps {
  fields: Record<string, unknown>;
  className?: string;
  showLabels?: boolean;
}

/**
 * Affiche l'ensemble des champs ACF d'un post / page / CPT.
 * Utile pour le débogage ou pour afficher tous les champs automatiquement.
 */
export function ACFRenderer({ fields, className, showLabels = false }: ACFRendererProps) {
  return <ACFGroup fields={fields} className={className} showLabels={showLabels} />;
}
