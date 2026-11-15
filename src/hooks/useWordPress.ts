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
  lienInterne,
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
  AccueilOptions,
  CTA,
  PagePrestations,
  FaqOptions,
  FaqItem,
  CabinetOptions,
  Therapeute,
  CabinetAddress,
  SocialLinks,
} from "../types/wordpress";

// Re-export des types utiles
export type { WPPost, WPPage, ACFOptions, QueryParams, WPTaxonomyTerm, FetchState, UsePostsOptions };
export type { GlobalOptions, AccueilOptions, PagePrestations, FaqOptions, CabinetOptions, Therapeute };

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

// ─── Global via WPGraphQL (ACF Options Page `optGlobale`) ─────────────────

const GQL_GLOBAL = `
  query Global {
    optGlobale {
      optionsGlobale {
        telephone
        email
        resume
        logo { node { sourceUrl altText databaseId mediaDetails { width height } } }
        adresses { lieu adresse npa ville }
        reseauxSociaux { facebook instagram linkedin whatsapp }
      }
    }
  }
`;

type GQLGlobalResponse = {
  optGlobale: {
    optionsGlobale: {
      telephone: string | null;
      email: string | null;
      resume: string | null;
      logo: GQLMediaEdge;
      adresses: { lieu: string | null; adresse: string | null; npa: string | null; ville: string | null }[] | null;
      reseauxSociaux: { facebook: string | null; instagram: string | null; linkedin: string | null; whatsapp: string | null } | null;
    } | null;
  } | null;
};

function fromGQLGlobal(d: GQLGlobalResponse | null): GlobalOptions | null {
  const g = d?.optGlobale?.optionsGlobale;
  if (!g) return null;
  return {
    logo:  fromGQLMedia(g.logo ?? null),
    resume: g.resume?.trim() ?? "",
    phone: g.telephone ?? "",
    email: g.email ?? "",
    addresses: (g.adresses ?? []).map((a, i): CabinetAddress => ({
      id:       i,
      label:    a.lieu ?? "",
      street:   a.adresse ?? "",
      postcode: a.npa ?? "",
      city:     a.ville ?? "",
    })),
    social: {
      instagram: g.reseauxSociaux?.instagram || undefined,
      facebook:  g.reseauxSociaux?.facebook  || undefined,
      linkedin:  g.reseauxSociaux?.linkedin  || undefined,
      whatsapp:  g.reseauxSociaux?.whatsapp  || undefined,
    } as SocialLinks,
  };
}

// ─── Accueil via WPGraphQL (ACF Options Page `accueil`) ───────────────────

// Champs suffixés `*Accueil` côté WP (anti-collision entre Options pages).
// Groupes ACF de la page d'options « Accueil » : banner, slogan, valeurs
// (valeur1 → valeur4), plus une image de section.
const GQL_ACCUEIL = `
  fragment ImgAccueil on AcfMediaItemConnectionEdge {
    node { sourceUrl altText databaseId mediaDetails { width height } }
  }
  query Accueil {
    accueil {
      accueils {
        banner {
          titre
          sousTitre
          description
          bouton1 { texteBouton urlBouton }
          bouton2 { texteBouton urlBouton }
          video { node { mediaItemUrl } }
        }
        slogan {
          titre
          description
          bouton { boutonTexte urlBouton }
        }
        imageSection1 { ...ImgAccueil }
        valeurs {
          imageDeFond { ...ImgAccueil }
          valeur1 { titre description image { ...ImgAccueil } }
          valeur2 { titre description image { ...ImgAccueil } }
          valeur3 { titre description image { ...ImgAccueil } }
          valeur4 { titre description image { ...ImgAccueil } }
        }
      }
    }
  }
`;

type GQLValeurAccueil = { titre: string | null; description: string | null; image: GQLMediaEdge } | null;

