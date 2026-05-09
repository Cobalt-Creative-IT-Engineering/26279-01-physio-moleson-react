import type {
  WPImage,
  WPTerm,
  WPTaxonomyTerm,
  WPPost,
  WPPage,
  WPMenuItem,
  QueryParams,
  ACFOptions,
} from "../types/wordpress";

// Re-export des types pour les imports legacy depuis ce module
export type {
  WPImage,
  WPTerm,
  WPTaxonomyTerm,
  WPPost,
  WPPage,
  WPMenuItem,
  QueryParams,
  ACFOptions,
};

// ─── URLs de base ─────────────────────────────────────────────────────────

const RAW_WP_URL = (import.meta.env.VITE_WP_URL ?? "https://votre-wordpress.com").replace(/\/+$/, "");

/**
 * En dev : "" (les requêtes /wp-json sont proxiées par Vite vers VITE_WP_URL).
 * En prod : l'URL complète du site WordPress.
 */
export const WP_BASE_URL = import.meta.env.DEV ? "" : RAW_WP_URL;

const API          = `${WP_BASE_URL}/wp-json/wp/v2`;
const ACF_API      = `${WP_BASE_URL}/wp-json/acf/v3`;
const GRAPHQL_URL  = import.meta.env.DEV ? "/graphql" : `${RAW_WP_URL}/graphql`;

// ─── Helpers internes ─────────────────────────────────────────────────────

function buildParams(params: QueryParams): URLSearchParams {
  const p = new URLSearchParams();
  if (params.page)               p.set("page",       String(params.page));
  if (params.perPage)            p.set("per_page",   String(params.perPage));
  if (params.search)             p.set("search",     params.search);
  if (params.categories?.length) p.set("categories", params.categories.join(","));
  if (params.tags?.length)       p.set("tags",       params.tags.join(","));
  if (params.slug)               p.set("slug",       params.slug);
  if (params.orderby)            p.set("orderby",    params.orderby);
  if (params.order)              p.set("order",      params.order);
  if (params.status)             p.set("status",     params.status);
  if (params.embed !== false)    p.set("_embed",     "1");
  if (params.include?.length)    p.set("include",    params.include.join(","));
  if (params.taxonomies) {
    for (const [tax, val] of Object.entries(params.taxonomies)) {
      p.set(tax, Array.isArray(val) ? val.join(",") : String(val));
    }
  }
  return p;
}

function parseImage(raw: Record<string, any>): WPImage | null {
  const img = raw?._embedded?.["wp:featuredmedia"]?.[0] ?? raw?._embedded?.["wp:featuredmedia"];
  if (!img) return null;
  return {
    id:     img.id,
    url:    img.source_url ?? img.guid?.rendered ?? "",
    alt:    img.alt_text ?? "",
    width:  img.media_details?.width ?? 0,
    height: img.media_details?.height ?? 0,
  };
}

function parseTerms(raw: Record<string, any>, taxonomy: string): WPTerm[] {
  const terms = raw?._embedded?.["wp:term"] ?? [];
  const group = terms.find((t: Record<string, unknown>[]) => t?.[0]?.taxonomy === taxonomy);
  return (group ?? []).map((t: Record<string, unknown>) => ({
    id:   t.id as number,
    name: t.name as string,
    slug: t.slug as string,
  }));
}

function parsePost(raw: Record<string, any>): WPPost {
  return {
    id:            raw.id,
    slug:          raw.slug,
    title:         raw.title?.rendered ?? "",
    excerpt:       raw.excerpt?.rendered ?? "",
    content:       raw.content?.rendered ?? "",
    date:          raw.date,
    modified:      raw.modified,
    featuredImage: parseImage(raw),
    categories:    parseTerms(raw, "category"),
    tags:          parseTerms(raw, "post_tag"),
    acf:           raw.acf ?? {},
  };
}

function parsePage(raw: Record<string, any>): WPPage {
  return {
    id:      raw.id,
    slug:    raw.slug,
    title:   raw.title?.rendered ?? "",
    content: raw.content?.rendered ?? "",
    acf:     raw.acf ?? {},
  };
}

async function fetcher<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`WP API error ${res.status} – ${url}`);
  return res.json();
}

export async function graphqlFetch<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
  const res = await fetch(GRAPHQL_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) throw new Error(`GraphQL error ${res.status}`);
  const json = await res.json() as { data?: T; errors?: Array<{ message: string }> };
  if (import.meta.env.DEV) {
    console.debug("[GraphQL] response:", JSON.stringify(json, null, 2));
  }
  if (json.errors?.length) throw new Error(json.errors[0].message);
  return json.data as T;
}

// ─── Posts ────────────────────────────────────────────────────────────────

