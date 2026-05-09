import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  getPosts,
  getPostBySlug,
  getPageBySlug,
  getACFOptions,
  getACFForPost,
  getCPT,
  getCategories,
  getTaxonomyTerms,
  getMediaByIds,
  getACFOptionsPage,
  graphqlFetch,
} from "../lib/wordpress";
import type {
  WPPost,
  WPPage,
  WPImage,
  ACFOptions,
  QueryParams,
  WPTaxonomyTerm,
  FetchState,
  UsePostsOptions,
  GlobalOptions,
  HeroOptions,
  SensoproOptions,
  CabinetOptions,
  Service,
  Therapeute,
  HeroStat,
  SensoproItem,
  CabinetAddress,
  SocialLinks,
} from "../types/wordpress";
import {
  GlobalACF,
  HeroACF,
  SensoproACF,
  CabinetACF,
  ServiceACF,
  TherapeuteACF,
} from "../config/acf-schemas";

// Re-export des types utiles
export type { WPPost, WPPage, ACFOptions, QueryParams, WPTaxonomyTerm, FetchState, UsePostsOptions };
export type { GlobalOptions, HeroOptions, SensoproOptions, CabinetOptions, Service, Therapeute };

// ─── Cache en mémoire ─────────────────────────────────────────────────────

const memoryCache = new Map<string, { data: unknown; updatedAt: number }>();
const DEFAULT_STALE_MS = 60_000;
const SESSION_STALE_MS = 30 * 60_000; // 30 min pour sessionStorage
const SESSION_PREFIX   = "wp:";

// ─── Sérialisation sessionStorage (gère les Maps) ─────────────────────────

function sessionWrite(key: string, data: unknown): void {
  try {
    const value = data instanceof Map
      ? { __map: true, entries: Array.from((data as Map<unknown, unknown>).entries()) }
      : data;
    sessionStorage.setItem(
      SESSION_PREFIX + key,
      JSON.stringify({ v: value, t: Date.now() })
    );
  } catch { /* quota exceeded ou private mode : on ignore */ }
}

function sessionRead<T>(key: string, staleMs = SESSION_STALE_MS): T | null {
  try {
    const raw = sessionStorage.getItem(SESSION_PREFIX + key);
    if (!raw) return null;
    const { v, t } = JSON.parse(raw) as { v: unknown; t: number };
    if (Date.now() - t > staleMs) return null;
    if (v && typeof v === "object" && (v as Record<string, unknown>).__map === true) {
      return new Map((v as { entries: [unknown, unknown][] }).entries) as unknown as T;
    }
    return v as T;
  } catch { return null; }
}

// ─── Hook interne useFetch ────────────────────────────────────────────────

function useFetch<T>(
  fetcher: () => Promise<T>,
  options: { cacheKey?: string; staleMs?: number; persist?: boolean; persistStaleMs?: number } = {}
) {
  const cacheKey       = options.cacheKey;
  const staleMs        = options.staleMs ?? DEFAULT_STALE_MS;
  const persist        = options.persist ?? false;
  const persistStaleMs = options.persistStaleMs;
  const fetcherRef = useRef(fetcher);

  useEffect(() => {
    fetcherRef.current = fetcher;
  }, [fetcher]);

  const initialCached = useMemo(() => {
    if (!cacheKey) return null;
    const mem = memoryCache.get(cacheKey);
    if (mem) return mem.data as T;
    if (persist) return sessionRead<T>(cacheKey, persistStaleMs);
    return null;
  }, [cacheKey, persist, persistStaleMs]);

  const [state, setState] = useState<FetchState<T>>({
    status:     initialCached ? "success" : "loading",
    data:       initialCached,
    error:      null,
    isFetching: !initialCached,
  });

  const load = useCallback(
    async (force = false) => {
      const now = Date.now();
      if (!force && cacheKey) {
        const cached = memoryCache.get(cacheKey);
        if (cached && now - cached.updatedAt < staleMs) {
          setState({ status: "success", data: cached.data as T, error: null, isFetching: false });
          return;
        }
      }

      setState((prev) => ({
        status:     prev.data ? "success" : "loading",
        data:       prev.data,
        error:      null,
        isFetching: true,
      }));

      try {
        const data = await fetcherRef.current();
        if (cacheKey) {
          memoryCache.set(cacheKey, { data, updatedAt: Date.now() });
          if (persist) sessionWrite(cacheKey, data);
        }
        setState({ status: "success", data, error: null, isFetching: false });
      } catch (e) {
        setState((prev) => ({
          status:     prev.data ? "success" : "error",
          data:       prev.data,
          error:      prev.data ? null : (e as Error).message,
          isFetching: false,
        }));
      }
    },
    [cacheKey, staleMs, persist]
  );

  useEffect(() => {
    void load();
  }, [load, cacheKey, staleMs]);

  return { ...state, refetch: () => load(true) };
}