type GQLAccueilResponse = {
  accueil: {
    accueils: {
      banner: {
        titre: string | null;
        sousTitre: string | null;
        description: string | null;
        bouton1: { texteBouton: string | null; urlBouton: string | null } | null;
        bouton2: { texteBouton: string | null; urlBouton: string | null } | null;
        video: { node: { mediaItemUrl: string | null } } | null;
      } | null;
      slogan: {
        titre: string | null;
        description: string | null;
        bouton: { boutonTexte: string | null; urlBouton: string | null } | null;
      } | null;
      imageSection1: GQLMediaEdge;
      valeurs: {
        imageDeFond: GQLMediaEdge;
        valeur1: GQLValeurAccueil;
        valeur2: GQLValeurAccueil;
        valeur3: GQLValeurAccueil;
        valeur4: GQLValeurAccueil;
      } | null;
    } | null;
  } | null;
};

function fromGQLAccueil(d: GQLAccueilResponse | null): AccueilOptions | null {
  const a = d?.accueil?.accueils;
  if (!a) return null;
  const cta = (label: string | null | undefined, url: string | null | undefined): CTA => ({
    label: label ?? "",
    url:   url ? lienInterne(url) : "",
  });
  const v = a.valeurs;
  return {
    heros: {
      titre:       a.banner?.titre ?? "",
      sousTitre:   a.banner?.sousTitre ?? "",
      description: a.banner?.description ?? "",
      cta1:        cta(a.banner?.bouton1?.texteBouton, a.banner?.bouton1?.urlBouton),
      cta2:        cta(a.banner?.bouton2?.texteBouton, a.banner?.bouton2?.urlBouton),
      video:       a.banner?.video?.node?.mediaItemUrl ?? null,
    },
    slogan: {
      titre:       a.slogan?.titre ?? "",
      description: a.slogan?.description ?? "",
      cta:         cta(a.slogan?.bouton?.boutonTexte, a.slogan?.bouton?.urlBouton),
    },
    imageSection1: fromGQLMedia(a.imageSection1 ?? null),
    valeurs: {
      fond:  fromGQLMedia(v?.imageDeFond ?? null),
      items: [v?.valeur1, v?.valeur2, v?.valeur3, v?.valeur4].map((x) => ({
        titre:       x?.titre ?? "",
        description: x?.description ?? "",
        image:       fromGQLMedia(x?.image ?? null),
      })),
    },
  };
}

// ─── Page Prestations via WPGraphQL (ACF Options Page `prestationPage`) ──
// Un seul groupe `prestations` (type Prestations) : bannière, répéteur des
// prestations (pictogramme SVG fixe + animé) et sous-groupe Sensopro.
// `mediaItemUrl` plutôt que `sourceUrl`, vide pour les fichiers non photo.
const GQL_PAGE_PRESTATIONS = `
  query PagePrestations {
    prestationPage {
      prestations {
        banner { titre sousTitre description video { node { mediaItemUrl } } }
        prestations {
          titre
          description
          iconeFixe { node { mediaItemUrl } }
          iconeEnMouvement { node { mediaItemUrl } }
        }
        sensopro {
          titre sousTitre description bouton { texte url }
          gallerie { nodes { sourceUrl altText databaseId mediaDetails { width height } } }
        }
      }
    }
  }
`;

type GQLFichier = { node: { mediaItemUrl: string | null } } | null;

type GQLPagePrestationsResponse = {
  prestationPage: {
    prestations: {
      banner: {
        titre: string | null;
        sousTitre: string | null;
        description: string | null;
        video: GQLFichier;
      } | null;
      prestations: {
        titre: string | null;
        description: string | null;
        iconeFixe: GQLFichier;
        iconeEnMouvement: GQLFichier;
      }[] | null;
      sensopro: {
        titre: string | null;
        sousTitre: string | null;
        description: string | null;
        bouton: { texte: string | null; url: string | null } | null;
        gallerie: { nodes: GQLMediaNode[] } | null;
      } | null;
    } | null;
  } | null;
};

