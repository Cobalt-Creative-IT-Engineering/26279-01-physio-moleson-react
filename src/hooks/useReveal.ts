import { useEffect, useRef } from "react";

/**
 * Apparition au défilement : pose `data-revealed` sur l'élément la première
 * fois qu'il entre dans la fenêtre. Les enfants `.reveal` (voir index.css)
 * passent alors de l'état masqué à l'état visible.
 *
 * Sans IntersectionObserver ou avec `prefers-reduced-motion`, le contenu est
 * révélé d'emblée : il ne doit jamais rester caché.
 */
export function useReveal<T extends HTMLElement>(threshold = 0.25) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduit = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduit || typeof IntersectionObserver === "undefined") {
      el.dataset.revealed = "";
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          el.dataset.revealed = "";
          observer.disconnect();
        }
      },
      { threshold, rootMargin: "0px 0px -8% 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return ref;
}