// ─── Hooks publics — REST ─────────────────────────────────────────────────

export function usePosts(options: UsePostsOptions = {}) {
  const { enabled = true, ...params } = options;
  const [page, setPage] = useState(params.page ?? 1);

  const state = useFetch(
    () =>
      enabled
        ? getPosts({ ...params, page })
        : Promise.resolve({ posts: [], total: 0, totalPages: 0 }),
    { cacheKey: `posts:${JSON.stringify({ ...params, page, enabled })}`, persist: true }
  );

  return {
    ...state,
    posts:      state.data?.posts ?? [],
    total:      state.data?.total ?? 0,
    totalPages: state.data?.totalPages ?? 0,
    page,
    setPage,
  };
}

export function usePost(slug: string) {
  return useFetch<WPPost | null>(
    () => (slug ? getPostBySlug(slug) : Promise.resolve(null)),
    { cacheKey: `post:${slug}`, persist: true }
  );
}

export function usePage(slug: string) {
  return useFetch<WPPage | null>(
    () => (slug ? getPageBySlug(slug) : Promise.resolve(null)),
    { cacheKey: `page:${slug}`, persist: true }
  );
}

export function useACFOptions() {
  return useFetch<ACFOptions>(
    () => getACFOptions(),
    { cacheKey: "acf-options", staleMs: 120_000, persist: true }
  );
}

export function useACFPost(postId: number | null) {
  return useFetch<Record<string, unknown>>(
    () => (postId ? getACFForPost(postId) : Promise.resolve({})),
    { cacheKey: `acf-post:${postId ?? "none"}` }
  );
}

export function useCPT<T extends Record<string, unknown>>(
  cptSlug: string,
  params: QueryParams = {}
) {
  return useFetch<T[]>(
    () => (cptSlug ? getCPT<T>(cptSlug, params) : Promise.resolve([])),
    { cacheKey: `cpt:${cptSlug}:${JSON.stringify(params)}`, persist: true }
  );
}

export function useCategories() {
  return useFetch(() => getCategories(), { cacheKey: "categories", persist: true });
}

/**
 * Résout une liste d'IDs d'attachments WP en Map<id, { url, alt }>.
 * Fait un seul appel batch à /wp/v2/media.
 */
export function useMediaBatch(ids: number[]) {
  const key = [...ids].sort((a, b) => a - b).join(",");
  return useFetch<Map<number, { url: string; alt: string }>>(
    () => getMediaByIds(ids),
    { cacheKey: `media:${key}`, persist: true }
  );
}

export function useTaxonomyTerms(taxonomy: string, params: QueryParams = {}) {
  return useFetch<WPTaxonomyTerm[]>(
    () => (taxonomy ? getTaxonomyTerms(taxonomy, params) : Promise.resolve([])),
    { cacheKey: `taxonomy:${taxonomy}:${JSON.stringify(params)}`, persist: true }
  );
}

/**
 * Lit les champs ACF d'une Options Sub-Page enregistrée dans WP via
 * acf_add_options_sub_page(['menu_slug' => $slug]).
 * Endpoint : /wp-json/acf/v3/options/{slug}
 */
export function useACFOptionsPage(slug: string) {
  return useFetch<Record<string, unknown>>(
    () => (slug ? getACFOptionsPage(slug) : Promise.resolve({})),
    { cacheKey: `acf-options-page:${slug}`, staleMs: 120_000, persist: true }
  );
}

// ─── Prefetch ─────────────────────────────────────────────────────────────

/**
 * Pré-remplit le cache mémoire pour une liste d'entrées CPT + leurs médias.
 * À appeler en arrière-plan (fire & forget) quand la liste est chargée.
 * Les requêtes sont parallèles ; si une entrée est déjà en cache, on la skippe.
 */
export async function prefetchCPTItems(
  cptSlug: string,
  items: { slug: string; photoIds?: number[] }[]
): Promise<void> {
  await Promise.all(
    items.map(async ({ slug, photoIds = [] }) => {
      const entryKey = `cpt:${cptSlug}:${JSON.stringify({ slug, perPage: 1 })}`;
      const entryFetch = memoryCache.has(entryKey)
        ? Promise.resolve()
        : getCPT(cptSlug, { slug, perPage: 1 }).then((data) =>
            memoryCache.set(entryKey, { data, updatedAt: Date.now() })
          ).catch(() => {});

      const validIds = photoIds.filter((id) => id > 0);
      const mediaKey = `media:${[...validIds].sort((a, b) => a - b).join(",")}`;
      const mediaFetch = !validIds.length || memoryCache.has(mediaKey)
        ? Promise.resolve()
        : getMediaByIds(validIds).then((data) =>
            memoryCache.set(mediaKey, { data, updatedAt: Date.now() })
          ).catch(() => {});

      await Promise.all([entryFetch, mediaFetch]);
    })
  );
}

