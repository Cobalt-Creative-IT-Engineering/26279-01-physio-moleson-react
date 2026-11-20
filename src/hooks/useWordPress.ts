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
  PageEquipe,
  PageFaq,
  FaqOptions,
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
/**
 * Cache durable (localStorage) : le dernier contenu connu s'affiche aussitôt,
 * d'une visite à l'autre, puis useFetch le rafraîchit en arrière-plan
 * (stale-while-revalidate). Au-delà de 7 jours, il est ignoré.
 */
const STOCKAGE_STALE_MS = 7 * 24 * 60 * 60_000;
const STOCKAGE_PREFIX   = "wp:";

/** Petite empreinte (djb2, base 36) pour versionner les clés de cache. */
function empreinte(texte: string): string {
  let h = 5381;
  for (let i = 0; i < texte.length; i++) h = ((h << 5) + h + texte.charCodeAt(i)) | 0;
  return (h >>> 0).toString(36);
}

/**
 * Clé de cache d'une requête GraphQL : le nom suivi de l'empreinte du texte
 * de la requête. Une requête modifiée (champ ACF renommé…) change de clé :
 * un ancien contenu stocké, de forme différente, n'est jamais relu.
 */
function cleGQL(nom: string, requete: string): string {
  return `${nom}:v${empreinte(requete)}`;
}

// ─── Sérialisation localStorage (gère les Maps) ───────────────────────────

function stockageEcrire(key: string, data: unknown): void {
  try {
    const value = data instanceof Map
      ? { __map: true, entries: Array.from((data as Map<unknown, unknown>).entries()) }
      : data;
    // Une clé versionnée remplace ses anciennes versions.
    const base = key.includes(":v") ? STOCKAGE_PREFIX + key.slice(0, key.lastIndexOf(":v") + 2) : null;
    if (base) {
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const k = localStorage.key(i);
        if (k && k.startsWith(base) && k !== STOCKAGE_PREFIX + key) localStorage.removeItem(k);
      }
    }
    localStorage.setItem(STOCKAGE_PREFIX + key, JSON.stringify({ v: value, t: Date.now() }));
  } catch { /* quota dépassé ou navigation privée : on ignore */ }
}

function stockageLire<T>(key: string, staleMs = STOCKAGE_STALE_MS): T | null {
  try {
    const raw = localStorage.getItem(STOCKAGE_PREFIX + key);
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
    if (persist) return stockageLire<T>(cacheKey, persistStaleMs);
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
          if (persist) stockageEcrire(cacheKey, data);
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

// ─── Préchargement des pages ──────────────────────────────────────────────

/**
 * Récupère en arrière-plan les données de toutes les pages du site, pour que
 * chaque navigation s'affiche sans attendre WordPress. Appelé une fois par
 * App.tsx quand la première page est affichée. Une requête déjà en mémoire
 * est sautée ; les erreurs sont ignorées (la page refera sa requête).
 * Les clés et requêtes doivent rester identiques à celles des hooks.
 */
export function prechargerPages(): void {
  const requetes: [string, string][] = [
    ["gql-global", GQL_GLOBAL],
    ["gql-accueil", GQL_ACCUEIL],
    ["gql-page-prestations", GQL_PAGE_PRESTATIONS],
    ["gql-cabinet", GQL_CABINET],
    ["gql-page-equipe", GQL_PAGE_EQUIPE],
    ["gql-therapeutes", GQL_THERAPEUTES],
    ["gql-faq", GQL_FAQ],
    ["gql-page-faq", GQL_PAGE_FAQ],
  ];
  for (const [nom, requete] of requetes) {
    const cle = cleGQL(nom, requete);
    if (memoryCache.has(cle)) continue;
    graphqlFetch<unknown>(requete)
      .then((data) => {
        memoryCache.set(cle, { data, updatedAt: Date.now() });
        stockageEcrire(cle, data);
      })
      .catch(() => {});
  }
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
        horaireSecretariat { jours horaires }
        carteGoogle
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
      horaireSecretariat: { jours: string | null; horaires: string | null }[] | null;
      carteGoogle: string | null;
      logo: GQLMediaEdge;
      adresses: { lieu: string | null; adresse: string | null; npa: string | null; ville: string | null }[] | null;
      reseauxSociaux: { facebook: string | null; instagram: string | null; linkedin: string | null; whatsapp: string | null } | null;
    } | null;
  } | null;
};

/**
 * Champ WhatsApp : un lien est gardé tel quel ; un numéro (« 076 237 00 53 »)
 * devient un lien wa.me au format international (indicatif suisse par défaut).
 */