function fromGQLPagePrestations(d: GQLPagePrestationsResponse | null): PagePrestations | null {
  const g = d?.prestationPage?.prestations;
  if (!g) return null;
  return {
    banner: {
      titre:       g.banner?.titre ?? "",
      sousTitre:   g.banner?.sousTitre ?? "",
      description: g.banner?.description ?? "",
      video:       g.banner?.video?.node?.mediaItemUrl ?? null,
    },
    // Une ligne de répéteur sans titre n'a rien à afficher.
    prestations: (g.prestations ?? [])
      .filter((p) => p.titre?.trim())
      .map((p) => ({
        titre:       p.titre!.trim(),
        description: p.description ?? "",
        icone: {
          fixe:      p.iconeFixe?.node?.mediaItemUrl ?? null,
          mouvement: p.iconeEnMouvement?.node?.mediaItemUrl ?? null,
        },
      })),
    sensopro: {
      titre:       g.sensopro?.titre ?? "",
      sousTitre:   g.sensopro?.sousTitre ?? "",
      description: g.sensopro?.description ?? "",
      bouton: {
        label: g.sensopro?.bouton?.texte ?? "",
        url:   g.sensopro?.bouton?.url ? lienInterne(g.sensopro.bouton.url) : "",
      },
      galerie: (g.sensopro?.gallerie?.nodes ?? []).map(mediaNodeToImage).filter((i): i is WPImage => !!i),
    },
  };
}

// ─── FAQ via WPGraphQL (type de publication `faqQuestion`) ────────────────
// Une entrée par question ; groupe ACF `faq` : question, réponse (WYSIWYG)
// et catégorie(s) (choix multiple). Ordre : champ « Ordre » de WP, puis date
// de création.
const GQL_FAQ = `
  query Faq {
    faqQuestions(first: 100, where: { orderby: [{ field: MENU_ORDER, order: ASC }, { field: DATE, order: ASC }] }) {
      nodes {
        databaseId
        title
        faq { question reponse categorie }
      }
    }
  }
`;

type GQLFaqResponse = {
  faqQuestions: {
    nodes: {
      databaseId: number;
      title: string | null;
      faq: { question: string | null; reponse: string | null; categorie: string[] | null } | null;
    }[];
  } | null;
};

function fromGQLFaq(d: GQLFaqResponse | null): FaqOptions | null {
  const nodes = d?.faqQuestions?.nodes;
  if (!nodes) return null;
  // Regroupement par catégorie, dans l'ordre de première apparition. Une
  // question cochée dans plusieurs catégories figure dans chacune ; sans
  // catégorie, elle rejoint « Questions générales ».
  const groupes = new Map<string, FaqItem[]>();
  for (const n of nodes) {
    const question = n.faq?.question?.trim() || n.title?.trim() || "";
    if (!question) continue;
    const item: FaqItem = { question, answer: n.faq?.reponse ?? "" };
    const cats = (n.faq?.categorie ?? []).map((c) => c.trim()).filter(Boolean);
    for (const cat of cats.length ? cats : ["Questions générales"]) {
      if (!groupes.has(cat)) groupes.set(cat, []);
      groupes.get(cat)!.push(item);
    }
  }
  return { themes: [...groupes].map(([title, items]) => ({ title, items })) };
}

// ─── Cabinet via WPGraphQL (ACF Options Page `pageCabinet`) ───────────────
// Groupe `cabinet` (type Cabinet) : bannière et répéteur `cabinet`, une ligne
// par cabinet (titre, détails : tag, galerie, planning jour → thérapeute(s)),
// plus une image de section affichée entre les cabinets.
const GQL_CABINET = `
  query Cabinet {
    pageCabinet {
      cabinet {
        banner { titre sousTitre description video { node { mediaItemUrl } } }
        imageSection { node { sourceUrl altText databaseId mediaDetails { width height } } }
        cabinet {
          titre
          details {
            tag
            gallerie { nodes { sourceUrl altText databaseId mediaDetails { width height } } }
            planning { jour therapeute }
          }
        }
      }
    }
  }
`;

