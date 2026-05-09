// ─── Gestion des balises meta (SEO + Open Graph + Twitter Card) ───────────────

import { SITE_CONFIG } from "../config/site";

let _siteName: string = SITE_CONFIG.name;
let _siteDesc: string = SITE_CONFIG.description;

/** À appeler une fois au chargement depuis App.tsx avec les infos WP. */
export function initMeta(name: string, description: string) {
  _siteName = name || _siteName;
  _siteDesc = description || _siteDesc;
}

export interface PageMeta {
  /** Label de la page (sans le nom du site). Ex : "À propos" */
  title?: string;
  description?: string;
  image?: string;
  type?: "website" | "article";
}

/**
 * Met à jour toutes les balises meta de la page :
 * <title>, description, og:*, twitter:*
 */
export function setPageMeta(meta: PageMeta = {}) {
  const pageLabel   = meta.title || null;
  const fullTitle   = pageLabel ? `${_siteName} - ${pageLabel}` : _siteName;
  const description = meta.description || _siteDesc || _siteName;
  const type        = meta.type || "website";
  const url         = window.location.href;

  document.title = fullTitle;

  setMeta("name",     "description",        description);
  setMeta("property", "og:title",           fullTitle);
  setMeta("property", "og:description",     description);
  setMeta("property", "og:type",            type);
  setMeta("property", "og:site_name",       _siteName);
  setMeta("property", "og:url",             url);
  setMeta("name",     "twitter:card",       meta.image ? "summary_large_image" : "summary");
  setMeta("name",     "twitter:title",      fullTitle);
  setMeta("name",     "twitter:description",description);

  if (meta.image) {
    setMeta("property", "og:image",    meta.image);
    setMeta("name",     "twitter:image", meta.image);
  } else {
    removeMeta("property", "og:image");
    removeMeta("name",     "twitter:image");
  }
}

function setMeta(attr: "name" | "property", key: string, value: string) {
  let el = document.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.content = value;
}

function removeMeta(attr: "name" | "property", key: string) {
  document.querySelector(`meta[${attr}="${key}"]`)?.remove();
}
