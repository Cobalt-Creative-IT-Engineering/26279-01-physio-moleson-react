import { useState, useEffect } from "react";

/**
 * Suit la section courante visible dans le viewport.
 * Retourne l'id de la section active (la première visible dans l'ordre du DOM).
 *
 * @param ids    Liste ordonnée des ids à observer (correspond aux nav items)
 * @param offset Décalage en % depuis le haut du viewport pour le seuil (défaut 20%)
 */
export function useScrollSpy(ids: readonly string[], offset = 20): string | null {
  const [activeId, setActiveId] = useState<string | null>(ids[0] ?? null);
  const key = ids.join(",");

  useEffect(() => {
    const visible = new Set<string>();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            visible.add(entry.target.id);
          } else {
            visible.delete(entry.target.id);
          }
        });
        // Retourne le premier id (dans l'ordre de NAV) actuellement visible
        const idList = key.split(",");
        const first = idList.find((id) => visible.has(id));
        if (first) setActiveId(first);
      },
      { rootMargin: `-${offset}% 0px -${100 - offset - 20}% 0px` }
    );

    key.split(",").forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [key, offset]);

  return activeId;
}