type GQLPlanningRow = { jour: string | null; therapeute: string | null };

type GQLCabinetResponse = {
  pageCabinet: {
    cabinet: {
      banner: {
        titre: string | null;
        sousTitre: string | null;
        description: string | null;
        video: { node: { mediaItemUrl: string | null } } | null;
      } | null;
      imageSection: GQLMediaEdge;
      cabinet: {
        titre: string | null;
        details: { tag: string | null; gallerie: GQLMediaConnection; planning: GQLPlanningRow[] | null } | null;
      }[] | null;
    } | null;
  } | null;
};

/** Découpe "Mégane, Noël" (ou séparé par ·) en ["Mégane", "Noël"]. */
function toSchedule(rows: GQLPlanningRow[] | null) {
  return (rows ?? [])
    .map((r) => ({
      day:   r.jour?.trim() ?? "",
      names: (r.therapeute ?? "")
               .split(/[,·]/)
               .map((s) => s.trim())
               .filter(Boolean),
    }))
    .filter((r) => r.day);
}

function fromGQLCabinet(d: GQLCabinetResponse | null): CabinetOptions | null {
  const c = d?.pageCabinet?.cabinet;
  if (!c) return null;
  return {
    banner: {
      titre:       c.banner?.titre ?? "",
      sousTitre:   c.banner?.sousTitre ?? "",
      description: c.banner?.description ?? "",
      video:       c.banner?.video?.node?.mediaItemUrl ?? null,
    },
    imageSection: fromGQLMedia(c.imageSection ?? null),
    // Une ligne de répéteur sans titre n'a rien à afficher.
    cabinets: (c.cabinet ?? [])
      .filter((x) => x.titre?.trim())
      .map((x) => ({
        titre:       x.titre!.trim(),
        tag:         x.details?.tag ?? "",
        images:      fromGQLGallery(x.details?.gallerie ?? null),
        schedule:    toSchedule(x.details?.planning ?? null),
      })),
  };
}

export function useGlobalOptions() {
  const state = useFetch<GQLGlobalResponse>(
    () => graphqlFetch<GQLGlobalResponse>(GQL_GLOBAL),
    { cacheKey: "gql-global", staleMs: 120_000, persist: true }
  );
  const data = useMemo(() => fromGQLGlobal(state.data), [state.data]);
  return { ...state, data };
}

export function useAccueilOptions() {
  const state = useFetch<GQLAccueilResponse>(
    () => graphqlFetch<GQLAccueilResponse>(GQL_ACCUEIL),
    { cacheKey: "gql-accueil", staleMs: 120_000, persist: true }
  );
  const data = useMemo(() => fromGQLAccueil(state.data), [state.data]);
  return { ...state, data };
}

export function usePagePrestations() {
  const state = useFetch<GQLPagePrestationsResponse>(
    () => graphqlFetch<GQLPagePrestationsResponse>(GQL_PAGE_PRESTATIONS),
    { cacheKey: "gql-page-prestations", staleMs: 120_000, persist: true }
  );
  const data = useMemo(() => fromGQLPagePrestations(state.data), [state.data]);
  return { ...state, data };
}

export function useFaqOptions() {
  const state = useFetch<GQLFaqResponse>(
    () => graphqlFetch<GQLFaqResponse>(GQL_FAQ),
    { cacheKey: "gql-faq", staleMs: 120_000, persist: true }
  );
  const data = useMemo(() => fromGQLFaq(state.data), [state.data]);
  return { ...state, data };
}

export function useCabinetOptions() {
  const state = useFetch<GQLCabinetResponse>(
    () => graphqlFetch<GQLCabinetResponse>(GQL_CABINET),
    { cacheKey: "gql-cabinet", staleMs: 120_000, persist: true }
  );
  const data = useMemo(() => fromGQLCabinet(state.data), [state.data]);
  return { ...state, data };
}

