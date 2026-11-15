import type { ReactNode } from "react";
import { useReveal } from "../../hooks/useReveal";

/**
 * Bloc qui déclenche l'apparition au défilement de ses enfants `.reveal`
 * (voir useReveal et index.css). L'observateur est posé au montage du bloc :
 * à rendre seulement quand son contenu est prêt (données WordPress chargées),
 * sinon l'animation se jouerait sur un bloc vide.
 */
export function Apparition({
  children,
  className = "",
  seuil = 0.15,
}: {
  children: ReactNode;
  className?: string;
  seuil?: number;
}) {
  const ref = useReveal<HTMLDivElement>(seuil);
  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

/** Décalages successifs pour une liste (classes complètes pour Tailwind). */
export const DELAIS_APPARITION = [
  "",
  "[--reveal-delay:100ms]",
  "[--reveal-delay:200ms]",
  "[--reveal-delay:300ms]",
  "[--reveal-delay:400ms]",
  "[--reveal-delay:500ms]",
] as const;

/** Décalage de l'élément n° i (plafonné au dernier palier). */
export const delaiApparition = (i: number) =>
  DELAIS_APPARITION[Math.min(i, DELAIS_APPARITION.length - 1)];