export async function getPosts(params: QueryParams = {}): Promise<{
  posts: WPPost[];
  total: number;
  totalPages: number;
}> {
  const url = `${API}/posts?${buildParams(params).toString()}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`WP API ${res.status}`);
  const total      = Number(res.headers.get("X-WP-Total") ?? 0);
  const totalPages = Number(res.headers.get("X-WP-TotalPages") ?? 0);
  const data       = (await res.json()) as Record<string, any>[];
  return { posts: data.map(parsePost), total, totalPages };
}

export async function getPostBySlug(slug: string): Promise<WPPost | null> {
  const { posts } = await getPosts({ slug, perPage: 1 });
  return posts[0] ?? null;
}

export async function getPostById(id: number): Promise<WPPost> {
  const raw = await fetcher<Record<string, any>>(`${API}/posts/${id}?_embed=1`);
  return parsePost(raw);
}

// ─── Pages ────────────────────────────────────────────────────────────────

export async function getPages(params: QueryParams = {}): Promise<WPPage[]> {
  const raw = await fetcher<Record<string, any>[]>(`${API}/pages?${buildParams(params).toString()}`);
  return raw.map(parsePage);
}

export async function getPageBySlug(slug: string): Promise<WPPage | null> {
  const pages = await getPages({ slug, perPage: 1 });
  return pages[0] ?? null;
}

// ─── Custom Post Types ────────────────────────────────────────────────────

export async function getCPT<T extends Record<string, unknown>>(
  cptSlug: string,
  params: QueryParams = {}
): Promise<T[]> {
  return fetcher<T[]>(`${API}/${cptSlug}?${buildParams(params).toString()}`);
}

// ─── ACF ──────────────────────────────────────────────────────────────────

export async function getACFOptions(): Promise<ACFOptions> {
  const raw = await fetcher<Record<string, unknown>>(`${ACF_API}/options/options`);
  return normalizeACFResponse(raw) as ACFOptions;
}

/**
 * Récupère les champs ACF d'une Options Sub-Page enregistrée via ACF.
 * Endpoint : /wp-json/acf/v3/options/{slug}
 *
 * Normalise la réponse : ACF v3 retourne parfois { id, acf: { fields } }
 * et parfois directement { fields }.
 */
export async function getACFOptionsPage(slug: string): Promise<Record<string, unknown>> {
  const raw = await fetcher<Record<string, unknown>>(`${ACF_API}/options/${slug}`);
  if (import.meta.env.DEV) {
    console.debug(`[ACF options/${slug}] raw response:`, raw);
  }
  return normalizeACFResponse(raw);
}

/** Extrait les champs depuis { id, acf: { ... } } ou { champs... } */
function normalizeACFResponse(raw: Record<string, unknown>): Record<string, unknown> {
  const inner = raw?.acf;
  if (inner && typeof inner === "object" && !Array.isArray(inner)) {
    return inner as Record<string, unknown>;
  }
  return raw;
}

export async function getACFForPost(postId: number): Promise<Record<string, unknown>> {
  return fetcher<Record<string, unknown>>(`${ACF_API}/posts/${postId}`);
}

export async function getACFForPage(pageId: number): Promise<Record<string, unknown>> {
  return fetcher<Record<string, unknown>>(`${ACF_API}/pages/${pageId}`);
}

export async function getACFForCPT(cptSlug: string, postId: number): Promise<Record<string, unknown>> {
  return fetcher<Record<string, unknown>>(`${ACF_API}/${cptSlug}/${postId}`);
}

// ─── Taxonomies ───────────────────────────────────────────────────────────

export async function getCategories(): Promise<WPTerm[]> {
  return fetcher<WPTerm[]>(`${API}/categories?per_page=100`);
}

export async function getTags(): Promise<WPTerm[]> {
  return fetcher<WPTerm[]>(`${API}/tags?per_page=100`);
}

export async function getTaxonomyTerms(
  taxonomy: string,
  params: QueryParams = {}
): Promise<WPTaxonomyTerm[]> {
  return fetcher<WPTaxonomyTerm[]>(
    `${API}/${taxonomy}?${buildParams({ perPage: 100, ...params }).toString()}`
  );
}

// ─── Media ────────────────────────────────────────────────────────────────

/**
 * Résout une liste d'IDs d'attachments WP en une Map id → { url, alt }.
 * Utilisé pour afficher les images ACF qui retournent un integer via REST.
 */
export async function getMediaByIds(
  ids: number[]
): Promise<Map<number, { url: string; alt: string }>> {
  if (!ids.length) return new Map();
  const raw = await fetcher<Array<{ id: number; source_url: string; alt_text?: string }>>(
    `${API}/media?include=${ids.join(",")}&per_page=${ids.length}`
  );
  return new Map(raw.map((m) => [m.id, { url: m.source_url, alt: m.alt_text ?? "" }]));
}

// ─── Menus (plugin WP REST Menu requis) ──────────────────────────────────

export async function getMenu(menuSlug: string): Promise<WPMenuItem[]> {
  const raw = await fetcher<{ items: WPMenuItem[] }>(
    `${WP_BASE_URL}/wp-json/menus/v1/menus/${menuSlug}`
  );
  return raw?.items ?? [];
}