// ─── GraphQL — exemple documenté ──────────────────────────────────────────
//
// Le blueprint laisse `graphqlFetch` disponible (voir src/lib/wordpress.ts)
// pour les cas où REST n'expose pas un champ (connexions MediaItem, options
// pages typées, etc.). Ci-dessous, un hook d'exemple à dupliquer/adapter.
//
// Pour que ça fonctionne, vous devez :
//   1. Avoir activé WPGraphQL + WPGraphQL for ACF côté WordPress
//   2. Définir l'Options page correspondante dans WP (graphql_field_name)
//   3. Typer la réponse dans src/types/wordpress.ts

/**
 * Exemple : charge une Options page nommée `siteSettings` via GraphQL.
 * Adaptez la query selon votre schéma WPGraphQL.
 * Échoue silencieusement (retourne `{}`) si la query n'aboutit pas — pratique
 * pour ne pas casser l'app quand le champ n'est pas encore configuré côté WP.
 */
const GQL_SITE_SETTINGS = `
  query GetSiteSettings {
    siteSettings {
      settings {
        tagline
        announcement
      }
    }
  }
`;

export function useGraphQLSiteSettings<T = Record<string, unknown>>() {
  return useFetch<T>(
    () => graphqlFetch<T>(GQL_SITE_SETTINGS).catch(() => ({} as T)),
    { cacheKey: "gql-site-settings", staleMs: 120_000, persist: true }
  );
}

// ─── Domain hooks — Physio du Moléson ─────────────────────────────────────
//
// Hooks typés qui transforment les réponses brutes WP/ACF en objets métier.
// Les composants consomment des `Therapeute[]`, `HeroOptions`, etc. — pas
// du `Record<string, unknown>` brut. Voir doc/wordpress-setup.md pour la
// configuration ACF requise côté WordPress.

import { acfReader } from "../components/acf";

/** Convertit une valeur brute (ACF image array | URL string) vers WPImage. */
function toImage(raw: unknown): WPImage | null {
  if (raw && typeof raw === "object" && "url" in raw) {
    const o = raw as Record<string, unknown>;
    return {
      id:     typeof o.ID === "number" ? o.ID : (typeof o.id === "number" ? o.id : 0),
      url:    String(o.url),
      alt:    typeof o.alt === "string" ? o.alt : "",
      width:  typeof o.width === "number" ? o.width : 0,
      height: typeof o.height === "number" ? o.height : 0,
    };
  }
  if (typeof raw === "string" && raw.startsWith("http")) {
    return { id: 0, url: raw, alt: "", width: 0, height: 0 };
  }
  return null;
}

/** Convertit une galerie ACF (array d'images) vers WPImage[]. */
function toGallery(raw: unknown): WPImage[] {
  if (!Array.isArray(raw)) return [];
  return raw.map(toImage).filter((i): i is WPImage => i !== null);
}

/** Lit un repeater {label} et retourne le tableau de labels. */
function toLabelList(items: { label?: string }[]): string[] {
  return items.map((i) => i.label ?? "").filter(Boolean);
}

// ─── Options pages ────────────────────────────────────────────────────────

function parseGlobal(raw: Record<string, unknown> | null): GlobalOptions | null {
  if (!raw) return null;
  const r = acfReader(raw, GlobalACF);
  const addressesRaw = r.repeater<{ label?: string; street?: string; postcode?: string; city?: string }>("addresses");
  const social = (raw[GlobalACF.social] ?? {}) as Record<string, string>;

  return {
    logo:      toImage(raw[GlobalACF.logo]),
    phone:     r.text("phone"),
    email:     r.text("email"),
    addresses: addressesRaw.map((a, i): CabinetAddress => ({
      id:       i,
      label:    a.label ?? "",
      street:   a.street ?? "",
      postcode: a.postcode ?? "",
      city:     a.city ?? "",
    })),
    social: {
      instagram: social.instagram || undefined,
      facebook:  social.facebook  || undefined,
      linkedin:  social.linkedin  || undefined,
      youtube:   social.youtube   || undefined,
    } as SocialLinks,
  };
}

function parseHero(raw: Record<string, unknown> | null): HeroOptions | null {
  if (!raw) return null;
  const r = acfReader(raw, HeroACF);
  return {
    eyebrow:        r.text("eyebrow"),
    titlePart1:     r.text("titlePart1"),
    titleEmphasis:  r.text("titleEmphasis"),
    titlePart2:     r.text("titlePart2"),
    subtitle:       r.text("subtitle"),
    ctaPrimary:     { label: r.text("ctaPrimary"),   url: r.text("ctaPrimaryUrl") },
    ctaSecondary:   { label: r.text("ctaSecondary"), url: r.text("ctaSecondaryUrl") },
    stats:          r.repeater<HeroStat>("stats"),
    imageMain:      toImage(raw[HeroACF.imageMain]),
    imageSecondary: toImage(raw[HeroACF.imageSecondary]),
  };
}