// ─── CPT via WPGraphQL — therapeute ─────────────────────────────────────

/** Nœud média WPGraphQL (MediaItem). */
type GQLMediaNode = {
  sourceUrl: string;
  altText: string | null;
  databaseId: number;
  mediaDetails: { width: number | null; height: number | null } | null;
};

function mediaNodeToImage(n: GQLMediaNode | null | undefined): WPImage | null {
  if (!n) return null;
  return {
    id:     n.databaseId,
    url:    n.sourceUrl,
    alt:    n.altText ?? "",
    width:  n.mediaDetails?.width ?? 0,
    height: n.mediaDetails?.height ?? 0,
  };
}

/** Edge image unique ACF (`field { node { … } }`). */
type GQLMediaEdge = { node: GQLMediaNode } | null;
function fromGQLMedia(edge: GQLMediaEdge): WPImage | null {
  return mediaNodeToImage(edge?.node ?? null);
}

/** Galerie ACF (`field { nodes [ … ] }`) → WPImage[]. */
type GQLMediaConnection = { nodes: GQLMediaNode[] } | null;
function fromGQLGallery(conn: GQLMediaConnection): WPImage[] {
  return (conn?.nodes ?? []).map(mediaNodeToImage).filter((i): i is WPImage => i !== null);
}

// ─── Thérapeutes via WPGraphQL ────────────────────────────────────────────
// CPT exposé par WPGraphQL ; champs ACF via WPGraphQL for ACF (groupe
// `therapeutes`, noms camelCase auto-générés depuis les slugs ACF).

const GQL_THERAPEUTES = `
  query Therapeutes {
    therapeutes(first: 50, where: { orderby: { field: MENU_ORDER, order: ASC } }) {
      nodes {
        databaseId
        slug
        title
        therapeutes {
          role
          debutDactivite
          biographie
          biographieCourt
          specialites
          urlTbooking
          certifications { designation }
          photo { node { sourceUrl altText databaseId mediaDetails { width height } } }
        }
      }
    }
  }
`;

type GQLTherapeuteNode = {
  databaseId: number;
  slug: string;
  title: string | null;
  therapeutes: {
    role: string | null;
    debutDactivite: number | null;
    biographie: string | null;
    biographieCourt: string | null;
    specialites: string | null;
    urlTbooking: string | null;
    certifications: { designation: string | null }[] | null;
    photo: GQLMediaEdge;
  } | null;
};

type GQLTherapeutesResponse = { therapeutes: { nodes: GQLTherapeuteNode[] } };

function fromGQLTherapeute(n: GQLTherapeuteNode): Therapeute {
  const a = n.therapeutes;
  return {
    id:          n.databaseId,
    slug:        n.slug,
    name:        n.title ?? "",
    role:        a?.role ?? "",
    since:       typeof a?.debutDactivite === "number" ? a.debutDactivite : null,
    certifs:     (a?.certifications ?? [])
                   .map((c) => c?.designation ?? "")
                   .filter(Boolean),
    bio:         a?.biographie ?? "",
    bioShort:    a?.biographieCourt ?? "",
    extras:      a?.specialites ?? "",
    photo:       fromGQLMedia(a?.photo ?? null),
    tbookingUrl: a?.urlTbooking ?? "",
  };
}

/** Liste des thérapeutes via WPGraphQL, ordonnés par menu_order côté WP. */
export function useTherapeutes() {
  const state = useFetch<GQLTherapeutesResponse>(
    () => graphqlFetch<GQLTherapeutesResponse>(GQL_THERAPEUTES),
    { cacheKey: "gql-therapeutes", staleMs: 120_000, persist: true }
  );
  const therapeutes = useMemo(
    () => (state.data?.therapeutes?.nodes ?? []).map(fromGQLTherapeute),
    [state.data]
  );
  return { ...state, therapeutes };
}
