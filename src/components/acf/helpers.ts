/**
 * Helpers pour accéder aux champs ACF de façon typée.
 *
 * Utilisation avec un schéma (recommandé) :
 *   const hero = acfReader(options, HeroACF);
 *   hero.text('title')    // TypeScript autocomplete sur les clés du schéma
 *   hero.image('logo')    // retourne { url, alt } | null
 *
 * Utilisation directe (clé string) :
 *   acfText(acf, 'hero_title')
 *   acfImage(acf, 'hero_logo')
 */

// ─── Type guard ───────────────────────────────────────────────────────────

function isACFImage(v: unknown): v is { url: string; alt?: string } {
  return typeof v === "object" && v !== null && "url" in v;
}

// ─── Helpers bas-niveau (clé string) ─────────────────────────────────────

/** Lit un champ texte ACF. Retourne "" si absent ou non-string. */
export function acfText(acf: Record<string, unknown>, key: string): string {
  return typeof acf[key] === "string" ? (acf[key] as string) : "";
}

/**
 * Lit un champ image ACF.
 * - Objet ACF `{ url, alt? }` → retourne directement
 * - String URL → retourne `{ url, alt: "" }`
 * - Integer (ID d'attachment WP) → résout via `mediaMap` si fourni
 */
export function acfImage(
  acf: Record<string, unknown>,
  key: string,
  mediaMap?: Map<number, { url: string; alt: string }>
): { url: string; alt: string } | null {
  const v = acf[key];
  if (isACFImage(v)) return { url: v.url, alt: (v.alt as string) ?? "" };
  if (typeof v === "string" && v.startsWith("http")) return { url: v, alt: "" };
  if (typeof v === "number" && v > 0 && mediaMap) return mediaMap.get(v) ?? null;
  return null;
}

/** Lit un champ booléen ACF. */
export function acfBool(acf: Record<string, unknown>, key: string): boolean {
  return Boolean(acf[key]);
}

/** Lit un champ repeater ACF. Retourne [] si absent ou non-tableau. */
export function acfRepeater<T>(acf: Record<string, unknown>, key: string): T[] {
  return Array.isArray(acf[key]) ? (acf[key] as T[]) : [];
}

// ─── acfReader — accès typé via schéma ───────────────────────────────────

/**
 * Crée un lecteur ACF typé à partir d'un schéma.
 *
 * @example
 *   const hero = acfReader(options, HeroACF);
 *   const title = hero.text('title');   // keyof HeroACF → autocomplétion TS
 *   const logo  = hero.image('logo');
 */
export function acfReader<S extends Record<string, string>>(
  data: Record<string, unknown> | null | undefined,
  schema: S,
  mediaMap?: Map<number, { url: string; alt: string }>
) {
  const acf = data ?? {};
  return {
    text: (key: keyof S): string =>
      acfText(acf, schema[key as string]),

    image: (key: keyof S): { url: string; alt: string } | null =>
      acfImage(acf, schema[key as string], mediaMap),

    bool: (key: keyof S): boolean =>
      acfBool(acf, schema[key as string]),

    repeater: <T>(key: keyof S): T[] =>
      acfRepeater<T>(acf, schema[key as string]),

    raw: (key: keyof S): unknown =>
      acf[schema[key as string]],

    /** Essaie plusieurs clés du schéma dans l'ordre, retourne la première valeur non-vide. */
    first: (...keys: (keyof S)[]): string => {
      for (const key of keys) {
        const val = acfText(acf, schema[key as string]);
        if (val) return val;
      }
      return "";
    },
  };
}