function parseSensopro(raw: Record<string, unknown> | null): SensoproOptions | null {
  if (!raw) return null;
  const r = acfReader(raw, SensoproACF);
  return {
    eyebrow:           r.text("eyebrow"),
    title:             r.text("title"),
    intro:             r.text("intro"),
    image:             toImage(raw[SensoproACF.image]),
    benefits:          r.repeater<SensoproItem>("benefits"),
    steps:             r.repeater<SensoproItem>("steps"),
    firstSessionTitle: r.text("firstSessionTitle"),
    firstSessionText:  r.text("firstSessionText"),
  };
}

function parseCabinet(raw: Record<string, unknown> | null): CabinetOptions | null {
  if (!raw) return null;
  const r = acfReader(raw, CabinetACF);
  return {
    eyebrow:  r.text("eyebrow"),
    title:    r.text("title"),
    intro:    r.text("intro"),
    tag66:    r.text("tag66"),
    images66: toGallery(raw[CabinetACF.images66]),
    tag68:    r.text("tag68"),
    images68: toGallery(raw[CabinetACF.images68]),
  };
}

export function useGlobalOptions() {
  const state = useACFOptionsPage("global");
  const data  = useMemo(() => parseGlobal(state.data), [state.data]);
  return { ...state, data };
}

export function useHeroOptions() {
  const state = useACFOptionsPage("hero");
  const data  = useMemo(() => parseHero(state.data), [state.data]);
  return { ...state, data };
}

export function useSensoproOptions() {
  const state = useACFOptionsPage("sensopro");
  const data  = useMemo(() => parseSensopro(state.data), [state.data]);
  return { ...state, data };
}

export function useCabinetOptions() {
  const state = useACFOptionsPage("cabinet");
  const data  = useMemo(() => parseCabinet(state.data), [state.data]);
  return { ...state, data };
}

// ─── Custom Post Types — service & therapeute ────────────────────────────

/** Forme brute d'un post WP avec ACF inline (REST, plugin "ACF to REST API"). */
type RawCPT = {
  id:    number;
  slug:  string;
  title: { rendered: string };
  acf?:  Record<string, unknown>;
};

function parseService(raw: RawCPT): Service {
  const acf = raw.acf ?? {};
  const r   = acfReader(acf, ServiceACF);
  const tags = r.repeater<{ label?: string }>("tags");
  return {
    id:          raw.id,
    slug:        raw.slug,
    title:       raw.title?.rendered ?? "",
    num:         r.text("num"),
    short:       r.text("short"),
    description: r.text("description"),
    tags:        toLabelList(tags),
    image:       toImage(acf[ServiceACF.image]),
  };
}

function parseTherapeute(raw: RawCPT): Therapeute {
  const acf = raw.acf ?? {};
  const r   = acfReader(acf, TherapeuteACF);
  const certifs = r.repeater<{ label?: string }>("certifs");
  const specs   = r.repeater<{ spec?: string }>("specs");
  const sinceRaw = acf[TherapeuteACF.since];
  return {
    id:          raw.id,
    slug:        raw.slug,
    name:        raw.title?.rendered ?? "",
    role:        r.text("role"),
    since:       typeof sinceRaw === "number" ? sinceRaw
               : typeof sinceRaw === "string" && sinceRaw ? Number(sinceRaw)
               : null,
    certifs:     toLabelList(certifs),
    bio:         r.text("bio"),
    bioShort:    r.text("bioShort"),
    extras:      r.text("extras"),
    photo:       toImage(acf[TherapeuteACF.photo]),
    tbookingUrl: r.text("tbookingUrl"),
    specs:       specs.map((s) => s.spec ?? "").filter(Boolean),
  };
}

/** Liste des services, ordonnés par menu_order côté WP. */
export function useServices() {
  const state = useCPT<RawCPT>("service", { perPage: 50, orderby: "menu_order", order: "asc" });
  const services = useMemo(
    () => (state.data ?? []).map(parseService),
    [state.data]
  );
  return { ...state, services };
}

/** Liste des thérapeutes, ordonnés par menu_order côté WP. */
export function useTherapeutes() {
  const state = useCPT<RawCPT>("therapeute", { perPage: 50, orderby: "menu_order", order: "asc" });
  const therapeutes = useMemo(
    () => (state.data ?? []).map(parseTherapeute),
    [state.data]
  );
  return { ...state, therapeutes };
}