function lienWhatsapp(valeur: string | null | undefined): string | undefined {
  const v = valeur?.trim();
  if (!v) return undefined;
  if (/^https?:\/\//i.test(v)) return v;
  const chiffres = v.replace(/[^\d+]/g, "");
  const international = chiffres.startsWith("+")
    ? chiffres.slice(1)
    : chiffres.startsWith("00")
      ? chiffres.slice(2)
      : chiffres.startsWith("0")
        ? `41${chiffres.slice(1)}`
        : chiffres;
  return international ? `https://wa.me/${international}` : undefined;
}

function fromGQLGlobal(d: GQLGlobalResponse | null): GlobalOptions | null {
  const g = d?.optGlobale?.optionsGlobale;
  if (!g) return null;
  return {
    logo:  fromGQLMedia(g.logo ?? null),
    resume: g.resume?.trim() ?? "",
    // Seule une URL d'intégration Google Maps est acceptée dans l'iframe.
    carte: /^https:\/\/(www\.google\.[a-z.]+\/maps|maps\.google\.[a-z.]+\/)/i.test(g.carteGoogle?.trim() ?? "")
      ? g.carteGoogle!.trim()
      : "",
    secretariat: (g.horaireSecretariat ?? [])
      .map((h) => ({ jours: h.jours?.trim() ?? "", horaires: h.horaires?.trim() ?? "" }))
      .filter((h) => h.jours),
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
      whatsapp:  lienWhatsapp(g.reseauxSociaux?.whatsapp),
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
  return {
    questions: nodes
      .map((n) => ({
        id:         n.databaseId,
        question:   n.faq?.question?.trim() || n.title?.trim() || "",
        answer:     n.faq?.reponse ?? "",
        categories: (n.faq?.categorie ?? []).map((c) => c.trim()).filter(Boolean),
      }))
      .filter((q) => q.question),
  };
}

// ─── Page FAQ via WPGraphQL (ACF Options Page `pageFAQs`) ─────────────────
// Groupe `pageFaq` (type PageFaq) : bannière (`bannerFaq`) et relation `faq`
// (questions choisies et ordonnées). Le sous-champ du sous-titre s'appelle
// `sousTitrre` côté ACF (faute de frappe conservée) ; s'il est renommé,
// adapter ici.
const GQL_PAGE_FAQ = `
  query PageFaq {
    pageFAQs {
      pageFaq {
        bannerFaq { titre sousTitrre description video { node { mediaItemUrl } } }
        faq { nodes { databaseId } }
      }
    }
  }
`;

type GQLPageFaqResponse = {
  pageFAQs: {
    pageFaq: {
      bannerFaq: {
        titre: string | null;
        sousTitrre: string | null;
        description: string | null;
        video: { node: { mediaItemUrl: string | null } } | null;
      } | null;
      faq: { nodes: { databaseId: number }[] } | null;
    } | null;
  } | null;
};

function fromGQLPageFaq(d: GQLPageFaqResponse | null): PageFaq | null {
  const f = d?.pageFAQs?.pageFaq;
  if (!f) return null;
  return {
    banner: {
      titre:       f.bannerFaq?.titre ?? "",
      sousTitre:   f.bannerFaq?.sousTitrre ?? "",
      description: f.bannerFaq?.description ?? "",
      video:       f.bannerFaq?.video?.node?.mediaItemUrl ?? null,
    },
    questions: (f.faq?.nodes ?? []).map((n) => n.databaseId),
  };
}

export function usePageFaq() {
  const state = useFetch<GQLPageFaqResponse>(
    () => graphqlFetch<GQLPageFaqResponse>(GQL_PAGE_FAQ),
    { cacheKey: cleGQL("gql-page-faq", GQL_PAGE_FAQ), staleMs: 120_000, persist: true }
  );
  const data = useMemo(() => fromGQLPageFaq(state.data), [state.data]);
  return { ...state, data };
}

// ─── Cabinet via WPGraphQL (ACF Options Page `pageCabinet`) ───────────────
// Groupe `cabinet` (type Cabinet) : bannière et répéteur `cabinet`, une ligne
// par cabinet (titre, détails : tag, galerie, planning jour → thérapeute(s)).
const GQL_CABINET = `
  query Cabinet {
    pageCabinet {
      cabinet {
        banner { titre sousTitre description video { node { mediaItemUrl } } }
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
    { cacheKey: cleGQL("gql-global", GQL_GLOBAL), staleMs: 120_000, persist: true }
  );
  const data = useMemo(() => fromGQLGlobal(state.data), [state.data]);
  return { ...state, data };
}

export function useAccueilOptions() {
  const state = useFetch<GQLAccueilResponse>(
    () => graphqlFetch<GQLAccueilResponse>(GQL_ACCUEIL),
    { cacheKey: cleGQL("gql-accueil", GQL_ACCUEIL), staleMs: 120_000, persist: true }
  );
  const data = useMemo(() => fromGQLAccueil(state.data), [state.data]);
  return { ...state, data };
}

export function usePagePrestations() {
  const state = useFetch<GQLPagePrestationsResponse>(
    () => graphqlFetch<GQLPagePrestationsResponse>(GQL_PAGE_PRESTATIONS),
    { cacheKey: cleGQL("gql-page-prestations", GQL_PAGE_PRESTATIONS), staleMs: 120_000, persist: true }
  );
  const data = useMemo(() => fromGQLPagePrestations(state.data), [state.data]);
  return { ...state, data };
}

export function useFaqOptions() {
  const state = useFetch<GQLFaqResponse>(
    () => graphqlFetch<GQLFaqResponse>(GQL_FAQ),
    { cacheKey: cleGQL("gql-faq", GQL_FAQ), staleMs: 120_000, persist: true }
  );
  const data = useMemo(() => fromGQLFaq(state.data), [state.data]);
  return { ...state, data };
}

export function useCabinetOptions() {
  const state = useFetch<GQLCabinetResponse>(
    () => graphqlFetch<GQLCabinetResponse>(GQL_CABINET),
    { cacheKey: cleGQL("gql-cabinet", GQL_CABINET), staleMs: 120_000, persist: true }
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
          biographie
          specialites
          urlTbooking
          langue
          ordre
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
    // Champ « choix » : chaîne ou liste selon le réglage ACF (sélection multiple).
    role: string | string[] | null;
    biographie: string | null;
    specialites: string | null;
    urlTbooking: string | null;
    // Case à cocher : liste (une valeur seule peut arriver en chaîne).
    langue: string | string[] | null;
    // Ordre d'apparition dans le carrousel (nombre ; vide = en fin de liste).
    ordre: number | null;
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
    role:        Array.isArray(a?.role) ? a.role.filter(Boolean).join(", ") : a?.role ?? "",
    bio:         a?.biographie ?? "",
    extras:      a?.specialites ?? "",
    photo:       fromGQLMedia(a?.photo ?? null),
    tbookingUrl: a?.urlTbooking ?? "",
    langues:     (Array.isArray(a?.langue) ? a.langue : a?.langue ? [a.langue] : []).filter(Boolean),
  };
}

// ─── Page Équipe via WPGraphQL (ACF Options Page `pageEquipe`) ────────────
// Groupe `equipe` (type Equipe) : bannière (`bannerEquipe`), image de fond du
// carrousel et relation `therapeute` (thérapeutes choisis et ordonnés).
const GQL_PAGE_EQUIPE = `
  query PageEquipe {
    pageEquipe {
      equipe {
        bannerEquipe { titre sousTitre description video { node { mediaItemUrl } } }
        imageDeFond { node { sourceUrl altText databaseId mediaDetails { width height } } }
        therapeute { nodes { databaseId } }
      }
    }
  }
`;

type GQLPageEquipeResponse = {
  pageEquipe: {
    equipe: {
      bannerEquipe: {
        titre: string | null;
        sousTitre: string | null;
        description: string | null;
        video: { node: { mediaItemUrl: string | null } } | null;
      } | null;
      imageDeFond: GQLMediaEdge;
      therapeute: { nodes: { databaseId: number }[] } | null;
    } | null;
  } | null;
};

function fromGQLPageEquipe(d: GQLPageEquipeResponse | null): PageEquipe | null {
  const e = d?.pageEquipe?.equipe;
  if (!e) return null;
  return {
    banner: {
      titre:       e.bannerEquipe?.titre ?? "",
      sousTitre:   e.bannerEquipe?.sousTitre ?? "",
      description: e.bannerEquipe?.description ?? "",
      video:       e.bannerEquipe?.video?.node?.mediaItemUrl ?? null,
    },
    fond:        fromGQLMedia(e.imageDeFond ?? null),
    therapeutes: (e.therapeute?.nodes ?? []).map((n) => n.databaseId),
  };
}

export function usePageEquipe() {
  const state = useFetch<GQLPageEquipeResponse>(
    () => graphqlFetch<GQLPageEquipeResponse>(GQL_PAGE_EQUIPE),
    { cacheKey: cleGQL("gql-page-equipe", GQL_PAGE_EQUIPE), staleMs: 120_000, persist: true }
  );
  const data = useMemo(() => fromGQLPageEquipe(state.data), [state.data]);
  return { ...state, data };
}

/** Liste des thérapeutes via WPGraphQL, ordonnés par menu_order côté WP. */
export function useTherapeutes() {
  const state = useFetch<GQLTherapeutesResponse>(
    () => graphqlFetch<GQLTherapeutesResponse>(GQL_THERAPEUTES),
    { cacheKey: cleGQL("gql-therapeutes", GQL_THERAPEUTES), staleMs: 120_000, persist: true }
  );
  // Tri par le champ ACF `ordre` (croissant) ; sans ordre, en fin de liste,
  // dans l'ordre de WordPress (tri stable).
  const therapeutes = useMemo(
    () =>
      (state.data?.therapeutes?.nodes ?? [])
        .map((n) => ({ t: fromGQLTherapeute(n), ordre: n.therapeutes?.ordre ?? Infinity }))
        .sort((a, b) => a.ordre - b.ordre)
        .map((x) => x.t),
    [state.data]
  );
  return { ...state, therapeutes };
}
