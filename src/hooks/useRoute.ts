import { useState, useEffect } from "react";

export interface RouteResult {
  /** Chemin normalisé, ex: "/programmation" ou "/" */
  route: string;
  /** Identique à route (alias pour compatibilité) */
  path: string;
  /**
   * Slug extrait pour les routes "/page/:slug".
   * null si la route n'est pas de ce format.
   */
  slug: string | null;
  /** Fragment URL sans le "#", ex: "contact" depuis "/festival#contact" */
  anchor: string | null;
}

/** Navigue sans rechargement de page (SPA). */
export function navigate(path: string) {
  history.pushState(null, "", path);
  window.dispatchEvent(new PopStateEvent("popstate"));
}

function getState(): RouteResult {
  // Migration depuis l'ancienne URL hash (#/festival → /festival)
  if (window.location.hash.startsWith("#/")) {
    const newPath = window.location.hash.slice(1); // "#/festival" → "/festival"
    history.replaceState(null, "", newPath);
  }

  const pathname = window.location.pathname.replace(/\/$/, "") || "/";
  const hash     = window.location.hash.replace(/^#/, "") || null;
  const pageMatch = pathname.match(/^\/page\/(.+)$/);
  const slug = pageMatch ? pageMatch[1] : null;
  return { route: pathname, path: pathname, slug, anchor: hash };
}

/**
 * Hook de routing basé sur l'History API (pathname).
 * Les liens doivent être interceptés via le gestionnaire global dans App.tsx.
 */
export function useRoute(): RouteResult {
  const [state, setState] = useState(getState);

  useEffect(() => {
    const update = () => setState(getState());
    window.addEventListener("popstate", update);
    return () => window.removeEventListener("popstate", update);
  }, []);

  return state;
}
